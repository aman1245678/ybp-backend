namespace YBP.Domain.Common.Enums;

/// <summary>The channel over which a one-time password is delivered.</summary>
public enum OtpChannel
{
    /// <summary>Delivered by email.</summary>
    Email = 0,

    /// <summary>Delivered by SMS to a mobile number.</summary>
    Mobile = 1
}

/// <summary>The business context in which an OTP was requested (used for analytics and gating).</summary>
public enum OtpPurpose
{
    /// <summary>Contact form verification.</summary>
    ContactForm = 0,

    /// <summary>Collaboration form verification.</summary>
    CollaborationForm = 1,

    /// <summary>Talent registration verification.</summary>
    TalentRegistration = 2,

    /// <summary>Casting application verification.</summary>
    CastingApplication = 3,

    /// <summary>Media professional registration verification.</summary>
    MediaRegistration = 4,

    /// <summary>Manpower requirement verification.</summary>
    ManpowerRequirement = 5,

    /// <summary>Account (login/registration) contact verification.</summary>
    AccountVerification = 6
}
