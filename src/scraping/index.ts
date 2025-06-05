import puppeteer from "puppeteer";
import { startLocationScraping } from "./locationScraping";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Replace this with the actual URL you want to scrape
  await page.goto("https://www.yatra.com/holidays");

  const data = await startLocationScraping(page);

  console.log("Scraped Packages:");
  console.log(JSON.stringify(data, null, 2));

  await browser.close();
})();
