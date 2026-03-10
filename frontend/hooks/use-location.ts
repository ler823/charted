import * as Location from "expo-location";
import { useEffect, useState } from "react";

type Coords = {
  latitude: number;
  longitude: number;
};

type LocationState = {
  coords: Coords | null;
  permissionStatus: Location.PermissionStatus | null;
  loading: boolean;
  error: string | null;
};

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coords: null,
    permissionStatus: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkPermission();
  }, []);

  // Silently checks status — does NOT trigger native prompt
  const checkPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setState((prev) => ({ ...prev, permissionStatus: status, loading: false }));
  };

  // Call this only on explicit user action (button tap)
  const requestPermission = async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, loading: true }));
    const { status } = await Location.requestForegroundPermissionsAsync();
    setState((prev) => ({ ...prev, permissionStatus: status, loading: false }));
    return status === Location.PermissionStatus.GRANTED;
  };

  const fetchLocation = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setState((prev) => ({
        ...prev,
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        loading: false,
      }));
    } catch (e) {
      setState((prev) => ({
        ...prev,
        error: "Could not fetch location.",
        loading: false,
      }));
    }
  };

  return { ...state, requestPermission, fetchLocation };
}
