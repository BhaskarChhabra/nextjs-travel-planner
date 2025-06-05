import { Worker } from "bullmq";
import { importQueue } from "./lib/queue";
import prisma from "./lib/prisma";
import { scrapeTripsFromURL } from "./lib/scraper";

const worker = new Worker("importQueue", async (job) => {
  const { url, jobType, id } = job.data;
  
  console.log("Processing job:", id, url);

  try {
    const trips = await scrapeTripsFromURL(url);

    for (const trip of trips) {
      await prisma.trip.create({
        data: {
          title: trip.title,
          price: trip.price,
          duration: trip.duration,
          jobId: id, // optional, only if jobId field exists in trips table
        },
      });
    }

    await prisma.jobs.update({
      where: { id },
      data: { status: "completed" },
    });

    console.log(`✅ Job ${id} completed with ${trips.length} trips added.`);
  } catch (err) {
    console.error("❌ Error processing job:", id, err);
    await prisma.jobs.update({
      where: { id },
      data: { status: "failed" },
    });
  }
});
