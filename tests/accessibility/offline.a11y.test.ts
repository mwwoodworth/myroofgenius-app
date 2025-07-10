import { readFileSync } from 'fs';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('offline.html is accessible', async () => {
  const html = readFileSync('public/offline.html', 'utf8');
  const results = await axe(html);
  expect(results).toHaveNoViolations();
});
