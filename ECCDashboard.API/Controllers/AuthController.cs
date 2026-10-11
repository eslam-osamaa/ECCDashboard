
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ECCDashboard.API.Data;
using ECCDashboard.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ECCDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        AppDbContext context,
        IPasswordHasher<User> passwordHasher,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
        _logger = logger;
    }

    // =========================
    // LOGIN
    // =========================

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        try
        {
            Console.WriteLine("LOGIN CHECKPOINT 0: Login started");

            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    message = "Email and password are required."
                });
            }

            var user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u =>
                    u.Email.ToLower() == request.Email.ToLower());

            Console.WriteLine(
                $"LOGIN CHECKPOINT 1: User found = {user != null}");

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new
                {
                    message = "This account is inactive."
                });
            }

            var passwordResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password);

            Console.WriteLine(
                $"LOGIN CHECKPOINT 2: Password result = {passwordResult}");

            if (passwordResult == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            var roles = user.UserRoles
                .Where(ur => ur.Role != null)
                .Select(ur => ur.Role!.Name)
                .ToList();

            Console.WriteLine(
                $"LOGIN CHECKPOINT 3: Roles loaded = {roles.Count}");

            var token = GenerateToken(user, roles);

            Console.WriteLine("LOGIN CHECKPOINT 4: Token generated");

            var expiresInMinutes =
                _configuration.GetValue<int>("Jwt:ExpiresInMinutes");

            if (expiresInMinutes <= 0)
            {
                throw new InvalidOperationException(
                    "Jwt:ExpiresInMinutes must be greater than zero.");
            }

Response.Cookies.Append("ecc_auth", token, new CookieOptions
{
    HttpOnly = true,
    Secure = true,                    // لازم true مع SameSite=None
    SameSite = SameSiteMode.None,     // عشان Cross-Site (Vercel)
    Expires = DateTimeOffset.UtcNow.AddMinutes(expiresInMinutes),
    Path = "/"
});

            Console.WriteLine("LOGIN CHECKPOINT 5: Cookie appended");

            return Ok(new
            {
                user = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.ProfileImage,
                    user.IsActive,
                    roles
                }
            });
        }
catch (Exception ex)
{
    _logger.LogError(
        ex,
        "LOGIN FAILURE. ExceptionType: {ExceptionType}. Details: {Details}",
        ex.GetType().FullName,
        ex.ToString());

    return StatusCode(500, new
    {
        message = "An internal server error occurred during login."
    });
}
    }

    // =========================
    // CURRENT USER
    // =========================

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            Response.Cookies.Delete("ecc_auth");

            return Unauthorized(new
            {
                message = "User account no longer exists."
            });
        }

        if (!user.IsActive)
        {
            Response.Cookies.Delete("ecc_auth");

            return Unauthorized(new
            {
                message = "This account is inactive."
            });
        }

        var roles = user.UserRoles
            .Where(ur => ur.Role != null)
            .Select(ur => ur.Role!.Name)
            .ToList();

        var permissions = user.UserRoles
            .Where(ur => ur.Role != null)
            .SelectMany(ur => ur.Role!.RolePermissions)
            .Where(rp => rp.Permission != null)
            .Select(rp => rp.Permission!.Name)
            .Distinct()
            .ToList();

        return Ok(new
        {
            user.Id,
            user.Username,
            user.Email,
            user.ProfileImage,
            user.IsActive,
            roles,
            permissions
        });
    }

    // =========================
    // LOGOUT
    // =========================

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
Response.Cookies.Delete("ecc_auth", new CookieOptions
{
    HttpOnly = true,
    Secure = true,
    SameSite = SameSiteMode.None,
    Path = "/"
});

        return Ok(new
        {
            message = "Logged out successfully."
        });
    }

    // =========================
    // GENERATE JWT TOKEN
    // =========================

    private string GenerateToken(User user, List<string> roles)
    {
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "JWT Key is missing.");

        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException(
                "JWT Issuer is missing.");

        var audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException(
                "JWT Audience is missing.");

        var expiresInMinutes =
            _configuration.GetValue<int>("Jwt:ExpiresInMinutes");

        if (string.IsNullOrWhiteSpace(key))
        {
            throw new InvalidOperationException(
                "JWT Key is empty.");
        }

        if (expiresInMinutes <= 0)
        {
            throw new InvalidOperationException(
                "Jwt:ExpiresInMinutes must be greater than zero.");
        }

        var claims = new List<Claim>
        {
            new(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()),

            new(
                ClaimTypes.Name,
                user.Username),

            new(
                ClaimTypes.Email,
                user.Email)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key));

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiresInMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// =========================
// LOGIN REQUEST
// =========================

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

