using ECCDashboard.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECCDashboard.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
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
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ==========================================
        // FORMULATION
        // ==========================================

        modelBuilder.Entity<Formulation>()
            .HasKey(f => f.SFG);

        modelBuilder.Entity<Formulation>()
            .Property(f => f.SFG)
            .IsRequired();

        modelBuilder.Entity<Formulation>()
            .Property(f => f.ParentCode)
            .IsRequired();

        modelBuilder.Entity<Formulation>()
            .Property(f => f.Description)
            .IsRequired();

        modelBuilder.Entity<Formulation>()
            .Property(f => f.Status)
            .IsRequired();


        // ==========================================
        // FORMULATION RAW MATERIALS
        // ==========================================

        modelBuilder.Entity<FormulationRawMaterial>()
            .HasOne(rm => rm.Formulation)
            .WithMany(f => f.RawMaterials)
            .HasForeignKey(rm => rm.SFG)
            .HasPrincipalKey(f => f.SFG)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FormulationRawMaterial>()
            .Property(rm => rm.Code)
            .IsRequired();

        modelBuilder.Entity<FormulationRawMaterial>()
            .Property(rm => rm.Description)
            .IsRequired();

        modelBuilder.Entity<FormulationRawMaterial>()
            .Property(rm => rm.Percentage)
            .HasPrecision(10, 4);


        // ==========================================
        // USER
        // ==========================================

        modelBuilder.Entity<User>()
            .HasKey(u => u.Id);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.Username)
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(u => u.PasswordHash)
            .IsRequired();

        modelBuilder.Entity<User>()
            .HasOne(u => u.CreatedByUser)
            .WithMany()
            .HasForeignKey(u => u.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.LastModifiedByUser)
            .WithMany()
            .HasForeignKey(u => u.LastModifiedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        // ==========================================
        // ROLE
        // ==========================================

        modelBuilder.Entity<Role>()
            .HasKey(r => r.Id);

        modelBuilder.Entity<Role>()
            .HasIndex(r => r.Name)
            .IsUnique();

        modelBuilder.Entity<Role>()
            .Property(r => r.Name)
            .IsRequired();


        // ==========================================
        // USER ROLE
        // ==========================================

        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new
            {
                ur.UserId,
                ur.RoleId
            });

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
        // ==========================================
        // PERMISSION
        // ==========================================

        modelBuilder.Entity<Permission>()
            .HasKey(p => p.Id);

        modelBuilder.Entity<Permission>()
            .HasIndex(p => p.Name)
            .IsUnique();

        modelBuilder.Entity<Permission>()
            .Property(p => p.Name)
            .IsRequired();


        // ==========================================
        // ROLE PERMISSION
        // ==========================================

        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new
            {
                rp.RoleId,
                rp.PermissionId
            });

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}