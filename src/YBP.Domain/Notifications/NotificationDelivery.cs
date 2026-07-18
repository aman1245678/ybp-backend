using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;

namespace YBP.Domain.Notifications;

/// <summary>
/// An auditable record of a single outbound notification (SMS/email/CRM) and its delivery outcome.
/// Each retriable send is its own unit; the background job mutates only this aggregate.
/// </summary>
public sealed class NotificationDelivery : AuditableAggregateRoot<Guid>
{
    /// <summary>The delivery channel.</summary>
    public NotificationChannel Channel { get; private set; }

    /// <summary>The provider used (e.g. "MSG91"), if applicable.</summary>
    public string? Provider { get; private set; }

    /// <summary>The recipient (mobile/email/endpoint).</summary>
    public string Recipient { get; private set; } = string.Empty;

    /// <summary>A routing/logging tag (e.g. "customer", "admin").</summary>
    public string? Tag { get; private set; }

    /// <summary>The template key used to render the message.</summary>
    public string? TemplateKey { get; private set; }

    /// <summary>The current delivery status.</summary>
    public NotificationStatus Status { get; private set; }

    /// <summary>The provider's message identifier once sent.</summary>
    public string? ProviderMessageId { get; private set; }

    /// <summary>The last error message when the send failed.</summary>
    public string? Error { get; private set; }

    /// <summary>The number of send attempts made.</summary>
    public int AttemptCount { get; private set; }

    /// <summary>The related entity type (e.g. "Lead"), for audit correlation.</summary>
    public string? RelatedType { get; private set; }

    /// <summary>The related entity identifier, for audit correlation.</summary>
    public Guid? RelatedId { get; private set; }

    private NotificationDelivery(Guid id) : base(id) { }

    private NotificationDelivery() { } // ORM

    /// <summary>Queues a new notification for dispatch.</summary>
    /// <param name="channel">The delivery channel.</param>
    /// <param name="recipient">The recipient (required).</param>
    /// <param name="templateKey">The template key (optional).</param>
    /// <param name="provider">The provider name (optional).</param>
    /// <param name="tag">A routing/logging tag (optional).</param>
    /// <param name="relatedType">Related entity type for correlation (optional).</param>
    /// <param name="relatedId">Related entity id for correlation (optional).</param>
    public static NotificationDelivery Queue(
        NotificationChannel channel,
        string? recipient,
        string? templateKey = null,
        string? provider = null,
        string? tag = null,
        string? relatedType = null,
        Guid? relatedId = null)
        => new(Guid.NewGuid())
        {
            Channel = channel,
            Recipient = DomainGuard.NotNullOrWhiteSpace(recipient),
            TemplateKey = templateKey,
            Provider = provider,
            Tag = tag,
            RelatedType = relatedType,
            RelatedId = relatedId,
            Status = NotificationStatus.Queued
        };

    /// <summary>Marks the notification as successfully sent.</summary>
    /// <param name="providerMessageId">The provider's message id (optional).</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void MarkSent(string? providerMessageId, DateTime utcNow)
    {
        Status = NotificationStatus.Sent;
        ProviderMessageId = providerMessageId;
        Error = null;
        AttemptCount++;
        MarkUpdated(utcNow);
    }

    /// <summary>Marks a send attempt as failed.</summary>
    /// <param name="error">The failure reason.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void MarkFailed(string? error, DateTime utcNow)
    {
        Status = NotificationStatus.Failed;
        Error = error;
        AttemptCount++;
        MarkUpdated(utcNow);
    }

    /// <summary>Marks the notification as intentionally skipped (channel disabled or no recipient).</summary>
    /// <param name="reason">The reason for skipping.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void MarkSkipped(string? reason, DateTime utcNow)
    {
        Status = NotificationStatus.Skipped;
        Error = reason;
        MarkUpdated(utcNow);
    }
}
