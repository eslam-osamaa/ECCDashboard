
using System.ComponentModel.DataAnnotations;

namespace ECCDashboard.API.Models;

public class AuditLog
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string SFG { get; set; } = string.Empty;

    public string? Type { get; set; }

    [Required]
    public string Action { get; set; } = string.Empty;

    public string? ChangedByUserId { get; set; }

    public string? ChangedByUsername { get; set; }

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    public string? OldStatus { get; set; }

    public string? NewStatus { get; set; }

    // Stores field-by-field old and new values as JSON.
    // It also allows storing Raw Materials changes.
    public string? ChangesJson { get; set; }
}