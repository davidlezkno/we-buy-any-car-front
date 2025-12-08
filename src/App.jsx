// Application shell that wires routing, context, and analytics providers.
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout/Layout";
import GTMProvider from "./components/Tracking/GTMProvider";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import ToastContainer from "./components/UI/ToastContainer";
import AppointmentFlow from "./pages/AppointmentFlow";
import Confirmation from "./pages/Confirmation";
import HomePage from "./pages/HomePage";
import LicensePlateFlow from "./pages/LicensePlateFlow";
import MakeModelFlow from "./pages/MakeModelFlow";
import VINFlow from "./pages/VINFlow";
import ManageAppointment from "./pages/ManageAppointment";
import { AppProvider } from "./context/AppContext";

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <GTMProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home/welcome/:id" element={<HomePage />} />
                <Route path="/manage-appointment/:id" element={<ManageAppointment />} />
                <Route path="/updateappointment" element={<ManageAppointment />} />
                <Route path="/sell-by-vin" element={<VINFlow />} />
                <Route path="/valuation/:uid" element={<MakeModelFlow />} />
                <Route path="/sell-by-make-model" element={<Navigate to="/valuation" replace />} />
                <Route path="/valuation/vehicledetails/:uid" element={<MakeModelFlow />} />
                <Route path="/valuation/vehiclecondition/:uid" element={<MakeModelFlow />} />
                <Route path="/secure/bookappointment/:uid" element={<MakeModelFlow />} />
                <Route path="/valuation/confirmation/:uid" element={<Confirmation />} />
                <Route path="/confirmation/:uid" element={<Confirmation />} />
                {/* Legacy routes stay available to honor existing inbound links. */}
                <Route path="/sell-by-plate" element={<LicensePlateFlow />} />
                <Route path="/appointment" element={<AppointmentFlow />} />
              </Routes>
            </Layout>
            <ToastContainer />
          </GTMProvider>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
