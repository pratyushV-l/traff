import { NextResponse } from "next/server";

type CommuteEstimateRequest = {
  city?: string;
  startLocation?: string;
  endLocation?: string;
  mode?: string;
  duration?: number;
  timeOfDay?: string;
  frequency?: string;
};

type CommuteEstimateResponse = {
  travelTimeMinutes: number;
  noTrafficMinutes: number;
  wastedMinutes: number;
  provider: string;
  travelMode: string;
  startLabel: string;
  endLabel: string;
  departureLocal: string;
  timeZone: string;
};

const DEFAULT_DURATION = 45;
const BASELINE_CONGESTION = 0.22;
const MAX_CONGESTION = 0.65;

export async function POST(request: Request) {
  const payload = (await parseBody(request)) ?? {};
  const duration = sanitizeDuration(payload.duration);
  const congestion = clamp(0.05, MAX_CONGESTION, buildCongestionFactor(payload));
  const freeFlowMinutes = Math.max(5, Math.round(duration * (1 - congestion)));
  const travelTimeMinutes = Math.max(freeFlowMinutes + 2, duration);
  const wastedMinutes = Math.max(0, travelTimeMinutes - freeFlowMinutes);

  const response: CommuteEstimateResponse = {
    travelTimeMinutes,
    noTrafficMinutes: freeFlowMinutes,
    wastedMinutes,
    provider: "traff-29 heuristics",
    travelMode: (payload.mode || "unspecified").toLowerCase(),
    startLabel: payload.startLocation?.trim() || "Starting point",
    endLabel: payload.endLocation?.trim() || "Destination",
    departureLocal: new Date().toISOString(),
    timeZone: inferTimeZone(payload.city),
  };

  return NextResponse.json(response);
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

async function parseBody(request: Request): Promise<CommuteEstimateRequest | null> {
  try {
    const raw = await request.json();
    if (typeof raw !== "object" || raw === null) {
      return null;
    }
    return raw as CommuteEstimateRequest;
  } catch (error) {
    return null;
  }
}

function sanitizeDuration(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_DURATION;
  }
  return clamp(5, 180, Math.round(value as number));
}

function buildCongestionFactor(payload: CommuteEstimateRequest): number {
  let factor = BASELINE_CONGESTION;

  switch ((payload.timeOfDay || "").toLowerCase()) {
    case "morning":
      factor += 0.18;
      break;
    case "evening":
      factor += 0.2;
      break;
    case "afternoon":
      factor += 0.08;
      break;
    case "night":
      factor += 0.02;
      break;
    default:
      factor += 0.05;
      break;
  }

  switch ((payload.mode || "").toLowerCase()) {
    case "car":
      factor += 0.08;
      break;
    case "ride-share":
      factor += 0.07;
      break;
    case "two-wheeler":
      factor += 0.05;
      break;
    case "public":
      factor += 0.04;
      break;
    case "walking":
      factor -= 0.12;
      break;
    default:
      factor += 0.03;
      break;
  }

  const city = (payload.city || "").toLowerCase();
  if (city.includes("bengaluru") || city.includes("bangalore")) {
    factor += 0.15;
  } else if (city.includes("mumbai")) {
    factor += 0.12;
  } else if (city.includes("delhi")) {
    factor += 0.14;
  } else if (city.includes("hyderabad")) {
    factor += 0.1;
  } else if (city.includes("chennai") || city.includes("pune") || city.includes("kolkata")) {
    factor += 0.09;
  } else if (city.trim().length) {
    factor += 0.06;
  }

  if ((payload.frequency || "").toLowerCase() === "occasionally") {
    factor -= 0.04;
  }

  return factor;
}

function inferTimeZone(city: string | undefined): string {
  if (!city) {
    return "Asia/Kolkata";
  }
  const lower = city.toLowerCase();
  if (lower.includes("new york") || lower.includes("chicago") || lower.includes("los angeles")) {
    return "America/New_York";
  }
  if (lower.includes("london")) {
    return "Europe/London";
  }
  return "Asia/Kolkata";
}

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}
