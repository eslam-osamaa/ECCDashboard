using ECCDashboard.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECCDashboard.API.Data;

public class SqlServerAppDbContext : DbContext
{
    public SqlServerAppDbContext(
        DbContextOptions<SqlServerAppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Formulation> Formulations => Set<Formulation>();
    public DbSet<FormulationRawMaterial> FormulationRawMaterials => Set<FormulationRawMaterial>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Reuse the same entity configuration as AppDbContext.
        AppDbContext.ConfigureModel(modelBuilder);
    }
}