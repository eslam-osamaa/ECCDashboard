using Microsoft.AspNetCore.Http;

namespace ECCDashboard.API.DTOs.Users;

public class CreateUserRequest
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public List<int> RoleIds { get; set; } = new();

    public IFormFile? ProfileImage { get; set; }
}