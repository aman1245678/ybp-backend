import { randomUUID } from 'node:crypto';
import { Entity } from '../common/base/Entity.js';
import { DomainGuard } from '../common/base/DomainGuard.js';
import { TagList } from '../common/valueObjects/TagList.js';

export class WorkforceRole extends Entity {
  /**
   * @param {string} id
   * @param {string} title
   * @param {number} count
   * @param {TagList} skills
   * @param {string|null} experienceLevel
   */
  constructor(id, title, count, skills, experienceLevel) {
    super(id);
    this.title = title;
    this.count = count;
    this.skills = skills;
    this.experienceLevel = experienceLevel;
  }

  /**
   * @param {string|null} title
   * @param {number} count
   * @param {Iterable<string>|null} [skills]
   * @param {string|null} [experienceLevel]
   */
  static create(title, count, skills = null, experienceLevel = null) {
    const safeTitle = DomainGuard.notNullOrWhiteSpace(title);
    DomainGuard.atLeast(count, 1);
    return new WorkforceRole(
      randomUUID(),
      safeTitle,
      count,
      TagList.Create(skills),
      DomainGuard.maxLength(experienceLevel, 100),
    );
  }

  /** @param {number} count */
  changeCount(count) {
    this.count = DomainGuard.atLeast(count, 1);
  }
}
