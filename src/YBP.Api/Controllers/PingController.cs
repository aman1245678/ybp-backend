using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using YBP.Shared.Time;

namespace YBP.Api.Controllers;

/// <summary>
/// Minimal liveness/diagnostics endpoint used to verify the Milestone 1 foundation:
/// routing, versioning, DI (IClock) and the JSON pipeline are all working.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public sealed class PingController(IClock clock) : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new
    {
        service = "YBP.Api",
        status = "ok",
        apiVersion = "v1",
        timeUtc = clock.UtcNow
    });
}
