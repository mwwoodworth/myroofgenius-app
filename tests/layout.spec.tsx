import React from 'react';
import { render } from '@testing-library/react';

// stub modules that cause issues in the test environment
jest.mock('../components/ui', () => ({ Analytics: () => null }));
jest.mock('../app/lib/sentry', () => ({}));
jest.mock('next/font/google', () => ({ Inter: () => ({ className: 'font' }) }));
jest.mock('next/dynamic', () => () => () => null);

import RootLayout from '../app/layout';

test('root layout html element has head and body', () => {
  render(<RootLayout>child</RootLayout>);
  expect(document.documentElement.childElementCount).toBe(2);
});
