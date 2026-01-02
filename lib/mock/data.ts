import type {
  ActivityItem,
  AwardOption,
  Client,
  HotelOption,
  Itinerary,
  KnowledgeArticle,
  Trip,
} from "@/lib/types";
import { defaultTripIntake } from "@/lib/types";

export const clients: Client[] = [
  {
    id: "client_001",
    fullName: "Avery Johnson",
    email: "avery.johnson@example.com",
    phone: "+1 (212) 555-0198",
    status: "Active",
    assignedAgentName: "Jordan Lee",
    preferences: {
      homeAirports: ["JFK", "EWR"],
      cabinPref: "Business",
      flexibilityDays: 3,
      notes: "Prefers overnight flights and lounge access.",
    },
    balances: {
      amexMR: 220000,
      chaseUR: 85000,
      cap1: 42000,
      united: 98000,
      hyatt: 56000,
      marriott: 120000,
      other: { "Alaska": 15000 },
    },
    createdAt: "2024-07-02",
  },
  {
    id: "client_002",
    fullName: "Priya Desai",
    email: "priya.desai@example.com",
    phone: "+1 (415) 555-0144",
    status: "Lead",
    assignedAgentName: "Mason Reed",
    preferences: {
      homeAirports: ["SFO", "OAK"],
      cabinPref: "Premium",
      flexibilityDays: 2,
      notes: "Flexible with routing, prefers daytime flights.",
    },
    balances: {
      amexMR: 78000,
      chaseUR: 42000,
      cap1: 31000,
      united: 44000,
      hyatt: 21000,
      marriott: 38000,
    },
    createdAt: "2024-08-10",
  },
  {
    id: "client_003",
    fullName: "Marcus Alvarez",
    email: "marcus.alvarez@example.com",
    phone: "+1 (646) 555-0171",
    status: "Completed",
    assignedAgentName: "Jordan Lee",
    preferences: {
      homeAirports: ["LGA"],
      cabinPref: "Economy",
      flexibilityDays: 1,
      notes: "Budget conscious, likes red-eye deals.",
    },
    balances: {
      amexMR: 34000,
      chaseUR: 12000,
      cap1: 18000,
      united: 0,
      hyatt: 9000,
      marriott: 14000,
    },
    createdAt: "2024-05-22",
  },
];

export const awardOptions: AwardOption[] = [
  {
    id: "award_001",
    tripId: "trip_001",
    program: "Virgin Atlantic",
    route: "JFK–CDG",
    milesRequired: 50000,
    feesUSD: 220,
    cashEquivalentUSD: 1400,
    transferRequired: true,
    transferTime: "Instant",
    badges: ["Sweet Spot"],
    createdAt: "2024-08-15",
  },
  {
    id: "award_002",
    tripId: "trip_001",
    program: "Air France",
    route: "EWR–AMS",
    milesRequired: 62000,
    feesUSD: 180,
    cashEquivalentUSD: 1250,
    transferRequired: true,
    transferTime: "1–2 days",
    badges: ["Low Fees"],
    createdAt: "2024-08-16",
  },
  {
    id: "award_003",
    tripId: "trip_002",
    program: "United",
    route: "SFO–HNL",
    milesRequired: 27500,
    feesUSD: 11,
    cashEquivalentUSD: 420,
    transferRequired: false,
    transferTime: "Instant",
    badges: ["Nonstop"],
    createdAt: "2024-08-11",
  },
];

