namespace YBP.Domain.Common.Enums;

/// <summary>Account status for a platform user.</summary>
public enum UserStatus
{
    /// <summary>Active and able to sign in.</summary>
    Active = 0,

    /// <summary>Invited/provisioned but has not completed set-up.</summary>
    Invited = 1,

    /// <summary>Temporarily suspended.</summary>
    Suspended = 2,

    /// <summary>Deactivated (soft-disabled).</summary>
    Deactivated = 3
}

/// <summary>The coarse role types aligned to current and future portals.</summary>
public enum RoleType
{
    /// <summary>Full administrative access.</summary>
    Admin = 0,

    /// <summary>Human-resources operations.</summary>
    HR = 1,

    /// <summary>Recruiter / applications pipeline.</summary>
    Recruiter = 2,

    /// <summary>Talent portal user.</summary>
    Talent = 3,

    /// <summary>Media professional portal user.</summary>
    MediaProfessional = 4,

    /// <summary>Client portal user.</summary>
    Client = 5,

    /// <summary>Trainer / training management.</summary>
    Trainer = 6
}

/// <summary>Lifecycle of a signup registration request (credentials issued out-of-band).</summary>
public enum RegistrationRequestStatus
{
    /// <summary>Submitted, awaiting review.</summary>
    Requested = 0,

    /// <summary>Approved, pending credential issuance.</summary>
    Approved = 1,

    /// <summary>Credentials issued and account created.</summary>
    Issued = 2,

    /// <summary>Rejected.</summary>
    Rejected = 3
}

/// <summary>The six signup categories offered by the public auth modal.</summary>
public enum SignupCategory
{
    /// <summary>Actor.</summary>
    Actor = 0,

    /// <summary>Other media professional seeking opportunity.</summary>
    OtherMediaProfessional = 1,

    /// <summary>Media professional searching for a talent pool.</summary>
    TalentPoolSeeker = 2,

    /// <summary>Corporate searching for manpower resources.</summary>
    CorporateManpower = 3,

    /// <summary>Candidate searching for industry jobs.</summary>
    IndustryJobSeeker = 4,

    /// <summary>Corporate searching for training services.</summary>
    CorporateTraining = 5
}
