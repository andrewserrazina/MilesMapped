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

export type AuditLogAction =
  | "ClientCreated"
  | "ClientUpdated"
  | "ClientBalancesUpdated"
  | "TripCreated"
  | "TripStatusUpdated"
  | "TripMarkedSent"
  | "TripMarkedBooked"
  | "TripMarkedClosed"
  | "AwardOptionPinned"
  | "ItineraryGenerated"
  | "DemoDataReset";

export type AuditLogTargetType =
  | "Client"
  | "Trip"
  | "Itinerary"
  | "Task"
  | "Balance";

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: string;
  action: AuditLogAction;
  targetType: AuditLogTargetType;
  targetId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface AwardOption {
  id: string;
  tripId: string;
  program: string;
  route: string;
  milesRequired: number;
  feesUSD: number;
  cashEquivalentUSD?: number;
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

export interface TripIntake {
  travelerNamesCaptured: boolean;
  preferredAirportsConfirmed: boolean;
  datesConfirmed: boolean;
  cabinConfirmed: boolean;
  pointsReviewed: boolean;
  docsChecked: boolean;
  budgetNotesAdded: boolean;
}

export const defaultTripIntake: TripIntake = {
  travelerNamesCaptured: false,
  preferredAirportsConfirmed: false,
  datesConfirmed: false,
  cabinConfirmed: false,
  pointsReviewed: false,
  docsChecked: false,
  budgetNotesAdded: false,
};

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
  assignedAgentName: string;
  notes?: string;
  intake: TripIntake;
  awardOptions: AwardOption[];
  hotelOptions: HotelOption[];
  pinnedAwardOptionId?: string;
}

export interface Itinerary {
  id: string;
  tripId: string;
  generatedAt: string;
  optionAId: string;
  backupOptionIds: string[];
  shareToken?: string;
  notes?: string;
}

export type CommunicationType = string;

export interface CommunicationEntry {
  id: string;
  clientId: string;
  tripId?: string;
  type: CommunicationType;
  summary: string;
  createdAt: string;
  createdBy: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  category: "Trip" | "Client" | "System";
}

export interface AwardSearchIntegrationConfig {
  enabled: boolean;
  baseUrl: string;
  urlTemplate: string;
}

export interface AwardSearchIntegrationsSettings {
  pointMe: AwardSearchIntegrationConfig;
  roame: AwardSearchIntegrationConfig;
}

export type KnowledgeArticleCategory =
  | "Sweet Spots"
  | "Transfer Partners"
  | "Airline Quirks"
  | "SOPs";

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: KnowledgeArticleCategory;
  content: string;
  tags: string[];
  createdAt: string;
}
