// changed code little bit for debugging
"use client";
import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  CardFooter,
  Input,
  Button,
  Listbox,
  ListboxItem,
} from "@heroui/react";
import { CurrentlyScrapingTable } from "./components/currently-scraping-table";
import ScrapingQueue from "@/components/admin/scraping-queue/scraping-queue";
import { apiClient } from "@/lib";
import { ADMIN_API_ROUTES } from "@/utils/api-routes";

const ScrapeTrips = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState<undefined | string>(
    undefined
  );
  const [jobs, setJobs] = useState([]);

  const searchCities = async (searchQuery: string) => {
    console.log("🔍 Searching for cities with query:", searchQuery);

    const response = await fetch(
      `https://secure.geonames.org/searchJSON?q=${searchQuery}&maxRows=5&username=kishan&style=SHORT`
    );
    const parsed = await response.json();
    setCities(
      parsed?.geonames.map((city: { name: string }) => city.name) ?? []
    );
  };

  const startScraping = async () => {
    if (!selectedCity) {
      alert("Please select a city first.");
      console.warn("⚠️ No city selected.");
      return;
    }

    const scrapeUrl = `https://packages.yatra.com/holidays/intl/search.htm?destination=${selectedCity}`;
    console.log("📤 Sending scrape request for:", selectedCity);
    console.log("🌐 Target URL:", scrapeUrl);

    try {
      const response = await apiClient.post(ADMIN_API_ROUTES.CREATE_JOB, {
        url: scrapeUrl,
        jobType: { type: "location" },
      });

      console.log("✅ Scrape job started. Backend response:", response.data);
      alert("Scraping job started successfully!");
    } catch (error) {
      console.error("❌ Error while starting scrape job:", error);
      alert("Failed to start scrape job. Check console for details.");
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await apiClient.get(ADMIN_API_ROUTES.JOB_DETAILS);
        setJobs(data.data.jobs);
      } catch (error) {
        console.error("❌ Error fetching job details:", error);
      }
    };

    const interval = setInterval(() => getData(), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="m-10 grid grid-cols-3 gap-5">
      <Card className="col-span-2">
        <CardBody>
          <Tabs>
            <Tab key="lcoation" title="Location">
              <Input
                type="text"
                label="Search for a Location"
                onChange={(e) => searchCities(e.target.value)}
              />

              <div className="w-full min-h-[200px] max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100 mt-5">
                <Listbox
                  aria-label="Actions"
                  onAction={(key) => {
                    console.log("✅ Selected city:", key);
                    setSelectedCity(key as string);
                  }}
                >
                  {cities.map((city) => (
                    <ListboxItem
                      key={city}
                      color="primary"
                      className="text-primary-500"
                    >
                      {city}
                    </ListboxItem>
                  ))}
                </Listbox>
              </div>
            </Tab>

            <Tab key="url" title="Flights">
              <Card>
                <CardBody>
                  <Input
                    type="text"
                    label="Scrape data for a specific URL"
                    // Not handled yet
                  />
                </CardBody>
              </Card>
            </Tab>

            <Tab key="id" title="Hotels">
              <Card>
                <CardBody>
                  <Input
                    type="text"
                    label="Search data for a specific trip package using package ID."
                    // Not handled yet
                  />
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </CardBody>

        <CardFooter className="flex flex-col gap-5 ">
          <div>
            {selectedCity && (
              <h1 className="text-xl">Scrape data for {selectedCity}</h1>
            )}
          </div>
          <Button
            onPress={startScraping}
            size="lg"
            className="w-full"
            color="primary"
          >
            Scrape
          </Button>
        </CardFooter>
      </Card>

      <ScrapingQueue />

      <div className="col-span-3">
        <CurrentlyScrapingTable jobs={jobs} />
      </div>
    </section>
  );
};

export default ScrapeTrips;
