import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GetCustomerJourney } from "../services/vehicleService";
import { cancelAppointment } from "../services/appointmentService";
import { getBrancheById } from "../services/branchService";
import { getCookie, removeCookie } from "../utils/helpers";

const ManageAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [appointmentData, setAppointmentData] = useState(null);
  const [branchInfo, setBranchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [cancelResult, setCancelResult] = useState({ success: false, message: "" });

  useEffect(() => {
    const loadAppointmentData = async () => {
      try {
        // Check for customerRef in query params (for /updateappointment route)
        const searchParams = new URLSearchParams(location.search);
        const customerRef = searchParams.get('customerRef');
        
        const customerJourneyId = id || customerRef || getCookie("visitorId");
        
        if (!customerJourneyId) {
          navigate("/");
          return;
        }

        const journeyData = await GetCustomerJourney(customerJourneyId);
        
        if (!journeyData?.currentAppointment) {
          navigate("/");
          return;
        }

        setAppointmentData(journeyData);

        // Load branch information
        const branchData = await getBrancheById(journeyData.currentAppointment.branchId);
        setBranchInfo(branchData.branchLocation);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading appointment:", error);
        navigate("/");
      }
    };

    loadAppointmentData();
  }, [id, location.search, navigate]);

  const handleUpdateAppointment = () => {
    // Store the existing appointment ID for rescheduling
    const appointmentId = appointmentData?.currentAppointment?.appointmentId;
    console.log('🔄 [ManageAppointment] Update appointment clicked:', {
      appointmentId,
      appointmentData: appointmentData?.currentAppointment
    });
    
    if (appointmentId) {
      localStorage.setItem('existingAppointmentId', appointmentId);
      
    } else {
      console.warn('⚠️ [ManageAppointment] No appointmentId found!');
    }
    
    // Redirect to calendar with reschedule flag
    navigate(`/secure/bookappointment/${appointmentData.customerJourneyId}?reschedule=true`);
  };

  const handleCancelAppointment = () => {
    setShowCancelModal(true);
  };

  const confirmCancelAppointment = async () => {
    setShowCancelModal(false);
    setLoading(true);

    try {
      const customerVehicleId = appointmentData.customerVehicleId;
      // Use optionalPhoneNumber (user's phone) instead of branch phone
      const phoneNumber = appointmentData.optionalPhoneNumber;

      if (!phoneNumber) {
        setCancelResult({
          success: false,
          message: "Unable to cancel appointment. Phone number not found. Please contact support."
        });
        setShowResultModal(true);
        setLoading(false);
        return;
      }

      await cancelAppointment(customerVehicleId, phoneNumber);

      setCancelResult({
        success: true,
        message: "Your appointment has been successfully cancelled."
      });
      setShowResultModal(true);

      // Clean up cookies and storage
      removeCookie("visitorId");
      localStorage.removeItem("appointmentData");

      // Redirect after showing success message
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setCancelResult({
        success: false,
        message: "There was an error cancelling your appointment. Please try again or contact support."
      });
      setShowResultModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    if (cancelResult.success) {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!appointmentData || !branchInfo) {
    return null;
  }

  const appointment = appointmentData.currentAppointment;
  const appointmentDate = appointment.appointmentDateTime.split('T')[0];
  const appointmentTime = appointment.appointmentDateTime.split('T')[1].split('-')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Title Bar */}
      <div id="title-bar" className="bg-primary-600 text-white py-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                <span id="top-heading">Manage Appointment</span>
              </h1>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-right">
                <h2 className="text-lg md:text-xl font-bold leading-tight">
                  {branchInfo.branchName}
                  <br />
                  <span className="text-sm font-normal">{branchInfo.city}, {branchInfo.state}</span>
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - Left Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-9 space-y-6"
          >
            {/* Appointment Title */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Appointment at Our {branchInfo.branchName} Branch
              </h2>
              <p className="text-gray-700 mb-6">
                You&apos;ve already made an appointment at our {branchInfo.branchName} branch on {appointmentDate} at {appointmentTime}. 
                If you need to reschedule for another time or branch, please use the buttons below.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleUpdateAppointment}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                  UPDATE APPOINTMENT
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancelAppointment}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                  CANCEL APPOINTMENT
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Directions Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-black text-white px-6 py-4">
                <h3 className="text-xl font-bold">Directions to webuyanycar.com®</h3>
              </div>
              <div className="p-6">
                {/* First Row: North and South */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* From North */}
                  <div>
                    <div className="border-t border-b border-gray-300 py-2 mb-3">
                      <h4 className="font-bold text-gray-900">From points North:</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Head South on the Garden State Pkwy</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Take exit 140A to merge onto US-22 W toward NJ-82 E/Elizabeth/Somerville</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Merge onto US-22 W</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Slight left toward Rte 22</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Slight left onto Rte 22</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>webuyanycar.com will be on your right</span></li>
                    </ul>
                  </div>

                  {/* From South */}
                  <div>
                    <div className="border-t border-b border-gray-300 py-2 mb-3">
                      <h4 className="font-bold text-gray-900">From points South:</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Head North on the Garden State Pkwy</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Take exit 139B toward NJ-82 W/Union</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Turn right onto Chestnut St</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Slight left onto W Chestnut S</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Slight right onto US-22 W</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Slight right toward Rte 22</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Slight right onto Rte 22</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>webuyanycar.com will be on the right</span></li>
                    </ul>
                  </div>
                </div>

                {/* Second Row: East and West */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* From East */}
                  <div>
                    <div className="border-t border-b border-gray-300 py-2 mb-3">
                      <h4 className="font-bold text-gray-900">From points East:</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Head West on I-78</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Keep left to continue on I-78 Express W, follow signs for Interstate 78 W/Garden State Parkway/Clinton</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Take the exit onto I-78 W</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Take exit 52 for Garden State Parkway</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Keep right at the fork and merge onto Garden State Pkwy</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Take exit 140A to merge onto US-22 W toward NJ-82 E/Elizabeth/Somerville</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Merge onto US-22 W</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Slight left toward Rte 22</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Slight left onto Rte 22</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>webuyanycar.com will be on your right</span></li>
                    </ul>
                  </div>

                  {/* From West */}
                  <div>
                    <div className="border-t border-b border-gray-300 py-2 mb-3">
                      <h4 className="font-bold text-gray-900">From points West:</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Head east on I-78</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Take exit 41 toward Berkeley Heights/Scotch Plains</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Turn left onto Dale Rd (signs for Exit 41)</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Continue onto Drift Rd</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Turn right to stay on Drift Rd</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Turn right onto Plainfield Ave</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Continue onto Bonnie Burn Rd</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Turn right onto New Providence Rd</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Turn left onto Park Ave</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>Slight right onto US-22 E</span></li>
                      <li className="flex gap-2"><span className="text-gray-400">—</span><span>webuyanycar.com will be on your right</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {branchInfo.branchName}
            </h3>
            
            {/* Branch Manager */}
            {branchInfo.branchManagerName && (
              <div className="mb-4">
                <p className="font-semibold text-gray-700">Branch Manager</p>
                <p className="text-gray-900">{branchInfo.branchManagerName}</p>
              </div>
            )}

            {/* Address */}
            <div className="mb-4">
              <p className="font-semibold text-gray-700">Address</p>
              <p className="text-gray-900">
                {branchInfo.address1}
                {branchInfo.address2 && <>, {branchInfo.address2}</>}
                <br />
                {branchInfo.city}, {branchInfo.state} {branchInfo.zipCode}
              </p>
            </div>

            {/* Telephone */}
            {branchInfo.branchPhone && (
              <div className="mb-4">
                <p className="font-semibold text-gray-700">Telephone</p>
                <a 
                  href={`tel:${branchInfo.branchPhone}`}
                  className="text-primary-600 hover:underline"
                >
                  {branchInfo.branchPhone}
                </a>
              </div>
            )}

            {/* Email Branch Button */}
            {branchInfo.branchEmail && (
              <a
                href={`mailto:${branchInfo.branchEmail}`}
                className="block w-full bg-black text-white text-center py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors mb-4"
              >
                Email Branch
              </a>
            )}

            {/* Hours */}
            <div>
              <p className="font-semibold text-gray-700 mb-2">Hours</p>
              <div className="space-y-1 text-sm">
                {branchInfo.operationHours?.map((hour, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-700">{hour.dayOfWeek}</span>
                    <span className="text-gray-900">
                      {hour.type === 'open' ? `${hour.openTime} - ${hour.closeTime}` : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Map */}
            {branchInfo.latitude && branchInfo.longitude && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 mb-2">Location</h4>
                <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    title="Branch Location"
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${branchInfo.latitude},${branchInfo.longitude}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="alert-message text-center text-lg font-semibold text-gray-900 mb-6">
              Are you sure you want to cancel your appointment?
            </div>
            <div className="alert-buttons-container flex gap-4 justify-center">
              <button
                onClick={confirmCancelAppointment}
                className="alert-button px-8 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={closeCancelModal}
                className="alert-button px-8 py-3 bg-gray-300 text-gray-900 rounded-lg font-bold hover:bg-gray-400 transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className={`text-center text-lg font-semibold mb-6 ${cancelResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {cancelResult.success ? '✓ Success' : '✗ Error'}
            </div>
            <div className="alert-message text-center text-gray-900 mb-6">
              {cancelResult.message}
            </div>
            <div className="alert-buttons-container flex justify-center">
              <button
                onClick={closeResultModal}
                className="alert-button px-8 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointment;
