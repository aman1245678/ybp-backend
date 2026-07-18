using YBP.Domain.Common.Base;
using YBP.Domain.Common.Exceptions;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// The physical attributes captured on a casting application. Every field is optional; the value
/// object is owned by <c>CastingApplication</c> and stored inline.
/// </summary>
public sealed class PhysicalProfile : ValueObject
{
    /// <summary>Height in centimetres.</summary>
    public int? HeightCm { get; private set; }

    /// <summary>Weight in kilograms.</summary>
    public int? WeightKg { get; private set; }

    /// <summary>Complexion (e.g. "Fair", "Wheatish", "Dusky").</summary>
    public string? Complexion { get; private set; }

    /// <summary>Hair colour.</summary>
    public string? HairColor { get; private set; }

    /// <summary>Eye colour.</summary>
    public string? EyeColor { get; private set; }

    /// <summary>Free-text measurements (e.g. "32-28-34").</summary>
    public string? Measurements { get; private set; }

    private PhysicalProfile(int? heightCm, int? weightKg, string? complexion, string? hairColor, string? eyeColor, string? measurements)
    {
        HeightCm = heightCm;
        WeightKg = weightKg;
        Complexion = complexion;
        HairColor = hairColor;
        EyeColor = eyeColor;
        Measurements = measurements;
    }

    private PhysicalProfile() { } // ORM

    /// <summary>An empty physical profile.</summary>
    public static PhysicalProfile Empty => new(null, null, null, null, null, null);

    /// <summary>Creates a validated <see cref="PhysicalProfile"/> (all parameters optional).</summary>
    /// <param name="heightCm">Height in centimetres (positive when supplied).</param>
    /// <param name="weightKg">Weight in kilograms (positive when supplied).</param>
    /// <param name="complexion">Complexion.</param>
    /// <param name="hairColor">Hair colour.</param>
    /// <param name="eyeColor">Eye colour.</param>
    /// <param name="measurements">Measurements text.</param>
    /// <exception cref="DomainException">Thrown when a supplied numeric value is not positive.</exception>
    public static PhysicalProfile Create(
        int? heightCm = null,
        int? weightKg = null,
        string? complexion = null,
        string? hairColor = null,
        string? eyeColor = null,
        string? measurements = null)
    {
        if (heightCm is <= 0) throw new DomainException("Height must be a positive value.");
        if (weightKg is <= 0) throw new DomainException("Weight must be a positive value.");

        return new PhysicalProfile(
            heightCm,
            weightKg,
            DomainGuard.MaxLength(complexion, 100),
            DomainGuard.MaxLength(hairColor, 100),
            DomainGuard.MaxLength(eyeColor, 100),
            DomainGuard.MaxLength(measurements, 100));
    }

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return HeightCm;
        yield return WeightKg;
        yield return Complexion;
        yield return HairColor;
        yield return EyeColor;
        yield return Measurements;
    }
}
