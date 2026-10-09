using Microsoft.AspNetCore.Authorization;

namespace ECCDashboard.API.Authorization;

public class RequirePermissionAttribute : AuthorizeAttribute
{
    private const string Prefix = "Permission:";

    public RequirePermissionAttribute(string permissionName)
    {
        Policy = $"{Prefix}{permissionName}";
    }
}