import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, participantName, slots } = body;

    if (!eventId || !participantName || !slots || slots.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        eventId,
        name: participantName,
      },
    });

    // Create availability records with priorities
    const availabilityData = slots.map((slot: { datetime: string; priority: number }) => ({
      participantId: participant.id,
      slotTime: new Date(slot.datetime),
      status: "available",
      priority: slot.priority || 1,
    }));

    await prisma.availability.createMany({
      data: availabilityData,
    });

    return NextResponse.json({ 
      success: true, 
      participantId: participant.id 
    });
  } catch (error) {
    console.error("Error saving availability:", error);
    return NextResponse.json(
      { error: "Failed to save availability" },
      { status: 500 }
    );
  }
}
