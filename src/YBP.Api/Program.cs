using Asp.Versioning;
using Serilog;
using YBP.Api.Swagger;
using YBP.Shared.Time;

// Bootstrap logger — captures anything that happens before the host is built.
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting YBP.Api host");

    var builder = WebApplication.CreateBuilder(args);

    // --- Logging (Serilog, configured from appsettings) ---------------------
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    // --- Shared kernel services --------------------------------------------
    builder.Services.AddSingleton<IClock, SystemClock>();

    // --- MVC controllers ----------------------------------------------------
    builder.Services.AddControllers();

    // --- API versioning (URL segment: /api/v1/...) --------------------------
    builder.Services
        .AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
            options.ApiVersionReader = new UrlSegmentApiVersionReader();
        })
        .AddApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";       // v1, v2, ...
            options.SubstituteApiVersionInUrl = true;
        });

    // --- Swagger / OpenAPI --------------------------------------------------
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    builder.Services.ConfigureOptions<ConfigureSwaggerOptions>();

    // --- CORS for the Angular SPA ------------------------------------------
    const string spaCorsPolicy = "SpaCors";
    var allowedOrigins = builder.Configuration
        .GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
    builder.Services.AddCors(options => options.AddPolicy(spaCorsPolicy, policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()));

    // --- Health checks ------------------------------------------------------
    builder.Services.AddHealthChecks();

    var app = builder.Build();

    // --- HTTP pipeline ------------------------------------------------------
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            foreach (var description in app.DescribeApiVersions())
            {
                options.SwaggerEndpoint(
                    $"/swagger/{description.GroupName}/swagger.json",
                    description.GroupName.ToUpperInvariant());
            }
        });
    }

    app.UseHttpsRedirection();
    app.UseCors(spaCorsPolicy);
    app.UseAuthorization();

    app.MapControllers();
    app.MapHealthChecks("/health");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "YBP.Api host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

/// <summary>Exposed so the integration-test host (WebApplicationFactory) can reference it.</summary>
public partial class Program;
