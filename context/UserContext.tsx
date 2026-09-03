import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";

type Vehicle = {
  id?: string;
  brand: string;
  model: string;
  plate: string;
  color?: string;
  seats?: string;
};

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUri: string | null;
};

type UserContextType = {
  loading: boolean;
  profile: Profile | null;
  updateProfile: (fields: Partial<Profile>) => Promise<void>;
  isDriver: boolean;
  isAdmin: boolean;
  vehicle: Vehicle | null;
  registerVehicle: (vehicle: Vehicle) => Promise<void>;
  updateVehicle: (fields: Partial<Vehicle>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const EMPTY_PROFILE: Profile = { id: "", name: "", email: "", phone: "", photoUri: null };

export function UserProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDriver, setIsDriver] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const loadProfile = async (userId: string) => {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileRow) {
      setProfile({
        id: profileRow.id,
        name: profileRow.name ?? "",
        email: profileRow.email ?? "",
        phone: profileRow.phone ?? "",
        photoUri: profileRow.photo_url,
      });
      setIsDriver(!!profileRow.is_driver);
      setIsAdmin(!!profileRow.is_admin);
    }

    const { data: vehicleRow } = await supabase
      .from("vehicles")
      .select("*")
      .eq("driver_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (vehicleRow) {
      setVehicle({
        id: vehicleRow.id,
        brand: vehicleRow.brand,
        model: vehicleRow.model,
        plate: vehicleRow.plate,
        color: vehicleRow.color,
        seats: String(vehicleRow.seats ?? ""),
      });
    } else {
      setVehicle(null);
    }
  };

  const refreshProfile = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      await loadProfile(data.session.user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setIsDriver(false);
        setIsAdmin(false);
        setVehicle(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const updateProfile = async (fields: Partial<Profile>) => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        name: fields.name ?? profile.name,
        phone: fields.phone ?? profile.phone,
        photo_url: fields.photoUri ?? profile.photoUri,
      })
      .eq("id", profile.id);
    if (!error) setProfile({ ...profile, ...fields });
  };

  // Enregistre le véhicule ET crée le dossier de validation admin
  // (driver_applications), cohérent avec le flux déjà construit.
  const registerVehicle = async (v: Vehicle) => {
    if (!profile) return;
    const { data: vehicleRow, error: vehicleError } = await supabase
      .from("vehicles")
      .insert({
        driver_id: profile.id,
        brand: v.brand,
        model: v.model,
        color: v.color,
        plate: v.plate,
        seats: v.seats ? parseInt(v.seats, 10) : 4,
      })
      .select()
      .single();
    if (vehicleError || !vehicleRow) return;

    await supabase.from("driver_applications").insert({
      driver_id: profile.id,
      vehicle_id: vehicleRow.id,
      license_number: "",
    });

    // Le compte bascule en mode conducteur immédiatement côté app,
    // même si le dossier reste "pending" côté admin (cohérent avec
    // l'écran "vehicle-submitted" déjà en place).
    await supabase.from("profiles").update({ is_driver: true }).eq("id", profile.id);

    setVehicle({ ...v, id: vehicleRow.id });
    setIsDriver(true);
  };

  const updateVehicle = async (fields: Partial<Vehicle>) => {
    if (!vehicle?.id) return;
    const { error } = await supabase
      .from("vehicles")
      .update({
        brand: fields.brand ?? vehicle.brand,
        model: fields.model ?? vehicle.model,
        color: fields.color ?? vehicle.color,
        plate: fields.plate ?? vehicle.plate,
        seats: fields.seats ? parseInt(fields.seats, 10) : undefined,
      })
      .eq("id", vehicle.id);
    if (!error) setVehicle({ ...vehicle, ...fields });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <UserContext.Provider
      value={{
        loading,
        profile: profile ?? (loading ? null : EMPTY_PROFILE),
        updateProfile,
        isDriver,
        isAdmin,
        vehicle,
        registerVehicle,
        updateVehicle,
        refreshProfile,
        signOut,
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
