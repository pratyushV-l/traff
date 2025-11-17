"use client";

import { FormEvent, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import RouteMap from "@/app/components/RouteMap";

type TimeOfDayOption = "morning" | "afternoon" | "evening" | "night";
type ModeOption = "car" | "two-wheeler" | "public" | "ride-share" | "walking";
type PriorityOption = "time" | "stress" | "cost" | "environment" | "none";
type FrequencyOption = "daily" | "few-times" | "weekly" | "occasionally";

type SurveyState = {
  city: string;
  startLocation: string;
  endLocation: string;
  timeOfDay: TimeOfDayOption | "";
  mode: ModeOption | "";
  duration: number;
  priority: PriorityOption | "";
  frequency: FrequencyOption | "";
};

type StepId =
  | "city"
  | "route"
  | "timeOfDay"
  | "mode"
  | "duration"
  | "priority"
  | "frequency";

type StepRenderProps = {
  answers: SurveyState;
  onAnswer: <K extends keyof SurveyState>(key: K, value: SurveyState[K]) => void;
};

type StepConfig = {
  id: StepId;
  title: string;
  helper: string;
  render: (props: StepRenderProps) => ReactNode;
  validate: (answers: SurveyState) => string | null;
};

const PHOTON_BASE_URL = "https://photon.komoot.io/api/";
type LocationSuggestion = {
  id: string;
  primary: string;
  secondary: string;
  full: string;
};
type CitySuggestion = {
  id: string;
  primary: string;
  secondary: string;
  full: string;
};

const cityOptions = [
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Gurugram",
  "Noida",
  "Other",
] as const;

const defaultCitySuggestions: CitySuggestion[] = cityOptions.map((city) => ({
  id: `default-city-${city}`,
  primary: city,
  secondary: "",
  full: city,
}));

const timeOfDayOptions: { value: TimeOfDayOption; label: string; detail: string }[] = [
  { value: "morning", label: "Morning", detail: "6-10 am" },
  { value: "afternoon", label: "Afternoon", detail: "10 am-4 pm" },
  { value: "evening", label: "Evening", detail: "4-8 pm" },
  { value: "night", label: "Night", detail: "8 pm-6 am" },
];

type ModeOptionMeta = { value: ModeOption; label: string; icon: ReactNode };

const modeOptions: ModeOptionMeta[] = [
  {
    value: "car",
    label: "Car",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-6 w-6 text-[var(--foreground)]"
        fill="currentColor"
      >
        <path d="M4.5 10.5L6 6.5h12l1.5 4h-15z" opacity="0.85" />
        <rect x="3.5" y="10.5" width="17" height="5.5" rx="1.5" />
        <circle cx="7.5" cy="17" r="1.8" />
        <circle cx="16.5" cy="17" r="1.8" />
      </svg>
    ),
  },
  {
    value: "two-wheeler",
    label: "Two-wheeler",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-6 w-6 text-[var(--foreground)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="7" cy="17" r="2.3" />
        <circle cx="17" cy="17" r="2.3" />
        <path d="M9 17l3-8h4" />
        <path d="M10 9h-2l-2 4" />
      </svg>
    ),
  },
  {
    value: "public",
    label: "Public transport",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-6 w-6 text-[var(--foreground)]"
        fill="currentColor"
      >
        <rect x="5" y="4" width="14" height="12" rx="2" />
        <rect x="7" y="6" width="4" height="4" rx="0.5" fill="var(--background)" />
        <rect x="13" y="6" width="4" height="4" rx="0.5" fill="var(--background)" />
        <rect x="7" y="12" width="10" height="2" rx="0.5" fill="var(--background)" />
        <circle cx="9" cy="18" r="1.2" />
        <circle cx="15" cy="18" r="1.2" />
      </svg>
    ),
  },
  {
    value: "ride-share",
    label: "Ride-share",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-6 w-6 text-[var(--foreground)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="9" r="2.5" />
        <circle cx="15" cy="9" r="2.5" />
        <path d="M5.5 17c1-2.4 2.7-3.5 5.5-3.5s4.5 1.1 5.5 3.5" />
        <path d="M7 17c0.8-1.6 2.1-2.3 4-2.3s3.2 0.7 4 2.3" opacity="0.6" />
      </svg>
    ),
  },
  {
    value: "walking",
    label: "Walking",
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-6 w-6 text-[var(--foreground)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="6" r="2" />
        <path d="M12 8.5l-2 4.5 3 2.5" />
        <path d="M10 13l-2.5 6" />
        <path d="M11.5 15l2.5 5.5" />
      </svg>
    ),
  },
];

