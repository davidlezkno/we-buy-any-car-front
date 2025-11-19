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
import AppointmentFlow from "./pages/AppointmentFlow";
import Confirmation from "./pages/Confirmation";
import HomePage from "./pages/HomePage";
import LicensePlateFlow from "./pages/LicensePlateFlow";
import MakeModelFlow from "./pages/MakeModelFlow";
import VINFlow from "./pages/VINFlow";
import { AppProvider } from "./context/AppContext";

function App() {
  return (
    <AppProvider>
      <Router>
        <GTMProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/sell-by-vin" element={<VINFlow />} />
              <Route path="/valuation" element={<MakeModelFlow />} />
              <Route
                path="/sell-by-make-model"
                element={<Navigate to="/valuation" replace />}
              />
              <Route path="/valuation/details" element={<MakeModelFlow />} />
              <Route path="/valuation/condition" element={<MakeModelFlow />} />
              <Route
                path="/valuation/appointment"
                element={<MakeModelFlow />}
              />
              <Route
                path="/valuation/confirmation"
                element={<Confirmation />}
              />
              <Route path="/confirmation" element={<Confirmation />} />
              {/* Legacy routes stay available to honor existing inbound links. */}
              <Route path="/sell-by-plate" element={<LicensePlateFlow />} />
              <Route path="/appointment" element={<AppointmentFlow />} />
            </Routes>
          </Layout>
        </GTMProvider>
      </Router>
    </AppProvider>
  );
}

export default App;
