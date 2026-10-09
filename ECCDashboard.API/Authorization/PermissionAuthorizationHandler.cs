using System.Security.Claims;
using ECCDashboard.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace ECCDashboard.API.Authorization;

public class PermissionAuthorizationHandler
    : AuthorizationHandler<PermissionRequirement>
{
    private readonly AppDbContext _context;

    public PermissionAuthorizationHandler(
        AppDbContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // Get current user ID from JWT
        var userIdClaim = context.User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return;
        }

        // Check whether the user has the required permission
        var hasPermission = await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .SelectMany(ur => ur.Role!.RolePermissions)
            .AnyAsync(rp =>
                rp.Permission != null &&
                rp.Permission.Name == requirement.PermissionName
            );

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
    }
}