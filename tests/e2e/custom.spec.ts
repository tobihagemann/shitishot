import type { Page } from '@playwright/test';
import { expect, placeAll, test, waitForGame } from './fixtures.js';

function field(page: Page, number: number) {
  return page.getByLabel(`Word ${number}`, { exact: true });
}

function resolution(page: Page, number: number) {
  return page.locator(`[data-resolution="${number - 1}"]`);
}

async function fillAll(page: Page, terms: string[]): Promise<void> {
  for (const [index, term] of terms.entries()) {
    await field(page, index + 1).fill(term);
  }
}

test('each term shows the article it resolves to, and Play waits for five distinct articles', async ({ page }) => {
  await page.goto('/custom');
  await fillAll(page, ['Katze', 'Xyzzy', 'Hauskatze', 'Hund', 'Tunnel']);
  await expect(resolution(page, 1)).toHaveText('→ Hauskatze');
  await expect(resolution(page, 2)).toHaveText('No Wikipedia article found');
  await expect(resolution(page, 3)).toHaveText('Same article as word 1');
  await expect(resolution(page, 4)).toHaveText('→ Hund');
  const play = page.getByRole('button', { name: 'Play Game' });
  await expect(play).toBeDisabled();

  await field(page, 2).fill('Berlin');
  await field(page, 3).fill('Fußball');
  await expect(play).toBeEnabled();
});

test('a term without an exact title falls back to its top search hit', async ({ page }) => {
  await page.goto('/custom');
  await field(page, 1).fill('Kartoffelsalt');
  await expect(resolution(page, 1)).toHaveText('→ Kartoffelsalat');
});

test('a search hit that is a redirect resolves to its article', async ({ page }) => {
  await page.goto('/custom');
  await field(page, 1).fill('Hauskatze');
  await field(page, 2).fill('onlyredirects:Katze');
  await expect(resolution(page, 2)).toHaveText('Same article as word 1');
});

test('a search hit outside the article namespace is rejected', async ({ page }) => {
  await page.goto('/custom');
  await field(page, 1).fill('Kategorie:Maler');
  await expect(resolution(page, 1)).toHaveText('No Wikipedia article found');
});

test('an edit disables Play at once and a stale lookup never re-enables it', async ({ page, wiki }) => {
  await page.goto('/custom');
  await fillAll(page, ['Katze', 'Hund', 'Tunnel', 'Berlin', 'Fußball']);
  const play = page.getByRole('button', { name: 'Play Game' });
  await expect(play).toBeEnabled();

  wiki.lookupDelays.Deutschland = 1500;
  await field(page, 5).fill('Deutschland');
  await expect(play).toBeDisabled();
  // Let the debounced, delayed lookup go out, then replace the term before it answers.
  await page.waitForTimeout(600);
  await field(page, 5).fill('Xyzzy');
  await expect(resolution(page, 5)).toHaveText('No Wikipedia article found');
  await page.waitForTimeout(1500);
  await expect(resolution(page, 5)).toHaveText('No Wikipedia article found');
  await expect(play).toBeDisabled();
});

test('a title with a comma survives the round trip through the editor', async ({ page }) => {
  await page.goto('/#t=Neatsville%2C%20Kentucky,Hund,Tunnel,Berlin,Fu%C3%9Fball&l=en');
  await waitForGame(page);
  await page.getByRole('button', { name: 'Custom Game' }).click();
  await expect(page.getByRole('button', { name: 'Play Game' })).toBeEnabled();
  const values = await page.getByRole('textbox').evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  const number = values.indexOf('Neatsville, Kentucky') + 1;
  expect(number).toBeGreaterThan(0);
  await expect(resolution(page, number)).toHaveText('→ Neatsville, Kentucky');
  await page.getByRole('button', { name: 'Play Game' }).click();
  await waitForGame(page);
  expect(await placeAll(page)).toContain('Neatsville, Kentucky');
});
