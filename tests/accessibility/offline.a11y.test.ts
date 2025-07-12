/// <reference path="../../types/jest-axe.d.ts" />
import { readFileSync } from 'fs';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
import { axe } from 'jest-axe';
import 'jest-axe/extend-expect';

test('offline.html is accessible', async () => {
  const html = readFileSync('public/offline.html', 'utf8');
  const results = await axe(html);
  (expect(results) as any).toHaveNoViolations();
});
