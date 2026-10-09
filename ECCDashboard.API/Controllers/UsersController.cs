
using System.Security.Claims;
using ECCDashboard.API.Authorization;
using ECCDashboard.API.Data;
using ECCDashboard.API.DTOs.Pagination;
using ECCDashboard.API.DTOs.Users;
using ECCDashboard.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECCDashboard.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Administrator + "," + Roles.UserManagement)]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IWebHostEnvironment _environment;

    private const long MaxProfileImageSize = 5 * 1024 * 1024;

    private static readonly string[] AllowedImageExtensions =
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    public UsersController(
        AppDbContext context,
        IPasswordHasher<User> passwordHasher,
        IWebHostEnvironment environment)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _environment = environment;
    }

    // =========================================================
    // GET ALL USERS
    // =========================================================

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] PaginationRequest request)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1
            ? 10
            : Math.Min(request.PageSize, 100);

        var query = _context.Users
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();

            query = query.Where(u =>
                u.Username.Contains(search) ||
                u.Email.Contains(search));
        }

        if (request.RoleId.HasValue)
        {
            var roleId = request.RoleId.Value;

            query = query.Where(u =>
                u.UserRoles.Any(ur => ur.RoleId == roleId));
        }

        query = query.OrderByDescending(u => u.LastModified);

        var totalCount = await query.CountAsync();

        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.ProfileImage,
                u.IsActive,
                u.CreatedAt,
                u.LastModified,

                createdBy = u.CreatedByUser == null
                    ? null
                    : new
                    {
                        u.CreatedByUser.Id,
                        u.CreatedByUser.Username
                    },

                lastModifiedBy = u.LastModifiedByUser == null
                    ? null
                    : new
                    {
                        u.LastModifiedByUser.Id,
                        u.LastModifiedByUser.Username
                    },

                roles = u.UserRoles
                    .Where(ur => ur.Role != null)
                    .Select(ur => new
                    {
                        ur.Role!.Id,
                        ur.Role.Name
                    })
                    .ToList()
            })
            .ToListAsync();

        var response = new PaginationResponse<object>
        {
            Items = users.Cast<object>().ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(response);
    }

    // =========================================================
    // GET USER BY ID
    // =========================================================

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
            return Unauthorized();

        var canManageUsers = CanManageUsers();

        if (currentUserId != id && !canManageUsers)
            return Forbid();

        var user = await GetUserDetails(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(user);
    }

    // =========================================================
    // CREATE USER
    // =========================================================

    [HttpPost]
    [Authorize(Roles = Roles.Administrator + "," + Roles.UserManagement)]
    public async Task<IActionResult> CreateUser(
        [FromForm] CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
        {
            return BadRequest(new
            {
                message = "Username is required."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new
            {
                message = "Email is required."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "Password is required."
            });
        }

        var username = request.Username.Trim();
        var email = request.Email.Trim();

        var usernameExists = await _context.Users
            .AnyAsync(u =>
                u.Username.ToLower() == username.ToLower());

        if (usernameExists)
        {
            return Conflict(new
            {
                message = "A user with this username already exists."
            });
        }

        var emailExists = await _context.Users
            .AnyAsync(u =>
                u.Email.ToLower() == email.ToLower());

        if (emailExists)
        {
            return Conflict(new
            {
                message = "A user with this email already exists."
            });
        }

        var roleIds = request.RoleIds
            .Distinct()
            .ToList();

        var existingRoleIds = await _context.Roles
            .Where(r => roleIds.Contains(r.Id))
            .Select(r => r.Id)
            .ToListAsync();

        var missingRoleIds = roleIds
            .Except(existingRoleIds)
            .ToList();

        if (missingRoleIds.Any())
        {
            return BadRequest(new
            {
                message = "One or more roles do not exist.",
                roleIds = missingRoleIds
            });
        }

        // User Management cannot assign protected roles.
        // Administrator can assign any existing role.
        if (!User.IsInRole(Roles.Administrator))
        {
            var protectedRoleRequested = await _context.Roles
                .AnyAsync(r =>
                    existingRoleIds.Contains(r.Id) &&
                    (r.Name == Roles.Administrator ||
                     r.Name == Roles.UserManagement));

            if (protectedRoleRequested)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    message =
                        "You cannot assign Administrator or User Management roles."
                });
            }
        }

        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
            return Unauthorized();

        if (request.ProfileImage != null)
        {
            var imageValidation =
                ValidateProfileImage(request.ProfileImage);

            if (imageValidation != null)
            {
                return BadRequest(new
                {
                    message = imageValidation
                });
            }
        }

        var now = DateTime.UtcNow;

        var user = new User
        {
            Username = username,
            Email = email,
            IsActive = true,
            CreatedAt = now,
            LastModified = now,
            CreatedByUserId = currentUserId,
            LastModifiedByUserId = currentUserId
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            request.Password
        );

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        if (request.ProfileImage != null)
        {
            var imagePath = await SaveProfileImage(
                request.ProfileImage,
                user.Id
            );

            user.ProfileImage = imagePath;
            user.LastModified = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        if (existingRoleIds.Any())
        {
            var userRoles = existingRoleIds
                .Select(roleId => new UserRole
                {
                    UserId = user.Id,
                    RoleId = roleId
                })
                .ToList();

            _context.UserRoles.AddRange(userRoles);

            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            message = "User created successfully.",
            user = await GetUserDetails(user.Id)
        });
    }

    // =========================================================
    // EDIT USER
    // =========================================================

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateUser(
        int id,
        [FromForm] UpdateUserRequest request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
            return Unauthorized();

        var isSelf = currentUserId == id;
        var canManageUsers = CanManageUsers();

        if (!isSelf && !canManageUsers)
            return Forbid();

        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        // Basic information
        if (string.IsNullOrWhiteSpace(request.Username))
        {
            return BadRequest(new
            {
                message = "Username is required."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new
            {
                message = "Email is required."
            });
        }

        var username = request.Username.Trim();
        var email = request.Email.Trim();

        var duplicateUsername = await _context.Users
            .AnyAsync(u =>
                u.Id != id &&
                u.Username.ToLower() == username.ToLower());

        if (duplicateUsername)
        {
            return Conflict(new
            {
                message = "A user with this username already exists."
            });
        }

        var duplicateEmail = await _context.Users
            .AnyAsync(u =>
                u.Id != id &&
                u.Email.ToLower() == email.ToLower());

        if (duplicateEmail)
        {
            return Conflict(new
            {
                message = "A user with this email already exists."
            });
        }

        user.Username = username;
        user.Email = email;

        // Password
        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = _passwordHasher.HashPassword(
                user,
                request.Password
            );
        }

        // Profile Image
        if (request.ProfileImage != null)
        {
            var imageValidation =
                ValidateProfileImage(request.ProfileImage);

            if (imageValidation != null)
            {
                return BadRequest(new
                {
                    message = imageValidation
                });
            }

            var imagePath = await SaveProfileImage(
                request.ProfileImage,
                user.Id
            );

            DeleteOldProfileImage(user.ProfileImage);
            user.ProfileImage = imagePath;
        }

        // Roles and active status
        if (canManageUsers)
        {
            if (request.IsActive.HasValue)
            {
                if (isSelf && !request.IsActive.Value)
                {
                    return BadRequest(new
                    {
                        message =
                            "You cannot deactivate your own account."
                    });
                }

                if (!request.IsActive.Value &&
                    await IsLastActiveAdministrator(user))
                {
                    return BadRequest(new
                    {
                        message =
                            "The last active Administrator cannot be deactivated."
                    });
                }

                if (request.IsActive == false)
                {
                    var targetIsAdministrator =
                        await _context.UserRoles
                            .Include(ur => ur.Role)
                            .AnyAsync(ur =>
                                ur.UserId == id &&
                                ur.Role != null &&
                                ur.Role.Name == Roles.Administrator);

                    if (targetIsAdministrator)
                    {
                        return BadRequest(new
                        {
                            message =
                                "Administrator accounts cannot be deactivated."
                        });
                    }
                }

                user.IsActive = request.IsActive.Value;
            }

            // Role changes
            if (request.RoleIds != null)
            {
                var roleIds = request.RoleIds
                    .Distinct()
                    .ToList();

                var existingRoleIds = await _context.Roles
                    .Where(r => roleIds.Contains(r.Id))
                    .Select(r => r.Id)
                    .ToListAsync();

                var missingRoleIds = roleIds
                    .Except(existingRoleIds)
                    .ToList();

                if (missingRoleIds.Any())
                {
                    return BadRequest(new
                    {
                        message = "One or more roles do not exist.",
                        roleIds = missingRoleIds
                    });
                }

                var isCurrentUserAdministrator =
                    User.IsInRole(Roles.Administrator);

                // User Management cannot grant protected roles
                // or remove protected roles already assigned.
                if (!isCurrentUserAdministrator)
                {
                    var protectedRoleIds = await _context.Roles
                        .Where(r =>
                            r.Name == Roles.Administrator ||
                            r.Name == Roles.UserManagement)
                        .Select(r => r.Id)
                        .ToListAsync();

                    var currentlyAssignedProtectedRoleIds =
                        user.UserRoles
                            .Select(ur => ur.RoleId)
                            .Where(roleId =>
                                protectedRoleIds.Contains(roleId))
                            .Distinct()
                            .ToList();

                    // Reject granting protected roles.
                    var attemptedProtectedRoleIds = existingRoleIds
                        .Where(roleId =>
                            protectedRoleIds.Contains(roleId))
                        .Except(currentlyAssignedProtectedRoleIds)
                        .ToList();

                    if (attemptedProtectedRoleIds.Any())
                    {
                        return StatusCode(
                            StatusCodes.Status403Forbidden,
                            new
                            {
                                message =
                                    "You cannot assign Administrator or User Management roles."
                            });
                    }

                    // Explicitly reject removing User Management
                    // from the current user's own account.
                    var userManagementRoleId =
                        await _context.Roles
                            .Where(r =>
                                r.Name == Roles.UserManagement)
                            .Select(r => (int?)r.Id)
                            .FirstOrDefaultAsync();

                    var isRemovingOwnUserManagementRole =
                        currentUserId == id &&
                        userManagementRoleId.HasValue &&
                        currentlyAssignedProtectedRoleIds.Contains(
                            userManagementRoleId.Value) &&
                        !existingRoleIds.Contains(
                            userManagementRoleId.Value);

                    if (isRemovingOwnUserManagementRole)
                    {
                        return BadRequest(new
                        {
                            message =
                                "You cannot remove the User Management role from your own account."
                        });
                    }

                    // Preserve protected roles already assigned
                    // to the target user.
                    foreach (var protectedRoleId
                             in currentlyAssignedProtectedRoleIds)
                    {
                        if (!existingRoleIds.Contains(protectedRoleId))
                        {
                            existingRoleIds.Add(protectedRoleId);
                        }
                    }
                }

                // Prevent removing Administrator from the
                // last Administrator account.
                var administratorRole =
                    await _context.Roles
                        .FirstOrDefaultAsync(r =>
                            r.IsSystemRole &&
                            r.Name == Roles.Administrator);

                if (administratorRole != null)
                {
                    var currentlyAdministrator =
                        user.UserRoles.Any(ur =>
                            ur.RoleId == administratorRole.Id);

                    var willRemainAdministrator =
                        existingRoleIds.Contains(
                            administratorRole.Id);

                    if (currentlyAdministrator &&
                        !willRemainAdministrator)
                    {
                        var administratorCount =
                            await _context.UserRoles
                                .Where(ur =>
                                    ur.RoleId == administratorRole.Id)
                                .Select(ur => ur.UserId)
                                .Distinct()
                                .CountAsync();

                        if (administratorCount <= 1)
                        {
                            return BadRequest(new
                            {
                                message =
                                    "The last Administrator role cannot be removed."
                            });
                        }
                    }
                }

                _context.UserRoles.RemoveRange(user.UserRoles);

                var newUserRoles = existingRoleIds
                    .Select(roleId => new UserRole
                    {
                        UserId = id,
                        RoleId = roleId
                    })
                    .ToList();

                _context.UserRoles.AddRange(newUserRoles);
            }
        }

        // Audit
        user.LastModified = DateTime.UtcNow;
        user.LastModifiedByUserId = currentUserId;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "User updated successfully.",
            user = await GetUserDetails(id)
        });
    }

    // =========================================================
    // DELETE USER
    // =========================================================

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Administrator + "," + Roles.UserManagement)]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == null)
            return Unauthorized();

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        if (currentUserId == id)
        {
            return BadRequest(new
            {
                message = "You cannot delete your own account."
            });
        }

        var targetIsAdministrator = user.UserRoles
            .Any(ur =>
                ur.Role != null &&
                ur.Role.Name == Roles.Administrator);

        // User Management cannot delete Administrators.
        if (targetIsAdministrator &&
            !User.IsInRole(Roles.Administrator))
        {
            return Forbid();
        }

        // Prevent deleting the last Administrator.
        if (targetIsAdministrator)
        {
            var administratorRole =
                await _context.Roles
                    .FirstOrDefaultAsync(r =>
                        r.IsSystemRole &&
                        r.Name == Roles.Administrator);

            if (administratorRole != null)
            {
                var administratorCount =
                    await _context.UserRoles
                        .Where(ur =>
                            ur.RoleId == administratorRole.Id)
                        .Select(ur => ur.UserId)
                        .Distinct()
                        .CountAsync();

                if (administratorCount <= 1)
                {
                    return BadRequest(new
                    {
                        message =
                            "The last Administrator account cannot be deleted."
                    });
                }
            }
        }

        DeleteOldProfileImage(user.ProfileImage);

        _context.Users.Remove(user);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "User deleted successfully."
        });
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private int? GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
            return null;

        return userId;
    }

    private bool CanManageUsers()
    {
        return User.IsInRole(Roles.Administrator) ||
               User.IsInRole(Roles.UserManagement);
    }

    private string? ValidateProfileImage(IFormFile image)
    {
        if (image.Length <= 0)
            return "Profile image is empty.";

        if (image.Length > MaxProfileImageSize)
            return "Profile image cannot exceed 5 MB.";

        var extension = Path.GetExtension(image.FileName)
            .ToLowerInvariant();

        if (!AllowedImageExtensions.Contains(extension))
        {
            return
                "Only JPG, JPEG, PNG and WEBP images are allowed.";
        }

        return null;
    }

    private async Task<string> SaveProfileImage(
        IFormFile image,
        int userId)
    {
        var uploadsFolder = Path.Combine(
            _environment.WebRootPath,
            "uploads",
            "profiles"
        );

        Directory.CreateDirectory(uploadsFolder);

        var extension = Path.GetExtension(image.FileName)
            .ToLowerInvariant();

        var fileName = $"{userId}_{Guid.NewGuid():N}{extension}";

        var filePath = Path.Combine(
            uploadsFolder,
            fileName
        );

        await using var stream = new FileStream(
            filePath,
            FileMode.Create
        );

        await image.CopyToAsync(stream);

        return $"/uploads/profiles/{fileName}";
    }

    private void DeleteOldProfileImage(string? profileImage)
    {
        if (string.IsNullOrWhiteSpace(profileImage))
            return;

        var relativePath = profileImage
            .TrimStart('/')
            .Replace('/', Path.DirectorySeparatorChar);

        var fullPath = Path.Combine(
            _environment.WebRootPath,
            relativePath
        );

        if (System.IO.File.Exists(fullPath))
            System.IO.File.Delete(fullPath);
    }

    private async Task<bool> IsLastActiveAdministrator(User user)
    {
        var administratorRole =
            await _context.Roles
                .FirstOrDefaultAsync(r =>
                    r.IsSystemRole &&
                    r.Name == Roles.Administrator);

        if (administratorRole == null)
            return false;

        var isAdministrator = user.UserRoles.Any(ur =>
            ur.RoleId == administratorRole.Id);

        if (!isAdministrator)
            return false;

        var activeAdministrators =
            await _context.Users
                .Where(u =>
                    u.IsActive &&
                    u.UserRoles.Any(ur =>
                        ur.RoleId == administratorRole.Id))
                .CountAsync();

        return activeAdministrators <= 1;
    }

    private async Task<object?> GetUserDetails(int id)
    {
        return await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.ProfileImage,
                u.IsActive,
                u.CreatedAt,
                u.LastModified,

                createdBy = u.CreatedByUser == null
                    ? null
                    : new
                    {
                        u.CreatedByUser.Id,
                        u.CreatedByUser.Username
                    },

                lastModifiedBy = u.LastModifiedByUser == null
                    ? null
                    : new
                    {
                        u.LastModifiedByUser.Id,
                        u.LastModifiedByUser.Username
                    },

                roles = u.UserRoles
                    .Where(ur => ur.Role != null)
                    .Select(ur => new
                    {
                        ur.Role!.Id,
                        ur.Role.Name
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();
    }
}