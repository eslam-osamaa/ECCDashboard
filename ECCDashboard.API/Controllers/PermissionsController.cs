using ECCDashboard.API.Authorization;
using ECCDashboard.API.Data;
using ECCDashboard.API.DTOs.Pagination;
using ECCDashboard.API.DTOs.Permissions;
using ECCDashboard.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECCDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Administrator)]
public class PermissionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PermissionsController(AppDbContext context)
    {
        _context = context;
    }

    // GET ALL PERMISSIONS
    [HttpGet]
    public async Task<IActionResult> GetPermissions(
        [FromQuery] PaginationRequest request)
    {
        var page = request.Page < 1 ? 1 : request.Page;

        var pageSize = request.PageSize < 1
            ? 10
            : Math.Min(request.PageSize, 100);

        var query = _context.Permissions
            .AsNoTracking()
            .OrderBy(p => p.Name);

        var totalCount = await query.CountAsync();

        var permissions = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                p.Name
            })
            .ToListAsync();

        var response = new PaginationResponse<object>
        {
            Items = permissions.Cast<object>().ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(response);
    }

    // GET PERMISSION BY ID
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetPermissionById(int id)
    {
        var permission = await _context.Permissions
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new
            {
                p.Id,
                p.Name
            })
            .FirstOrDefaultAsync();

        if (permission == null)
        {
            return NotFound(new
            {
                message = "Permission not found."
            });
        }

        return Ok(permission);
    }

    // CREATE PERMISSION
    [HttpPost]
    public async Task<IActionResult> CreatePermission(
        CreatePermissionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "Permission name is required."
            });
        }

        var permissionName = request.Name.Trim();

        var permissionExists = await _context.Permissions
            .AnyAsync(p =>
                p.Name.ToLower() == permissionName.ToLower());

        if (permissionExists)
        {
            return Conflict(new
            {
                message = "A permission with this name already exists."
            });
        }

        var permission = new Permission
        {
            Name = permissionName
        };

        _context.Permissions.Add(permission);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Permission created successfully.",
        });
    }

    // UPDATE PERMISSION
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePermission(
        int id,
        UpdatePermissionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "Permission name is required."
            });
        }

        var permission = await _context.Permissions
            .FirstOrDefaultAsync(p => p.Id == id);

        if (permission == null)
        {
            return NotFound(new
            {
                message = "Permission not found."
            });
        }

        var permissionName = request.Name.Trim();

        var duplicatePermission = await _context.Permissions
            .AnyAsync(p =>
                p.Id != id &&
                p.Name.ToLower() == permissionName.ToLower());

        if (duplicatePermission)
        {
            return Conflict(new
            {
                message = "A permission with this name already exists."
            });
        }

        permission.Name = permissionName;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Permission updated successfully.",
        });
    }

    // DELETE PERMISSION
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePermission(int id)
    {
        var permission = await _context.Permissions
            .FirstOrDefaultAsync(p => p.Id == id);

        if (permission == null)
        {
            return NotFound(new
            {
                message = "Permission not found."
            });
        }

        _context.Permissions.Remove(permission);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Permission deleted successfully."
        });
    }
}