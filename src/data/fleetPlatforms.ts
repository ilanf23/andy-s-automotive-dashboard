export type FleetPlatform = {
  id: string;
  name: string;
  logoLetter: string;
  status: "connected" | "disconnected";
  activeJobs: number;
  lastSync: string; // human "2 min ago"
  customers: string[]; // customer names routed through this platform
};

export const fleetPlatforms: FleetPlatform[] = [
  {
    id: "FP-FLEETIO",
    name: "Fleetio",
    logoLetter: "F",
    status: "connected",
    activeJobs: 12,
    lastSync: "2 min ago",
    customers: ["Med Trust"],
  },
  {
    id: "FP-HOLMAN",
    name: "Holman",
    logoLetter: "H",
    status: "connected",
    activeJobs: 8,
    lastSync: "5 min ago",
    customers: ["City Form", "FSCJ"],
  },
  {
    id: "FP-ENTERPRISE",
    name: "Enterprise Fleet",
    logoLetter: "E",
    status: "connected",
    activeJobs: 4,
    lastSync: "12 min ago",
    customers: ["Reliable Ducks"],
  },
  {
    id: "FP-MIKEALBERTS",
    name: "Mike Albert's",
    logoLetter: "M",
    status: "connected",
    activeJobs: 2,
    lastSync: "1 hr ago",
    customers: ["Davy Tree Service"],
  },
];
