namespace ECCDashboard.API.DTOs.Pagination;

public class PaginationRequest
{
    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 10;

    public string? Search { get; set; }

    public int? RoleId { get; set; }
}