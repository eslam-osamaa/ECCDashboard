
using System.ComponentModel.DataAnnotations;

namespace ECCDashboard.API.DTOs.Formulations;

public class InitialFormulationRequest
{
    [Required]
    [RegularExpression(
        @"^SFG\d{6}$",
        ErrorMessage = "SFG Code must contain SFG followed by 6 digits."
    )]
    public string SFG { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [RegularExpression(
        @"^(Still|Uploading)$",
        ErrorMessage = "Status must be Still or Uploading."
    )]
    public string Status { get; set; } = "Still";
}

public class FullFormulationRequest
{
    [Required]
    [RegularExpression(
        @"^SFG\d{6}$",
        ErrorMessage = "SFG Code must contain SFG followed by 6 digits."
    )]
    public string SFG { get; set; } = string.Empty;

    [Required]
    public string ParentCode { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [RegularExpression(
        @"^(Still|Uploading)$",
        ErrorMessage = "Status must be Still or Uploading."
    )]
    public string Status { get; set; } = "Still";

    [Required]
    [MinLength(1)]
    public List<RawMaterialRequest> RawMaterials { get; set; } = new();
}

public class RawMaterialRequest
{
    [Required]
    [RegularExpression(
        @"^(RM\d{6}|C-RM\d{6})$",
        ErrorMessage = "Invalid Raw Material Code."
    )]
    public string Code { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Range(
        typeof(decimal),
        "0.0001",
        "100",
        ErrorMessage = "Percentage must be greater than 0 and at most 100."
    )]
    public decimal Percentage { get; set; }
}

public class EditFormulationRequest
{
    [Required]
    public string ParentCode { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public List<RawMaterialRequest> RawMaterials { get; set; } = new();
}

public class ChangeFormulationStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
}