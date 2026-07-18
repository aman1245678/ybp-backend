namespace YBP.Domain.Common.Enums;

/// <summary>Deployment work mode for a workforce requirement.</summary>
public enum WorkMode
{
    /// <summary>On-site at the client location.</summary>
    Onsite = 0,

    /// <summary>Fully remote.</summary>
    Remote = 1,

    /// <summary>A mix of on-site and remote.</summary>
    Hybrid = 2
}

/// <summary>Gender captured on the casting application (optional).</summary>
public enum Gender
{
    /// <summary>Not provided.</summary>
    Unspecified = 0,

    /// <summary>Female.</summary>
    Female = 1,

    /// <summary>Male.</summary>
    Male = 2,

    /// <summary>Non-binary.</summary>
    NonBinary = 3,

    /// <summary>Other.</summary>
    Other = 4
}

/// <summary>Approximate organization size band (mirrors the manpower wizard options).</summary>
public enum CompanySize
{
    /// <summary>Not provided.</summary>
    Unspecified = 0,

    /// <summary>1–10 employees.</summary>
    Size1To10 = 1,

    /// <summary>11–50 employees.</summary>
    Size11To50 = 2,

    /// <summary>51–200 employees.</summary>
    Size51To200 = 3,

    /// <summary>201–500 employees.</summary>
    Size201To500 = 4,

    /// <summary>500+ employees.</summary>
    Size500Plus = 5
}
