
using ECCDashboard.API.Authorization;
using ECCDashboard.API.Data;
using ECCDashboard.API.DTOs.Pagination;
using ECCDashboard.API.DTOs.Roles;
using ECCDashboard.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECCDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RolesController(AppDbContext context)
    {
        _context = context;
    }

    // ==========================================
    // GET ALL ROLES
    // Administrator + User Management
    // ==========================================

    [HttpGet]
    [Authorize(Roles = Roles.Administrator + "," + Roles.UserManagement)]
    public async Task<IActionResult> GetRoles(
        [FromQuery] PaginationRequest request)
    {
        var page = request.Page < 1 ? 1 : request.Page;

        var pageSize = request.PageSize < 1
            ? 10
            : Math.Min(request.PageSize, 100);

        var query = _context.Roles
            .AsNoTracking()
            .OrderByDescending(r => r.LastModified);

        var totalCount = await query.CountAsync();

        var roles = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.IsSystemRole,
                r.CreatedAt,
                r.LastModified,

                permissions = r.RolePermissions
                    .Where(rp => rp.Permission != null)
                    .Select(rp => new
                    {
                        rp.Permission!.Id,
                        rp.Permission.Name
                    })
                    .ToList()
            })
            .ToListAsync();

        var response = new PaginationResponse<object>
        {
            Items = roles.Cast<object>().ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(response);
    }

    // ==========================================
    // GET ROLE BY ID
    // Administrator only
    // ==========================================

    [HttpGet("{id:int}")]
    [Authorize(Roles = Roles.Administrator)]
    public async Task<IActionResult> GetRoleById(int id)
    {
        var role = await _context.Roles
            .AsNoTracking()
            .Where(r => r.Id == id)
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.IsSystemRole,
                r.CreatedAt,
                r.LastModified,

                permissions = r.RolePermissions
                    .Where(rp => rp.Permission != null)
                    .Select(rp => new
                    {
                        rp.Permission!.Id,
                        rp.Permission.Name
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (role == null)
        {
            return NotFound(new
            {
                message = "Role not found."
            });
        }

        return Ok(role);
    }

    // ==========================================
    // CREATE ROLE
    // Administrator only
    // ==========================================

    [HttpPost]
    [Authorize(Roles = Roles.Administrator)]
    public async Task<IActionResult> CreateRole(
        CreateRoleRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "Role name is required."
            });
        }

        var roleName = request.Name.Trim();

        var roleExists = await _context.Roles
            .AnyAsync(r =>
                r.Name.ToLower() == roleName.ToLower());

        if (roleExists)
        {
            return Conflict(new
            {
                message = "A role with this name already exists."
            });
        }

        var permissionIds = request.PermissionIds
            .Distinct()
            .ToList();

        var existingPermissionIds = await _context.Permissions
            .Where(p => permissionIds.Contains(p.Id))
            .Select(p => p.Id)
            .ToListAsync();

        var missingPermissionIds = permissionIds
            .Except(existingPermissionIds)
            .ToList();

        if (missingPermissionIds.Any())
        {
            return BadRequest(new
            {
                message = "One or more permissions do not exist.",
                permissionIds = missingPermissionIds
            });
        }

        var now = DateTime.UtcNow;

        var role = new Role
        {
            Name = roleName,
            IsSystemRole = false,
            CreatedAt = now,
            LastModified = now
        };

        _context.Roles.Add(role);

        await _context.SaveChangesAsync();

        if (existingPermissionIds.Any())
        {
            var rolePermissions = existingPermissionIds
                .Select(permissionId => new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = permissionId
                })
                .ToList();

            _context.RolePermissions.AddRange(rolePermissions);

            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            message = "Role created successfully.",
            role = new
            {
                role.Id,
                role.Name,
                role.IsSystemRole,
                role.CreatedAt,
                role.LastModified,

                permissions = await _context.Permissions
                    .Where(p => existingPermissionIds.Contains(p.Id))
                    .Select(p => new
                    {
                        p.Id,
                        p.Name
                    })
                    .ToListAsync()
            }
        });
    }

    // ==========================================
    // UPDATE ROLE
    // Administrator only
    // ==========================================

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Administrator)]
    public async Task<IActionResult> UpdateRole(
        int id,
        UpdateRoleRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "Role name is required."
            });
        }

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null)
        {
            return NotFound(new
            {
                message = "Role not found."
            });
        }

        // System roles cannot be modified
        if (role.IsSystemRole)
        {
            return BadRequest(new
            {
                message = "System roles cannot be modified."
            });
        }

        var roleName = request.Name.Trim();

        var duplicateRole = await _context.Roles
            .AnyAsync(r =>
                r.Id != id &&
                r.Name.ToLower() == roleName.ToLower());

        if (duplicateRole)
        {
            return Conflict(new
            {
                message = "A role with this name already exists."
            });
        }

        role.Name = roleName;
        role.LastModified = DateTime.UtcNow;

        // PermissionIds was provided
        if (request.PermissionIds != null)
        {
            var permissionIds = request.PermissionIds
                .Distinct()
                .ToList();

            var existingPermissionIds = await _context.Permissions
                .Where(p => permissionIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            var missingPermissionIds = permissionIds
                .Except(existingPermissionIds)
                .ToList();

            if (missingPermissionIds.Any())
            {
                return BadRequest(new
                {
                    message = "One or more permissions do not exist.",
                    permissionIds = missingPermissionIds
                });
            }

            var currentRolePermissions =
                await _context.RolePermissions
                    .Where(rp => rp.RoleId == id)
                    .ToListAsync();

            _context.RolePermissions
                .RemoveRange(currentRolePermissions);

            var newRolePermissions = existingPermissionIds
                .Select(permissionId => new RolePermission
                {
                    RoleId = id,
                    PermissionId = permissionId
                })
                .ToList();

            _context.RolePermissions
                .AddRange(newRolePermissions);
        }

        await _context.SaveChangesAsync();

        var updatedRole = await _context.Roles
            .AsNoTracking()
            .Where(r => r.Id == id)
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.IsSystemRole,
                r.CreatedAt,
                r.LastModified,

                permissions = r.RolePermissions
                    .Where(rp => rp.Permission != null)
                    .Select(rp => new
                    {
                        rp.Permission!.Id,
                        rp.Permission.Name
                    })
                    .ToList()
            })
            .FirstAsync();

        return Ok(new
        {
            message = "Role updated successfully.",
            role = updatedRole
        });
    }

    // ==========================================
    // DELETE ROLE
    // Administrator only
    // ==========================================

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Administrator)]
    public async Task<IActionResult> DeleteRole(int id)
    {
        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null)
        {
            return NotFound(new
            {
                message = "Role not found."
            });
        }

        // System roles cannot be deleted
        if (role.IsSystemRole)
        {
            return BadRequest(new
            {
                message = "System roles cannot be deleted."
            });
        }

        _context.Roles.Remove(role);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Role deleted successfully."
        });
    }
}

