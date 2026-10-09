using Microsoft.AspNetCore.Http;

namespace ECCDashboard.API.DTOs.Users;

public class UpdateUserRequest
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Password { get; set; }

    public List<int>? RoleIds { get; set; }

    public bool? IsActive { get; set; }

    public IFormFile? ProfileImage { get; set; }
}