import { DomainGuard } from '../base/DomainGuard.js';
import { ValueObject } from '../base/ValueObject.js';

export class Money extends ValueObject {
  static DefaultCurrency = 'INR';

  /** @param {number} amount @param {string} currency */
  constructor(amount, currency) {
    super();
    this.amount = amount;
    this.currency = currency;
  }

  static get Zero() {
    return new Money(0, Money.DefaultCurrency);
  }

  /** @param {number} amount @param {string} [currency] */
  static Create(amount, currency = Money.DefaultCurrency) {
    DomainGuard.requires(amount >= 0, 'Amount cannot be negative.');
    return new Money(amount, DomainGuard.notNullOrWhiteSpace(currency).toUpperCase());
  }

  getEqualityComponents() {
    return [this.amount, this.currency];
  }
}
