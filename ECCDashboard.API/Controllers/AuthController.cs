
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

    public AuthController(
        AppDbContext context,
        IPasswordHasher<User> passwordHasher,
        IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
    }

    // ==========================================
    // LOGIN
    // ==========================================

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u =>
                u.Email.ToLower() == request.Email.ToLower());

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        // Inactive users cannot login
        if (!user.IsActive)
        {
            return Unauthorized(new
            {
                message = "This account is inactive."
            });
        }

        var passwordResult =
            _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );

        if (passwordResult ==
            PasswordVerificationResult.Failed)
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

        var token = GenerateToken(
            user,
            roles
        );

        Response.Cookies.Append(
            "ecc_auth",
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // true when using HTTPS in production
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(
                    _configuration.GetValue<int>(
                        "Jwt:ExpiresInMinutes"
                    )
                ),
                Path = "/"
            }
        );

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

    // ==========================================
    // CURRENT USER
    // ==========================================

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userIdClaim =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

        if (!int.TryParse(
            userIdClaim,
            out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(
                u => u.Id == userId
            );
        // User no longer exists
        if (user == null)
        {
            Response.Cookies.Delete("ecc_auth");

            return Unauthorized(new
            {
                message = "User account no longer exists."
            });
        }

        // User was deactivated after login
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


    // ==========================================
    // LOGOUT
    // ==========================================

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(
            "ecc_auth",
            new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // true in production with HTTPS
                SameSite = SameSiteMode.Lax,
                Path = "/"
            }
        );

        return Ok(new
        {
            message = "Logged out successfully."
        });
    }


    // ==========================================
    // JWT TOKEN
    // ==========================================

    private string GenerateToken(
        User user,
        List<string> roles)
    {
        var key =
            _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "JWT Key is missing."
            );

        var issuer =
            _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException(
                "JWT Issuer is missing."
            );

        var audience =
            _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException(
                "JWT Audience is missing."
            );

        var expiresInMinutes =
            _configuration.GetValue<int>(
                "Jwt:ExpiresInMinutes"
            );

        var claims = new List<Claim>
        {
            new(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            ),

            new(
                ClaimTypes.Name,
                user.Username
            ),

            new(
                ClaimTypes.Email,
                user.Email
            )
        };

        foreach (var role in roles)
        {
            claims.Add(
                new Claim(
                    ClaimTypes.Role,
                    role
                )
            );
        }

        var securityKey =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key)
            );

        var credentials =
            new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256
            );

        var token =
            new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    expiresInMinutes
                ),
                signingCredentials: credentials
            );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}


// ==========================================
// REQUEST MODELS
// ==========================================

public class LoginRequest
{
    public string Email { get; set; } =
        string.Empty;

    public string Password { get; set; } =
        string.Empty;
}

