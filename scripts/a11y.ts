import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
let axe: any;

async function runAxe(path: string) {
  const html = readFileSync(path, 'utf-8');
  const dom = new JSDOM(html);
  (global as any).window = dom.window as any;
  (global as any).document = dom.window.document;
  (global as any).Node = dom.window.Node;
  (global as any).NodeList = dom.window.NodeList;
  if (!axe) {
    axe = await import('axe-core');
  }
  const run = axe.run || axe.default.run;
  const results = await run(dom.window.document);
  const critical = results.violations.filter(v => v.impact === 'critical');
  if (critical.length) {
    console.error('Critical issues on', path, critical);
    return false;
  }
  return true;
}

(async () => {
  const ok = await runAxe('public/offline.html');
  if (!ok) process.exit(1);
  console.log('A11y checks passed');
})();
