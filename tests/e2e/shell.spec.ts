/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { deckCard, expect, moveTo, placeAll, pointIn, press, slots, test, waitForGame } from './fixtures.js';

test.describe('in a German browser', () => {
  test.use({ locale: 'de-DE' });

  test('the UI starts in German', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner').getByRole('link', { name: 'Der Scheiß ist heiß' })).toBeVisible();
  });
});

test('the UI starts in English elsewhere, and a language chosen in Settings persists', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByRole('banner').getByRole('link', { name: 'The Shit Is Hot' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Language' }).click();
  await page.getByRole('option', { name: 'Deutsch' }).click();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Der Scheiß ist heiß' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Der Scheiß ist heiß' })).toBeVisible();
});

test.describe('on a first visit', () => {
  test.use({ hideTutorial: false });

  test('the tutorial appears and can be skipped', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await expect(page.getByText('Drag this word into a column')).toBeVisible();
    await page.getByRole('button', { name: 'Skip Tutorial' }).click();
    await expect(page.getByText('Drag this word into a column')).toBeHidden();
    await page.reload();
    await waitForGame(page);
    await expect(page.getByText('Drag this word into a column')).toBeHidden();
  });

  test('a tap placement advances it, and Close hides the sorting step', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await slots(page).first().click();
    await expect(page.getByText('Drag this word into a column')).toBeHidden();
    await expect(page.getByText('The words can be rearranged')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText('The words can be rearranged')).toBeHidden();
  });

  test('on a phone, columns under the first hint still take a tap', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await waitForGame(page);
    await expect(page.getByText('Drag this word into a column')).toBeVisible();
    const title = await deckCard(page).innerText();
    await slots(page).first().click();
    await expect(slots(page).first()).toHaveText(title);
  });

  test('the first hint moves beside the card when the board turns horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await waitForGame(page);
    await expect(page.locator('[data-tutorial]')).toHaveAttribute('data-side', 'bottom');
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('[data-tutorial]')).toHaveAttribute('data-side', 'right');
  });

  test('starting to drag the deck card ends the first step', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await expect(page.getByText('Drag this word into a column')).toBeVisible();
    const start = await pointIn(deckCard(page));
    await press(page, deckCard(page));
    await moveTo(page, { x: start.x, y: start.y + 30 });
    await expect(page.getByText('Drag this word into a column')).toBeHidden();
    await page.mouse.up();
  });

  test('it walks through results, new game, custom game and copying the URL', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await placeAll(page);
    await expect(page.getByText('press here to show the results')).toBeVisible();
    await page.getByRole('button', { name: 'Show Results' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Start a game with new words.')).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Or create a game with your own words.')).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('And share the game')).toBeVisible();
    await page.getByRole('button', { name: 'Finish Tutorial' }).click();
    await expect(page.locator('[data-tutorial]')).toHaveCount(0);
  });
});

test('Reset tutorial on a finished board shows the evaluation, and New Game restarts it', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await placeAll(page);
  await page.getByRole('button', { name: 'Show Results' }).click();
  // Navigate inside the SPA: a document load would re-seed the hidden tutorial.
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Reset Tutorial' }).click();
  await expect(page.getByRole('button', { name: 'Tutorial reset' })).toBeVisible();
  await page.getByRole('banner').getByRole('link', { name: 'The Shit Is Hot' }).click();
  await expect(page.locator('[data-tutorial]')).toContainText(/match/);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'New Game' }).click();
  await waitForGame(page);
  await expect(page.getByText('Drag this word into a column')).toBeVisible();
});

test('the legal pages load directly and the privacy text describes what the site does', async ({ page }) => {
  await page.goto('/impressum');
  await expect(page.getByRole('heading', { level: 1, name: 'Impressum' })).toBeVisible();
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { level: 1, name: 'Datenschutz' })).toBeVisible();
  const text = await page.locator('main').innerText();
  for (const expected of ['GitHub Pages', 'Wikimedia', 'localStorage']) {
    expect(text).toContain(expected);
  }
  expect(text).not.toContain('Cloudflare');
  expect(text).not.toContain('Session-Cookies');
});

test('the build ships the app as 404.html, which GitHub Pages serves for deep links', () => {
  expect(readFileSync('dist/404.html', 'utf8')).toBe(readFileSync('dist/index.html', 'utf8'));
});

test('an unreachable Wikimedia shows an error with Retry', async ({ page, wiki }) => {
  wiki.failing = true;
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Wikipedia is unreachable');
  await expect(page.locator('[data-board]')).toHaveCount(0);
  wiki.failing = false;
  await page.getByRole('button', { name: 'Retry' }).click();
  await waitForGame(page);
});

test('too few articles across every candidate round shows the assembly error', async ({ page, wiki }) => {
  wiki.topList = ['Wikipedia:Hauptseite', 'Spezial:Suche', 'Datei:Foo.png', 'Hund', 'Tunnel'];
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('could not be put together');
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  await expect(page.locator('[data-board]')).toHaveCount(0);
});

test('an undecodable title is replaced and named, on first load and in a running tab', async ({ page }) => {
  await page.goto('/#t=Katze,%&l=de');
  await waitForGame(page);
  await expect(page.locator('[data-replaced]')).toContainText('%');
  expect(await placeAll(page)).toContain('Hauskatze');

  await page.getByRole('button', { name: 'New Game' }).click();
  await waitForGame(page);
  await page.evaluate(() => {
    location.hash = '#t=Katze,%&l=de';
  });
  await expect(page.locator('[data-replaced]')).toContainText('%');
  await waitForGame(page);
  expect(await placeAll(page)).toContain('Hauskatze');
});
