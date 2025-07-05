import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { LocaleProvider } from '../../src/context/LocaleContext';

test('switches language', () => {
  render(
    <LocaleProvider>
      <LanguageSwitcher />
    </LocaleProvider>
  );
  const spanish = screen.getByText('ES');
  fireEvent.click(spanish);
  expect(document.documentElement.lang).toBe('es');
});
