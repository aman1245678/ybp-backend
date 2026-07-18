using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;
using YBP.Domain.Common.ValueObjects;
using YBP.Domain.Identity.Events;

namespace YBP.Domain.Identity;

/// <summary>
/// A public signup captured as a lead: credentials are not self-issued but provisioned out-of-band
/// by an admin (matching the frontend copy "your login credentials will be shared shortly"). Owns
/// the requested → approved → issued/rejected lifecycle.
/// </summary>
public sealed class RegistrationRequest : AuditableAggregateRoot<Guid>
{
    /// <summary>The applicant's name.</summary>
    public PersonName Name { get; private set; } = default!;

    /// <summary>The applicant's mobile number.</summary>
    public MobileNumber Mobile { get; private set; } = default!;

    /// <summary>The applicant's email.</summary>
    public EmailAddress Email { get; private set; } = default!;

    /// <summary>The selected signup category.</summary>
    public SignupCategory Category { get; private set; }

    /// <summary>An optional description of the applicant's requirement.</summary>
    public string? Description { get; private set; }

    /// <summary>The lifecycle status.</summary>
    public RegistrationRequestStatus Status { get; private set; }

    /// <summary>The user account created when credentials were issued, if any.</summary>
    public Guid? IssuedUserId { get; private set; }

    private RegistrationRequest(Guid id) : base(id) { }

    private RegistrationRequest() { } // ORM

    /// <summary>Creates a new registration request and raises <see cref="RegistrationRequested"/>.</summary>
    /// <param name="name">The applicant's name.</param>
    /// <param name="mobile">The applicant's mobile number.</param>
    /// <param name="email">The applicant's email.</param>
    /// <param name="category">The signup category.</param>
    /// <param name="utcNow">The creation instant (UTC).</param>
    /// <param name="description">An optional requirement description.</param>
    public static RegistrationRequest Create(
        PersonName name,
        MobileNumber mobile,
        EmailAddress email,
        SignupCategory category,
        DateTime utcNow,
        string? description = null)
    {
        var request = new RegistrationRequest(Guid.NewGuid())
        {
            Name = DomainGuard.NotNull(name),
            Mobile = DomainGuard.NotNull(mobile),
            Email = DomainGuard.NotNull(email),
            Category = category,
            Description = DomainGuard.MaxLength(description, 2000),
            Status = RegistrationRequestStatus.Requested
        };
        request.RaiseDomainEvent(new RegistrationRequested(request.Id, email.Value, category) { OccurredOnUtc = utcNow });
        return request;
    }

    /// <summary>Approves the request, pending credential issuance.</summary>
    /// <param name="utcNow">The update instant (UTC).</param>
    /// <exception cref="Common.Exceptions.DomainException">Thrown when the request is not in the Requested state.</exception>
    public void Approve(DateTime utcNow)
    {
        DomainGuard.Requires(Status == RegistrationRequestStatus.Requested, "Only a requested registration can be approved.");
        Status = RegistrationRequestStatus.Approved;
        MarkUpdated(utcNow);
    }

    /// <summary>Rejects the request.</summary>
    /// <param name="utcNow">The update instant (UTC).</param>
    /// <exception cref="Common.Exceptions.DomainException">Thrown when the request has already been issued.</exception>
    public void Reject(DateTime utcNow)
    {
        DomainGuard.Requires(Status != RegistrationRequestStatus.Issued, "An issued registration cannot be rejected.");
        Status = RegistrationRequestStatus.Rejected;
        MarkUpdated(utcNow);
    }

    /// <summary>Records that credentials were issued for a newly created user and raises <see cref="CredentialsIssued"/>.</summary>
    /// <param name="userId">The created user's identifier.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    /// <exception cref="Common.Exceptions.DomainException">Thrown when the request has not been approved.</exception>
    public void MarkIssued(Guid userId, DateTime utcNow)
    {
        DomainGuard.Requires(Status == RegistrationRequestStatus.Approved, "Credentials can only be issued for an approved registration.");
        Status = RegistrationRequestStatus.Issued;
        IssuedUserId = userId;
        MarkUpdated(utcNow);
        RaiseDomainEvent(new CredentialsIssued(userId, Id) { OccurredOnUtc = utcNow });
    }
}
