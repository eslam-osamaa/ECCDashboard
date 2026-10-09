
namespace ECCDashboard.API.DTOs.Formulations;

public class FormulationResponseDto
{
    public string SFG { get; set; } = string.Empty;

    public string ParentCode { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? Type { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime LastModified { get; set; }

    public List<RawMaterialResponseDto> RawMaterials { get; set; } = new();
}

public class RawMaterialResponseDto
{
    public int Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Percentage { get; set; }
}