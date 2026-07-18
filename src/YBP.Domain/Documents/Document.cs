using YBP.Domain.Common.Base;
using YBP.Domain.Common.Enums;
using YBP.Domain.Common.Exceptions;
using YBP.Domain.Common.ValueObjects;
using YBP.Domain.Documents.Events;

namespace YBP.Domain.Documents;

/// <summary>
/// An uploaded asset (resume, portfolio, work sample, attachment or CMS media). Uploaded before it
/// is linked, so it owns its own lifecycle: register → upload → scan → attach to an owner. Uses a
/// polymorphic owner reference (<see cref="OwnerType"/> + <see cref="OwnerId"/>).
/// </summary>
public sealed class Document : AuditableAggregateRoot<Guid>
{
    /// <summary>Descriptive metadata (name, MIME, kind, size).</summary>
    public FileMetadata Metadata { get; private set; } = default!;

    /// <summary>What the document represents on its owning form.</summary>
    public DocumentPurpose Purpose { get; private set; }

    /// <summary>The kind of aggregate that owns this document (Unassigned until linked).</summary>
    public DocumentOwnerType OwnerType { get; private set; } = DocumentOwnerType.Unassigned;

    /// <summary>The owning aggregate's identifier (null until linked).</summary>
    public Guid? OwnerId { get; private set; }

    /// <summary>The storage key/path in the backing store (set once uploaded).</summary>
    public string? StorageKey { get; private set; }

    /// <summary>The public/CDN or signed URL (set once uploaded).</summary>
    public string? Url { get; private set; }

    /// <summary>The upload lifecycle state.</summary>
    public UploadStatus UploadStatus { get; private set; } = UploadStatus.Pending;

    /// <summary>The virus-scan state.</summary>
    public ScanStatus ScanStatus { get; private set; } = ScanStatus.Pending;

    /// <summary>An error message when the upload failed.</summary>
    public string? Error { get; private set; }

    private Document(Guid id) : base(id) { }

    private Document() { } // ORM

    /// <summary>Registers a new document prior to upload.</summary>
    /// <param name="metadata">The file metadata.</param>
    /// <param name="purpose">What the document represents.</param>
    public static Document Register(FileMetadata metadata, DocumentPurpose purpose)
        => new(Guid.NewGuid())
        {
            Metadata = DomainGuard.NotNull(metadata),
            Purpose = purpose,
            UploadStatus = UploadStatus.Pending,
            ScanStatus = ScanStatus.Pending
        };

    /// <summary>Marks the document as successfully uploaded and records its storage location.</summary>
    /// <param name="storageKey">The storage key/path.</param>
    /// <param name="url">The public/signed URL.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void MarkUploaded(string? storageKey, string? url, DateTime utcNow)
    {
        StorageKey = DomainGuard.NotNullOrWhiteSpace(storageKey);
        Url = DomainGuard.NotNullOrWhiteSpace(url);
        UploadStatus = UploadStatus.Uploaded;
        Error = null;
        MarkUpdated(utcNow);
        RaiseDomainEvent(new DocumentUploaded(Id, Purpose) { OccurredOnUtc = utcNow });
    }

    /// <summary>Marks the upload as failed with an error message.</summary>
    /// <param name="error">The failure reason.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void MarkUploadFailed(string error, DateTime utcNow)
    {
        UploadStatus = UploadStatus.Error;
        Error = DomainGuard.NotNullOrWhiteSpace(error);
        MarkUpdated(utcNow);
    }

    /// <summary>Records the outcome of the virus scan.</summary>
    /// <param name="status">The scan result.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    public void MarkScanned(ScanStatus status, DateTime utcNow)
    {
        ScanStatus = status;
        MarkUpdated(utcNow);
        RaiseDomainEvent(new DocumentScanned(Id, status) { OccurredOnUtc = utcNow });
    }

    /// <summary>Links the document to its owning aggregate at submission time.</summary>
    /// <param name="ownerType">The owner aggregate type (must not be Unassigned).</param>
    /// <param name="ownerId">The owner aggregate identifier.</param>
    /// <param name="utcNow">The update instant (UTC).</param>
    /// <exception cref="DomainException">Thrown when the owner type is Unassigned.</exception>
    public void AttachToOwner(DocumentOwnerType ownerType, Guid ownerId, DateTime utcNow)
    {
        DomainGuard.Requires(ownerType != DocumentOwnerType.Unassigned, "A document owner type must be specified.");
        OwnerType = ownerType;
        OwnerId = ownerId;
        MarkUpdated(utcNow);
    }

    /// <summary>True when this document has finished uploading but is not yet linked to an owner.</summary>
    public bool IsOrphan => OwnerType == DocumentOwnerType.Unassigned;
}
