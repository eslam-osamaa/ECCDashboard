
using ECCDashboard.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ECCDashboard.API.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(
        IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var context = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var passwordHasher = scope.ServiceProvider
            .GetRequiredService<IPasswordHasher<User>>();

        var configuration = scope.ServiceProvider
            .GetRequiredService<IConfiguration>();

        await context.Database.MigrateAsync();

        // ==========================================
        // DEFAULT ROLES
        // ==========================================

        var defaultRoles = new[]
        {
            "Cosmetics",
            "Makeup",
            "SAP Uploading",
            "SAP Production",
            "Planning",
            "Administrator",
            "Weekly Plan Uploader",
            "User Management"
        };

        foreach (var roleName in defaultRoles)
        {
            var role = await context.Roles
                .FirstOrDefaultAsync(r => r.Name == roleName);

            if (role == null)
            {
                context.Roles.Add(new Role
                {
                    Name = roleName,
                    IsSystemRole = roleName == "Administrator"
                });
            }
            else if (
                roleName == "Administrator" &&
                !role.IsSystemRole)
            {
                role.IsSystemRole = true;
            }
        }

        await context.SaveChangesAsync();


        // ==========================================
        // DEFAULT PERMISSIONS
        // ==========================================

        var defaultPermissions = new[]
        {
            // Users
            "View Users",
            "Create Users",
            "Edit Users",
            "Delete Users",

            // Roles
            "View Roles",

            // Permissions
            "View Permissions",

            // Cosmetics
            "View Cosmetics",
            "Add Cosmetics",
            "Edit Cosmetics",
            "Delete Cosmetics",

            // Makeup
            "View Makeup",
            "Add Makeup",
            "Edit Makeup",
            "Delete Makeup",

            // Formulation Workflow
            "Uploading",
            "Production",

            // Weekly Plan
            "Weekly Plan Uploader"
        };

        foreach (var permissionName in defaultPermissions)
        {
            var permissionExists = await context.Permissions
                .AnyAsync(p => p.Name == permissionName);

            if (!permissionExists)
            {
                context.Permissions.Add(new Permission
                {
                    Name = permissionName
                });
            }
        }

        await context.SaveChangesAsync();


        // ==========================================
        // REMOVE OBSOLETE ROLE PERMISSIONS
        // ==========================================

        var obsoletePermissions = await context.Permissions
            .Where(p =>
                p.Name == "Create Roles" ||
                p.Name == "Edit Roles" ||
                p.Name == "Delete Roles")
            .ToListAsync();

        if (obsoletePermissions.Any())
        {
            var obsoletePermissionIds =
                obsoletePermissions
                    .Select(p => p.Id)
                    .ToList();

            // Remove RolePermission records first
            var obsoleteRolePermissions =
                await context.RolePermissions
                    .Where(rp =>
                        obsoletePermissionIds.Contains(
                            rp.PermissionId))
                    .ToListAsync();

            if (obsoleteRolePermissions.Any())
            {
                context.RolePermissions.RemoveRange(
                    obsoleteRolePermissions
                );
            }

            // Remove the obsolete permissions
            context.Permissions.RemoveRange(
                obsoletePermissions
            );

            await context.SaveChangesAsync();
        }


        // ==========================================
        // ASSIGN DEFAULT PERMISSIONS
        // TO ADMINISTRATOR
        // ==========================================

        var administratorRole = await context.Roles
            .FirstAsync(r => r.Name == "Administrator");

        var allPermissions = await context.Permissions
            .ToListAsync();

        var existingAdministratorPermissions =
            await context.RolePermissions
                .Where(rp =>
                    rp.RoleId == administratorRole.Id)
                .Select(rp => rp.PermissionId)
                .ToListAsync();

        var missingAdministratorPermissions =
            allPermissions
                .Where(permission =>
                    !existingAdministratorPermissions
                        .Contains(permission.Id))
                .Select(permission => new RolePermission
                {
                    RoleId = administratorRole.Id,
                    PermissionId = permission.Id
                })
                .ToList();

        if (missingAdministratorPermissions.Any())
        {
            context.RolePermissions.AddRange(
                missingAdministratorPermissions
            );

            await context.SaveChangesAsync();
        }


        // ==========================================
        // INITIAL ADMINISTRATOR
        // ==========================================

        var hasUsers = await context.Users.AnyAsync();

        if (hasUsers)
        {
            return;
        }

        var username =
            configuration["InitialAdmin:Username"];

        var email =
            configuration["InitialAdmin:Email"];

        var password =
            configuration["InitialAdmin:Password"];

        if (string.IsNullOrWhiteSpace(username))
        {
            throw new InvalidOperationException(
                "InitialAdmin:Username is missing."
            );
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new InvalidOperationException(
                "InitialAdmin:Email is missing."
            );
        }

        if (string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "InitialAdmin:Password is missing."
            );
        }

        var adminUser = new User
        {
            Username = username,
            Email = email,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            LastModified = DateTime.UtcNow
        };

        adminUser.PasswordHash =
            passwordHasher.HashPassword(
                adminUser,
                password
            );

        context.Users.Add(adminUser);

        await context.SaveChangesAsync();


        // ==========================================
        // ASSIGN ADMINISTRATOR ROLE
        // ==========================================

        context.UserRoles.Add(new UserRole
        {
            UserId = adminUser.Id,
            RoleId = administratorRole.Id
        });

        await context.SaveChangesAsync();
    }
}

