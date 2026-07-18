using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;
using YBP.Domain.Common.Exceptions;
using YBP.Domain.Common.ValueObjects;
using YBP.Domain.Leads.Events;

namespace YBP.Domain.Leads;

/// <summary>
/// The unified inbound lead — the seed of the future CRM / lead-management pipeline. Every public
/// submission produces exactly one lead (contact and collaboration create only a lead; the four
/// application tracks create a typed aggregate that also links a lead). Owns its triage lifecycle.
/// </summary>
public sealed class Lead : AuditableAggregateRoot<Guid>
{
    /// <summary>The inquiry type.</summary>
    public InquiryType Type { get; private set; }

    /// <summary>The originating channel/surface.</summary>
    public LeadSource Source { get; private set; }

    /// <summary>A human-friendly label used in admin notifications (e.g. "Contact Form").</summary>
    public string Label { get; private set; } = string.Empty;

    /// <summary>The contact's name.</summary>
    public PersonName Name { get; private set; } = default!;

    /// <summary>The contact's email, if provided.</summary>
    public EmailAddress? Email { get; private set; }

    /// <summary>The contact's mobile, if provided.</summary>
    public MobileNumber? Mobile { get; private set; }

    /// <summary>A service/interest tag (e.g. the requested service or industry).</summary>
    public string? Service { get; private set; }

    /// <summary>A free-text description of the requirement.</summary>
    public string? Requirement { get; private set; }

    /// <summary>Opaque, form-specific extra data captured as JSON (clientType, budget, source, etc.).</summary>
    public string? ExtraJson { get; private set; }

    /// <summary>The triage status of the lead.</summary>
    public LeadStatus Status { get; private set; }

    /// <summary>The typed application this lead is linked to, if any.</summary>
    public Guid? LinkedApplicationId { get; private set; }

    private Lead(Guid id) : base(id) { }

    private Lead() { } // ORM

    /// <summary>Creates a new lead and raises the corresponding domain events.</summary>
    /// <param name="type">The inquiry type.</param>
    /// <param name="source">The originating channel.</param>
    /// <param name="label">A human-friendly label.</param>
    /// <param name="name">The contact's name.</param>
    /// <param name="utcNow">The creation instant (UTC).</param>
    /// <param name="email">The contact's email (optional).</param>
    /// <param name="mobile">The contact's mobile (optional).</param>
    /// <param name="service">A service/interest tag (optional).</param>
    /// <param name="requirement">A free-text requirement (optional).</param>
    /// <param name="extraJson">Form-specific extra data as JSON (optional).</param>
    public static Lead Create(
        InquiryType type,
        LeadSource source,
        string label,
        PersonName name,
        DateTime utcNow,
        EmailAddress? email = null,
        MobileNumber? mobile = null,
        string? service = null,
        string? requirement = null,
        string? extraJson = null)
    {
        var lead = new Lead(Guid.NewGuid())
        {
            Type = type,
            Source = source,
            Label = DomainGuard.NotNullOrWhiteSpace(label),
            Name = DomainGuard.NotNull(name),
            Email = email,
            Mobile = mobile,
            Service = DomainGuard.MaxLength(service, 200),
            Requirement = DomainGuard.MaxLength(requirement, 2000),
            ExtraJson = extraJson,
            Status = LeadStatus.New
        };

        lead.RaiseDomainEvent(new LeadCreated(lead.Id, type, source) { OccurredOnUtc = utcNow });

        if (type is InquiryType.Contact or InquiryType.Collaboration or InquiryType.Consultation)
            lead.RaiseDomainEvent(new InquirySubmitted(lead.Id, type, email?.Value, mobile?.Value) { OccurredOnUtc = utcNow });

        return lead;
    }

    /// <summary>Links this lead to a typed application aggregate.</summary>
    /// <param name="applicationId">The application aggregate identifier.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void LinkApplication(Guid applicationId, DateTime utcNow)
    {
        LinkedApplicationId = applicationId;
        MarkUpdated(utcNow);
    }

    /// <summary>Moves the lead to a new triage status. Closed leads cannot change further.</summary>
    /// <param name="status">The new status.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    /// <exception cref="DomainException">Thrown when the lead is already closed.</exception>
    public void ChangeStatus(LeadStatus status, DateTime utcNow)
    {
        DomainGuard.Requires(Status != LeadStatus.Closed, "A closed lead cannot change status.");
        Status = status;
        MarkUpdated(utcNow);
    }

    /// <summary>Marks the lead as converted.</summary>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void Convert(DateTime utcNow) => ChangeStatus(LeadStatus.Converted, utcNow);

    /// <summary>Closes the lead (won, lost, or spam). Idempotent.</summary>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void Close(DateTime utcNow)
    {
        if (Status == LeadStatus.Closed) return;
        Status = LeadStatus.Closed;
        MarkUpdated(utcNow);
    }
}
