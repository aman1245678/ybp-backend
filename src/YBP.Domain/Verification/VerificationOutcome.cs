namespace YBP.Domain.Verification;

/// <summary>The possible results of attempting to verify a one-time password.</summary>
public enum VerificationOutcome
{
    /// <summary>The code matched and the request is now consumed.</summary>
    Success = 0,

    /// <summary>The code was correct in format but did not match.</summary>
    InvalidCode = 1,

    /// <summary>The request had already expired.</summary>
    Expired = 2,

    /// <summary>The verify-attempt limit was exceeded.</summary>
    TooManyAttempts = 3,

    /// <summary>The request had already been successfully consumed.</summary>
    AlreadyConsumed = 4
}
