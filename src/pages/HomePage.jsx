import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { id } = useParams();
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
        
        if(data.currentAppointment){
          setAppointmentData(data);
          // Redirect to URL with ID if we're not already on that route
          if (location.pathname === '/' && data.customerJourneyId) {
            navigate(`/home/welcome/${data.customerJourneyId}`, { replace: true });
          }
        }
      });
    }
    const data = JSON.parse(localStorage.getItem("appointmentData"));
    if(data) {
      setAppointmentData(data);
      // Redirect to URL with ID if we're not already on that route
      if (location.pathname === '/' && data.customerJourneyId) {
        navigate(`/home/welcome/${data.customerJourneyId}`, { replace: true });
      }
    }
   
  }, [location.pathname, navigate]);

  const handleChangeAppointment = () => {
    navigate(`/updateappointment?customerRef=${appointmentData.customerJourneyId}`);
  };

  const handleNewValuation = () => {
    removeCookie("visitorId");
    localStorage.removeItem("appointmentData");
    navigate("/", { replace: true });
    window.location.reload();
  };

  const handleButton1 = () => {
    setIsPopupOpen(false);
    // Your logic here
  };

  const handleButton2 = () => {
    setIsPopupOpen(false);
    setActiveTabIndex(0);
  };

  const handleMakeModelSubmit = useCallback(
    (vehicleDetails) => {

      createVisitorID().then(visitor => {
        // Save visitorId in cookie (7 days expiration)
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
    
    createVisitorID().then(visitor => {
      // Save visitorId in cookie (7 days expiration)
      setCookie("visitorId", visitor.visitorId, { expires: 7 });
      
      createCustomerJourneyByVin(vinValue, visitor.visitorId).then(rps => {
        if(rps && rps.customerJourneyId){
          localStorage.setItem("customerJourneyId", rps.customerJourneyId);
          
          // If vehicle description is complete, skip to step 3 (vehicle condition)
          if(rps.isVehicleDescriptionComplete === true){
            navigate(`/valuation/vehiclecondition/${rps.customerJourneyId}`);
          } else {
            // Otherwise go to step 2 (vehicle details)
            navigate(`/valuation/vehicledetails/${rps.customerJourneyId}`);
          }
        }else{
          setIsPopupOpen(true)
        }
      }).catch(error => {
        setIsPopupOpen(true)
        console.error("Error Create customer journey by vin:", error);
      });
    }).catch(error => {
      console.error("Error creating visitor ID:", error);
      setIsPopupOpen(true)
    });
  }

  const handlePlateSubmit = (_state, _plate) => {
    setTitleButton1("Edit License Plate");
    setDescription(`We could not locate a vehicle using the license plate number ${_plate.toUpperCase()}. 
      Please double check the information you entered is correct or tell us your Year, Make and Model.`);
    
    createVisitorID().then(visitor => {
      // Save visitorId in cookie (7 days expiration)
      setCookie("visitorId", visitor.visitorId, { expires: 7 });
      
      createCustomerJourneyByPlate(visitor.visitorId, _plate, _state).then(rps => {
        if(rps && rps.customerJourneyId){
          localStorage.setItem("customerJourneyId", rps.customerJourneyId);
          
          // Save plate info for display
          updateVehicleData({
            ...vehicleData,
            plateNumber: _plate,
            plateState: _state,
            ...rps
          });
          
          // If vehicle description is complete, skip to step 3 (vehicle condition)
          if(rps.isVehicleDescriptionComplete === true){
            navigate(`/valuation/vehiclecondition/${rps.customerJourneyId}`);
          } else {
            // Otherwise go to step 2 (vehicle details)
            navigate(`/valuation/vehicledetails/${rps.customerJourneyId}`);
          }
        }else{
          setIsPopupOpen(true)
        }
      }).catch(error => {
        setIsPopupOpen(true)
        console.error("Error Create customer journey by plate:", error);
      });
    }).catch(error => {
      console.error("Error creating visitor ID:", error);
      setIsPopupOpen(true)
    });
  }

  const handleOpenVinModal = useCallback(() => {
    setIsVinHelpModalOpen(true);
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
      {/* HeroSection always visible, with custom title if there's an appointment */}
      <HeroSection 
        customTitle={appointmentData ? `Welcome ${appointmentData.make} ${appointmentData.model} Owner!` : null}
        hideSubtitle={!!appointmentData}
      />

      {appointmentData ? (
        <>
          <ChangeAppointment
            imageUrl={appointmentData.vehicleImageUrl}
            vehicleInfo={{
              year: appointmentData.year,
              make: appointmentData.make,
              model: appointmentData.model,
              valuationDate: new Date(appointmentData.valuationDate || appointmentData.currentAppointment?.appointmentDateTime).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
              valuationAmount: appointmentData.valuationAmount ? `$${appointmentData.valuationAmount.toLocaleString()}` : 'N/A',
            }}
            text={`You have an appointment booked at our ${appointmentData?.currentAppointment?.branchName} branch 
            on ${appointmentData?.currentAppointment?.appointmentDateTime.split('T')[0]} at 
            ${appointmentData?.currentAppointment?.appointmentDateTime.split('T')[1].split('-')[0]}`}
            onButton1Click={handleChangeAppointment}
            onButton2Click={handleNewValuation}
          />
        </>
      ) : (
        <>
          <ValuationTabs
            activeTab={activeTabIndex}
            onTabChange={setActiveTabIndex}
            onMakeModelSubmit={handleMakeModelSubmit}
            onVinSubmit={handleVinSubmit}
            onPlateSubmit={handlePlateSubmit}
            onOpenVinHelp={handleOpenVinModal}
          />
          {/* Only show TradeInBanner if there's NO appointment */}
          <div className="flex flex-col md:contents">
            <TradeInBanner />
          </div>
        </>
      )}

      {/* Common sections always visible */}
      <div className="flex flex-col md:contents">
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

      {/* The Popup component */}
      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Popup Title"
        subtitle="Optional Subtitle"
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
