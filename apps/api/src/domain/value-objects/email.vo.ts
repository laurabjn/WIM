// src/domain/value-objects/email.vo.ts
export class Email {
  private constructor(public readonly value: string) {}

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    if (!isValid) throw new Error('Invalid email');
    return new Email(normalized);
  }
}