const priorityOptions: { value: PriorityOption; label: string }[] = [
  { value: "time", label: "Saving time" },
  { value: "stress", label: "Reducing stress" },
  { value: "cost", label: "Reducing cost" },
  { value: "environment", label: "Being more environmentally conscious" },
  { value: "none", label: "No specific priority" },
];

const frequencyOptions: { value: FrequencyOption; label: string }[] = [
  { value: "daily", label: "Every day" },
  { value: "few-times", label: "A few times a week" },
  { value: "weekly", label: "Once a week" },
  { value: "occasionally", label: "Occasionally" },
];

const initialState: SurveyState = {
  city: "",
  startLocation: "",
  endLocation: "",
  timeOfDay: "",
  mode: "",
  duration: 45,
  priority: "",
  frequency: "",
};

type WrappedCategory = "social" | "economic" | "environmental" | "personal";

type WrappedStat = {
  id: string;
  category: WrappedCategory;
  text: string;
};

type CongestionInsights = {
  wastedPerTrip: number;
  wastedDaily: number;
  wastedWeekly: number;
  wastedYearly: number;
  freeFlowMinutes: number;
  tripsPerWeek: number;
  annualTrips: number;
  wrapped: WrappedStat[];
};

const WORKDAY_HOURS = 8;
const COMMUNITY_SESSION_MINUTES = 90;
const CO2_PER_LITRE = 2.31; // kg of CO2 per litre of petrol burned

function buildInsights(answers: SurveyState): CongestionInsights {
  const tripsPerWeek = getTripsPerWeek(answers.frequency);
  const annualTrips = Math.max(1, Math.round(tripsPerWeek * 52));
  const congestionFactor = getCongestionFactor(answers);

  const freeFlowMultiplier = 1 - congestionFactor * 0.65;
  const freeFlowMinutes = Math.max(5, Math.round(answers.duration * freeFlowMultiplier));
  const wastedPerTrip = Math.max(2, Math.round(answers.duration - freeFlowMinutes));

  const wastedWeekly = wastedPerTrip * tripsPerWeek;
  const wastedDaily = tripsPerWeek ? wastedWeekly / 7 : wastedPerTrip;
  const wastedYearly = wastedWeekly * 52;

  const averageSpeed = getAverageSpeed(answers.mode);
  const distancePerTrip = Math.max(3, (answers.duration / 60) * averageSpeed);
  const annualDistance = distancePerTrip * annualTrips;
  const shiftSavingsLitres = tripsPerWeek
    ? estimateFuelLitres(answers.mode, distancePerTrip * 52)
    : 0;
  const annualFuelLitres = estimateFuelLitres(answers.mode, annualDistance);
  const wastedYearlyHours = wastedYearly / 60;
  const lostWorkdays = wastedYearlyHours / WORKDAY_HOURS;
  const weeklyDelayHours = wastedWeekly / 60;
  const weeklyCatchUps = COMMUNITY_SESSION_MINUTES ? wastedWeekly / COMMUNITY_SESSION_MINUTES : 0;
  const delayShare = answers.duration ? wastedPerTrip / answers.duration : 0;
  const annualTailpipeKg = annualFuelLitres * CO2_PER_LITRE;
  const annualTailpipeTonnes = annualTailpipeKg / 1000;

  const fuelStatText =
    annualFuelLitres > 0.5
      ? `This pattern consumes about ${formatDecimal(annualFuelLitres, 1)} litres of fuel yearly; skipping one trip each week would save roughly ${formatDecimal(shiftSavingsLitres, 1)} litres.`
      : `No direct personal vehicle fuel use is estimated for your chosen mode across roughly ${formatKilometers(annualDistance)} travelled.`;

  const wrapped: WrappedStat[] = [];

  wrapped.push({
    id: "trip-volume",
    category: "personal",
    text: `Around ${formatNumber(annualTrips)} peak-hour trips this year (~${formatNumber(
      tripsPerWeek
    )} per week).`,
  });

  wrapped.push({
    id: "delay-share",
    category: "personal",
    text: `Each trip loses about ${formatDuration(wastedPerTrip)}, which is ${formatPercentage(
      delayShare
    )} of the total commute you reported.`,
  });

  wrapped.push({
    id: "social-time",
    category: "social",
    text: `Weekly congestion delay totals ${formatDecimal(weeklyDelayHours, 1)} hours—roughly ${formatDecimal(
      weeklyCatchUps,
      1
    )} typical 90-minute meetups you could plan elsewhere.`,
  });

  wrapped.push({
    id: "workdays",
    category: "social",
    text: `Over the year that delay sums to ${formatDecimal(
      wastedYearlyHours,
      1
    )} hours, close to ${formatDecimal(lostWorkdays, 1)} standard workdays of time.`,
  });

  wrapped.push({
    id: "distance",
    category: "economic",
    text: `Your route covers about ${formatKilometers(distancePerTrip)} per trip and ${formatKilometers(
      annualDistance
    )} annually—useful for tracking passes, maintenance, or reimbursements.`,
  });

  wrapped.push({
    id: "fuel",
    category: "economic",
    text: fuelStatText,
  });

  if (annualTailpipeKg > 0.5) {
    wrapped.push({
      id: "emissions",
      category: "environmental",
      text: `Tailpipe emissions from this pattern are roughly ${formatDecimal(
        annualTailpipeKg,
        0
      )} kg CO₂ (${formatDecimal(annualTailpipeTonnes, 2)} tonnes) each year.`,
    });
  } else {
    wrapped.push({
      id: "emissions",
      category: "environmental",
      text: `Direct tailpipe CO₂ is near zero for the mode and distance you selected; upstream power impacts depend on the transit network.`,
    });
  }

  return {
    wastedPerTrip,
    wastedDaily,
    wastedWeekly,
    wastedYearly,
    freeFlowMinutes,
    tripsPerWeek,
    annualTrips,
    wrapped,
  };
}

