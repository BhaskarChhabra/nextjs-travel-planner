import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { importQueue } from "@/lib/queue";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const destination = searchParams.get("destination");
    const date = searchParams.get("date");

    if (!source || !destination || !date) {
      return NextResponse.json({ message: "Missing params" }, { status: 400 });
    }

    // ✅ Check if already scraped
    const existingFlights = await prisma.flights.findMany({
      where: {
        from: source,
        to: destination,
        departureTime: {
          contains: date.split("-").reverse().join("/"),
        },
      },
    });

    if (existingFlights.length > 0) {
      return NextResponse.json({
        message: "Flights already available in DB",
        reused: true,
        count: existingFlights.length,
      });
    }

    const [yyyy, mm, dd] = date.split("-");
const formattedDate = `${dd}/${mm}/${yyyy}`;
const encodedDate = encodeURIComponent(formattedDate);

const url = `https://flight.yatra.com/air-search-ui/dom2/trigger?flex=0&viewName=normal&source=fresco-flights&type=O&class=Economy&ADT=1&CHD=0&INF=0&noOfSegments=1&origin=${source}&originCountry=IN&destination=${destination}&destinationCountry=IN&flight_depart_date=${encodedDate}&arrivalDate=`;

    // ✅ Create job
    const response = await prisma.jobs.create({
      data: { url, jobType: { type: "flight", source, destination, date } },
    });

    // ✅ Add to scraping queue
    await importQueue.add("new location", {
      url,
      jobType: { type: "flight", source, destination, date },
      id: response.id,
    });

    return NextResponse.json(
      { msg: "Job started", id: response.id },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Unexpected error", error },
      { status: 500 }
    );
  }
}
