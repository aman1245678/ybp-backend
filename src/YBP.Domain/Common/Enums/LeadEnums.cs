namespace YBP.Domain.Common.Enums;

/// <summary>The inbound inquiry sources across the site (mirrors the frontend <c>InquiryType</c>).</summary>
public enum InquiryType
{
    /// <summary>General contact-form inquiry.</summary>
    Contact = 0,

    /// <summary>Consultation request.</summary>
    Consultation = 1,

    /// <summary>Collaboration/partnership inquiry.</summary>
    Collaboration = 2,

    /// <summary>Talent registration (raised alongside a talent/casting/media application).</summary>
    TalentRegistration = 3,

    /// <summary>Manpower/workforce requirement.</summary>
    ManpowerRequirement = 4
}

/// <summary>Triage lifecycle of a lead in the (future) CRM/lead-management pipeline.</summary>
public enum LeadStatus
{
    /// <summary>Newly received, untriaged.</summary>
    New = 0,

    /// <summary>Reviewed and categorized.</summary>
    Triaged = 1,

    /// <summary>Contacted by the team.</summary>
    Contacted = 2,

    /// <summary>Qualified as a genuine opportunity.</summary>
    Qualified = 3,

    /// <summary>Converted to a client/engagement.</summary>
    Converted = 4,

    /// <summary>Closed (won, lost, or spam).</summary>
    Closed = 5
}

/// <summary>The originating channel/surface of a lead.</summary>
public enum LeadSource
{
    /// <summary>Contact form.</summary>
    ContactForm = 0,

    /// <summary>Collaboration form.</summary>
    CollaborationForm = 1,

    /// <summary>Talent &amp; Career portal.</summary>
    TalentPortal = 2,

    /// <summary>Casting application portal.</summary>
    CastingPortal = 3,

    /// <summary>Media professional portal.</summary>
    MediaPortal = 4,

    /// <summary>Manpower requirement portal.</summary>
    ManpowerPortal = 5
}
