using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace ECCDashboard.API.Authorization;

public class PermissionPolicyProvider
    : DefaultAuthorizationPolicyProvider
{
    public PermissionPolicyProvider(
        IOptions<AuthorizationOptions> options)
        : base(options)
    {
    }

    public override async Task<AuthorizationPolicy?>
        GetPolicyAsync(string policyName)
    {
        // Permission policies use this format:
        // Permission:Delete Users

        if (policyName.StartsWith(
            "Permission:",
            StringComparison.OrdinalIgnoreCase))
        {
            var permissionName =
                policyName["Permission:".Length..];

            var policy = new AuthorizationPolicyBuilder()
                .AddRequirements(
                    new PermissionRequirement(permissionName)
                )
                .Build();

            return await Task.FromResult(policy);
        }

        return await base.GetPolicyAsync(policyName);
    }
}