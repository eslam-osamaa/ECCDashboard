using System.ComponentModel.DataAnnotations;

namespace ECCDashboard.API.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public string? ProfileImage { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime LastModified { get; set; } = DateTime.UtcNow;

    public int? CreatedByUserId { get; set; }

    public int? LastModifiedByUserId { get; set; }

    public User? CreatedByUser { get; set; }

    public User? LastModifiedByUser { get; set; }

    public List<UserRole> UserRoles { get; set; } = new();
}