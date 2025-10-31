import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('formats values less than 1000', () => {
      expect(formatCurrency(500.5)).toBe('$500.50');
      expect(formatCurrency(0.1234)).toBe('$0.12');
    });

    it('formats values in thousands', () => {
      expect(formatCurrency(1500)).toBe('$1.50K');
      expect(formatCurrency(25000)).toBe('$25.00K');
    });

    it('formats values in millions', () => {
      expect(formatCurrency(1500000)).toBe('$1.50M');
      expect(formatCurrency(25000000)).toBe('$25.00M');
    });

    it('formats values in billions', () => {
      expect(formatCurrency(1500000000)).toBe('$1.50B');
      expect(formatCurrency(25000000000)).toBe('$25.00B');
    });
  });

  describe('formatPercent', () => {
    it('formats percentage values', () => {
      expect(formatPercent(5.25)).toBe('5.25%');
      expect(formatPercent(12.345)).toBe('12.35%');
      expect(formatPercent(0.1)).toBe('0.10%');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers less than 1000', () => {
      expect(formatNumber(500)).toBe('500');
      expect(formatNumber(999.99)).toBe('999.99');
    });

    it('formats numbers in thousands', () => {
      expect(formatNumber(1500)).toBe('1.50K');
      expect(formatNumber(25000)).toBe('25.00K');
    });

    it('formats numbers in millions', () => {
      expect(formatNumber(1500000)).toBe('1.50M');
      expect(formatNumber(25000000)).toBe('25.00M');
    });

    it('formats numbers in billions', () => {
      expect(formatNumber(1500000000)).toBe('1.50B');
      expect(formatNumber(25000000000)).toBe('25.00B');
    });
  });
});