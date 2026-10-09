namespace ECCDashboard.API.DTOs.Roles;

public class CreateRoleRequest
{
    public string Name { get; set; } = string.Empty;

    public List<int> PermissionIds { get; set; } = new();
}