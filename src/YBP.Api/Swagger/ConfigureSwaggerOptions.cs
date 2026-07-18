using Asp.Versioning.ApiExplorer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace YBP.Api.Swagger;

/// <summary>
/// Generates one Swagger document per discovered API version, so every
/// <c>/api/v{n}</c> surface is documented independently as new versions are added.
/// </summary>
public sealed class ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider)
    : IConfigureOptions<SwaggerGenOptions>
{
    public void Configure(SwaggerGenOptions options)
    {
        foreach (var description in provider.ApiVersionDescriptions)
        {
            options.SwaggerDoc(description.GroupName, new OpenApiInfo
            {
                Title = "Yashvi Bagga Productions API",
                Version = description.ApiVersion.ToString(),
                Description = "Backend API for the Yashvi Bagga Productions platform."
                    + (description.IsDeprecated ? " This API version has been deprecated." : string.Empty)
            });
        }
    }
}
