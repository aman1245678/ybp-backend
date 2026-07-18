namespace YBP.Domain.Common.Enums;

/// <summary>The file categories accepted by the upload subsystem (mirrors <c>AllowedFileKind</c>).</summary>
public enum FileKind
{
    /// <summary>Unrecognized/unsupported kind.</summary>
    Unknown = 0,

    /// <summary>PDF document.</summary>
    Pdf = 1,

    /// <summary>Word document (.doc/.docx).</summary>
    Docx = 2,

    /// <summary>JPEG image.</summary>
    Jpg = 3,

    /// <summary>PNG image.</summary>
    Png = 4,

    /// <summary>ZIP archive.</summary>
    Zip = 5,

    /// <summary>MP4 video.</summary>
    Mp4 = 6
}

/// <summary>The lifecycle state of an upload (mirrors <c>UploadStatus</c>).</summary>
public enum UploadStatus
{
    /// <summary>Registered but not yet uploaded.</summary>
    Pending = 0,

    /// <summary>Upload in progress.</summary>
    Uploading = 1,

    /// <summary>Successfully stored.</summary>
    Uploaded = 2,

    /// <summary>Upload failed.</summary>
    Error = 3
}

/// <summary>The virus-scan state of a stored document.</summary>
public enum ScanStatus
{
    /// <summary>Awaiting scan.</summary>
    Pending = 0,

    /// <summary>Scanned and safe.</summary>
    Clean = 1,

    /// <summary>Scanned and flagged as malicious (quarantined).</summary>
    Infected = 2,

    /// <summary>Scanning intentionally skipped (e.g. disabled in the environment).</summary>
    Skipped = 3
}

/// <summary>The kind of aggregate that owns an uploaded document (polymorphic association).</summary>
public enum DocumentOwnerType
{
    /// <summary>Not yet linked to an owner (freshly uploaded).</summary>
    Unassigned = 0,

    /// <summary>Owned by a talent profile.</summary>
    TalentProfile = 1,

    /// <summary>Owned by a casting application.</summary>
    CastingApplication = 2,

    /// <summary>Owned by a media professional registration.</summary>
    MediaProfessional = 3,

    /// <summary>Owned by an outsourcing requirement.</summary>
    OutsourcingRequirement = 4,

    /// <summary>Owned by a CMS content item.</summary>
    Cms = 5
}

/// <summary>What an uploaded document represents on its owning form.</summary>
public enum DocumentPurpose
{
    /// <summary>Generic attachment.</summary>
    Attachment = 0,

    /// <summary>Talent resume/CV.</summary>
    TalentResume = 1,

    /// <summary>Talent supporting attachment.</summary>
    TalentAttachment = 2,

    /// <summary>Casting headshots/reels/portfolio.</summary>
    CastingPortfolio = 3,

    /// <summary>Media professional work sample.</summary>
    MediaWorkSample = 4,

    /// <summary>Manpower requirement supporting document.</summary>
    ManpowerAttachment = 5,

    /// <summary>CMS media asset.</summary>
    CmsAsset = 6
}
