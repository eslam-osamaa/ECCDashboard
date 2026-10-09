using System.ComponentModel.DataAnnotations;

namespace ECCDashboard.API.Models;

public class Role
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    public bool IsSystemRole { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime LastModified { get; set; } = DateTime.UtcNow;

    public List<UserRole> UserRoles { get; set; } = new();

    public List<RolePermission> RolePermissions { get; set; } = new();
}