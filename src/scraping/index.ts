import puppeteer from "puppeteer";
import { startFlightScraping } from "./flightsScraping";

(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();

  // ✅ Replace with a real Yatra flight search URL (e.g., DEL to BOM on 26 June 2025)
  const url = "https://flight.yatra.com/air-search-ui/dom2/trigger?flex=0&viewName=normal&source=fresco-flights&type=O&class=Economy&ADT=1&CHD=0&INF=0&noOfSegments=1&origin=DEL&originCountry=IN&destination=BOM&destinationCountry=IN&flight_depart_date=26%2F06%2F2025&arrivalDate=";

  await page.goto(url, { timeout: 120000, waitUntil: "networkidle2" });

  const flights = await startFlightScraping(page);

  console.log("✈️ Scraped Flights:");
  console.log(JSON.stringify(flights, null, 2));

  await browser.close();
})();
