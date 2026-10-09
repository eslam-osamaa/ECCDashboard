namespace ECCDashboard.API.DTOs.Roles;

public class UpdateRoleRequest
{
    public string Name { get; set; } = string.Empty;

    public List<int>? PermissionIds { get; set; }
}