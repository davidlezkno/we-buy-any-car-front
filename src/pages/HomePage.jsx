import { useCallback, useEffect, useState } from "react";
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
import { createCustomerJourney, createCustomerJourneyByPlate, createCustomerJourneyByVin, createVisitorID, GetCustomerJourneyByVisit } from "../services/vehicleService";
import { getCookie, removeCookie, setCookie } from "../utils/helpers";
import ChangeAppointment from "../components/Home/ChangeAppointment";
import Popup from "../components/popup/Popup";

// HomePage composes the homepage journey while delegating presentation to section components.
const HomePage = () => {
  const navigate = useNavigate();
  const { updateVehicleData } = useApp();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isVinHelpModalOpen, setIsVinHelpModalOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [titleButton1, setTitleButton1] = useState("");
  const [description, setDescription] = useState("");
  const [appointmentData, setAppointmentData] = useState(null);
  

  useEffect(() => {
    const visitorId = getCookie("visitorId");
    if(visitorId){
      GetCustomerJourneyByVisit(visitorId).then(data => {
        console.log(data);
        if(data.currentAppointment){
          setAppointmentData(data);
        }
      });
    }
    const data = JSON.parse(localStorage.getItem("appointmentData"));
    setAppointmentData(data);
   
  }, []);

  const handleChangeAppointment = () => {
    navigate(`/secure/bookappointment/${appointmentData.customerJourneyId}`);
  };

  const handleNewValuation = () => {
    removeCookie("visitorId");
    window.location.reload();
  };

  const handleButton1 = () => {
    setIsPopupOpen(false);
    // Tu lógica aquí
  };

  const handleButton2 = () => {
    setIsPopupOpen(false);
    setActiveTabIndex(0);
  };

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

  const handleVinSubmit =  (vinValue) => {
    setTitleButton1("Edit VIN");
    setDescription(`We had trouble decoding your VIN. Please double check the information you entered is correct or tell us your Year, Make and Model.`);
    createCustomerJourneyByVin(vinValue).then(rps => {
      if(rps && rps.customerJourneyId){
        localStorage.setItem("customerJourneyId", rps.customerJourneyId);
        navigate(`/valuation/vehicledetails/${rps.customerJourneyId}`);
      }else{
        setIsPopupOpen(true)
      }
    }).catch(error => {
      setIsPopupOpen(true)
      console.error("Error Create customer journey by vin:", error);
    });

  }

  const handlePlateSubmit = (_state, _plate) => {
    setTitleButton1("Edit License Plate");
    setDescription(`We could not locate a vehicle using the license plate number ${_plate.toUpperCase()}. 
      Please double check the information you entered is correct or tell us your Year, Make and Model.`);
    createCustomerJourneyByPlate(null, _plate, _state).then(rps => {
      if(rps && rps.customerJourneyId){
        localStorage.setItem("customerJourneyId", rps.customerJourneyId);
        navigate(`/valuation/vehicledetails/${rps.customerJourneyId}`);
      }else{
        setIsPopupOpen(true)
      }
    }).catch(error => {
      setIsPopupOpen(true)
      console.error("Error Create customer journey by vin:", error);
    });
  }

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
    <>
    <div className="min-h-screen">
      <HeroSection />

      {appointmentData ? (
        <ChangeAppointment
          imageUrl={appointmentData.vehicleImageUrl}
          text={`You have an appointment booked at our ${appointmentData.branchName} branch on ${appointmentData.date} at ${appointmentData.time}`}
          onButton1Click={handleChangeAppointment}
          onButton2Click={handleNewValuation}
        />
      ) : (

        <ValuationTabs
        activeTab={activeTabIndex}
        onTabChange={setActiveTabIndex}
        onMakeModelSubmit={handleMakeModelSubmit}
        onVinSubmit={handleVinSubmit}
        onPlateSubmit={handlePlateSubmit}
        onOpenVinHelp={handleOpenVinModal}
      />

      )}

      
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
      <div>

      {/* El componente Popup */}
      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Título del Popup"
        subtitle="Subtítulo opcional"
        description={description}
        onButton1Click={handleButton1}
        onButton2Click={handleButton2}
        button1Label={titleButton1}
        button2Label="Describe Vehicle"
      />
    </div>
    </>
  );
};

export default HomePage;
