import type { Page } from '@playwright/test';
import { deckCard, expect, moveTo, placeAll, pointIn, press, slots, test, VIEWS, waitForGame } from './fixtures.js';

const LINK_TITLES = ['Hund', 'Tunnel', 'Berlin', 'Kartoffelsalat', 'Fußball'];
const LINK = `/#t=${LINK_TITLES.map(encodeURIComponent).join(',')}&l=en`;

function slotTexts(page: Page): Promise<string[]> {
  return slots(page).allInnerTexts();
}

/** Places each deck card into the column its views belong to; `swapLowest` switches the two lowest targets. */
async function placeSorted(page: Page, titles: string[], swapLowest = false): Promise<void> {
  const ascending = [...titles].sort((a, b) => VIEWS[a]! - VIEWS[b]!);
  if (swapLowest) {
    [ascending[0], ascending[1]] = [ascending[1]!, ascending[0]!];
  }
  for (let placed = 0; placed < titles.length; placed++) {
    const title = await deckCard(page).innerText();
    await slots(page).nth(ascending.indexOf(title)).click();
  }
}

test('a new game deals five articles with ascending numbers and no non-articles', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  const numbers = (await page.locator('[data-number]').allInnerTexts()).map((text) => Number(text.replace(/\D/g, '')));
  expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  const titles = await placeAll(page);
  expect(new Set(titles).size).toBe(5);
  for (const title of titles) {
    expect(['Wikipedia:Hauptseite', 'Spezial:Suche', 'Datei:Foo.png', 'Main Page']).not.toContain(title);
  }
});

test('the latest New Game wins over an earlier, slower one', async ({ page, wiki }) => {
  await page.goto('/');
  await waitForGame(page);
  const second = ['Hund', 'Tunnel', 'Kartoffelsalat', 'Schindhaubasistunnel', 'Neatsville,_Kentucky'];
  wiki.topQueue = [{ list: ['Angela_Merkel', 'Berlin', 'Deutschland', 'Fußball', 'Helene_Fischer'], delayMs: 1500 }, { list: second }];
  const newGame = page.getByRole('button', { name: 'New Game' });
  await newGame.click();
  await newGame.click();
  await waitForGame(page);
  await page.waitForTimeout(2000);
  expect((await placeAll(page)).sort()).toEqual(second.map((title) => title.replaceAll('_', ' ')).sort());
});

test('dragging onto an occupied column previews and applies the shift', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  const first = await deckCard(page).innerText();
  await press(page, deckCard(page));
  await moveTo(page, await pointIn(slots(page).nth(2)));
  await page.mouse.up();
  await expect(slots(page).nth(2)).toHaveText(first);

  // Left half: the occupant moves right.
  const second = await deckCard(page).innerText();
  await press(page, deckCard(page));
  await moveTo(page, await pointIn(slots(page).nth(2), 0.25));
  await expect(slots(page).nth(2)).toHaveText(second);
  await expect(slots(page).nth(3)).toHaveText(first);
  await page.mouse.up();
  await expect(slots(page).nth(2)).toHaveText(second);
  await expect(slots(page).nth(3)).toHaveText(first);

  // Right half: the occupant moves left.
  const third = await deckCard(page).innerText();
  await press(page, deckCard(page));
  await moveTo(page, await pointIn(slots(page).nth(2), 0.75));
  await page.mouse.up();
  expect((await slotTexts(page)).slice(1, 4)).toEqual([second, third, first]);
});

test('a drop outside the board returns the card and does not swallow a later click', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await slots(page).nth(0).click();
  const next = await deckCard(page).innerText();
  const before = await slotTexts(page);
  await press(page, deckCard(page));
  await moveTo(page, { x: 10, y: 10 });
  await page.mouse.up();
  await expect(deckCard(page)).toHaveText(next);
  expect(await slotTexts(page)).toEqual(before);
  // An empty column starts no gesture, so only the suppressed-click flag's own timeout can have cleared it.
  await slots(page).nth(1).click();
  await expect(slots(page).nth(1)).toHaveText(next);
  await slots(page).nth(0).click();
  await expect(slots(page).nth(0)).toHaveAttribute('aria-pressed', 'true');
});

test('a cancelled pointer reverts the preview and leaves later drags working', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  const title = await deckCard(page).innerText();
  await press(page, deckCard(page));
  await moveTo(page, await pointIn(slots(page).nth(2)));
  await expect(slots(page).nth(2)).toHaveText(title);
  await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1 })));
  await expect(slots(page).nth(2)).toHaveText('–');
  await page.mouse.up();
  await press(page, deckCard(page));
  await moveTo(page, await pointIn(slots(page).nth(2)));
  await page.mouse.up();
  await expect(slots(page).nth(2)).toHaveText(title);
});

test('the click that trails a drag back onto its own slot is swallowed', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await slots(page).nth(0).click();
  await slots(page).nth(1).click();
  const before = await slotTexts(page);
  // Press and release on the button's padding: the title text is re-rendered mid-drag, which alone would drop the click.
  await press(page, slots(page).nth(0), 0.03);
  await moveTo(page, await pointIn(slots(page).nth(3)));
  await moveTo(page, await pointIn(slots(page).nth(0), 0.03));
  await page.mouse.up();
  await expect(slots(page).nth(0)).toHaveAttribute('aria-pressed', 'false');
  expect(await slotTexts(page)).toEqual(before);
  await slots(page).nth(1).click();
  await expect(slots(page).nth(1)).toHaveAttribute('aria-pressed', 'true');
  expect(await slotTexts(page)).toEqual(before);
});