function getTripsPerWeek(frequency: FrequencyOption | ""): number {
  switch (frequency) {
    case "daily":
      return 10;
    case "few-times":
      return 6;
    case "weekly":
      return 2;
    case "occasionally":
      return 1;
    default:
      return 6;
  }
}

function getCongestionFactor(answers: SurveyState): number {
  let factor = 0.24;

  switch (answers.timeOfDay) {
    case "morning":
      factor += 0.1;
      break;
    case "evening":
      factor += 0.12;
      break;
    case "afternoon":
      factor += 0.05;
      break;
    case "night":
      factor += 0.01;
      break;
    default:
      factor += 0.03;
      break;
  }

  switch (answers.mode) {
    case "car":
      factor += 0.06;
      break;
    case "ride-share":
      factor += 0.05;
      break;
    case "two-wheeler":
      factor += 0.03;
      break;
    case "public":
      factor += 0.04;
      break;
    case "walking":
      factor -= 0.12;
      break;
    default:
      factor += 0.02;
      break;
  }

  const city = answers.city.toLowerCase();
  if (city.includes("bengaluru") || city.includes("bangalore")) {
    factor += 0.12;
  } else if (city.includes("mumbai")) {
    factor += 0.1;
  } else if (city.includes("delhi")) {
    factor += 0.11;
  } else if (city.includes("hyderabad") || city.includes("chennai")) {
    factor += 0.07;
  } else if (city.includes("pune") || city.includes("kolkata")) {
    factor += 0.06;
  } else if (city.trim().length) {
    factor += 0.05;
  }

  if (answers.frequency === "occasionally") {
    factor -= 0.03;
  }

  return clamp(0.08, 0.6, factor);
}

function getAverageSpeed(mode: ModeOption | ""): number {
  switch (mode) {
    case "car":
      return 22;
    case "ride-share":
      return 20;
    case "two-wheeler":
      return 28;
    case "public":
      return 18;
    case "walking":
      return 5;
    default:
      return 21;
  }
}

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatDuration(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  if (hours && minutes) {
    return `${hours} hr ${minutes} min`;
  }
  if (hours) {
    return `${hours} hr`;
  }
  return `${minutes} min`;
}

function formatNumber(value: number): string {
  const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
  return formatter.format(Math.round(value));
}

function formatDecimal(value: number, fractionDigits = 1): string {
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  const safeValue = Number.isFinite(value) ? value : 0;
  return formatter.format(safeValue);
}

function formatKilometers(distanceKm: number, fractionDigits = 1): string {
  const safeDistance = Math.max(0, distanceKm);
  return `${formatDecimal(safeDistance, fractionDigits)} km`;
}

