export type ApplicationStatus = "pending" | "approved" | "rejected";

export type DriverApplication = {
  id: string;
  applicantName: string;
  submittedAt: string;
  vehicle: {
    brand: string;
    model: string;
    color: string;
    plate: string;
    seats: number;
  };
  licenseNumber: string;
  vehiclePhoto: string;
  licensePhoto: string;
  idCardPhoto: string;
  facePhoto: string;
  status: ApplicationStatus;
};

// TODO: remplacer par un appel API réel (GET /admin/driver-applications)
// une fois le backend branché. Mutée en mémoire pour la démo.
export const DRIVER_APPLICATIONS: DriverApplication[] = [
  {
    id: "app1",
    applicantName: "Hugues Noel",
    submittedAt: "Aujourd'hui, 10:32",
    vehicle: { brand: "Toyota", model: "Corolla", color: "Gris", plate: "LT 123 AB", seats: 4 },
    licenseNumber: "0021458CM",
    vehiclePhoto: "https://placehold.co/400x300/D85A30/FBF6EF?text=Véhicule",
    licensePhoto: "https://placehold.co/400x300/0F6E56/FBF6EF?text=Permis",
    idCardPhoto: "https://placehold.co/400x300/8C7A6B/FBF6EF?text=CNI",
    facePhoto: "https://placehold.co/300x300/D85A30/FBF6EF?text=Selfie",
    status: "pending",
  },
  {
    id: "app2",
    applicantName: "Divine Nkeng",
    submittedAt: "Hier, 18:04",
    vehicle: { brand: "Hyundai", model: "Accent", color: "Blanc", plate: "CE 456 CD", seats: 4 },
    licenseNumber: "0033214CM",
    vehiclePhoto: "https://placehold.co/400x300/0F6E56/FBF6EF?text=Véhicule",
    licensePhoto: "https://placehold.co/400x300/D85A30/FBF6EF?text=Permis",
    idCardPhoto: "https://placehold.co/400x300/8C7A6B/FBF6EF?text=CNI",
    facePhoto: "https://placehold.co/300x300/0F6E56/FBF6EF?text=Selfie",
    status: "pending",
  },
];

export function getApplicationById(id: string): DriverApplication | undefined {
  return DRIVER_APPLICATIONS.find((a) => a.id === id);
}

export function pendingApplicationsCount(): number {
  return DRIVER_APPLICATIONS.filter((a) => a.status === "pending").length;
}

export function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const app = getApplicationById(id);
  if (app) app.status = status;
}
