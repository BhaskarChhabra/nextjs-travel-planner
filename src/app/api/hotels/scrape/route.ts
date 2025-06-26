import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { importQueue } from "../../../../lib/queue";

function formatDate(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split("T")[0]; // yyyy-mm-dd
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    if (!location) {
      return NextResponse.json(
        { message: "Missing location parameter" },
        { status: 400 }
      );
    }

    // ✅ Format actual dates
    const checkin = formatDate(1); // tomorrow
    const checkout = formatDate(2); // day after tomorrow

    // ✅ Construct final Yatra URL
    const encodedLocation = location.trim().replace(/\s+/g, "-");
    const url = `https://www.yatra.com/hotels/hotels-in-${encodedLocation}?checkin=${checkin}&checkout=${checkout}`;

    // ✅ Store job in DB
    const response = await prisma.jobs.create({
      data: {
        url,
        jobType: {
          type: "hotels",
          location,
        },
      },
    });

    // ✅ Push to scraping queue
    await importQueue.add("new location", {
      id: response.id,
      url,
      location,
      jobType: {
        type: "hotels",
        location,
      },
    });

    return NextResponse.json(
      { msg: "✅ Hotel scraping job started", id: response.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in hotel scraping route:", error);
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
}
