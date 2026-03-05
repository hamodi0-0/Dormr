export interface TenantCompatibilityProfile {
  sleep_schedule: "early_bird" | "night_owl" | "flexible";
  cleanliness: 1 | 2 | 3 | 4 | 5;
  noise_level: "quiet" | "moderate" | "social";
  guests_frequency: "rarely" | "sometimes" | "often";
  smoking: boolean;
  pets: boolean;
  major: string;
  hobbies: string[];
}

export interface CleanlinessScore {
  tenantIndex: number;
  diff: number;
  score: number;
}

export interface FactorMatchDetails {
  matches: number;
  total: number;
  compatible: number[];
}

export interface CompatibilityDetails {
  sleep_schedule: FactorMatchDetails;
  cleanliness: { averageDiff: number; scores: CleanlinessScore[] };
  noise_level: FactorMatchDetails;
  guests_frequency: FactorMatchDetails;
  smoking: FactorMatchDetails;
  pets: FactorMatchDetails;
  major: FactorMatchDetails;
  hobbies: { shared: string[]; totalShared: number };
}

export interface TenantMatch {
  tenantIndex: number;
  score: number;
}

export interface CompatibilityResult {
  overallScore: number;
  details: CompatibilityDetails;
  tenantMatches: TenantMatch[];
}
