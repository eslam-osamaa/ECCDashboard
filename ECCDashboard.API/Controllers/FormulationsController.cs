
using System.Security.Claims;
using System.Text.Json;
using ECCDashboard.API.Data;
using ECCDashboard.API.DTOs.Formulations;
using ECCDashboard.API.DTOs.Pagination;
using ECCDashboard.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECCDashboard.API.Controllers;

[ApiController]
[Route("api/formulations")]
public class FormulationsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuthorizationService _authorizationService;

    public FormulationsController(
        AppDbContext context,
        IAuthorizationService authorizationService)
    {
        _context = context;
        _authorizationService = authorizationService;
    }

    // ==========================================
    // GET COSMETICS WITH PAGINATION
    // ==========================================

    [HttpGet("cosmetics")]
    [Authorize(Policy = "Permission:View Cosmetics")]
    public async Task<IActionResult> GetCosmetics(
        [FromQuery] PaginationRequest request,
        [FromQuery] string? parentCode,
        [FromQuery] string? status)
    {
        var query = _context.Formulations
            .AsNoTracking()
            .Where(f => f.Type == "Cosmetics");

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(f => f.SFG.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(parentCode))
        {
            var code = parentCode.Trim();
            query = query.Where(f => f.ParentCode.Contains(code));
        }

        if (!string.IsNullOrWhiteSpace(status) &&
            !string.Equals(status, "all", StringComparison.OrdinalIgnoreCase))
        {
            var selectedStatus = status.Trim();
            query = query.Where(f => f.Status == selectedStatus);
        }

        var totalCount = await query.CountAsync();

        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var formulations = await query
            .OrderBy(f => f.SFG)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new FormulationResponseDto
            {
                SFG = f.SFG,
                ParentCode = f.ParentCode,
                Description = f.Description,
                Type = f.Type,
                Status = f.Status,
                LastModified = f.LastModified,

                RawMaterials = f.RawMaterials
                    .Select(rm => new RawMaterialResponseDto
                    {
                        Id = rm.Id,
                        Code = rm.Code,
                        Description = rm.Description,
                        Percentage = rm.Percentage
                    })
                    .ToList()
            })
            .ToListAsync();

        return Ok(new PaginationResponse<FormulationResponseDto>
        {
            Items = formulations,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    // ==========================================
    // GET MAKEUP WITH PAGINATION
    // ==========================================

    [HttpGet("makeup")]
    [Authorize(Policy = "Permission:View Makeup")]
    public async Task<IActionResult> GetMakeup(
        [FromQuery] PaginationRequest request)
    {
        var query = _context.Formulations
            .AsNoTracking()
            .Where(f => f.Type == "Makeup");

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();

            query = query.Where(f =>
                f.SFG.Contains(search) ||
                f.Description.Contains(search) ||
                f.ParentCode.Contains(search));
        }

        var totalCount = await query.CountAsync();
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var formulations = await query
            .OrderBy(f => f.SFG)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new FormulationResponseDto
            {
                SFG = f.SFG,
                ParentCode = f.ParentCode,
                Description = f.Description,
                Type = f.Type,
                Status = f.Status,
                LastModified = f.LastModified,

                RawMaterials = f.RawMaterials
                    .Select(rm => new RawMaterialResponseDto
                    {
                        Id = rm.Id,
                        Code = rm.Code,
                        Description = rm.Description,
                        Percentage = rm.Percentage
                    })
                    .ToList()
            })
            .ToListAsync();

        return Ok(new PaginationResponse<FormulationResponseDto>
        {
            Items = formulations,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    // ==========================================
    // CREATE INITIAL COSMETICS
    // ==========================================

    [HttpPost("cosmetics/initial")]
    [Authorize(Policy = "Permission:Add Cosmetics")]
    public async Task<IActionResult> CreateInitialCosmetics(
        [FromBody] InitialFormulationRequest request)
    {
        return await CreateInitial(request, "Cosmetics");
    }

    // ==========================================
    // CREATE INITIAL MAKEUP
    // ==========================================

    [HttpPost("makeup/initial")]
    [Authorize(Policy = "Permission:Add Makeup")]
    public async Task<IActionResult> CreateInitialMakeup(
        [FromBody] InitialFormulationRequest request)
    {
        return await CreateInitial(request, "Makeup");
    }

    // ==========================================
    // CREATE FULL COSMETICS
    // ==========================================

    [HttpPost("cosmetics/full")]
    [Authorize(Policy = "Permission:Add Cosmetics")]
    public async Task<IActionResult> CreateFullCosmetics(
        [FromBody] FullFormulationRequest request)
    {
        return await CreateFull(request, "Cosmetics");
    }

    // ==========================================
    // CREATE FULL MAKEUP
    // ==========================================

    [HttpPost("makeup/full")]
    [Authorize(Policy = "Permission:Add Makeup")]
    public async Task<IActionResult> CreateFullMakeup(
        [FromBody] FullFormulationRequest request)
    {
        return await CreateFull(request, "Makeup");
    }

    // ==========================================
    // CREATE INITIAL FORMULATION
    // ==========================================

    private async Task<IActionResult> CreateInitial(
        InitialFormulationRequest request,
        string type)
    {
        var sfg = request.SFG.Trim().ToUpperInvariant();

        var exists = await _context.Formulations
            .AnyAsync(f => f.SFG == sfg);

        if (exists)
        {
            return Conflict(new
            {
                message = $"Formulation {sfg} already exists."
            });
        }

        var formulation = new Formulation
        {
            SFG = sfg,
            Description = request.Description.Trim(),
            ParentCode = string.Empty,
            Type = type,
            Status = request.Status,
            LastModified = DateTime.UtcNow
        };

        _context.Formulations.Add(formulation);

        _context.AuditLogs.Add(CreateAuditLog(
            "Created",
            formulation,
            newStatus: formulation.Status,
            changes: new
            {
                NewValues = new
                {
                    formulation.SFG,
                    formulation.ParentCode,
                    formulation.Description,
                    formulation.Type,
                    formulation.Status,
                    RawMaterials = new object[] { }
                }
            }
        ));

        await _context.SaveChangesAsync();

        return Ok(ToResponse(formulation));
    }

    // ==========================================
    // CREATE FULL FORMULATION
    // ==========================================

    private async Task<IActionResult> CreateFull(
        FullFormulationRequest request,
        string type)
    {
        var sfg = request.SFG.Trim().ToUpperInvariant();

        var exists = await _context.Formulations
            .AnyAsync(f => f.SFG == sfg);

        if (exists)
        {
            return Conflict(new
            {
                message = $"Formulation {sfg} already exists."
            });
        }

        var formulation = new Formulation
        {
            SFG = sfg,
            ParentCode = request.ParentCode.Trim(),
            Description = request.Description.Trim(),
            Type = type,
            Status = request.Status,
            LastModified = DateTime.UtcNow
        };

        foreach (var item in request.RawMaterials)
        {
            formulation.RawMaterials.Add(
                new FormulationRawMaterial
                {
                    SFG = sfg,
                    Code = item.Code.Trim().ToUpperInvariant(),
                    Description = item.Description.Trim(),
                    Percentage = item.Percentage
                });
        }

        _context.Formulations.Add(formulation);

        _context.AuditLogs.Add(CreateAuditLog(
            "Created",
            formulation,
            newStatus: formulation.Status,
            changes: new
            {
                NewValues = new
                {
                    formulation.SFG,
                    formulation.ParentCode,
                    formulation.Description,
                    formulation.Type,
                    formulation.Status,
                    RawMaterials = formulation.RawMaterials
                        .Select(rm => new
                        {
                            rm.Code,
                            rm.Description,
                            rm.Percentage
                        })
                        .ToList()
                }
            }
        ));

        await _context.SaveChangesAsync();

        return Ok(ToResponse(formulation));
    }

    // ==========================================
    // EDIT COSMETICS FORMULATION
    // ==========================================

    [HttpPut("cosmetics/{sfg}")]
    [Authorize(Policy = "Permission:Edit Cosmetics")]
    public async Task<IActionResult> EditCosmetics(
        string sfg,
        [FromBody] EditFormulationRequest request)
    {
        return await EditFormulation(sfg, request, "Cosmetics");
    }

    // ==========================================
    // EDIT MAKEUP FORMULATION
    // ==========================================

    [HttpPut("makeup/{sfg}")]
    [Authorize(Policy = "Permission:Edit Makeup")]
    public async Task<IActionResult> EditMakeup(
        string sfg,
        [FromBody] EditFormulationRequest request)
    {
        return await EditFormulation(sfg, request, "Makeup");
    }

    // ==========================================
    // EDIT FORMULATION DATA + AUDIT LOG
    // ==========================================

    private async Task<IActionResult> EditFormulation(
        string sfg,
        EditFormulationRequest request,
        string expectedType)
    {
        sfg = sfg.Trim().ToUpperInvariant();

        var formulation = await _context.Formulations
            .Include(f => f.RawMaterials)
            .FirstOrDefaultAsync(f => f.SFG == sfg);

        if (formulation == null || formulation.Type != expectedType)
        {
            return NotFound(new
            {
                message = $"Formulation {sfg} was not found in this category."
            });
        }

        var oldParentCode = formulation.ParentCode;
        var oldDescription = formulation.Description;

        var oldRawMaterials = formulation.RawMaterials
            .OrderBy(rm => rm.Code)
            .Select(rm => new
            {
                rm.Code,
                rm.Description,
                rm.Percentage
            })
            .ToList();

        var newRawMaterials = request.RawMaterials
            .Select(rm => new
            {
                Code = rm.Code.Trim().ToUpperInvariant(),
                Description = rm.Description.Trim(),
                rm.Percentage
            })
            .OrderBy(rm => rm.Code)
            .ToList();

        var changes = new Dictionary<string, object?>();

        if (oldParentCode != request.ParentCode.Trim())
        {
            changes["ParentCode"] = new
            {
                Old = oldParentCode,
                New = request.ParentCode.Trim()
            };
        }

        if (oldDescription != request.Description.Trim())
        {
            changes["Description"] = new
            {
                Old = oldDescription,
                New = request.Description.Trim()
            };
        }

        if (JsonSerializer.Serialize(oldRawMaterials) !=
            JsonSerializer.Serialize(newRawMaterials))
        {
            changes["RawMaterials"] = new
            {
                Old = oldRawMaterials,
                New = newRawMaterials
            };
        }

        if (changes.Count == 0)
        {
            return Ok(ToResponse(formulation));
        }

        formulation.ParentCode = request.ParentCode.Trim();
        formulation.Description = request.Description.Trim();

        _context.FormulationRawMaterials.RemoveRange(
            formulation.RawMaterials);

        formulation.RawMaterials.Clear();

        foreach (var item in newRawMaterials)
        {
            formulation.RawMaterials.Add(
                new FormulationRawMaterial
                {
                    SFG = formulation.SFG,
                    Code = item.Code,
                    Description = item.Description,
                    Percentage = item.Percentage
                });
        }

        formulation.LastModified = DateTime.UtcNow;

        _context.AuditLogs.Add(CreateAuditLog(
            "Updated",
            formulation,
            changes: changes
        ));

        await _context.SaveChangesAsync();

        return Ok(ToResponse(formulation));
    }

    // ==========================================
    // CHANGE FORMULATION STATUS + AUDIT LOG
    // ==========================================

    [HttpPut("{sfg}/status")]
    [Authorize]
    public async Task<IActionResult> ChangeStatus(
        string sfg,
        [FromBody] ChangeFormulationStatusRequest request)
    {
        sfg = sfg.Trim().ToUpperInvariant();

        var formulation = await _context.Formulations
            .FirstOrDefaultAsync(f => f.SFG == sfg);

        if (formulation == null)
        {
            return NotFound(new
            {
                message = $"Formulation {sfg} was not found."
            });
        }

        var allowedStatuses = new[]
        {
            "Still",
            "Uploading",
            "Production",
            "Done",
            "Modification",
            "Problem"
        };

        var targetStatus = allowedStatuses.FirstOrDefault(
            status => string.Equals(
                status,
                request.Status?.Trim(),
                StringComparison.OrdinalIgnoreCase));

        if (targetStatus == null)
        {
            return BadRequest(new
            {
                message = "Invalid status."
            });
        }

        var currentStatus = formulation.Status;

        if (currentStatus == targetStatus)
        {
            return BadRequest(new
            {
                message = $"Formulation is already in status {currentStatus}."
            });
        }

        string? requiredPermission;

        if (targetStatus is "Modification" or "Problem")
        {
            requiredPermission = formulation.Type switch
            {
                "Cosmetics" => "Permission:Edit Cosmetics",
                "Makeup" => "Permission:Edit Makeup",
                _ => null
            };

            if (requiredPermission == null)
            {
                return BadRequest(new
                {
                    message = "Formulation type is not classified."
                });
            }
        }
        else
        {
            var validTransition = (currentStatus, targetStatus) switch
            {
                ("Still", "Uploading") => true,
                ("Uploading", "Production") => true,
                ("Production", "Done") => true,
                _ => false
            };

            if (!validTransition)
            {
                return BadRequest(new
                {
                    message =
                        $"Transition from {currentStatus} to {targetStatus} is not allowed."
                });
            }

            requiredPermission = targetStatus switch
            {
                "Uploading" => "Permission:Uploading",
                "Production" => "Permission:Uploading",
                "Done" => "Permission:Production",
                _ => null
            };
        }

        if (requiredPermission == null)
        {
            return BadRequest(new
            {
                message = "No permission rule exists for this transition."
            });
        }

        var authorizationResult = await _authorizationService
            .AuthorizeAsync(User, requiredPermission);

        if (!authorizationResult.Succeeded)
        {
            return Forbid();
        }

        formulation.Status = targetStatus;
        formulation.LastModified = DateTime.UtcNow;

        _context.AuditLogs.Add(CreateAuditLog(
            "StatusChanged",
            formulation,
            oldStatus: currentStatus,
            newStatus: targetStatus,
            changes: new
            {
                Status = new
                {
                    Old = currentStatus,
                    New = targetStatus
                }
            }
        ));

        await _context.SaveChangesAsync();

        return Ok(new
        {
            formulation.SFG,
            formulation.Status,
            formulation.LastModified
        });
    }

    // ==========================================
    // DELETE COSMETICS + AUDIT LOG
    // ==========================================

    [HttpDelete("cosmetics/{sfg}")]
    [Authorize]
    public async Task<IActionResult> DeleteCosmetics(string sfg)
    {
        var authorizationResult = await _authorizationService.AuthorizeAsync(
            User,
            "Permission:Delete Cosmetics"
        );

        if (!authorizationResult.Succeeded)
        {
            return Forbid();
        }

        sfg = sfg.Trim().ToUpperInvariant();

        var formulation = await _context.Formulations
            .Include(f => f.RawMaterials)
            .FirstOrDefaultAsync(
                f => f.SFG == sfg && f.Type == "Cosmetics");

        if (formulation == null)
        {
            return NotFound(new
            {
                message = $"Cosmetics formulation {sfg} was not found."
            });
        }

        _context.AuditLogs.Add(CreateAuditLog(
            "Deleted",
            formulation,
            oldStatus: formulation.Status,
            changes: new
            {
                DeletedValues = new
                {
                    formulation.SFG,
                    formulation.ParentCode,
                    formulation.Description,
                    formulation.Type,
                    formulation.Status,
                    RawMaterials = formulation.RawMaterials
                        .Select(rm => new
                        {
                            rm.Code,
                            rm.Description,
                            rm.Percentage
                        })
                        .ToList()
                }
            }
        ));

        _context.Formulations.Remove(formulation);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Cosmetics formulation {sfg} was deleted successfully.",
            sfg
        });
    }

    // ==========================================
    // DELETE MAKEUP + AUDIT LOG
    // ==========================================

    [HttpDelete("makeup/{sfg}")]
    [Authorize]
    public async Task<IActionResult> DeleteMakeup(string sfg)
    {
        var authorizationResult = await _authorizationService.AuthorizeAsync(
            User,
            "Permission:Delete Makeup"
        );

        if (!authorizationResult.Succeeded)
        {
            return Forbid();
        }

        sfg = sfg.Trim().ToUpperInvariant();

        var formulation = await _context.Formulations
            .Include(f => f.RawMaterials)
            .FirstOrDefaultAsync(
                f => f.SFG == sfg && f.Type == "Makeup");

        if (formulation == null)
        {
            return NotFound(new
            {
                message = $"Makeup formulation {sfg} was not found."
            });
        }

        _context.AuditLogs.Add(CreateAuditLog(
            "Deleted",
            formulation,
            oldStatus: formulation.Status,
            changes: new
            {
                DeletedValues = new
                {
                    formulation.SFG,
                    formulation.ParentCode,
                    formulation.Description,
                    formulation.Type,
                    formulation.Status,
                    RawMaterials = formulation.RawMaterials
                        .Select(rm => new
                        {
                            rm.Code,
                            rm.Description,
                            rm.Percentage
                        })
                        .ToList()
                }
            }
        ));

        _context.Formulations.Remove(formulation);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Makeup formulation {sfg} was deleted successfully.",
            sfg
        });
    }

    // ==========================================
    // CREATE AUDIT LOG ENTRY
    // ==========================================

    private AuditLog CreateAuditLog(
        string action,
        Formulation formulation,
        string? oldStatus = null,
        string? newStatus = null,
        object? changes = null)
    {
        return new AuditLog
        {
            SFG = formulation.SFG,
            Type = formulation.Type,
            Action = action,

            ChangedByUserId = User.FindFirstValue(
                ClaimTypes.NameIdentifier),

            ChangedByUsername = User.FindFirstValue(
                ClaimTypes.Name),

            ChangedAt = DateTime.UtcNow,
            OldStatus = oldStatus,
            NewStatus = newStatus,

            ChangesJson = changes == null
                ? null
                : JsonSerializer.Serialize(changes)
        };
    }

    // ==========================================
    // MAP FORMULATION TO RESPONSE DTO
    // ==========================================

    private static FormulationResponseDto ToResponse(
        Formulation formulation)
    {
        return new FormulationResponseDto
        {
            SFG = formulation.SFG,
            ParentCode = formulation.ParentCode,
            Description = formulation.Description,
            Type = formulation.Type,
            Status = formulation.Status,
            LastModified = formulation.LastModified,

            RawMaterials = formulation.RawMaterials
                .Select(rm => new RawMaterialResponseDto
                {
                    Id = rm.Id,
                    Code = rm.Code,
                    Description = rm.Description,
                    Percentage = rm.Percentage
                })
                .ToList()
        };
    }
}