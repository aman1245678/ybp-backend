import { DomainGuard } from '../base/DomainGuard.js';
import { DomainException } from '../exceptions/DomainException.js';
import { ValueObject } from '../base/ValueObject.js';

export class PhysicalProfile extends ValueObject {
  /** @param {number|null} heightCm @param {number|null} weightKg @param {string|null} complexion @param {string|null} hairColor @param {string|null} eyeColor @param {string|null} measurements */
  constructor(heightCm, weightKg, complexion, hairColor, eyeColor, measurements) {
    super();
    this.heightCm = heightCm;
    this.weightKg = weightKg;
    this.complexion = complexion;
    this.hairColor = hairColor;
    this.eyeColor = eyeColor;
    this.measurements = measurements;
  }

  static get Empty() {
    return new PhysicalProfile(null, null, null, null, null, null);
  }

  /** @param {number|null} [heightCm] @param {number|null} [weightKg] @param {string|null} [complexion] @param {string|null} [hairColor] @param {string|null} [eyeColor] @param {string|null} [measurements] */
  static Create(
    heightCm = null,
    weightKg = null,
    complexion = null,
    hairColor = null,
    eyeColor = null,
    measurements = null,
  ) {
    if (heightCm != null && heightCm <= 0)
      throw new DomainException('Height must be a positive value.');
    if (weightKg != null && weightKg <= 0)
      throw new DomainException('Weight must be a positive value.');

    return new PhysicalProfile(
      heightCm,
      weightKg,
      DomainGuard.maxLength(complexion, 100),
      DomainGuard.maxLength(hairColor, 100),
      DomainGuard.maxLength(eyeColor, 100),
      DomainGuard.maxLength(measurements, 100),
    );
  }

  getEqualityComponents() {
    return [
      this.heightCm,
      this.weightKg,
      this.complexion,
      this.hairColor,
      this.eyeColor,
      this.measurements,
    ];
  }
}
