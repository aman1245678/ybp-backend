namespace YBP.Domain.Common.Enums;

/// <summary>Supported SMS providers (secrets live server-side; selection is configuration-driven).</summary>
public enum SmsProvider
{
    /// <summary>Twilio.</summary>
    Twilio = 0,

    /// <summary>MSG91 (the configured default).</summary>
    Msg91 = 1,

    /// <summary>Fast2SMS.</summary>
    Fast2Sms = 2
}

/// <summary>The delivery channels the notification subsystem can dispatch through.</summary>
public enum NotificationChannel
{
    /// <summary>SMS (live).</summary>
    Sms = 0,

    /// <summary>Email (future-ready).</summary>
    Email = 1,

    /// <summary>CRM sync (future-ready).</summary>
    Crm = 2,

    /// <summary>WhatsApp (future).</summary>
    WhatsApp = 3,

    /// <summary>Push notification (future).</summary>
    Push = 4
}

/// <summary>The delivery state of a single outbound notification.</summary>
public enum NotificationStatus
{
    /// <summary>Queued for dispatch.</summary>
    Queued = 0,

    /// <summary>Successfully sent.</summary>
    Sent = 1,

    /// <summary>Failed after retries.</summary>
    Failed = 2,

    /// <summary>Intentionally skipped (channel disabled or no recipient).</summary>
    Skipped = 3
}