test('taps place, select, deselect, swap and move cards', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  const a = await deckCard(page).innerText();
  await slots(page).nth(0).click();
  await expect(slots(page).nth(0)).toHaveText(a);
  const b = await deckCard(page).innerText();
  await slots(page).nth(2).click();
  await expect(slots(page).nth(2)).toHaveText(b);

  await slots(page).nth(0).click();
  await expect(slots(page).nth(0)).toHaveAttribute('aria-pressed', 'true');
  await slots(page).nth(0).click();
  await expect(slots(page).nth(0)).toHaveAttribute('aria-pressed', 'false');

  await slots(page).nth(0).click();
  await slots(page).nth(2).click();
  await expect(slots(page).nth(0)).toHaveText(b);
  await expect(slots(page).nth(2)).toHaveText(a);
  await expect(page.locator('[data-board-slot][aria-pressed="true"]')).toHaveCount(0);

  await slots(page).nth(0).click();
  await slots(page).nth(4).click();
  await expect(slots(page).nth(4)).toHaveText(b);
  await expect(slots(page).nth(0)).toHaveText('–');
});

test('Show Results marks each column and scores the board', async ({ page }) => {
  await page.goto(LINK);
  await waitForGame(page);
  await placeSorted(page, LINK_TITLES, true);
  await page.getByRole('button', { name: 'Show Results' }).click();
  await expect(page.locator('[data-result="correct"]')).toHaveCount(3);
  await expect(page.locator('[data-result="wrong"]')).toHaveCount(2);
  await expect(page.locator('[data-result="wrong"]').first().locator('[data-expected]')).toContainText('Kartoffelsalat');
  await expect(page.locator('[data-score]')).toHaveText('3 of 5 correct');
});

test('a reload resumes the game', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await slots(page).nth(1).click();
  await slots(page).nth(3).click();
  const board = await slotTexts(page);
  const next = await deckCard(page).innerText();
  const numbers = await page.locator('[data-number]').allInnerTexts();
  await page.reload();
  await waitForGame(page);
  expect(await slotTexts(page)).toEqual(board);
  await expect(deckCard(page)).toHaveText(next);
  expect(await page.locator('[data-number]').allInnerTexts()).toEqual(numbers);
});

test('numbers are 30-day sums rounded to 3 digits, with no pageview data counting as 0', async ({ page }) => {
  await page.goto('/#t=Leerartikel,Hund,Tunnel,Berlin,Fu%C3%9Fball&l=en');
  await waitForGame(page);
  expect(await page.locator('[data-number]').allInnerTexts()).toEqual(['0', '18,400', '95,100', '230,000', '512,000']);
});

test('choosing the random titles source in Settings deals from it', async ({ page, wiki }) => {
  wiki.topList = ['Wikipedia:Hauptseite', 'Spezial:Suche'];
  await page.goto('/settings');
  await page.getByRole('combobox', { name: 'Source for Words' }).click();
  await page.getByRole('option', { name: 'Wikipedia (Random)' }).click();
  await page.getByRole('banner').getByRole('link', { name: 'The Shit Is Hot' }).click();
  await waitForGame(page);
  const titles = await placeAll(page);
  expect(titles.every((title) => title in VIEWS)).toBe(true);
});

test('a drag still held when a new game is dealt drops nothing onto it', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await press(page, deckCard(page));
  await moveTo(page, await pointIn(slots(page).nth(2)));
  await page.getByRole('button', { name: 'New Game' }).focus();
  await page.keyboard.press('Enter');
  await waitForGame(page);
  await moveTo(page, await pointIn(slots(page).nth(0)));
  await page.mouse.up();
  expect(await slotTexts(page)).toEqual(['–', '–', '–', '–', '–']);
});

test('a drag still held when results are shown no longer previews on the board', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  const committed = await placeAll(page);
  await press(page, slots(page).nth(0));
  await moveTo(page, await pointIn(slots(page).nth(3), 0.75));
  await expect(slots(page).nth(3)).toHaveText(committed[0]!);
  await page.getByRole('button', { name: 'Show Results' }).focus();
  await page.keyboard.press('Enter');
  const columns = page.locator('[data-column]');
  for (const [index, title] of committed.entries()) {
    await expect(columns.nth(index)).toContainText(title);
  }
  await page.mouse.up();
});

test.describe('on a touch phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('a touch drag places a card without the browser taking over the gesture', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    const title = await deckCard(page).innerText();
    const from = await pointIn(deckCard(page));
    const to = await pointIn(slots(page).nth(0));
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', points: { x: number; y: number }[]) =>
      cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points });
    await touch('touchStart', [from]);
    for (let step = 1; step <= 10; step++) {
      await touch('touchMove', [{ x: from.x + ((to.x - from.x) * step) / 10, y: from.y + ((to.y - from.y) * step) / 10 }]);
    }
    await touch('touchEnd', []);
    await expect(slots(page).nth(0)).toHaveText(title);
  });
});

test.describe('with the German setting', () => {
  test.use({ locale: 'de-DE' });

  test('a finished English game points to the own settings', async ({ page }) => {
    await page.goto(LINK);
    await waitForGame(page);
    await placeAll(page);
    await page.getByRole('button', { name: 'Ergebnisse zeigen' }).click();
    const notice = page.locator('[data-different-settings]');
    await expect(notice).toContainText('English');
    await expect(notice.getByRole('link')).toHaveAttribute('href', '/settings');
  });
});
