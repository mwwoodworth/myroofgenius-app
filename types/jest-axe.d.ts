import 'jest-axe';

declare module 'jest' {
  interface Matchers<R> {
    toHaveNoViolations(): R;
  }
}
