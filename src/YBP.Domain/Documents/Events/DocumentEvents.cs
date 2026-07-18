using YBP.Domain.Common.Enums;
using YBP.Domain.Common.Events;

namespace YBP.Domain.Documents.Events;

/// <summary>Raised when a document has finished uploading and is stored. Triggers the virus-scan job.</summary>
/// <param name="DocumentId">The document identifier.</param>
/// <param name="Purpose">What the document represents.</param>
public sealed record DocumentUploaded(Guid DocumentId, DocumentPurpose Purpose) : DomainEvent;

/// <summary>Raised when a document's virus scan completes. Infected documents are quarantined.</summary>
/// <param name="DocumentId">The document identifier.</param>
/// <param name="Status">The resulting scan status.</param>
public sealed record DocumentScanned(Guid DocumentId, ScanStatus Status) : DomainEvent;
