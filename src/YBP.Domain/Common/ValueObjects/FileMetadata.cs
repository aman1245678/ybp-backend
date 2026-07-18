using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;
using YBP.Domain.Common.Exceptions;

namespace YBP.Domain.Common.ValueObjects;

/// <summary>
/// Descriptive metadata for an uploaded file: original name, MIME type, detected kind and size.
/// Owned by the <c>Document</c> aggregate.
/// </summary>
public sealed class FileMetadata : ValueObject
{
    /// <summary>Original file name.</summary>
    public string Name { get; private set; }

    /// <summary>MIME type reported by the browser.</summary>
    public string MimeType { get; private set; }

    /// <summary>Detected file kind (used for validation and preview).</summary>
    public FileKind Kind { get; private set; }

    /// <summary>Size in bytes.</summary>
    public long SizeBytes { get; private set; }

    private FileMetadata(string name, string mimeType, FileKind kind, long sizeBytes)
    {
        Name = name;
        MimeType = mimeType;
        Kind = kind;
        SizeBytes = sizeBytes;
    }

    private FileMetadata() // ORM
    {
        Name = string.Empty;
        MimeType = string.Empty;
    }

    /// <summary>Creates validated <see cref="FileMetadata"/>.</summary>
    /// <param name="name">Original file name (required).</param>
    /// <param name="mimeType">MIME type (required).</param>
    /// <param name="kind">Detected file kind.</param>
    /// <param name="sizeBytes">Size in bytes (non-negative).</param>
    /// <exception cref="DomainException">Thrown when name/MIME are empty or size is negative.</exception>
    public static FileMetadata Create(string? name, string? mimeType, FileKind kind, long sizeBytes)
    {
        var safeName = DomainGuard.NotNullOrWhiteSpace(name);
        var safeMime = DomainGuard.NotNullOrWhiteSpace(mimeType);
        DomainGuard.Requires(sizeBytes >= 0, "File size cannot be negative.");
        return new FileMetadata(safeName, safeMime, kind, sizeBytes);
    }

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Name;
        yield return MimeType;
        yield return Kind;
        yield return SizeBytes;
    }
}
