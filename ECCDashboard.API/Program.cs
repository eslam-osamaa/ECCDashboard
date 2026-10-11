using System.Security.Claims;
using System.Text;
using ECCDashboard.API.Authorization;
using ECCDashboard.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// DATABASE
// ==========================================

var useSqlServer = builder.Configuration.GetValue<bool>("UseSqlServer");

var sqlServerConnectionString =
    builder.Configuration.GetConnectionString("SqlServerConnection");

var sqliteConnectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

if (useSqlServer)
{
    if (string.IsNullOrWhiteSpace(sqlServerConnectionString))
    {
        throw new InvalidOperationException(
            "SQL Server connection string is missing.");
    }

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(sqlServerConnectionString));

    builder.Services.AddDbContext<SqlServerAppDbContext>(options =>
        options.UseSqlServer(
            sqlServerConnectionString,
            sql => sql.MigrationsAssembly(
                typeof(SqlServerAppDbContext).Assembly.FullName)));
}
else
{
    if (string.IsNullOrWhiteSpace(sqliteConnectionString))
    {
        throw new InvalidOperationException(
            "SQLite connection string is missing.");
    }

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite(sqliteConnectionString));
}

// ==========================================
// SIGNALR
// ==========================================

builder.Services.AddSignalR();

// ==========================================
// JWT AUTHENTICATION
// ==========================================

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is missing.");

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("JWT Issuer is missing.");

var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("JWT Audience is missing.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,

                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey)),

                RoleClaimType = ClaimTypes.Role,
                NameClaimType = ClaimTypes.NameIdentifier
            };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue(
                    "ecc_auth", out var token))
                {
                    context.Token = token;
                }

                return Task.CompletedTask;
            }
        };
    });

// ==========================================
// AUTHORIZATION
// ==========================================

builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

builder.Services.AddAuthorization();

// ==========================================
// PASSWORD HASHER
// ==========================================

builder.Services.AddScoped<
    IPasswordHasher<ECCDashboard.API.Models.User>,
    PasswordHasher<ECCDashboard.API.Models.User>>();

// ==========================================
// CONTROLLERS & SWAGGER
// ==========================================

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter your JWT token."
        });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [
                new OpenApiSecuritySchemeReference(
                    "Bearer", document)
            ] = []
        });
});

// ==========================================
// CORS
// ==========================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "https://ecc-dashboard-dxx2-gold.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ==========================================
// BUILD APPLICATION
// ==========================================

var app = builder.Build();

// ==========================================
// DATABASE INITIALIZATION
// ==========================================

await DbInitializer.InitializeAsync(app.Services);

// ==========================================
// SWAGGER
// ==========================================

app.MapOpenApi();
app.UseSwagger();
app.UseSwaggerUI();

// ==========================================
// HTTP PIPELINE
// ==========================================

// app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

app.UseCors("ReactApp");

app.UseAuthentication();

app.UseAuthorization();

// ==========================================
// ENDPOINTS
// ==========================================

app.MapControllers();

// SignalR endpoint can be mapped here when needed.

// ==========================================
// RUN
// ==========================================

app.Run();