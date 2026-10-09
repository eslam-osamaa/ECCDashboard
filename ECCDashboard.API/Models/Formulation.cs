
using System.ComponentModel.DataAnnotations;

namespace ECCDashboard.API.Models;

public class Formulation
{
    [Key]
    public string SFG { get; set; } = string.Empty;

    public string ParentCode { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public string? Type { get; set; }

    [Required]
    public string Status { get; set; } = "Still";

    public DateTime LastModified { get; set; } = DateTime.UtcNow;

    public List<FormulationRawMaterial> RawMaterials { get; set; } = new();
}