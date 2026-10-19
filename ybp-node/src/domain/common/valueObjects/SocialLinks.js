import { DomainGuard } from '../base/DomainGuard.js';
import { ValueObject } from '../base/ValueObject.js';
import { TagList } from './TagList.js';

export class SocialLinks extends ValueObject {
  /** @param {TagList} portfolioLinks @param {TagList} mediaLinks @param {string|null} instagram */
  constructor(portfolioLinks, mediaLinks, instagram) {
    super();
    this.portfolioLinks = portfolioLinks;
    this.mediaLinks = mediaLinks;
    this.instagram = instagram;
  }

  static get Empty() {
    return new SocialLinks(TagList.Empty, TagList.Empty, null);
  }

  /** @param {Iterable<string|null|undefined>|null|undefined} [portfolioLinks] @param {Iterable<string|null|undefined>|null|undefined} [mediaLinks] @param {string|null|undefined} [instagram] */
  static Create(portfolioLinks = null, mediaLinks = null, instagram = null) {
    return new SocialLinks(
      TagList.Create(portfolioLinks),
      TagList.Create(mediaLinks),
      DomainGuard.maxLength(instagram, 256),
    );
  }

  getEqualityComponents() {
    return [this.portfolioLinks, this.mediaLinks, this.instagram];
  }
}