export const hotelOptions: HotelOption[] = [
  {
    id: "hotel_001",
    tripId: "trip_001",
    name: "Hyatt Regency Paris Etoile",
    pointsPerNight: 25000,
    cashAltUSD: 420,
    notes: "Club lounge access included.",
  },
  {
    id: "hotel_002",
    tripId: "trip_001",
    name: "Marriott Opera Ambassador",
    pointsPerNight: 32000,
    cashAltUSD: 490,
    notes: "Close to Metro, flexible cancellation.",
  },
  {
    id: "hotel_003",
    tripId: "trip_002",
    name: "Hyatt Regency Waikiki",
    pointsPerNight: 18000,
    cashAltUSD: 310,
    notes: "Ocean view rooms available.",
  },
];

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: "kb_001",
    title: "Virgin Atlantic ANA sweet spot checklist",
    category: "Sweet Spots",
    content: `# Virgin Atlantic ANA sweet spot

Use Virgin Atlantic Flying Club to book ANA business/first between the US and Japan.

## When to use it
- Roundtrip only pricing required
- Best for West Coast to Tokyo (lower mileage bands)

## Steps
1. Verify ANA space on United or ANA.
2. Call Virgin to ticket (online rarely works).
3. Confirm taxes stay under $200.

**Pro tip:** Keep a backup carrier in case ANA space disappears.`,
    tags: ["Virgin Atlantic", "ANA", "Japan", "Sweet Spot"],
    createdAt: "2024-09-04",
  },
  {
    id: "kb_002",
    title: "Chase → Air France transfer playbook",
    category: "Transfer Partners",
    content: `# Chase to Air France/KLM

Transfers from Chase Ultimate Rewards to Flying Blue are usually instant.

## Notes
- Watch for monthly Promo Rewards.
- Taxes are moderate; avoid last-minute departures.

## Agent checklist
- Confirm cabin inventory before transferring
- Screenshot award price for client record`,
    tags: ["Chase", "Flying Blue", "Air France", "Transfer"],
    createdAt: "2024-10-12",
  },
  {
    id: "kb_003",
    title: "United quirks: mixed cabin pricing",
    category: "Airline Quirks",
    content: `# United mixed cabin quirks

United can price long-haul segments in business with a short economy hop.

## What to watch
- The itinerary may display "Business" even with an economy segment.
- Always open segment details to confirm cabin per leg.

## SOP
Add a note in the itinerary explaining any economy positioning.`,
    tags: ["United", "Mixed Cabin", "Quirk"],
    createdAt: "2024-11-02",
  },
  {
    id: "kb_004",
    title: "SOP: award option intake notes",
    category: "SOPs",
    content: `# Award option intake SOP

Log every award option with:
- Program and route
- Mileage + taxes
- Transfer time
- Screenshot of availability

## Ownership
Assign the trip lead in the notes field.`,
    tags: ["SOP", "Award Options", "Process"],
    createdAt: "2024-08-18",
  },
  {
    id: "kb_005",
    title: "Capital One → Virgin Atlantic timing",
    category: "Transfer Partners",
    content: `# Capital One to Virgin Atlantic

Transfers are usually instant but can lag 5–15 minutes.

## Best practices
- Initiate transfer before calling Virgin.
- Keep the client on standby for final ticketing.

**Reminder:** Virgin charges per segment for changes.`,
    tags: ["Capital One", "Virgin Atlantic", "Transfer Time"],
    createdAt: "2024-09-22",
  },
  {
    id: "kb_006",
    title: "Sweet spot: Avianca LifeMiles to Europe",
    category: "Sweet Spots",
    content: `# Avianca LifeMiles to Europe

LifeMiles often prices Star Alliance business to Europe at 63k one-way.

## Good to know
- Mixed cabin pricing can lower totals.
- Avoid Lufthansa first within 14 days (limited access).

## Suggested tags
Star Alliance, LifeMiles, Europe`,
    tags: ["LifeMiles", "Star Alliance", "Europe"],
    createdAt: "2024-10-05",
  },
  {
    id: "kb_007",
    title: "How to Use MilesMapped Portal (Agent SOP)",
    category: "SOPs",
    content: `# How to Use MilesMapped Portal (Agent SOP)

Use this step-by-step flow to move a client trip from intake to closure.

## 1) Client
- Create or open the client profile.
- Confirm contact details, points balances, and preferences.
- **Screenshot placeholder:** Client overview with balances and notes.

## 2) Trip
- Create a new trip for the client.
- Confirm route, dates, cabin, and passenger count.
- **Screenshot placeholder:** Trip creation form with key fields.

## 3) Intake
- Complete the intake checklist.
- Document budget notes and document requirements.
- **Screenshot placeholder:** Intake checklist completion state.

## 4) Searching
- Begin award search and log sources.
- Validate real availability before moving forward.
- **Screenshot placeholder:** Search status with award sources.

## 5) Award Options
- Add award options with mileage, fees, and transfer time.
- Include notes and screenshots of availability when possible.
- **Screenshot placeholder:** Award options list with notes.

## 6) Pin
- Pin the best award option for the primary itinerary.
- Confirm it is fully bookable before proceeding.
- **Screenshot placeholder:** Pinned award option highlight.

## 7) Draft Ready
- Mark trip as Draft Ready after all options are reviewed.
- Prepare draft itinerary notes for the client.
- **Screenshot placeholder:** Trip header showing Draft Ready.

## 8) Itinerary
- Generate the itinerary once pinned options are set.
- Include backup options and client-ready notes.
- **Screenshot placeholder:** Generated itinerary summary.

## 9) Sent
- Send the itinerary to the client and log the communication.
- Confirm the client understands transfer steps.
- **Screenshot placeholder:** Sent status with communication log.

## 10) Booked
- Mark as Booked once ticketed.
- Capture confirmation numbers and deadlines.
- **Screenshot placeholder:** Booked status with booking metadata.

## 11) Closed
- Close the trip after travel is complete.
- Add final notes and outcomes for future reference.
- **Screenshot placeholder:** Closed status summary.`,
    tags: ["SOP", "Onboarding", "Workflow"],
    createdAt: "2024-11-18",
  },
];

