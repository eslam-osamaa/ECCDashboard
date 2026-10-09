using System.ComponentModel.DataAnnotations;

namespace ECCDashboard.API.Models;

public class FormulationRawMaterial
{
    public int Id { get; set; }

    [Required]
    public string SFG { get; set; } = string.Empty;

    [Required]
    public string Code { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public decimal Percentage { get; set; }

    public Formulation? Formulation { get; set; }
}