export type Trip = {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  seatsAvailable: number;
  driver: {
    name: string;
    rating: number;
    tripsCount: number;
  };
  vehicle: {
    brand: string;
    model: string;
  };
};

// TODO: remplacer par un appel API réel une fois le backend branché.
export const TRIPS: Trip[] = [
  {
    id: "1",
    from: "Douala",
    to: "Yaoundé",
    date: "Aujourd'hui",
    time: "14h00",
    price: 4000,
    seatsAvailable: 2,
    driver: { name: "Marc Ateba", rating: 4.8, tripsCount: 132 },
    vehicle: { brand: "Toyota", model: "Corolla" },
  },
  {
    id: "2",
    from: "Yaoundé",
    to: "Bafoussam",
    date: "Demain",
    time: "08h30",
    price: 3500,
    seatsAvailable: 3,
    driver: { name: "Chantal Mballa", rating: 4.6, tripsCount: 87 },
    vehicle: { brand: "Hyundai", model: "Accent" },
  },
];

export function getTripById(id: string): Trip | undefined {
  return TRIPS.find((t) => t.id === id);
}
