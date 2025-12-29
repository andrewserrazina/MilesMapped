import type { ActivityItem, AwardOption, Client, HotelOption, Itinerary, Trip } from "@/lib/types";

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
    notes: "Focus on low surcharges and overnight flights.",
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
    notes: "Needs stroller-friendly transfers.",
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
