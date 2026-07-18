namespace YBP.Domain.Common.Enums;

/// <summary>The kind of action recorded in the audit log.</summary>
public enum AuditAction
{
    /// <summary>A record was created.</summary>
    Create = 0,

    /// <summary>A record was updated.</summary>
    Update = 1,

    /// <summary>A record was soft-deleted.</summary>
    SoftDelete = 2,

    /// <summary>A record was restored from soft-delete.</summary>
    Restore = 3,

    /// <summary>An application status was changed.</summary>
    StatusChange = 4,

    /// <summary>A user signed in.</summary>
    Login = 5,

    /// <summary>Credentials were issued for a registration request.</summary>
    IssueCredentials = 6
}

/// <summary>Difficulty/level of a vocational training program.</summary>
public enum TrainingLevel
{
    /// <summary>Beginner level.</summary>
    Beginner = 0,

    /// <summary>Intermediate level.</summary>
    Intermediate = 1,

    /// <summary>Advanced level.</summary>
    Advanced = 2
}