function formatPercentage(value: number, fractionDigits = 1): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${formatDecimal(safeValue * 100, fractionDigits)}%`;
}

function estimateFuelLitres(mode: ModeOption | "", distanceKm: number): number {
  const km = Math.max(0, distanceKm);
  let efficiency: number | null = null;

  switch (mode) {
    case "car":
      efficiency = 12;
      break;
    case "ride-share":
      efficiency = 13;
      break;
    case "two-wheeler":
      efficiency = 32;
      break;
    case "public":
    case "walking":
      efficiency = null;
      break;
    default:
      efficiency = 15;
      break;
  }

  if (!efficiency) {
    return 0;
  }

  return km / efficiency;
}

type WrappedCategoryBlock = {
  category: WrappedCategory;
  label: string;
  entries: WrappedStat[];
};

function getWrappedByCategory(stats: WrappedStat[]): WrappedCategoryBlock[] {
  const categoryOrder: WrappedCategory[] = ["personal", "social", "economic", "environmental"];
  const categoryLabels: Record<WrappedCategory, string> = {
    personal: "Personal Pace",
    social: "Social Bandwidth",
    economic: "Economic Footprint",
    environmental: "Environmental Impact",
  };

  return categoryOrder
    .map((category) => ({
      category,
      label: categoryLabels[category],
      entries: stats.filter((stat) => stat.category === category),
    }))
    .filter((block) => block.entries.length > 0);
}

type ResultStatProps = {
  label: string;
  value: string;
  emphasis?: boolean;
};

function ResultStat({ label, value, emphasis }: ResultStatProps) {
  return (
    <div
      className={`rounded-2xl border border-black/10 px-5 py-4 text-center dark:border-white/10 ${
        emphasis ? "bg-[var(--primary)]/16" : "bg-[var(--background)]/70"
      }`}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </span>
      <span className="mt-2 block text-xl font-semibold text-[var(--foreground)]">{value}</span>
    </div>
  );
}

// Ordered list of questions to drive the minimalist survey flow.
const steps: StepConfig[] = [
  {
    id: "city",
    title: "Which city do you travel in most often?",
    helper: "We will load the right traffic model for your commute.",
    render: (props) => <CityQuestion {...props} />,
    validate: (answers) => (answers.city.trim().length ? null : "Pick a city to continue."),
  },
  {
    id: "route",
    title: "What areas do you usually travel between?",
    helper: "We only need your usual start and end points to set route baselines.",
    render: (props) => <RouteQuestion {...props} />,
    validate: (answers) => {
      if (!answers.startLocation.trim() || !answers.endLocation.trim()) {
        return "Fill in both locations.";
      }
      if (answers.startLocation.trim() === answers.endLocation.trim()) {
        return "Start and end locations should be different.";
      }
      return null;
    },
  },
  {
    id: "timeOfDay",
    title: "When do you normally make this trip?",
    helper: "Time of day helps us compare congestion patterns.",
    render: (props) => <TimeQuestion {...props} />,
    validate: (answers) => (answers.timeOfDay ? null : "Select the time you travel."),
  },
  {
    id: "mode",
    title: "How do you usually get around?",
    helper: "Modes tell us what baseline to use for cost, emissions, and comfort.",
    render: (props) => <ModeQuestion {...props} />,
    validate: (answers) => (answers.mode ? null : "Choose the way you travel."),
  },
  {
    id: "duration",
    title: "How long does this trip usually take you?",
    helper: "A rough estimate is enough for the simulation to calibrate.",
    render: (props) => <DurationQuestion {...props} />,
    validate: (answers) => (answers.duration >= 5 ? null : "Duration must be at least 5 minutes."),
  },
  {
    id: "priority",
    title: "What is your main priority during your commute?",
    helper: "We tune recommendations and tone to what matters most to you.",
    render: (props) => <PriorityQuestion {...props} />,
    validate: (answers) => (answers.priority ? null : "Select your top priority."),
  },
  {
    id: "frequency",
    title: "How often do you make this trip?",
    helper: "Frequency helps us estimate weekly impact and effort savings.",
    render: (props) => <FrequencyQuestion {...props} />,
    validate: (answers) => (answers.frequency ? null : "Let us know how often you travel."),
  },
];

export default function SimulatePage() {
  const [answers, setAnswers] = useState<SurveyState>(initialState);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleAnswer: StepRenderProps["onAnswer"] = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentStep = steps[stepIndex];
    const validationMessage = currentStep.validate(answers);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setError(null);
    if (stepIndex === steps.length - 1) {
      setCompleted(true);
      return;
    }
    setStepIndex((index) => index + 1);
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      return;
    }
    setStepIndex((index) => Math.max(0, index - 1));
    setError(null);
  };

  const handleRestart = () => {
    setAnswers(initialState);
    setStepIndex(0);
    setError(null);
    setCompleted(false);
  };

  if (completed) {
    const insights = buildInsights(answers);
    const summaryItems: { label: string; value: string }[] = [
      { label: "City", value: answers.city || "-" },
      { label: "Start location", value: answers.startLocation || "-" },
      { label: "End location", value: answers.endLocation || "-" },
      {
        label: "Time of day",
        value: timeOfDayOptions.find((item) => item.value === answers.timeOfDay)?.label || "-",
      },
      {
        label: "Mode",
        value: modeOptions.find((item) => item.value === answers.mode)?.label || "-",
      },
      { label: "Typical duration", value: `${answers.duration} minutes` },
      {
        label: "Priority",
        value: priorityOptions.find((item) => item.value === answers.priority)?.label || "-",
      },
      {
        label: "Frequency",
        value: frequencyOptions.find((item) => item.value === answers.frequency)?.label || "-",
      },
    ];

    return (
      <section className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-3xl rounded-3xl border border-black/10 bg-[var(--card)]/85 px-10 py-12 shadow-sm dark:border-white/10">
          <h1 className="text-3xl font-semibold text-[var(--foreground)] text-center">Snapshot locked.</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)] text-center">
            Here is the quick-form summary that feeds your simulation plus a glimpse of what congestion has been doing behind the scenes.
          </p>
          <ul className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
            {summaryItems.map((item) => (
              <li key={item.label}>
                <span className="block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  {item.label}
                </span>
                <span className="mt-1 block text-[var(--foreground)]">{item.value}</span>
              </li>
            ))}
          </ul>

          {answers.startLocation && answers.endLocation && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-[var(--foreground)] text-center">Route Snapshot</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)] text-center">
                Open data map with estimated route and slower segments in red.
              </p>
              <RouteMap
                startLocation={answers.startLocation}
                endLocation={answers.endLocation}
                mode={answers.mode || "driving"}
                className="mt-4"
              />
            </div>
          )}

          <div className="mt-10 rounded-2xl bg-[var(--primary)]/12 px-6 py-5 text-sm text-[var(--foreground)]">
            <p>
              Your typical commute takes <strong>{formatDuration(answers.duration)}</strong> while the streets could clear it in about <strong>{formatDuration(insights.freeFlowMinutes)}</strong>. That leaves <strong>{formatDuration(insights.wastedPerTrip)}</strong> eaten by delays every trip.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <ResultStat label="Lost daily" value={formatDuration(insights.wastedDaily)} />
            <ResultStat label="Lost weekly" value={formatDuration(insights.wastedWeekly)} />
            <ResultStat label="Lost yearly" value={formatDuration(insights.wastedYearly)} emphasis />
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-[var(--foreground)] text-center">Commute Wrapped</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)] text-center">
              A domain-by-domain snapshot based on your inputs and our calculations.
            </p>
            <div className="mt-6 grid gap-5 text-sm">
              {getWrappedByCategory(insights.wrapped).map(({ category, label, entries }) => (
                <div
                  key={category}
                  className="rounded-2xl border border-black/10 bg-[var(--background)]/65 px-5 py-4 shadow-sm dark:border-white/10"
                >
                  <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">
                    {label}
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {entries.map((entry) => (
                      <li key={entry.id} className="text-[var(--foreground)]/95">
                        {entry.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="mt-8 inline-flex items-center justify-center rounded-full border border-black/20 px-5 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Start again
          </button>
        </div>
      </section>
    );
  }

  const currentStep = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <section className="flex-1 flex items-center justify-center py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <div className="mx-auto max-w-md rounded-3xl border border-black/10 bg-[var(--card)]/80 px-8 py-10 shadow-sm backdrop-blur dark:border-white/10">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
              Step {stepIndex + 1} of {steps.length}
            </div>
            <div className="mt-3 h-1 w-full rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-[var(--foreground)]">{currentStep.title}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{currentStep.helper}</p>
          {currentStep.render({ answers, onAnswer: handleAnswer })}
          {error && <p className="mt-5 text-sm text-red-500">{error}</p>}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={stepIndex === 0}
              className="rounded-full border border-black/20 px-4 py-2 text-sm text-[var(--text-secondary)] transition disabled:opacity-40 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
            >
              Back
            </button>
            <button
              type="submit"
              className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {stepIndex === steps.length - 1 ? "Finish" : "Continue"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function CityQuestion({ answers, onAnswer }: StepRenderProps) {
  return (
    <div className="mt-6 text-left">
      <CitySearchInput
        label="Search for your city"
        placeholder="Start typing a city..."
        value={answers.city}
        onChange={(nextValue: string) => onAnswer("city", nextValue)}
      />
    </div>
  );
}

type CitySearchInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

function CitySearchInput({ label, placeholder, value, onChange }: CitySearchInputProps) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>(defaultCitySuggestions);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const blurTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (value.trim().length < 2) {
      setSuggestions(defaultCitySuggestions);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      try {
        const searchUrl =
          `${PHOTON_BASE_URL}?q=${encodeURIComponent(value)}&limit=8&lang=en&osm_tag=place:city&osm_tag=place:town`;
        const response = await fetch(searchUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Photon city lookup failed: ${response.status}`);
        }
        const data = await response.json();
        const features: unknown = data?.features;
        const mapped = Array.isArray(features)
          ? features
              .map((feature, featureIndex) => {
                if (typeof feature !== "object" || feature === null) {
                  return null;
                }
                const typed = feature as Record<string, unknown>;
                const properties = (typed.properties ?? {}) as Record<string, unknown>;
                const osmIdRaw = properties.osm_id;
                const osmTypeRaw = properties.osm_type;
                const osmId =
                  typeof osmIdRaw === "number"
                    ? osmIdRaw.toString(10)
                    : typeof osmIdRaw === "string"
                    ? osmIdRaw
                    : "";
                const osmType = typeof osmTypeRaw === "string" ? osmTypeRaw : "";
                const nameProp = typeof properties.name === "string" ? properties.name : "";
                const cityProp = typeof properties.city === "string" ? properties.city : "";
                const county = typeof properties.county === "string" ? properties.county : "";
                const state = typeof properties.state === "string" ? properties.state : "";
                const country = typeof properties.country === "string" ? properties.country : "";
                const primaryTextCandidates = [nameProp, cityProp].filter(
                  (text) => typeof text === "string" && text.trim().length
                ) as string[];
                const primaryText = primaryTextCandidates[0];
                if (!primaryText) {
                  return null;
                }
                const secondaryParts = [county, state, country]
                  .filter((part) => typeof part === "string" && part.trim().length)
                  .map((part) => part.trim());
                const uniqueSecondary = secondaryParts.filter(
                  (part, index) => secondaryParts.indexOf(part) === index
                );
                const fullLabelParts = [primaryText, ...uniqueSecondary];
                const full = fullLabelParts.filter(Boolean).join(", ");
                if (!full.trim().length) {
                  return null;
                }
                const idBasePieces = [osmType, osmId, primaryText, uniqueSecondary.join(",")]
                  .filter((part) => typeof part === "string" && part.trim().length)
                  .map((part) => part.trim())
                  .join("-");
                const id = `${idBasePieces || "photon-city"}-${featureIndex}`;

                return {
                  id,
                  primary: primaryText,
                  secondary: uniqueSecondary.join(", "),
                  full,
                } satisfies CitySuggestion;
              })
              .filter((item): item is CitySuggestion => Boolean(item?.full))
          : [];
        setSuggestions(mapped.length ? mapped : defaultCitySuggestions);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("City suggestion fetch failed", error);
        }
        setSuggestions(defaultCitySuggestions);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  const handleFocus = () => {
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsOpen(true);
    if (value.trim().length < 2) {
      setSuggestions(defaultCitySuggestions);
    }
  };

  const handleBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      blurTimeoutRef.current = null;
    }, 150);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChange(nextValue);
    if (nextValue.trim().length >= 2) {
      setIsOpen(true);
    } else {
      setSuggestions(defaultCitySuggestions);
    }
  };

  const handleSuggestionSelect = (suggestion: CitySuggestion) => {
    onChange(suggestion.full);
    setIsOpen(false);
  };

  const shouldShowDropdown = isOpen && suggestions.length > 0;

  return (
    <div className="grid gap-2">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          className="input-shell"
        />
        {shouldShowDropdown && (
          <div className="dropdown-panel absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-auto">
            {loading ? (
              <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">Searching...</div>
            ) : (
              suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="font-medium text-[var(--foreground)]">{suggestion.primary}</span>
                  {suggestion.secondary && (
                    <span className="text-xs text-[var(--text-secondary)]">{suggestion.secondary}</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RouteQuestion({ answers, onAnswer }: StepRenderProps) {
  return (
    <div className="mt-6 grid gap-4 text-left">
      <LocationSearchInput
        label="Start location"
        placeholder="Eg. Indiranagar"
        value={answers.startLocation}
        onChange={(nextValue: string) => onAnswer("startLocation", nextValue)}
      />
      <LocationSearchInput
        label="End location"
        placeholder="Eg. Electronic City"
        value={answers.endLocation}
        onChange={(nextValue: string) => onAnswer("endLocation", nextValue)}
      />
    </div>
  );
}

type LocationSearchInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

function LocationSearchInput({ label, placeholder, value, onChange }: LocationSearchInputProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const blurTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (value.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      try {
        const searchUrl = `${PHOTON_BASE_URL}?q=${encodeURIComponent(value)}&limit=6&lang=en`;
        const response = await fetch(searchUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Photon lookup failed: ${response.status}`);
        }
        const data = await response.json();
        const features: unknown = data?.features;
        const mapped = Array.isArray(features)
          ? features
              .map((feature, featureIndex) => {
                if (typeof feature !== "object" || feature === null) {
                  return null;
                }
                const typed = feature as Record<string, unknown>;
                const properties = (typed.properties ?? {}) as Record<string, unknown>;
                const osmIdRaw = properties.osm_id;
                const osmTypeRaw = properties.osm_type;
                const osmId =
                  typeof osmIdRaw === "number"
                    ? osmIdRaw.toString(10)
                    : typeof osmIdRaw === "string"
                    ? osmIdRaw
                    : "";
                const osmType = typeof osmTypeRaw === "string" ? osmTypeRaw : "";
                const name = typeof properties.name === "string" ? properties.name : "";
                const street = typeof properties.street === "string" ? properties.street : "";
                const houseNumber = typeof properties.housenumber === "string" ? properties.housenumber : "";
                const suburb = typeof properties.suburb === "string" ? properties.suburb : "";
                const city = typeof properties.city === "string" ? properties.city : "";
                const state = typeof properties.state === "string" ? properties.state : "";
                const district = typeof properties.county === "string" ? properties.county : "";
                const postcode = typeof properties.postcode === "string" ? properties.postcode : "";
                const country = typeof properties.country === "string" ? properties.country : "";

                const primaryCandidates = [name, [houseNumber, street].filter(Boolean).join(" "), street, city, suburb].filter(
                  (entry) => typeof entry === "string" && entry.trim().length
                ) as string[];
                const primaryText = primaryCandidates[0] ?? "Unknown location";

                const secondaryParts = [
                  postcode,
                  [suburb, city].filter(Boolean).join(", "),
                  district,
                  state,
                  country,
                ]
                  .filter((part) => typeof part === "string" && part.trim().length)
                  .map((part) => part.trim());

                const uniqueSecondary = secondaryParts.filter((part, index) => secondaryParts.indexOf(part) === index);

                const fullLabelParts = [primaryText, ...uniqueSecondary];
                const full = fullLabelParts.filter(Boolean).join(", ");
                if (!full.trim().length) {
                  return null;
                }

                const idBasePieces = [osmType, osmId, primaryText, uniqueSecondary.join(",")]
                  .filter((part) => typeof part === "string" && part.trim().length)
                  .map((part) => part.trim())
                  .join("-");
                const id = `${idBasePieces || "photon-result"}-${featureIndex}`;

                return {
                  id,
                  primary: primaryText,
                  secondary: uniqueSecondary.join(", "),
                  full,
                } satisfies LocationSuggestion;
              })
              .filter((item): item is LocationSuggestion => Boolean(item?.full))
          : [];
        setSuggestions(mapped);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Location suggestion fetch failed", error);
        }
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    };
  }, []);

  const handleFocus = () => {
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (value.trim().length >= 3) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      blurTimeoutRef.current = null;
    }, 150);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChange(nextValue);
    if (nextValue.trim().length >= 3) {
      setIsOpen(true);
    }
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    onChange(suggestion.full);
    setIsOpen(false);
  };

  const shouldShowDropdown = Boolean(isOpen && value.trim().length >= 3);

  return (
    <div className="grid gap-2">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          className="input-shell"
        />
        {shouldShowDropdown && (
          <div className="dropdown-panel absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-auto">
            {loading ? (
              <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">Searching...</div>
            ) : suggestions.length ? (
              suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="font-medium text-[var(--foreground)]">{suggestion.primary}</span>
                  {suggestion.secondary && (
                    <span className="text-xs text-[var(--text-secondary)]">{suggestion.secondary}</span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">No matches found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TimeQuestion({ answers, onAnswer }: StepRenderProps) {
  return (
    <div className="mt-6 grid gap-3">
      {timeOfDayOptions.map((option) => {
        const isSelected = answers.timeOfDay === option.value;
        return (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
              isSelected
                ? "border-[var(--primary)] bg-[var(--primary)]/10"
                : "border-black/10 dark:border-white/15 hover:border-[var(--primary)]/60"
            }`}
          >
            <div>
              <div className="font-medium text-[var(--foreground)]">{option.label}</div>
              <div className="text-xs text-[var(--text-secondary)]">{option.detail}</div>
            </div>
            <input
              type="radio"
              name="time-of-day"
              value={option.value}
              checked={isSelected}
              onChange={(event) => onAnswer("timeOfDay", event.target.value as TimeOfDayOption)}
              className="h-4 w-4"
            />
          </label>
        );
      })}
    </div>
  );
}

function ModeQuestion({ answers, onAnswer }: StepRenderProps) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {modeOptions.map((option) => {
        const isActive = answers.mode === option.value;
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onAnswer("mode", option.value)}
            aria-pressed={isActive}
            className={`flex flex-col items-center gap-3 rounded-2xl border px-4 py-4 text-sm transition ${
              isActive
                ? "border-[var(--primary)] bg-[var(--primary)]/10"
                : "border-black/10 dark:border-white/15 hover:border-[var(--primary)]/60"
            }`}
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                isActive ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-black/10 dark:border-white/15"
              }`}
            >
              {option.icon}
            </span>
            <span className="text-center text-sm font-medium text-[var(--foreground)]">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DurationQuestion({ answers, onAnswer }: StepRenderProps) {
  return (
    <div className="mt-6 text-left">
      <div className="text-center text-4xl font-semibold text-[var(--foreground)]">
        {answers.duration} min
      </div>
      <input
        type="range"
        min={5}
        max={120}
        step={5}
        value={answers.duration}
        onChange={(event) => onAnswer("duration", Number(event.target.value))}
        className="mt-6 w-full"
      />
      <div className="mt-2 flex justify-between text-xs text-[var(--text-secondary)]">
        <span>5</span>
        <span>120</span>
      </div>
    </div>
  );
}

function PriorityQuestion({ answers, onAnswer }: StepRenderProps) {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      {priorityOptions.map((option) => {
        const isSelected = answers.priority === option.value;
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onAnswer("priority", option.value)}
            aria-pressed={isSelected}
            className={`rounded-full px-5 py-2 text-sm transition ${
              isSelected
                ? "bg-[var(--primary)] text-white"
                : "border border-black/15 text-[var(--foreground)] hover:border-[var(--primary)]/60 dark:border-white/20"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FrequencyQuestion({ answers, onAnswer }: StepRenderProps) {
  return (
    <div className="mt-6 text-left">
      <FrequencyDropdown
        value={answers.frequency}
        onChange={(nextValue: FrequencyOption) => onAnswer("frequency", nextValue)}
      />
    </div>
  );
}

type FrequencyDropdownProps = {
  value: FrequencyOption | "";
  onChange: (value: FrequencyOption) => void;
};

function FrequencyDropdown({ value, onChange }: FrequencyDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selected = value ? frequencyOptions.find((option) => option.value === value) : null;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node | null;
      if (containerRef.current && targetNode && containerRef.current.contains(targetNode)) {
        return;
      }
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (nextValue: FrequencyOption) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className="relative grid gap-2" ref={containerRef}>
      <span className="text-sm text-[var(--text-secondary)]">Select frequency</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="input-shell flex w-full items-center justify-between"
      >
        <span className={selected ? "" : "text-black/40"}>
          {selected ? selected.label : "Choose one..."}
        </span>
        <ChevronIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`} />
      </button>
      {open && (
        <div
          role="listbox"
          className="dropdown-panel absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-auto"
        >
          {frequencyOptions.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center justify-between px-4 py-3 text-sm transition ${
                  isSelected
                    ? "bg-[var(--primary)]/10 text-[var(--foreground)]"
                    : "text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <span className="text-xs text-[var(--primary)]">Selected</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 8l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
