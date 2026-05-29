import { useState } from "react";

export type Screen = "login" | "dashboard" | "patients" | "patient-detail" | "sensor-detail";

export interface NavigationState {
  currentScreen: Screen;
  selectedPatientId: string | null;
  selectedSensorId: string | null;
  isAuthenticated: boolean;
}

export interface NavigationContextType {
  state: NavigationState;
  navigateTo: (screen: Screen, params?: { patientId?: string; sensorId?: string }) => void;
  login: () => void;
  logout: () => void;
}

export function useNavigation(): NavigationContextType {
  const [state, setState] = useState<NavigationState>({
    currentScreen: "login",
    selectedPatientId: null,
    selectedSensorId: null,
    isAuthenticated: false,
  });

  const navigateTo = (screen: Screen, params?: { patientId?: string; sensorId?: string }) => {
    setState(prev => ({
      ...prev,
      currentScreen: screen,
      selectedPatientId: params?.patientId || null,
      selectedSensorId: params?.sensorId || null,
    }));
  };

  const login = () => {
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      currentScreen: "dashboard",
    }));
  };

  const logout = () => {
    setState({
      currentScreen: "login",
      selectedPatientId: null,
      selectedSensorId: null,
      isAuthenticated: false,
    });
  };

  return { state, navigateTo, login, logout };
}
