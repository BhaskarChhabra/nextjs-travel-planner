import { Page, Browser } from "puppeteer";

interface Hotel {
  title: string;
  price: string;
  photo: string;
  rating?: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const startHotelScraping = async (
  page: Page,
  browser: Browser,
  jobData: {
    url: string;
    location: string;
  }
): Promise<Hotel[]> => {
  console.log("📦 Incoming jobData:", jobData);
  const { url, location } = jobData;

  console.log(`🔍 Searching hotels on Yatra.com for: ${location}`);
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // ✅ Navigate to Yatra Hotels page using provided URL
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    console.log("ℹ️ Yatra hotel page loaded");

    // ✅ Accept cookies (if shown)
    try {
      const cookieBtn = await page.waitForSelector("#cookieConsentBtn", { timeout: 5000 });
      if (cookieBtn) {
        await cookieBtn.click();
        console.log("✅ Accepted cookies");
        await delay(1000);
      }
    } catch {
      console.log("ℹ️ No cookie popup");
    }

    // ✅ Type location
    const locationInputSelector = "#BE_hotel_destination_city";
    await page.waitForSelector(locationInputSelector);
    const input = await page.$(locationInputSelector);
    if (!input) throw new Error("❌ Location input not found");

    await input.click({ clickCount: 3 });
    await input.type(location, { delay: 100 });
    console.log("ℹ️ Location typed");
    await delay(2000);

    // ✅ Select first autocomplete option
    try {
      await page.waitForSelector(".ac_results li", { timeout: 8000 });
      await page.click(".ac_results li");
      console.log("✅ Selected autocomplete");
    } catch {
      console.log("❌ Failed to select autocomplete");
    }

    // ✅ Select check-in and check-out dates
    try {
      await page.click("#BE_hotel_checkin_date");
      await delay(1000);
      await page.click('td[data-date]:not(.inact):nth-child(2)');
      await page.click('td[data-date]:not(.inact):nth-child(3)');
      console.log("✅ Dates selected");
    } catch {
      console.log("❌ Failed to select dates");
    }

    // ✅ Submit hotel search
    try {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
        page.click("#BE_hotel_htsearch_btn"),
      ]);
      console.log("✅ Hotel search submitted");
    } catch {
      console.log("❌ Failed to submit search");
    }

    // ✅ Wait and scrape results
    await delay(5000);
    console.log("ℹ️ Scraping hotel cards...");

    const hotels = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".hotel-card"));

      return cards
        .map((card) => {
          const title = card.querySelector(".hotel-name")?.textContent?.trim() || "Unknown";
          const priceRaw = card.querySelector(".price")?.textContent?.trim() || "";
          const price = priceRaw.replace(/[^\d.,]/g, "");
          const photo = (card.querySelector("img.hotel-img") as HTMLImageElement)?.src || "";
          const rating = card.querySelector(".rating-text")?.textContent?.trim() || "";

          return { title, price, photo, rating };
        })
        .filter((hotel) => hotel.title !== "Unknown" && hotel.price);
    });

    console.log(`✅ Scraped ${hotels.length} hotels`);
    return hotels;
  } catch (err) {
    console.error("❌ Scraping failed:", err);
    await page.screenshot({ path: `yatra-error-${Date.now()}.png` });
    throw err;
  } finally {
    console.log("ℹ️ Hotel scraping process completed");
  }
};
