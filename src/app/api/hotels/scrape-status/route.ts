import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "../../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobIdParam = searchParams.get("jobId");

    if (!jobIdParam) {
      return NextResponse.json(
        { message: "Job id is required.", status: false },
        { status: 400 }
      );
    }

    const jobId = parseInt(jobIdParam);

    const job = await prisma.jobs.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { message: "Invalid job id.", status: false },
        { status: 400 }
      );
    }

    if (!job.isComplete) {
      return NextResponse.json(
        { msg: "Job Incomplete", status: false },
        { status: 200 }
      );
    }

    const hotels = await prisma.hotels.findMany({
      where: { jobId },
    });

    return NextResponse.json(
      { msg: "Job Completed", hotels, status: true },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "An unexpected error occurred.", status: false },
      { status: 500 }
    );
  }
}
