namespace YBP.Domain.Common.Exceptions;

/// <summary>
/// Raised when a domain invariant or business rule is violated. The Application layer
/// translates these into validation/conflict responses at the API boundary.
/// </summary>
public class DomainException : Exception
{
    /// <summary>Creates a domain exception with the supplied message.</summary>
    /// <param name="message">A human-readable description of the violated rule.</param>
    public DomainException(string message) : base(message) { }

    /// <summary>Creates a domain exception wrapping an inner exception.</summary>
    /// <param name="message">A human-readable description of the violated rule.</param>
    /// <param name="innerException">The underlying cause.</param>
    public DomainException(string message, Exception innerException) : base(message, innerException) { }
}

/// <summary>Raised when an application status transition is not permitted by the workflow.</summary>
public sealed class InvalidStatusTransitionException : DomainException
{
    /// <summary>Creates the exception with a descriptive message.</summary>
    /// <param name="message">Details of the illegal transition.</param>
    public InvalidStatusTransitionException(string message) : base(message) { }
}
