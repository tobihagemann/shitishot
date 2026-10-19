import { expect, placeAll, test, waitForGame } from './fixtures.js';

test('a 2018 link resolves its terms and replaces duplicates and misses', async ({ page }) => {
  await page.goto('/#t=Katze,Hund,Xyzzy,Hauskatze,Tunnel&l=de&s=Yandex');
  await waitForGame(page);
  await expect(page).toHaveURL('/');
  const titles = await placeAll(page);
  expect(titles).toEqual(expect.arrayContaining(['Hauskatze', 'Hund', 'Tunnel']));
  expect(titles).not.toContain('Katze');
  expect(new Set(titles).size).toBe(5);
  await expect(page.locator('[data-replaced]')).toContainText('Xyzzy, Hauskatze');
});

test('a link with more than five titles deals exactly the first five', async ({ page }) => {
  await page.goto('/#t=Hund,Tunnel,Berlin,Kartoffelsalat,Fu%C3%9Fball,Deutschland,Hauskatze&l=de');
  await waitForGame(page);
  expect((await placeAll(page)).sort()).toEqual(['Berlin', 'Fußball', 'Hund', 'Kartoffelsalat', 'Tunnel']);
});

test('a share fragment set in a running tab deals that game', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await page.evaluate(() => {
    location.hash = '#t=Hund,Tunnel,Berlin,Kartoffelsalat,Fu%C3%9Fball&l=en';
  });
  await expect(page).toHaveURL('/');
  await waitForGame(page);
  expect((await placeAll(page)).sort()).toEqual(['Berlin', 'Fußball', 'Hund', 'Kartoffelsalat', 'Tunnel']);
});

test.describe('with clipboard access', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('a copied URL reopens the same articles with fresh numbers', async ({ page, context, wiki }) => {
    await page.goto('/');
    await waitForGame(page);
    const titles = await placeAll(page);
    await page.getByRole('button', { name: 'Copy URL' }).click();
    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
    const url = await page.evaluate(() => navigator.clipboard.readText());
    expect(url.startsWith(new URL('/#t=', page.url()).href)).toBe(true);

    [...titles].sort().forEach((title, index) => {
      wiki.views[title] = (index + 1) * 111;
    });
    const reopened = await context.newPage();
    await reopened.goto(url);
    await waitForGame(reopened);
    expect((await placeAll(reopened)).sort()).toEqual([...titles].sort());
    expect(await reopened.locator('[data-number]').allInnerTexts()).toEqual(['111', '222', '333', '444', '555']);
  });
});