export const trips: Trip[] = [
  {
    id: "trip_001",
    clientId: "client_001",
    title: "Europe Honeymoon",
    origin: "JFK",
    destination: "CDG",
    dateStart: "2024-10-12",
    dateEnd: "2024-10-22",
    flexibilityDays: 3,
    passengers: 2,
    cabinPref: "Business",
    cashBudget: 2800,
    status: "Searching",
    assignedAgentName: "Admin",
    notes: "Focus on low surcharges and overnight flights.",
    intake: {
      ...defaultTripIntake,
      travelerNamesCaptured: true,
      preferredAirportsConfirmed: true,
      datesConfirmed: true,
      cabinConfirmed: true,
      pointsReviewed: true,
    },
    awardOptions: awardOptions.filter((option) => option.tripId === "trip_001"),
    hotelOptions: hotelOptions.filter((option) => option.tripId === "trip_001"),
    pinnedAwardOptionId: "award_001",
  },
  {
    id: "trip_002",
    clientId: "client_002",
    title: "Hawaii Family Escape",
    origin: "SFO",
    destination: "HNL",
    dateStart: "2024-12-05",
    dateEnd: "2024-12-12",
    flexibilityDays: 2,
    passengers: 4,
    cabinPref: "Premium",
    cashBudget: 1800,
    status: "Intake",
    assignedAgentName: "Agent A",
    notes: "Needs stroller-friendly transfers.",
    intake: {
      ...defaultTripIntake,
      travelerNamesCaptured: true,
      preferredAirportsConfirmed: false,
      datesConfirmed: true,
    },
    awardOptions: awardOptions.filter((option) => option.tripId === "trip_002"),
    hotelOptions: hotelOptions.filter((option) => option.tripId === "trip_002"),
  },
  {
    id: "trip_003",
    clientId: "client_003",
    title: "Austin Music Weekend",
    origin: "LGA",
    destination: "AUS",
    dateStart: "2024-09-05",
    dateEnd: "2024-09-08",
    flexibilityDays: 1,
    passengers: 1,
    cabinPref: "Economy",
    status: "Booked",
    assignedAgentName: "Agent B",
    intake: {
      ...defaultTripIntake,
      travelerNamesCaptured: true,
      preferredAirportsConfirmed: true,
      datesConfirmed: true,
      cabinConfirmed: true,
      pointsReviewed: true,
      docsChecked: true,
      budgetNotesAdded: true,
    },
    awardOptions: [],
    hotelOptions: [],
  },
];

export const itineraries: Itinerary[] = [];

export const activities: ActivityItem[] = [
  {
    id: "activity_001",
    title: "Award option pinned",
    description: "Virgin Atlantic JFK–CDG option pinned for Europe Honeymoon.",
    createdAt: "2024-08-18",
    category: "Trip",
  },
  {
    id: "activity_002",
    title: "New client intake",
    description: "Priya Desai completed the intake form.",
    createdAt: "2024-08-10",
    category: "Client",
  },
  {
    id: "activity_003",
    title: "Trip delivered",
    description: "Austin Music Weekend itinerary sent to Marcus Alvarez.",
    createdAt: "2024-08-01",
    category: "Trip",
  },
];

export const tripStatusOrder: Trip["status"][] = [
  "Intake",
  "Searching",
  "Draft Ready",
  "Sent",
  "Booked",
  "Closed",
];

export function getClientById(id: string) {
  return clients.find((client) => client.id === id);
}

export function getTripById(id: string) {
  return trips.find((trip) => trip.id === id);
}

export function getTripsByClientId(clientId: string) {
  return trips.filter((trip) => trip.clientId === clientId);
}
