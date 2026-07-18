namespace YBP.Shared.Time;

/// <summary>
/// Abstraction over the system clock. Injected everywhere a timestamp is needed
/// (audit fields, OTP expiry, status-event times) so time can be controlled in tests
/// and there is a single source of "now" across the app and background jobs.
/// </summary>
public interface IClock
{
    DateTime UtcNow { get; }
    DateTimeOffset UtcNowOffset { get; }
}
