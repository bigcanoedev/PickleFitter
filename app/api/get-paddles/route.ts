import { NextResponse } from "next/server";
import { paddleData } from "@/lib/paddle-data";

export async function GET() {
  return NextResponse.json(paddleData);
}
