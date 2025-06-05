import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "../../../../lib/prisma";
import { importQueue } from "../../../../lib/queue";

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

    const url = "https://www.booking.com"; // ✅ Changed from Kayak to Booking

    const response = await prisma.jobs.create({
      data: {
        url,
        jobType: {
          type: "hotels",
          location
        },
      },
    });

    // ✅ Push to scraping queue
    await importQueue.add("new location", {
      url,
      jobType: { type: "hotels" },
      id: response.id,
      location
    });

    return NextResponse.json(
      { msg: "Hotel scraping job started", id: response.id },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
