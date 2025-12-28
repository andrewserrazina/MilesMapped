export type TripStatus =
  | "Intake"
  | "Searching"
  | "Draft Ready"
  | "Sent"
  | "Booked"
  | "Closed";

export type ClientStatus = "Lead" | "Active" | "Completed";

export interface ClientPreferences {
  homeAirports: string[];
  cabinPref: "Economy" | "Premium" | "Business" | "First";
  flexibilityDays: number;
  notes?: string;
}

export interface ClientBalances {
  amexMR: number;
  chaseUR: number;
  cap1: number;
  united: number;
  hyatt: number;
  marriott: number;
  other?: Record<string, number>;
}

export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: ClientStatus;
  assignedAgentName: string;
  preferences: ClientPreferences;
  balances: ClientBalances;
  createdAt: string;
}

export interface AwardOption {
  id: string;
  tripId: string;
  program: string;
  route: string;
  milesRequired: number;
  feesUSD: number;
  transferRequired: boolean;
  transferTime: "Instant" | "1–2 days" | "Unknown";
  badges?: string[];
  createdAt: string;
}

export interface HotelOption {
  id: string;
  tripId: string;
  name: string;
  pointsPerNight: number;
  cashAltUSD: number;
  notes?: string;
}

export interface Trip {
  id: string;
  clientId: string;
  title: string;
  origin: string;
  destination: string;
  dateStart: string;
  dateEnd: string;
  flexibilityDays: number;
  passengers: number;
  cabinPref: ClientPreferences["cabinPref"];
  cashBudget?: number;
  status: TripStatus;
  notes?: string;
  awardOptions: AwardOption[];
  hotelOptions: HotelOption[];
  pinnedAwardOptionId?: string;
}

export interface Itinerary {
  id: string;
  tripId: string;
  generatedAt: string;
  sections: string[];
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  category: "Trip" | "Client" | "System";
}
