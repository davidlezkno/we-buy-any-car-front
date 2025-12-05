import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/Home/HeroSection";
import ValuationTabs from "../components/Home/ValuationTabs";
import TradeInBanner from "../components/Home/TradeInBanner";
import WhySellSection from "../components/Home/WhySellSection";
import ReviewsSection from "../components/Home/ReviewsSection";
import ProcessStepsSection from "../components/Home/ProcessStepsSection";
import DisclaimerSection from "../components/Home/DisclaimerSection";
import VINHelpModal from "../components/UI/VINHelpModal";
import { useApp } from "../context/AppContext";
import { createCustomerJourney, createVisitorID } from "../services/vehicleService";
import { setCookie } from "../utils/helpers";

// HomePage composes the homepage journey while delegating presentation to section components.
const HomePage = () => {
  const navigate = useNavigate();
  const { updateVehicleData } = useApp();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isVinHelpModalOpen, setIsVinHelpModalOpen] = useState(false);

  const handleMakeModelSubmit = useCallback(
    (vehicleDetails) => {

      createVisitorID().then(visitor => {
        // Guardar visitorId en cookie (7 días de expiración)
        setCookie("visitorId", visitor.visitorId, { expires: 7 });
        
        const { year, make, model } = vehicleDetails;
        createCustomerJourney(year,make,model,visitor.visitorId).then(rps => {
          localStorage.setItem("customerJourneyId", rps.customerJourneyId);
          updateVehicleData(vehicleDetails);
          navigate(`/valuation/vehicledetails/${rps.customerJourneyId}`);
          // navigate(`/valuation/vehicledetails`);
        }).catch(_error => {
          navigate("/valuation/vehicledetails");
        }).catch(error => {
          console.error("Error Create customer journey:", error);
        });
      }).catch(error => {
        console.error("Error creating visitor ID:", error);
      });

      

      
    },
    [navigate, updateVehicleData],
  );

  const handleVinSubmit = useCallback(
    (vehicleInfo) => {
      updateVehicleData(vehicleInfo);
      navigate("/sell-by-vin");
    },
    [navigate, updateVehicleData],
  );

  const handlePlateSubmit = useCallback(
    (_state, _plate) => {
      navigate("/sell-by-plate");
    },
    [navigate],
  );

  const handleOpenVinModal = useCallback(() => {
    // setIsVinHelpModalOpen(true);
  }, []);

  const handleCloseVinModal = useCallback(() => {
    setIsVinHelpModalOpen(false);
  }, []);

  const handleVinModalSelectList = useCallback(() => {
    setIsVinHelpModalOpen(false);
    setActiveTabIndex(0);
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <ValuationTabs
        activeTab={activeTabIndex}
        onTabChange={setActiveTabIndex}
        onMakeModelSubmit={handleMakeModelSubmit}
        onVinSubmit={handleVinSubmit}
        onPlateSubmit={handlePlateSubmit}
        onOpenVinHelp={handleOpenVinModal}
      />
      <div className="flex flex-col md:contents">
        <TradeInBanner />
        <div className="order-3 md:order-none">
          <WhySellSection />
        </div>
        <div className="order-2 md:order-none">
          <ReviewsSection />
        </div>
      </div>
      <ProcessStepsSection />
      <DisclaimerSection />
      <VINHelpModal
        isOpen={isVinHelpModalOpen}
        onClose={handleCloseVinModal}
        onSelectFromList={handleVinModalSelectList}
      />
    </div>
  );
};

export default HomePage;
