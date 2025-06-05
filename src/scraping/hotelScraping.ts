import { Page, Browser } from "puppeteer";

interface Hotel {
  title: string;
  price: string;
  photo: string;
  rating?: string;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const startHotelScraping = async (
  page: Page,
  browser: Browser,
  location: string
): Promise<Hotel[]> => {
  console.log(`🔍 Searching hotels on Booking.com for: ${location}`);
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Load Booking.com home page
    await page.goto("https://www.booking.com/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    console.log('ℹ️ Page loaded');

    // 2. Accept cookies if popup appears
    try {
      const cookieAccept = await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });
      if (cookieAccept) {
        await cookieAccept.click();
        await delay(1000);
        console.log('✅ Accepted cookies');
      }
    } catch {
      console.log('ℹ️ No cookie popup found');
    }

    // 3. Find the search input with updated selectors
    const searchInputSelectors = [
      'input[name="ss"]',                         // classic Booking.com search box
      '[data-testid="searchbox-input"]',          // new testid selector
      '[aria-label="Search"]',                     // aria label fallback
    ];

    let searchInput;
    for (const selector of searchInputSelectors) {
      try {
        searchInput = await page.waitForSelector(selector, { timeout: 10000 });
        if (searchInput) break;
      } catch {
        console.log(`Selector ${selector} not found`);
      }
    }

    if (!searchInput) {
      await page.screenshot({ path: 'search-input-not-found.png' });
      throw new Error('Could not find search input');
    }

    // 4. Type location like a human
    await searchInput.click({ clickCount: 3 });
    await delay(300);
    await searchInput.type(location, { delay: 150 });
    console.log('ℹ️ Typed location');
    await delay(2000); // wait for autocomplete

    // 5. Handle autocomplete suggestions robustly
    const handleAutocomplete = async (): Promise<boolean> => {
      // Updated autocomplete selectors from Booking.com recent DOM
      const suggestionSelectors = [
        '[data-testid="autocomplete-result"]:first-child',
        '.c-autocomplete__item--selected',
        '.sb-autocomplete__item:first-child',
        '.search-autocomplete__item--active'
      ];

      for (const selector of suggestionSelectors) {
        try {
          const suggestion = await page.waitForSelector(selector, { timeout: 8000 });
          if (suggestion) {
            await suggestion.click();
            console.log(`✅ Clicked autocomplete suggestion (${selector})`);
            await delay(1500);
            return true;
          }
        } catch {}
      }

      // Fallback to keyboard navigation if no clickable suggestion found
      try {
        await page.keyboard.press('ArrowDown');
        await delay(500);
        await page.keyboard.press('Enter');
        console.log('✅ Used keyboard selection');
        await delay(1500);
        return true;
      } catch {
        console.log('Keyboard selection failed');
      }

      return false;
    };

    if (!(await handleAutocomplete())) {
      console.log('ℹ️ Falling back to direct search');
      await page.keyboard.press('Enter');
      await delay(2000);
    }

    // 6. Submit the search form and wait for navigation & results
    console.log('ℹ️ Submitting search...');

    const searchButtonSelectors = [
      '.sb-searchbox__button',
      '[data-testid="searchbox-submit"]',
      'button[type="submit"]',
      'button[data-testid="search-button"]', // newly added possible selector
    ];

    let clicked = false;
    for (const selector of searchButtonSelectors) {
      try {
        const button = await page.waitForSelector(selector, { timeout: 5000 });
        if (button) {
          await button.evaluate((btn) => btn.scrollIntoView({ behavior: 'smooth', block: 'center' }));

          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
            button.click(),
          ]);
          clicked = true;
          console.log(`✅ Clicked search button with selector: ${selector}`);
          break;
        }
      } catch (err) {
        console.log(`❌ Search button selector "${selector}" not found or click failed`);
      }
    }

    if (!clicked) {
      throw new Error('Could not click search button');
    }
    console.log('✅ Search submitted');

    // 7. Wait some extra time for results to stabilize
    await delay(4000);

    // 8. Scrape hotels using updated selectors
    console.log('ℹ️ Scraping hotel data...');
    const hotels = await page.evaluate(() => {
      // Updated container selectors for hotel cards
      const cards = Array.from(document.querySelectorAll('[data-testid="property-card"], .sr_property_block'));

      return cards.map(card => {
        const title =
          card.querySelector('[data-testid="title"]')?.textContent?.trim() ||
          card.querySelector('.sr-hotel__name')?.textContent?.trim() ||
          card.querySelector('h3, h4')?.textContent?.trim() ||
          'Unknown';

        // Price selectors - trying multiple patterns, extract digits and commas/periods
        const priceElement =
          card.querySelector('[data-testid="price-and-discounted-price"]') ||
          card.querySelector('.bui-price-display__value') ||
          Array.from(card.querySelectorAll('span, div')).find(el =>
            /\d+/.test(el.textContent || '') && /[$€£₹¥₩₽]/.test(el.textContent || '')
          );

        const rawPrice = priceElement?.textContent?.trim() || '';
        // Extract only numbers, dots, commas from price string
        const price = rawPrice.replace(/[^\d.,]/g, '');

        // Image selectors - try multiple fallbacks
        const photo =
          (card.querySelector('img[data-testid="image"]') as HTMLImageElement)?.src ||
          (card.querySelector('.hotel_image, .sr_item_photo, img') as HTMLImageElement)?.src ||
          '';

        // Rating selectors
        const rating =
          card.querySelector('[aria-label*="Scored"]')?.textContent?.trim() ||
          card.querySelector('.bui-review-score__badge')?.textContent?.trim() ||
          '';

        return {
          title,
          price,
          photo,
          rating
        };
      }).filter(hotel => hotel.title !== 'Unknown' && hotel.price);
    });

    console.log(`✅ Successfully scraped ${hotels.length} hotels`);
    return hotels;

  } catch (err) {
    console.error("❌ Scraping failed:", err);
    await page.screenshot({ path: `booking-error-${Date.now()}.png` });
    throw err;
  } finally {
    console.log('ℹ️ Scraping process completed');
  }
};
