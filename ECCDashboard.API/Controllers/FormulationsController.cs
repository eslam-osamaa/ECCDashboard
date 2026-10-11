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
    private const string CosmeticsType = "Cosmetics";
    private const string MakeupType = "Makeup";

    private static readonly string[] AllowedStatuses =
    {
        "Still", "Uploading", "Production", "Done", "Modification", "Problem"
    };

    private readonly AppDbContext _context;
    private readonly IAuthorizationService _authorizationService;
    private readonly ILogger<FormulationsController> _logger;

    public FormulationsController(
        AppDbContext context,
        IAuthorizationService authorizationService,
        ILogger<FormulationsController> logger)
    {
        _context = context;
        _authorizationService = authorizationService;
        _logger = logger;
    }

    // ==========================================
    // GET COSMETICS
    // ==========================================

    [HttpGet("cosmetics")]
    [Authorize(Policy = "Permission:View Cosmetics")]
    public Task<IActionResult> GetCosmetics(
        [FromQuery] PaginationRequest request,
        [FromQuery] string? parentCode,
        [FromQuery] string? status,
        [FromQuery] string? description)
        => GetFormulationsByTypeAsync(
            request, CosmeticsType, parentCode, status, description);

    // ==========================================
    // GET MAKEUP
    // ==========================================

    [HttpGet("makeup")]
    [Authorize(Policy = "Permission:View Makeup")]
    public Task<IActionResult> GetMakeup(
        [FromQuery] PaginationRequest request,
        [FromQuery] string? parentCode,
        [FromQuery] string? status,
        [FromQuery] string? description)
        => GetFormulationsByTypeAsync(
            request, MakeupType, parentCode, status, description);

    // ==========================================
    // GET SINGLE FORMULATION BY SFG
    // ==========================================

    [HttpGet("{sfg}")]
    [Authorize]
    public async Task<IActionResult> GetBySfg(string sfg)
    {
        try
        {
            sfg = sfg.Trim().ToUpperInvariant();

            var formulation = await _context.Formulations
                .AsNoTracking()
                .Include(f => f.RawMaterials)
                .FirstOrDefaultAsync(f => f.SFG == sfg);

            if (formulation == null)
                return NotFound(new { message = $"Formulation {sfg} was not found." });

            var permission = formulation.Type switch
            {
                CosmeticsType => "Permission:View Cosmetics",
                MakeupType => "Permission:View Makeup",
                _ => null
            };

            if (permission == null)
                return BadRequest(new { message = "Formulation type is not classified." });

            var authResult = await _authorizationService.AuthorizeAsync(User, permission);

            if (!authResult.Succeeded)
                return Forbid();

            return Ok(ToResponse(formulation, includeRawMaterials: true));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetBySfg failed. SFG={SFG}", sfg);
            return StatusCode(500, new
            {
                message = "Failed to load formulation.",
                error = ex.Message,
                type = ex.GetType().FullName,
                inner = ex.InnerException?.Message
            });
        }
    }

    // ==========================================
    // SHARED: GET FORMULATIONS BY TYPE
    // ==========================================

    private async Task<IActionResult> GetFormulationsByTypeAsync(
        PaginationRequest request,
        string type,
        string? parentCode,
        string? status,
        string? description)
    {
        try
        {
            _logger.LogInformation(
                "Get {Type} started. Page={Page}, PageSize={PageSize}, Search={Search}, Description={Description}, ParentCode={ParentCode}, Status={Status}",
                type, request.Page, request.PageSize, request.Search,
                description, parentCode, status);

            var query = _context.Formulations
                .AsNoTracking()
                .Where(f => f.Type == type);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim();
                query = query.Where(f => f.SFG.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(description))
            {
                var desc = description.Trim();
                query = query.Where(f => f.Description.Contains(desc));
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
                    RawMaterials = new List<RawMaterialResponseDto>()
                })
                .ToListAsync();

            _logger.LogInformation(
                "Get {Type} completed. TotalCount={TotalCount}, Returned={Returned}",
                type, totalCount, formulations.Count);

            return Ok(new PaginationResponse<FormulationResponseDto>
            {
                Items = formulations,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get{Type} failed.", type);
            return StatusCode(500, new
            {
                message = $"Failed to load {type.ToLowerInvariant()} formulations.",
                error = ex.Message,
                type = ex.GetType().FullName,
                inner = ex.InnerException?.Message
            });
        }
    }

    // ==========================================
    // CREATE INITIAL COSMETICS
    // ==========================================

    [HttpPost("cosmetics/initial")]
    [Authorize(Policy = "Permission:Add Cosmetics")]
    public Task<IActionResult> CreateInitialCosmetics(
        [FromBody] InitialFormulationRequest request)
        => CreateInitialAsync(request, CosmeticsType);

    // ==========================================
    // CREATE INITIAL MAKEUP
    // ==========================================

    [HttpPost("makeup/initial")]
    [Authorize(Policy = "Permission:Add Makeup")]
    public Task<IActionResult> CreateInitialMakeup(
        [FromBody] InitialFormulationRequest request)
        => CreateInitialAsync(request, MakeupType);

    // ==========================================
    // CREATE FULL COSMETICS
    // ==========================================

    [HttpPost("cosmetics/full")]
    [Authorize(Policy = "Permission:Add Cosmetics")]
    public Task<IActionResult> CreateFullCosmetics(
        [FromBody] FullFormulationRequest request)
        => CreateFullAsync(request, CosmeticsType);

    // ==========================================
    // CREATE FULL MAKEUP
    // ==========================================

    [HttpPost("makeup/full")]
    [Authorize(Policy = "Permission:Add Makeup")]
    public Task<IActionResult> CreateFullMakeup(
        [FromBody] FullFormulationRequest request)
        => CreateFullAsync(request, MakeupType);

    // ==========================================
    // SHARED: CREATE INITIAL
    // ==========================================

    private async Task<IActionResult> CreateInitialAsync(
        InitialFormulationRequest request,
        string type)
    {
        var sfg = request.SFG?.Trim().ToUpperInvariant() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(sfg))
            return BadRequest(new { message = "SFG is required." });

        if (await _context.Formulations.AnyAsync(f => f.SFG == sfg))
            return Conflict(new { message = $"Formulation {sfg} already exists." });

        var formulation = new Formulation
        {
            SFG = sfg,
            Description = request.Description?.Trim() ?? string.Empty,
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
                    RawMaterials = Array.Empty<object>()
                }
            }));

        await _context.SaveChangesAsync();

        return Ok(ToResponse(formulation, includeRawMaterials: true));
    }

    // ==========================================
    // SHARED: CREATE FULL
    // ==========================================

    private async Task<IActionResult> CreateFullAsync(
        FullFormulationRequest request,
        string type)
    {
        var sfg = request.SFG?.Trim().ToUpperInvariant() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(sfg))
            return BadRequest(new { message = "SFG is required." });

        if (await _context.Formulations.AnyAsync(f => f.SFG == sfg))
            return Conflict(new { message = $"Formulation {sfg} already exists." });

        var rawMaterialsResult = ValidateAndNormalizeRawMaterials(request.RawMaterials);

        if (!rawMaterialsResult.IsValid)
            return BadRequest(new { message = rawMaterialsResult.Error });

        var formulation = new Formulation
        {
            SFG = sfg,
            ParentCode = request.ParentCode?.Trim() ?? string.Empty,
            Description = request.Description?.Trim() ?? string.Empty,
            Type = type,
            Status = request.Status,
            LastModified = DateTime.UtcNow
        };

        foreach (var item in rawMaterialsResult.Items!)
        {
            formulation.RawMaterials.Add(new FormulationRawMaterial
            {
                SFG = sfg,
                Code = item.Code,
                Description = item.Description,
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
                        .Select(rm => new { rm.Code, rm.Description, rm.Percentage })
                        .ToList()
                }
            }));

        await _context.SaveChangesAsync();

        return Ok(ToResponse(formulation, includeRawMaterials: true));
    }

    // ==========================================
    // EDIT COSMETICS
    // ==========================================

    [HttpPut("cosmetics/{sfg}")]
    [Authorize(Policy = "Permission:Edit Cosmetics")]
    public Task<IActionResult> EditCosmetics(
        string sfg,
        [FromBody] EditFormulationRequest request)
        => EditFormulationAsync(sfg, request, CosmeticsType);

    // ==========================================
    // EDIT MAKEUP
    // ==========================================

    [HttpPut("makeup/{sfg}")]
    [Authorize(Policy = "Permission:Edit Makeup")]
    public Task<IActionResult> EditMakeup(
        string sfg,
        [FromBody] EditFormulationRequest request)
        => EditFormulationAsync(sfg, request, MakeupType);

    // ==========================================
    // SHARED: EDIT FORMULATION
    // ==========================================

    private async Task<IActionResult> EditFormulationAsync(
        string sfg,
        EditFormulationRequest request,
        string expectedType)
    {
        sfg = sfg.Trim().ToUpperInvariant();

        var formulation = await _context.Formulations
            .Include(f => f.RawMaterials)
            .FirstOrDefaultAsync(f => f.SFG == sfg);

        if (formulation == null || formulation.Type != expectedType)
            return NotFound(new
            {
                message = $"Formulation {sfg} was not found in this category."
            });

        var rawMaterialsResult = ValidateAndNormalizeRawMaterials(request.RawMaterials);

        if (!rawMaterialsResult.IsValid)
            return BadRequest(new { message = rawMaterialsResult.Error });

        var newParentCode = request.ParentCode?.Trim() ?? string.Empty;
        var newDescription = request.Description?.Trim() ?? string.Empty;

        var oldParentCode = formulation.ParentCode;
        var oldDescription = formulation.Description;

        var oldRawMaterials = formulation.RawMaterials
            .OrderBy(rm => rm.Code)
            .Select(rm => new { rm.Code, rm.Description, rm.Percentage })
            .ToList();

        var newRawMaterials = rawMaterialsResult.Items!
            .OrderBy(rm => rm.Code)
            .Select(rm => new { rm.Code, rm.Description, rm.Percentage })
            .ToList();

        var changes = new Dictionary<string, object?>();

        if (oldParentCode != newParentCode)
            changes["ParentCode"] = new { Old = oldParentCode, New = newParentCode };

        if (oldDescription != newDescription)
            changes["Description"] = new { Old = oldDescription, New = newDescription };

        var rawMaterialsChanged =
            JsonSerializer.Serialize(oldRawMaterials) !=
            JsonSerializer.Serialize(newRawMaterials);

        if (rawMaterialsChanged)
            changes["RawMaterials"] = new { Old = oldRawMaterials, New = newRawMaterials };

        if (changes.Count == 0)
            return Ok(ToResponse(formulation, includeRawMaterials: true));

        formulation.ParentCode = newParentCode;
        formulation.Description = newDescription;

        if (rawMaterialsChanged)
            SyncRawMaterials(formulation, rawMaterialsResult.Items!);

        formulation.LastModified = DateTime.UtcNow;

        _context.AuditLogs.Add(CreateAuditLog(
            "Updated",
            formulation,
            changes: changes));

        await _context.SaveChangesAsync();

        return Ok(ToResponse(formulation, includeRawMaterials: true));
    }

    // ==========================================
    // CHANGE STATUS
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
            return NotFound(new { message = $"Formulation {sfg} was not found." });

        var targetStatus = AllowedStatuses.FirstOrDefault(
            s => string.Equals(s, request.Status?.Trim(), StringComparison.OrdinalIgnoreCase));

        if (targetStatus == null)
            return BadRequest(new { message = "Invalid status." });

        var currentStatus = formulation.Status;

        if (currentStatus == targetStatus)
            return BadRequest(new
            {
                message = $"Formulation is already in status {currentStatus}."
            });

        var permissionResult = ResolveRequiredPermission(
            formulation.Type, currentStatus, targetStatus);

        if (!permissionResult.Success)
            return BadRequest(new { message = permissionResult.Error });

        var authorizationResult = await _authorizationService
            .AuthorizeAsync(User, permissionResult.Permission!);

        if (!authorizationResult.Succeeded)
            return Forbid();

        formulation.Status = targetStatus;
        formulation.LastModified = DateTime.UtcNow;

        _context.AuditLogs.Add(CreateAuditLog(
            "StatusChanged",
            formulation,
            oldStatus: currentStatus,
            newStatus: targetStatus,
            changes: new
            {
                Status = new { Old = currentStatus, New = targetStatus }
            }));

        await _context.SaveChangesAsync();

        return Ok(new
        {
            formulation.SFG,
            formulation.Status,
            formulation.LastModified
        });
    }

    // ==========================================
    // DELETE COSMETICS
    // ==========================================

    [HttpDelete("cosmetics/{sfg}")]
    [Authorize(Policy = "Permission:Delete Cosmetics")]
    public Task<IActionResult> DeleteCosmetics(string sfg)
        => DeleteFormulationAsync(sfg, CosmeticsType);

    // ==========================================
    // DELETE MAKEUP
    // ==========================================

    [HttpDelete("makeup/{sfg}")]
    [Authorize(Policy = "Permission:Delete Makeup")]
    public Task<IActionResult> DeleteMakeup(string sfg)
        => DeleteFormulationAsync(sfg, MakeupType);

    // ==========================================
    // SHARED: DELETE FORMULATION
    // ==========================================

    private async Task<IActionResult> DeleteFormulationAsync(
        string sfg,
        string type)
    {
        sfg = sfg.Trim().ToUpperInvariant();

        var formulation = await _context.Formulations
            .Include(f => f.RawMaterials)
            .FirstOrDefaultAsync(f => f.SFG == sfg && f.Type == type);

        if (formulation == null)
            return NotFound(new
            {
                message = $"{type} formulation {sfg} was not found."
            });

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
                        .Select(rm => new { rm.Code, rm.Description, rm.Percentage })
                        .ToList()
                }
            }));

        _context.Formulations.Remove(formulation);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"{type} formulation {sfg} was deleted successfully.",
            sfg
        });
    }

    // ==========================================
    // HELPERS
    // ==========================================

    private static (bool IsValid, string? Error, List<RawMaterialRequest>? Items)
        ValidateAndNormalizeRawMaterials(List<RawMaterialRequest>? rawMaterials)
    {
        if (rawMaterials == null || rawMaterials.Count == 0)
            return (false, "At least one raw material is required.", null);

        var normalized = new List<RawMaterialRequest>(rawMaterials.Count);

        foreach (var item in rawMaterials)
        {
            var code = item.Code?.Trim().ToUpperInvariant() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(code))
                return (false, "Raw material code is required.", null);

            normalized.Add(new RawMaterialRequest
            {
                Code = code,
                Description = item.Description?.Trim() ?? string.Empty,
                Percentage = item.Percentage
            });
        }

        var totalPercentage = normalized.Sum(rm => rm.Percentage);

        if (Math.Abs(totalPercentage - 100m) > 0.01m)
            return (false,
                $"Raw material percentages must sum to 100. Current total: {totalPercentage}.",
                null);

        return (true, null, normalized);
    }

    private void SyncRawMaterials(
        Formulation formulation,
        List<RawMaterialRequest> newItems)
    {
        // حذف صريح من الـ DbContext عشان نضمن إن EF يعمل DELETE
        var existing = formulation.RawMaterials.ToList();

        _context.FormulationRawMaterials.RemoveRange(existing);

        formulation.RawMaterials.Clear();

        foreach (var item in newItems)
        {
            formulation.RawMaterials.Add(new FormulationRawMaterial
            {
                SFG = formulation.SFG,
                Code = item.Code,
                Description = item.Description,
                Percentage = item.Percentage
            });
        }
    }

    private static (bool Success, string? Permission, string? Error)
        ResolveRequiredPermission(
            string? formulationType,
            string currentStatus,
            string targetStatus)
    {
        if (targetStatus is "Modification" or "Problem")
        {
            var permission = formulationType switch
            {
                CosmeticsType => "Permission:Edit Cosmetics",
                MakeupType => "Permission:Edit Makeup",
                _ => null
            };

            return permission == null
                ? (false, null, "Formulation type is not classified.")
                : (true, permission, null);
        }

        var validTransition = (currentStatus, targetStatus) switch
        {
            ("Still", "Uploading") => true,
            ("Uploading", "Production") => true,
            ("Production", "Done") => true,
            _ => false
        };

        if (!validTransition)
            return (false, null,
                $"Transition from {currentStatus} to {targetStatus} is not allowed.");

        var transitionPermission = targetStatus switch
        {
            "Uploading" => "Permission:Uploading",
            "Production" => "Permission:Uploading",
            "Done" => "Permission:Production",
            _ => null
        };

        return transitionPermission == null
            ? (false, null, "No permission rule exists for this transition.")
            : (true, transitionPermission, null);
    }

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
            ChangedByUserId = User.FindFirstValue(ClaimTypes.NameIdentifier),
            ChangedByUsername = User.FindFirstValue(ClaimTypes.Name),
            ChangedAt = DateTime.UtcNow,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            ChangesJson = changes == null ? null : JsonSerializer.Serialize(changes)
        };
    }

    private static FormulationResponseDto ToResponse(
        Formulation formulation,
        bool includeRawMaterials = false)
    {
        var dto = new FormulationResponseDto
        {
            SFG = formulation.SFG,
            ParentCode = formulation.ParentCode,
            Description = formulation.Description,
            Type = formulation.Type,
            Status = formulation.Status,
            LastModified = formulation.LastModified,
            RawMaterials = new List<RawMaterialResponseDto>()
        };

        if (includeRawMaterials && formulation.RawMaterials != null)
        {
            dto.RawMaterials = formulation.RawMaterials
                .OrderBy(rm => rm.Code)
                .Select(rm => new RawMaterialResponseDto
                {
                    Id = rm.Id,
                    Code = rm.Code,
                    Description = rm.Description,
                    Percentage = rm.Percentage
                })
                .ToList();
        }

        return dto;
    }
}