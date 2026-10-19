/** Base class for immutable value objects with structural equality. */
export class ValueObject {
  /** @returns {unknown[]} */
  getEqualityComponents() {
    return [];
  }

  equals(other) {
    if (other == null) {
      return false;
    }
    if (this === other) {
      return true;
    }
    if (this.constructor !== other.constructor) {
      return false;
    }
    const a = this.getEqualityComponents();
    const b = other.getEqualityComponents();
    if (a.length !== b.length) {
      return false;
    }
    return a.every((component, index) => {
      const otherComponent = b[index];
      if (component instanceof ValueObject && otherComponent instanceof ValueObject) {
        return component.equals(otherComponent);
      }
      return Object.is(component, otherComponent);
    });
  }
}
