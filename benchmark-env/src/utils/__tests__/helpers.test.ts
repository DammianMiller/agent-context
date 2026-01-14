import { describe, it, expect } from 'vitest';
import { add, multiply } from '../helpers';

describe('add function', () => {
  it('should add two positive numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should handle zero values', () => {
    expect(add(0, 5)).toBe(5);
    expect(add(5, 0)).toBe(5);
    expect(add(0, 0)).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(add(-2, 3)).toBe(1);
    expect(add(2, -3)).toBe(-1);
    expect(add(-2, -3)).toBe(-5);
  });

  it('should handle decimal numbers', () => {
    expect(add(0.1, 0.2)).toBeCloseTo(0.3, 10);
    expect(add(1.5, 2.5)).toBe(4);
  });

  it('should return number type', () => {
    const result = add(1, 2);
    expect(typeof result).toBe('number');
  });
});

describe('multiply function', () => {
  it('should multiply two positive numbers correctly', () => {
    expect(multiply(2, 3)).toBe(6);
  });

  it('should handle zero values', () => {
    expect(multiply(0, 5)).toBe(0);
    expect(multiply(5, 0)).toBe(0);
    expect(multiply(0, 0)).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(multiply(-2, 3)).toBe(-6);
    expect(multiply(2, -3)).toBe(-6);
    expect(multiply(-2, -3)).toBe(6);
  });

  it('should handle decimal numbers', () => {
    expect(multiply(0.5, 2)).toBe(1);
    expect(multiply(1.5, 2)).toBe(3);
  });

  it('should handle multiplication by 1', () => {
    expect(multiply(5, 1)).toBe(5);
    expect(multiply(1, 5)).toBe(5);
  });

  it('should return number type', () => {
    const result = multiply(2, 3);
    expect(typeof result).toBe('number');
  });
});

// Verify that functions are properly exported
describe('exports', () => {
  it('should export add function', () => {
    expect(typeof add).toBe('function');
  });

  it('should export multiply function', () => {
    expect(typeof multiply).toBe('function');
  });
});
