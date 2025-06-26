/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { Page } from "puppeteer";

interface Flight {
  airlineLogo: string;
  departureTime: string;
  arrivalTime: string;
  flightDuration: string;
  airlineName: string;
  price: number;
}

export const startFlightScraping = async (page: Page): Promise<Flight[]> => {
  console.log("🛫 [startFlightScraping] Yatra scraping started...");

  const maxRetries = 5;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔁 Attempt ${attempt}/${maxRetries}...`);

    try {
      // ✅ Wait for flightItem cards to appear
      await page.waitForSelector(".flightItem", { timeout: 15000 });

      // ✅ Scrape inside browser context
      const flights: Flight[] = await page.evaluate((): Flight[] => {
        const flightCards = document.querySelectorAll(".flightItem");
        const flights: Flight[] = [];

        flightCards.forEach((card, index) => {
          try {
            const airlineName =
              card.querySelector(".airline-name span")?.textContent?.trim() || "";

            const departureTime =
              card.querySelector(".depart-details .mob-time")?.textContent?.trim() || "";

            const arrivalTime =
              card.querySelector(".arrival-details .mob-time")?.textContent?.trim() || "";

            const flightDuration =
              card.querySelector(".stops-details .mob-duration")?.textContent?.trim() || "";

            const fareOptions = card.querySelectorAll(".br-fare-block .fare-price");
            let lowestFare = Infinity;

            fareOptions.forEach((fare) => {
              const rawPrice = fare.textContent?.replace(/[^\d]/g, "") || "";
              const price = parseInt(rawPrice, 10);
              if (!isNaN(price)) {
                lowestFare = Math.min(lowestFare, price);
              }
            });

            const price = isFinite(lowestFare) ? lowestFare : 0;

            flights.push({
              airlineLogo: "", // can be improved if logo selector found
              departureTime,
              arrivalTime,
              flightDuration,
              airlineName,
              price,
            });
          } catch (err) {
            console.error(`❌ Failed to parse flight #${index + 1}:`, err);
          }
        });

        return flights;
      });

      if (flights.length > 0) {
        console.log(`✅ Scraped ${flights.length} flights on attempt ${attempt}`);
        return flights;
      }

      console.warn(`⚠️ No flights found on attempt ${attempt}. Retrying in 3 seconds...`);
      await new Promise((res) => setTimeout(res, 3000));

    } catch (err) {
      console.warn(`⚠️ Error on attempt ${attempt}:`, err.message);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  console.error("❌ All retries exhausted. No flights scraped.");
  return [];
};
