namespace YBP.Shared.Time;

/// <summary>The production <see cref="IClock"/> backed by the real UTC system clock.</summary>
public sealed class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;
    public DateTimeOffset UtcNowOffset => DateTimeOffset.UtcNow;
}
