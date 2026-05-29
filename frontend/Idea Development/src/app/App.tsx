import { useNavigation } from "./navigation/AppNavigator";
import { LoginScreen } from "./screens/LoginScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { PatientsScreen } from "./screens/PatientsScreen";
import { PatientDetailScreen } from "./screens/PatientDetailScreen";

export default function App() {
  const { state, navigateTo, login, logout } = useNavigation();

  return (
    <div className="min-h-screen">
      {state.currentScreen === "login" && (
        <LoginScreen onLogin={login} />
      )}

      {state.currentScreen === "dashboard" && state.isAuthenticated && (
        <DashboardScreen
          onNavigateToPatients={() => navigateTo("patients")}
          onNavigateToSensor={(sensorId) => navigateTo("sensor-detail", { sensorId })}
          onLogout={logout}
        />
      )}

      {state.currentScreen === "patients" && state.isAuthenticated && (
        <PatientsScreen
          onBack={() => navigateTo("dashboard")}
          onViewPatient={(patientId) => navigateTo("patient-detail", { patientId })}
        />
      )}

      {state.currentScreen === "patient-detail" && state.isAuthenticated && state.selectedPatientId && (
        <PatientDetailScreen
          patientId={state.selectedPatientId}
          onBack={() => navigateTo("patients")}
        />
      )}
    </div>
  );
}