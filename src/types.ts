export interface Measurement {
  id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  source: "physical" | "virtual";
}

export interface AppConfig {
  apiKey: string;
  appUrl: string;
  endpointUrl: string;
}

export type TabType = "dashboard" | "wiring" | "software" | "testing" | "about";
