export type ReservationStatus = "pending" | "accepted" | "declined";

export type ReservationRequest = {
  id: string;
  passengerName: string;
  seats: number;
  status: ReservationStatus;
};

export type PublishedTrip = {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  seatsTotal: number;
  requests: ReservationRequest[];
};

// TODO: remplacer par un appel API réel (GET /me/trips) une fois Supabase
// branché. Mutée en mémoire pour la démo.
export const MY_PUBLISHED_TRIPS: PublishedTrip[] = [
  {
    id: "p1",
    from: "Douala",
    to: "Yaoundé",
    date: "Aujourd'hui",
    time: "14h00",
    price: 4000,
    seatsTotal: 4,
    requests: [
      { id: "r1", passengerName: "Estelle Fotso", seats: 1, status: "accepted" },
      { id: "r2", passengerName: "Junior Ekwalla", seats: 2, status: "pending" },
    ],
  },
  {
    id: "p2",
    from: "Yaoundé",
    to: "Bafoussam",
    date: "Vendredi",
    time: "07h00",
    price: 3500,
    seatsTotal: 3,
    requests: [
      { id: "r3", passengerName: "Divine Nkeng", seats: 1, status: "pending" },
    ],
  },
];

export function getPublishedTripById(id: string): PublishedTrip | undefined {
  return MY_PUBLISHED_TRIPS.find((t) => t.id === id);
}

export function seatsTaken(trip: PublishedTrip): number {
  return trip.requests
    .filter((r) => r.status === "accepted")
    .reduce((sum, r) => sum + r.seats, 0);
}

export function pendingCount(trip: PublishedTrip): number {
  return trip.requests.filter((r) => r.status === "pending").length;
}

export function updateRequestStatus(
  tripId: string,
  requestId: string,
  status: ReservationStatus
) {
  const trip = getPublishedTripById(tripId);
  if (!trip) return;
  const req = trip.requests.find((r) => r.id === requestId);
  if (req) req.status = status;
}

// ---------------------------------------------------------------------
// Avis reçus par le conducteur
// ---------------------------------------------------------------------

export type Review = {
  id: string;
  passengerName: string;
  rating: number;
  comment: string;
  date: string;
};

export const MY_REVIEWS: Review[] = [
  { id: "rev1", passengerName: "Estelle Fotso", rating: 5, comment: "Conducteur ponctuel et sympathique, trajet très agréable.", date: "12 juillet" },
  { id: "rev2", passengerName: "Junior Ekwalla", rating: 4, comment: "Bonne conduite, un peu de retard au départ.", date: "5 juillet" },
  { id: "rev3", passengerName: "Divine Nkeng", rating: 5, comment: "Rien à dire, tout était parfait.", date: "28 juin" },
];

export function averageRating(): number {
  if (MY_REVIEWS.length === 0) return 0;
  const sum = MY_REVIEWS.reduce((s, r) => s + r.rating, 0);
  return Math.round((sum / MY_REVIEWS.length) * 10) / 10;
}
