export type Technician = {
  id: string;
  name: string;
  role: string;
  hourlyRate: number;
  initials: string;
  utilization: number; // 0-100
};

export const technicians: Technician[] = [
  {
    id: "TECH-MARCUS",
    name: "Marcus Reeves",
    role: "Lead Diesel Technician",
    hourlyRate: 42,
    initials: "MR",
    utilization: 92,
  },
  {
    id: "TECH-JOSE",
    name: "Jose Alvarez",
    role: "Hydraulics Specialist",
    hourlyRate: 38,
    initials: "JA",
    utilization: 86,
  },
  {
    id: "TECH-ANDRE",
    name: "Andre Bell",
    role: "Electrical / Ambulance Specialist",
    hourlyRate: 40,
    initials: "AB",
    utilization: 78,
  },
  {
    id: "TECH-TREVOR",
    name: "Trevor Hicks",
    role: "General Technician",
    hourlyRate: 28,
    initials: "TH",
    utilization: 64,
  },
  {
    id: "TECH-DANNY",
    name: "Danny Pearce",
    role: "Apprentice / Lube Tech",
    hourlyRate: 22,
    initials: "DP",
    utilization: 71,
  },
];
