import { DomainGuard } from '../base/DomainGuard.js';
import { DomainException } from '../exceptions/DomainException.js';
import { ValueObject } from '../base/ValueObject.js';

export class TagList extends ValueObject {
  static DefaultMaxTags = 50;

  /** @param {string[]} values */
  constructor(values) {
    super();
    this._values = values;
  }

  /** @returns {readonly string[]} */
  get values() {
    return Object.freeze([...this._values]);
  }

  get isEmpty() {
    return this._values.length === 0;
  }

  static get Empty() {
    return new TagList([]);
  }

  /** @param {Iterable<string|null|undefined>|null|undefined} items @param {number} [maxTags] */
  static Create(items, maxTags = TagList.DefaultMaxTags) {
    const result = [];
    const seen = new Set();

    for (const raw of items ?? []) {
      const trimmed = raw?.trim();
      if (trimmed == null || trimmed === '') continue;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(trimmed);
    }

    if (result.length > maxTags)
      throw new DomainException(`A maximum of ${maxTags} tags is allowed.`);

    return new TagList(result);
  }

  getEqualityComponents() {
    return [...this._values];
  }
}
