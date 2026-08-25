import React, { createContext, useContext, useState, ReactNode } from "react";

type Vehicle = {
  brand: string;
  model: string;
  plate: string;
  color?: string;
  seats?: string;
};

type Profile = {
  name: string;
  email: string;
  phone: string;
  photoUri: string | null;
};

type UserContextType = {
  profile: Profile;
  updateProfile: (fields: Partial<Profile>) => void;
  isDriver: boolean;
  isAdmin: boolean;
  vehicle: Vehicle | null;
  registerVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (fields: Partial<Vehicle>) => void;
  loginAsAdmin: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>({
    name: "Hugues Noel",
    email: "hugues.noel@email.com",
    phone: "6XX XXX XXX",
    photoUri: null,
  });
  const [isDriver, setIsDriver] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  // TODO: en production, isAdmin doit venir de la réponse de connexion
  // de votre backend, jamais être modifiable côté client en dehors de
  // ce flux de connexion admin dédié.
  const [isAdmin, setIsAdmin] = useState(false);

  const updateProfile = (fields: Partial<Profile>) =>
    setProfile((p) => ({ ...p, ...fields }));

  const registerVehicle = (v: Vehicle) => {
    setVehicle(v);
    setIsDriver(true);
  };

  // Distinct de registerVehicle : sert à modifier un véhicule déjà
  // enregistré (nouvelle immatriculation, changement de marque, etc.)
  // sans toucher au statut conducteur.
  const updateVehicle = (fields: Partial<Vehicle>) =>
    setVehicle((v) => (v ? { ...v, ...fields } : v));

  const loginAsAdmin = () => setIsAdmin(true);

  return (
    <UserContext.Provider
      value={{
        profile,
        updateProfile,
        isDriver,
        isAdmin,
        vehicle,
        registerVehicle,
        updateVehicle,
        loginAsAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser doit être utilisé dans un UserProvider");
  return ctx;
}
