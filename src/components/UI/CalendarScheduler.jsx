import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MapPin,
  Phone,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import Input from "./Input";
import BranchInfoModal from "./BranchInfoModal";
import { getPeriod } from "../../utils/helpers";

const CalendarScheduler = ({
  onTimeSlotSelect,
  selectedDate,
  selectedTime,
  selectedLocation,
  onSlotClick,
  onBookAppointment,
  initialPhone = "",
  branches,
}) => {
  const [dayOffset, setDayOffset] = useState(0); // Start from today (offset 0)
  const MAX_DAYS_AHEAD = 10; // Maximum days to show in the future
  const [zipCode, setZipCode] = useState("");
  const [branchesData, setBranchesData] = useState(branches);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (branchesData.length > 0) {

      const weekDays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ];

      const locs = branchesData.map(branch => {
        let obj = {};
        for (let i = 0; i < branch.operationHours.length; i++) {
          const hour = branch.operationHours[i];

          if (hour.type === "open") {
            obj[weekDays.indexOf(hour.dayOfWeek)] = obj[weekDays.indexOf(hour.dayOfWeek)] ? {
              Morning: obj[weekDays.indexOf(hour.dayOfWeek)].Morning || getPeriod(hour.openTime) == "Morning",
              Afternoon: obj[weekDays.indexOf(hour.dayOfWeek)].Afternoon || getPeriod(hour.openTime) == "Afternoon",
              Evening: obj[weekDays.indexOf(hour.dayOfWeek)].Evening || getPeriod(hour.closeTime) == "Evening",
            } : {
              Morning: getPeriod(hour.openTime) == "Morning",
              Afternoon: getPeriod(hour.openTime) == "Afternoon",
              Evening: getPeriod(hour.closeTime) == "Evening",
            };
          }

        }

        return {
          id: branch.branchId,
          name: branch.branchName,
          location: branch.address1,
          phone: branch.branchPhone,
          type: "branch",
          availability: obj,
        }
      });


      setLocations(locs);
    }
  }, [branchesData]);


  // Generate dates for the next 7 days starting from dayOffset (for desktop view)
  const getDates = (offset = 0) => {
    const dates = [];
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + offset + i);
      // Format: day/month/year (DD/MM/YYYY)
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      dates.push({
        day: days[date.getDay()],
        date: `${day}/${month}/${year}`,
        fullDate: date.toISOString().split("T")[0],
        dayIndex: date.getDay(),
      });
    }
    return dates;
  };

  // Generate all dates up to MAX_DAYS_AHEAD for mobile view
  // This allows mobile users to see and select from all 10 days in the dropdown
  const getAllDatesForMobile = () => {
    const dates = [];
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    for (let i = 0; i < MAX_DAYS_AHEAD; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      // Format: day/month/year (DD/MM/YYYY)
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      dates.push({
        day: days[date.getDay()],
        date: `${day}/${month}/${year}`,
        fullDate: date.toISOString().split("T")[0],
        dayIndex: date.getDay(),
      });
    }
    return dates;
  };

  const dates = getDates(dayOffset);
  const allDatesForMobile = getAllDatesForMobile();

  // Check if we can go forward (not beyond MAX_DAYS_AHEAD)
  // We show 7 days at a time, so max offset is MAX_DAYS_AHEAD - 7
  const canGoForward = dayOffset + 7 < MAX_DAYS_AHEAD;
  // Check if we can go back (not before today)
  const canGoBack = dayOffset > 0;

  const handleViewMoreDates = () => {
    console.log("---- canGoForward ---", canGoForward);
    if (canGoForward) {
      // Advance by 7 days, but don't exceed MAX_DAYS_AHEAD - 7
      const newOffset = Math.min(dayOffset + 7, MAX_DAYS_AHEAD - 7);
      setDayOffset(newOffset);
    }
  };

  const handleViewEarlierDates = () => {
    if (canGoBack) {
      // Go back by 7 days, but don't go before today
      const newOffset = Math.max(dayOffset - 7, 0);
      setDayOffset(newOffset);
    }
  };

  const handleZipSearch = (e) => {
    e.preventDefault();
    // TODO: Implement ZIP code search functionality
    // This would update the locations based on the ZIP code
    if (zipCode && zipCode.length === 5) {
      console.log("Searching for stores near ZIP:", zipCode);
      // Here you would call findNearbyStores(zipCode) and update locations
    }
  };
  const timeSlots = ["Morning", "Afternoon", "Evening"];

  // Function to extract only digits from phone number
  const getDigitsOnly = (phone) => {
    return phone.replace(/\D/g, "");
  };

  // Function to format phone number as (XXX) XXX XXXX
  const formatPhoneNumber = (phone) => {
    const digits = getDigitsOnly(phone);
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);

    if (limitedDigits.length === 0) return "";
    if (limitedDigits.length <= 3) return `(${limitedDigits}`;
    if (limitedDigits.length <= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    }
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)} ${limitedDigits.slice(6)}`;
  };

  // Generate real time slots for branches (e.g., "4:00 PM")
  const generateBranchTimeSlots = () => {
    const slots = [];
    // Generate slots from 9:00 AM to 5:00 PM, every hour
    for (let hour = 9; hour <= 17; hour++) {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      slots.push(`${displayHour}:00 ${period}`);
    }
    return slots;
  };

  const branchTimeSlots = generateBranchTimeSlots();

  // Example location data (should come from an API)
  // const locations = [
  //   {
  //     id: "home",
  //     name: "We Come to You",
  //     location: "New Jersey",
  //     phone: "(484) 519-2538",
  //     type: "home",
  //     availability: {
  //       // Example: only available Friday and Saturday
  //       5: { Morning: true, Afternoon: true, Evening: false }, // Friday
  //       6: { Morning: true, Afternoon: true, Evening: false }, // Saturday
  //     },
  //   },
  //   {
  //     id: "union",
  //     name: "Union",
  //     distance: "8 miles",
  //     phone: "(908) 873-6460",
  //     type: "branch",
  //     availability: {
  //       1: { Morning: true, Afternoon: true, Evening: true }, // Monday
  //       2: { Morning: true, Afternoon: true, Evening: true }, // Tuesday
  //       3: { Morning: true, Afternoon: true, Evening: true }, // Wednesday
  //       4: { Morning: true, Afternoon: true, Evening: true }, // Thursday
  //       5: { Morning: true, Afternoon: true, Evening: true }, // Friday
  //       6: { Morning: true, Afternoon: true, Evening: true }, // Saturday
  //     },
  //   },
  //   {
  //     id: "plainfield",
  //     name: "Plainfield",
  //     distance: "10 miles",
  //     phone: "(908) 873-6950",
  //     type: "branch",
  //     availability: {
  //       1: { Morning: true, Afternoon: true, Evening: true },
  //       2: { Morning: true, Afternoon: true, Evening: true },
  //       3: { Morning: true, Afternoon: true, Evening: true },
  //       4: { Morning: true, Afternoon: true, Evening: true },
  //       5: { Morning: true, Afternoon: true, Evening: true },
  //       6: { Morning: true, Afternoon: true, Evening: true },
  //     },
  //   },
  // ];

  const isSlotAvailable = (locationId, dayIndex, timeSlot) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (!location) return false;
    const dayAvailability = location.availability[dayIndex.toString()];
    if (!dayAvailability) return false;
    return dayAvailability[timeSlot] === true;
  };

  const handleSlotClick = (locationId, date, timeSlot) => {
    if (!isSlotAvailable(locationId, date.dayIndex, timeSlot)) return;

    const location = locations.find((loc) => loc.id === locationId);
    const slotData = {
      locationId,
      location: location?.name || "",
      date: date.fullDate,
      dateFormatted: `${date.day} ${date.date}`,
      time: timeSlot,
      phone: location?.phone || "",
    };

    // If custom callback exists, use it (for opening modal)
    if (onSlotClick) {
      onSlotClick(slotData);
    } else if (onTimeSlotSelect) {
      // Original callback for compatibility
      onTimeSlotSelect(slotData);
    }
  };

  const [selectedLocationMobile, setSelectedLocationMobile] = useState(
    selectedLocation?.locationId || "",
  );
  const [selectedDateMobile, setSelectedDateMobile] = useState(
    selectedDate || "",
  );
  const [selectedTimeMobile, setSelectedTimeMobile] = useState(
    selectedTime || "",
  );
  const [branchType, setBranchType] = useState("branch");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [receiveSMS, setReceiveSMS] = useState(false);
  const [smsError, setSmsError] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateZip, setStateZip] = useState("NJ, 07008");
  const smsCheckboxRef = useRef(null);
  const smsCheckboxContainerRef = useRef(null);
  const smsCheckboxBranchRef = useRef(null);
  const smsCheckboxBranchContainerRef = useRef(null);
  const [selectedBranchForInfo, setSelectedBranchForInfo] = useState(null);

  // Sync states when props change
  useEffect(() => {
    if (selectedLocation?.locationId) {
      setSelectedLocationMobile(selectedLocation.locationId);
      // Set branch type based on selected location
      const location = locations.find(
        (loc) => loc.id === selectedLocation.locationId,
      );
      if (location) {
        setBranchType(location.type);
      }
    }
    if (selectedDate) {
      setSelectedDateMobile(selectedDate);
    }
    if (selectedTime) {
      setSelectedTimeMobile(selectedTime);
    }
  }, [selectedLocation?.locationId, selectedDate, selectedTime]);

  // Sync telephone from initialPhone prop
  useEffect(() => {
    if (initialPhone) {
      // If phone is already formatted, use it as is
      if (initialPhone.includes("(")) {
        setTelephone(initialPhone);
      } else {
        // Otherwise, format it
        const formatted = formatPhoneNumber(initialPhone);
        setTelephone(formatted);
      }
    }
  }, [initialPhone]);

  // Get available time slots for selected date
  const getAvailableTimesForDate = (locationId, dateFullDate) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (!location || !dateFullDate) return [];

    const selectedDateObj = dates.find((d) => d.fullDate === dateFullDate);
    if (!selectedDateObj) return [];

    return timeSlots.filter((timeSlot) =>
      isSlotAvailable(locationId, selectedDateObj.dayIndex, timeSlot),
    );
  };

  // Handle mobile changes
  const handleBranchTypeChange = (e) => {
    const newType = e.target.value;
    setBranchType(newType);

    // Clear selections if current location doesn't match new type
    if (selectedLocationMobile) {
      const currentLocation = locations.find(
        (loc) => loc.id === selectedLocationMobile,
      );
      if (currentLocation && currentLocation.type !== newType) {
        // If switching to home, auto-select home location if available
        if (newType === "home") {
          const homeLocation = locations.find((loc) => loc.type === "home");
          if (homeLocation) {
            setSelectedLocationMobile(homeLocation.id);
          } else {
            setSelectedLocationMobile("");
          }
        } else {
          setSelectedLocationMobile("");
        }
        setSelectedDateMobile("");
        setSelectedTimeMobile("");
      }
    } else {
      // If no location selected, auto-select based on type
      if (newType === "home") {
        const homeLocation = locations.find((loc) => loc.type === "home");
        if (homeLocation) {
          setSelectedLocationMobile(homeLocation.id);
        }
      }
      setSelectedDateMobile("");
      setSelectedTimeMobile("");
    }
  };

  const handleMobileLocationChange = (e) => {
    const locationId = e.target.value;
    setSelectedLocationMobile(locationId);
    setSelectedDateMobile("");
    setSelectedTimeMobile("");
  };

  // Filter locations based on branch type
  const filteredLocations = locations.filter(
    (loc) => loc.type === branchType,
  );

  const handleMobileDateChange = (e) => {
    const dateFullDate = e.target.value;
    setSelectedDateMobile(dateFullDate);
    setSelectedTimeMobile("");
  };

  const handleMobileTimeChange = (e) => {
    const timeSlot = e.target.value;
    setSelectedTimeMobile(timeSlot);

    // In mobile, we don't open the modal for either branch or home appointments
    // The contact form is shown inline for both cases
    // Desktop will handle clicks through the calendar view
    // Removed handleSlotClick call to prevent modal from opening in mobile
  };

  return (
    <div
      className="space-y-0 md:space-y-2 w-full"
      style={{ maxWidth: "100%", boxSizing: "border-box" }}
    >
      <div className="text-center mb-4 hidden md:block">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          When Would You Like to Sell Your Car?
        </h3>
        <p className="text-lg text-gray-600">
          Book a Home Visit or Bring Your Car to Us!
        </p>
      </div>

      {/* Mobile View - Selects */}
      <div className="md:hidden space-y-2 w-full" style={{ marginTop: 0 }}>
        {/* Step Header */}
        <div id="choose-where-to-sell-header" className="step-header">
          <span className="form-text countable" data-defaulttext="Choose Where to Sell">
            1. Choose Where to Sell
          </span>
        </div>

        {/* Branch Type Toggle */}
        <div id="mobile-branch-toggle" data-default-type="branch" className="mb-2">
          <label
            className={`toggle-button ${branchType === "branch" ? "is-active" : ""}`}
          >
            <input
              type="radio"
              name="branchType"
              value="branch"
              id="physical-toggle"
              className="toggle-radio"
              checked={branchType === "branch"}
              onChange={handleBranchTypeChange}
              hidden
              data-gtm-form-interact-field-id="2"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="w-5 h-5"
            >
              <path d="M500 176h-59.9l-16.6-41.6C406.4 91.6 365.6 64 319.5 64h-127c-46.1 0-86.9 27.6-104 70.4L71.9 176H12C4.2 176-1.5 183.3 .4 190.9l6 24C7.7 220.3 12.5 224 18 224h20.1C24.7 235.7 16 252.8 16 272v48c0 16.1 6.2 30.7 16 41.9V416c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32v-32h256v32c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32v-54.1c9.8-11.3 16-25.8 16-41.9v-48c0-19.2-8.7-36.3-22.1-48H494c5.5 0 10.3-3.8 11.6-9.1l6-24c1.9-7.6-3.8-14.9-11.7-14.9zm-352.1-17.8c7.3-18.2 24.9-30.2 44.6-30.2h127c19.6 0 37.3 12 44.6 30.2L384 208H128l19.9-49.8zM96 319.8c-19.2 0-32-12.8-32-31.9S76.8 256 96 256s48 28.7 48 47.9-28.8 16-48 16zm320 0c-19.2 0-48 3.2-48-16S396.8 256 416 256s32 12.8 32 31.9-12.8 31.9-32 31.9z"></path>
            </svg>
            <span>You Come to Us</span>
          </label>

          <label
            className={`toggle-button ${branchType === "home" ? "is-active" : ""}`}
          >
            <input
              type="radio"
              name="branchType"
              value="home"
              id="mobile-toggle"
              className="toggle-radio"
              checked={branchType === "home"}
              onChange={handleBranchTypeChange}
              hidden
              data-gtm-form-interact-field-id="1"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
              className="w-5 h-5"
            >
              <path d="M280.4 148.3L96 300.1V464a16 16 0 0 0 16 16l112.1-.3a16 16 0 0 0 15.9-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.6a16 16 0 0 0 16 16.1L464 480a16 16 0 0 0 16-16V300L295.7 148.3a12.2 12.2 0 0 0 -15.3 0zM571.6 251.5L488 182.6V44.1a12 12 0 0 0 -12-12h-56a12 12 0 0 0 -12 12v72.6L318.5 43a48 48 0 0 0 -61 0L4.3 251.5a12 12 0 0 0 -1.6 16.9l25.5 31A12 12 0 0 0 45.2 301l235.2-193.7a12.2 12.2 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0 -1.7-16.9z"></path>
            </svg>
            <span>We Come to You</span>
          </label>
        </div>

        {/* Branch Type: Branch - Show new selects */}
        {branchType === "branch" ? (
          <>
            {/* Branch Select */}
            <div className="select-container" style={{ display: "block" }}>
              <select
                autoComplete="off"
                className="countable w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                data-defaulttext="Select Branch (126 Locations)"
                data-val="true"
                data-val-number="The field SelectedBranchId must be a number."
                data-val-required="The SelectedBranchId field is required."
                id="SelectedBranchId"
                name="SelectedBranchId"
                style={{ display: "inline-block", maxWidth: "100%", boxSizing: "border-box" }}
                value={selectedLocationMobile}
                onChange={handleMobileLocationChange}
              >
                <option value="">2. Select Branch (126 Locations)</option>
                {filteredLocations
                  .filter((loc) => loc.type === "branch")
                  .map((location, index) => (
                    <option
                      key={location.id + "-" + index}
                      value={location.id}
                      data-booking-requires-otp="true"
                    >
                      {location.name}
                      {location.location && ` ${location.location}`}
                      {location.distance && ` ${location.distance}`}
                    </option>
                  ))}
                <option value="0" data-booking-requires-otp="undefined">
                  More Locations...
                </option>
              </select>
            </div>

            {/* Date Select */}
            <div className="select-container">
              <select
                className="countable w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                data-datapath="/secure/availabledateslotsbybranch?delaydays=0"
                data-defaulttext="Select Date"
                data-val="true"
                data-val-date="The field AvailableDate must be a date."
                data-val-required="The AvailableDate field is required."
                id="AvailableDate"
                name="AvailableDate"
                disabled={!selectedLocationMobile}
                value={selectedDateMobile}
                onChange={handleMobileDateChange}
                style={{ maxWidth: "100%", boxSizing: "border-box" }}
              >
                <option value="">3. Select Date</option>
                {selectedLocationMobile &&
                  allDatesForMobile.map((date, index) => (
                    <option key={date.fullDate + "-" + index} value={date.fullDate}>
                      {date.day} {date.date}
                    </option>
                  ))}
              </select>
            </div>

            {/* Time Select */}
            <select
              className="countable w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              data-datapath="/secure/availablesitetimeslotsbydate"
              data-defaulttext="Select Time"
              data-val="true"
              data-val-required="Please select a time."
              disabled={!selectedDateMobile || !selectedLocationMobile}
              id="AvailableTime"
              name="AvailableTime"
              value={selectedTimeMobile}
              onChange={handleMobileTimeChange}
              style={{ maxWidth: "100%", boxSizing: "border-box" }}
            >
              <option value="">4. Select Time</option>
              {selectedLocationMobile &&
                selectedDateMobile &&
                branchTimeSlots.map((timeSlot, index) => (
                  <option key={timeSlot + "-" + index} value={timeSlot}>
                    {timeSlot}
                  </option>
                ))}
            </select>

            {/* Step 5: Confirm Contact Info - Always visible */}
            <div id="confirm-contact-info-header" className="step-header mt-2">
              <span className="form-text countable" data-defaulttext="Confirm Contact Info">
                5. Confirm Contact Info
              </span>
            </div>

            <div className="space-y-2">
              <div className="w-full">
                <label className="label hidden md:block" htmlFor="appointment-modal-first-name-input">
                  First Name
                </label>
                <div className="relative group">
                  <input
                    className="input-field"
                    placeholder="Enter First Name"
                    id="appointment-modal-first-name-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 group-focus-within:opacity-100 animate-shimmer"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.1), transparent) 0% 0% / 200% 100%",
                    }}
                  ></div>
                </div>
              </div>

              <div className="w-full">
                <label className="label hidden md:block" htmlFor="appointment-modal-last-name-input">
                  Last Name
                </label>
                <div className="relative group">
                  <input
                    className="input-field"
                    placeholder="Enter Last Name"
                    id="appointment-modal-last-name-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 group-focus-within:opacity-100 animate-shimmer"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.1), transparent) 0% 0% / 200% 100%",
                    }}
                  ></div>
                </div>
              </div>

              <div className="w-full">
                <label className="label hidden md:block" htmlFor="appointment-modal-telephone-input">
                  Telephone
                </label>
                <div className="relative group">
                  <input
                    className="input-field"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter Telephone Number"
                    id="appointment-modal-telephone-input"
                    value={telephone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setTelephone(formatted);
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 group-focus-within:opacity-100 animate-shimmer"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.1), transparent) 0% 0% / 200% 100%",
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-1" ref={smsCheckboxBranchContainerRef}>
                <input
                  type="checkbox"
                  id="appointment-modal-receive-sms-checkbox"
                  ref={smsCheckboxBranchRef}
                  className={`mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 ${smsError ? "border-red-500 border-2 ring-2 ring-red-300 shadow-lg" : ""
                    }`}
                  style={smsError ? {
                    borderColor: "#ef4444",
                    borderWidth: "2px",
                    boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  } : {}}
                  checked={receiveSMS}
                  onChange={(e) => {
                    setReceiveSMS(e.target.checked);
                    if (e.target.checked) {
                      setSmsError("");
                    }
                  }}
                />
                <label
                  htmlFor="appointment-modal-receive-sms-checkbox"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Receive text (SMS) messages about this appointment**
                </label>
              </div>
              {smsError && (
                <span className="text-red-600 text-sm block mt-2">
                  {smsError}
                </span>
              )}

              {/* Book Appointment Button */}
              <div className="pt-0 md:pt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Validate SMS opt-in is required
                    if (!receiveSMS) {
                      setSmsError("You must receive a verification code by text (SMS) message to complete your appointment booking online. If you prefer not to receive the code by SMS, please call (484) 519-2538 to schedule your appointment.");
                      // Focus and scroll to the checkbox when error is shown
                      setTimeout(() => {
                        // First, scroll the container into view
                        if (smsCheckboxBranchContainerRef.current) {
                          smsCheckboxBranchContainerRef.current.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                          });
                        }
                        // Then try to focus the checkbox
                        if (smsCheckboxBranchRef.current) {
                          // Try to focus the checkbox directly
                          smsCheckboxBranchRef.current.focus();
                          // If checkbox doesn't receive focus, try the label
                          setTimeout(() => {
                            if (document.activeElement !== smsCheckboxBranchRef.current) {
                              const label = document.querySelector('label[for="appointment-modal-receive-sms-checkbox"]');
                              if (label) {
                                label.setAttribute('tabIndex', '-1');
                                label.focus();
                              }
                            }
                          }, 50);
                        }
                      }, 150);
                      return;
                    }

                    if (onBookAppointment) {
                      const location = locations.find(
                        (loc) => loc.id === selectedLocationMobile,
                      );
                      onBookAppointment({
                        locationId: selectedLocationMobile,
                        location: location?.name || "",
                        phone: location?.phone || "",
                        date: selectedDateMobile,
                        time: selectedTimeMobile,
                        firstName,
                        lastName,
                        telephone,
                        receiveSMS,
                      });
                    }
                  }}
                  disabled={!firstName || !lastName || !telephone || !selectedTimeMobile}
                  className="w-full bg-black text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase"
                  id="mobile-book-appointment-button"
                >
                  BOOK APPOINTMENT
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Branch Type: Home - Show only Date and Time selects */}
            {/* Date Select */}
            <div className="select-container">
              <select
                className="countable w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                data-defaulttext="Select Date"
                data-val="true"
                data-val-date="The field AvailableDate must be a date."
                data-val-required="The AvailableDate field is required."
                id="AvailableDate"
                name="AvailableDate"
                value={selectedDateMobile}
                onChange={handleMobileDateChange}
                style={{ maxWidth: "100%", boxSizing: "border-box" }}
              >
                <option value="">Select Date</option>
                {allDatesForMobile.map((date, index) => (
                  <option key={date.fullDate + "-" + index} value={date.fullDate}>
                    {date.day} {date.date}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Select */}
            <select
              className="countable w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              data-defaulttext="Select Time"
              data-val="true"
              data-val-required="Please select a time."
              disabled={!selectedDateMobile || !selectedLocationMobile}
              id="AvailableTime"
              name="AvailableTime"
              value={selectedTimeMobile}
              onChange={handleMobileTimeChange}
              style={{ maxWidth: "100%", boxSizing: "border-box" }}
            >
              <option value="">Select Time</option>
              {selectedLocationMobile &&
                selectedDateMobile &&
                getAvailableTimesForDate(
                  selectedLocationMobile,
                  selectedDateMobile,
                ).map((timeSlot, index) => (
                  <option key={timeSlot + "-" + index} value={timeSlot}>
                    {timeSlot}
                  </option>
                ))}
            </select>

            {/* Step 4: Confirm Contact Info - Always visible for Home (no branch selection) */}
            <div id="confirm-contact-info-header" className="step-header mt-6">
              <span className="form-text countable" data-defaulttext="Confirm Contact Info">
                4. Confirm Contact Info
              </span>
            </div>

            <div className="space-y-5">
              <div className="w-full">
                <label className="label hidden md:block" htmlFor="appointment-modal-first-name-input">
                  First Name
                </label>
                <div className="relative group">
                  <input
                    className="input-field"
                    placeholder="Enter First Name"
                    id="appointment-modal-first-name-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 group-focus-within:opacity-100 animate-shimmer"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.1), transparent) 0% 0% / 200% 100%",
                    }}
                  ></div>
                </div>
              </div>

              <div className="w-full">
                <label className="label hidden md:block" htmlFor="appointment-modal-last-name-input">
                  Last Name
                </label>
                <div className="relative group">
                  <input
                    className="input-field"
                    placeholder="Enter Last Name"
                    id="appointment-modal-last-name-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 group-focus-within:opacity-100 animate-shimmer"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.1), transparent) 0% 0% / 200% 100%",
                    }}
                  ></div>
                </div>
              </div>

              <div className="w-full">
                <label className="label hidden md:block" htmlFor="appointment-modal-telephone-input">
                  Telephone
                </label>
                <div className="relative group">
                  <input
                    className="input-field"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter Telephone Number"
                    id="appointment-modal-telephone-input"
                    value={telephone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setTelephone(formatted);
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 group-focus-within:opacity-100 animate-shimmer"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.1), transparent) 0% 0% / 200% 100%",
                    }}
                  ></div>
                </div>
              </div>

              {/* Address Fields for Home appointments */}
              <div className="w-full">
                <input
                  className="textbox mobile-address input-field"
                  data-val="true"
                  data-val-required="Address is required."
                  id="Address1"
                  maxLength={50}
                  name="Address1"
                  placeholder="Address Line 1"
                  type="text"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  style={{ display: "inline-block", width: "100%" }}
                />
              </div>

              <div className="w-full">
                <input
                  className="textbox mobile-address input-field"
                  id="Address2"
                  maxLength={50}
                  name="Address2"
                  placeholder="Address Line 2 (Optional)"
                  type="text"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  style={{ display: "inline-block", width: "100%" }}
                />
              </div>

              <div className="city-state-zip-container flex gap-2">
                <div className="flex-1">
                  <input
                    className="textbox mobile-address input-field"
                    data-val="true"
                    data-val-required="City is required."
                    id="City"
                    maxLength={50}
                    name="City"
                    placeholder="City"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ display: "inline-block", width: "100%" }}
                  />
                </div>
                <div className="flex-1">
                  <input
                    id="state-zip"
                    type="text"
                    value={stateZip}
                    className="textbox mobile-address input-field"
                    readOnly
                    tabIndex={-1}
                    style={{ display: "inline-block", width: "100%", backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2" ref={smsCheckboxContainerRef}>
                <input
                  type="checkbox"
                  id="appointment-modal-receive-sms-checkbox-home"
                  ref={smsCheckboxRef}
                  className={`mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 ${smsError ? "border-red-500 border-2 ring-2 ring-red-300 shadow-lg" : ""
                    }`}
                  style={smsError ? {
                    borderColor: "#ef4444",
                    borderWidth: "2px",
                    boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  } : {}}
                  checked={receiveSMS}
                  onChange={(e) => {
                    setReceiveSMS(e.target.checked);
                    if (e.target.checked) {
                      setSmsError("");
                    }
                  }}
                />
                <label
                  htmlFor="appointment-modal-receive-sms-checkbox-home"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Receive text (SMS) messages about this appointment**
                </label>
              </div>
              {smsError && (
                <span className="text-red-600 text-sm block mt-2">
                  {smsError}
                </span>
              )}

              {/* Book Appointment Button for Home */}
              <div className="pt-0 md:pt-4">
                <button
                  type="button"
                  onClick={() => {
                    // Validate SMS opt-in is required
                    if (!receiveSMS) {
                      setSmsError("You must receive a verification code by text (SMS) message to complete your appointment booking online. If you prefer not to receive the code by SMS, please call (484) 519-2538 to schedule your appointment.");
                      // Focus and scroll to the checkbox when error is shown
                      setTimeout(() => {
                        // First, scroll the container into view
                        if (smsCheckboxContainerRef.current) {
                          smsCheckboxContainerRef.current.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                          });
                        }
                        // Then try to focus the checkbox
                        if (smsCheckboxRef.current) {
                          // Try to focus the checkbox directly
                          smsCheckboxRef.current.focus();
                          // If checkbox doesn't receive focus, try the label
                          setTimeout(() => {
                            if (document.activeElement !== smsCheckboxRef.current) {
                              const label = document.querySelector('label[for="appointment-modal-receive-sms-checkbox-home"]');
                              if (label) {
                                label.setAttribute('tabIndex', '-1');
                                label.focus();
                              }
                            }
                          }, 50);
                        }
                      }, 150);
                      return;
                    }

                    if (onBookAppointment) {
                      const location = locations.find(
                        (loc) => loc.id === selectedLocationMobile,
                      );
                      onBookAppointment({
                        locationId: selectedLocationMobile,
                        location: location?.name || "",
                        phone: location?.phone || "",
                        date: selectedDateMobile,
                        time: selectedTimeMobile,
                        firstName,
                        lastName,
                        telephone,
                        receiveSMS,
                        address1,
                        address2,
                        city,
                        stateZip,
                      });
                    }
                  }}
                  disabled={!firstName || !lastName || !telephone || !selectedTimeMobile || !address1 || !city}
                  className="w-full bg-black text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase"
                  id="mobile-home-book-appointment-button"
                >
                  BOOK APPOINTMENT
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop View - Calendar */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full" style={{ minWidth: "900px" }}>
          {/* Header Row */}
          <AnimatePresence mode="wait">
            <motion.div
              key={dayOffset}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="grid gap-2 mb-4 rounded-2xl p-4"
              style={{
                gridTemplateColumns: "200px repeat(7, 1fr)",
                background: "linear-gradient(135deg, #20B24D 0%, #1a9a3e 100%)",
                boxShadow: "0 8px 24px 0 rgba(8, 162, 70, 0.3)",
              }}
            >
              <div className="font-bold text-white text-lg flex items-center">
                Branches
              </div>
              {dates.map((date, idx) => (
                <motion.div
                  key={`${dayOffset}-${idx}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="text-center"
                >
                  <div className="text-white font-bold text-sm md:text-base">
                    {date.day}
                  </div>
                  <div className="text-white/90 text-xs md:text-sm">
                    {date.date}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Location Rows */}
          <AnimatePresence mode="wait">
            {locations.map((location, locIdx) => (
              <motion.div
                key={`${location.id}-${dayOffset}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{
                  delay: locIdx * 0.1,
                  duration: 0.4,
                  ease: "easeInOut",
                }}
                className="mb-4"
              >
                <div
                  className="grid gap-2 rounded-xl p-4 transition-all duration-300"
                  style={{
                    gridTemplateColumns: "200px repeat(7, 1fr)",
                    background:
                      selectedLocation?.locationId === location.id
                        ? "rgba(8, 162, 70, 0.1)"
                        : "rgba(255, 255, 255, 0.8)",
                    border:
                      selectedLocation?.locationId === location.id
                        ? "2px solid rgba(8, 162, 70, 0.5)"
                        : "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow:
                      selectedLocation?.locationId === location.id
                        ? "0 8px 24px 0 rgba(8, 162, 70, 0.2)"
                        : "0 2px 8px 0 rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {/* Location Info */}
                  <div className="pr-4">
                    <div className="flex items-start gap-2 mb-2">
                      {location.type === "home" ? (
                        <Home className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-gray-900 text-sm md:text-base">
                          {location.type === "home"
                            ? location.name
                            : location.name}
                          {location.location && ` ${location.location}`}
                          {location.distance && ` ${location.distance}`}
                        </div>
                        <a
                          href={`tel:${location.phone}`}
                          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-1"
                        >
                          <Phone className="w-3 h-3" />
                          {location.phone}
                        </a>
                        {location.type === "branch" && (
                          <button
                            onClick={() => setSelectedBranchForInfo(location)}
                            className="text-xs text-gray-500 hover:text-gray-700 mt-1 underline"
                            id={`branch-info-${location.id}-button`}
                          >
                            Click for branch info
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Time Slots for each day */}
                  {dates.map((date, dateIdx) => (
                    <motion.div
                      key={`${dayOffset}-${dateIdx}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: locIdx * 0.1 + dateIdx * 0.05,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="space-y-1.5"
                    >
                      {timeSlots.map((timeSlot) => {
                        const available = isSlotAvailable(
                          location.id,
                          date.dayIndex,
                          timeSlot,
                        );
                        const isSelected =
                          selectedLocation?.locationId === location.id &&
                          selectedLocation?.date === date.fullDate &&
                          selectedLocation?.time === timeSlot;

                        return (
                          <motion.button
                            key={timeSlot}
                            onClick={() =>
                              available &&
                              handleSlotClick(location.id, date, timeSlot)
                            }
                            disabled={!available}
                            whileHover={available ? { scale: 1.05 } : {}}
                            whileTap={available ? { scale: 0.95 } : {}}
                            className={`w-full py-2 px-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${isSelected
                              ? "bg-primary-600 text-white shadow-lg scale-105"
                              : available
                                ? "bg-gray-100 text-primary-700 hover:bg-primary-50 hover:scale-105"
                                : "bg-gray-50 text-gray-400 cursor-not-allowed"
                              }`}
                            id={`desktop-time-slot-${location.id}-${date.fullDate}-${timeSlot.replace(/\s+/g, "-").toLowerCase()}-button`}
                          >
                            {timeSlot}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Footer - Desktop Only */}
      <div className="hidden md:block">
        <div
          className="flex items-center justify-between gap-4 rounded-2xl p-4 mt-6"
          style={{
            background: "linear-gradient(135deg, #20B24D 0%, #1a9a3e 100%)",
            boxShadow: "0 8px 24px 0 rgba(8, 162, 70, 0.3)",
          }}
        >
          {/* View Earlier Dates Button */}
          <motion.button
            onClick={handleViewEarlierDates}
            disabled={!canGoBack}
            whileHover={canGoBack ? { scale: 1.05, x: -5 } : {}}
            whileTap={canGoBack ? { scale: 0.95 } : {}}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${canGoBack
              ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
            id="view-earlier-dates-button"
          >
            <ChevronLeft className="w-5 h-5" />
            View Earlier Dates
          </motion.button>

          {/* Center Section - Search by ZIP */}
          <form
            onSubmit={handleZipSearch}
            className="flex flex-col md:flex-row items-center gap-4 md:gap-3 w-full flex-1"
          >
            <span className="text-white font-medium text-base md:text-lg whitespace-nowrap w-full md:w-auto text-center md:text-left">
              Looking for a different branch?
            </span>
            <div className="flex flex-1 w-full md:w-auto gap-3">
              <input
                type="text"
                placeholder="Enter ZIP Code"
                maxLength={5}
                pattern="[0-9]{5}"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ""))}
                className="flex-1 px-4 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all min-w-0"
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
                id="zip-code-search-input"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                id="zip-code-search-button"
              >
                Search by ZIP
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* View More Dates Button */}
          <motion.button
            onClick={handleViewMoreDates}
            disabled={!canGoForward}
            whileHover={canGoForward ? { scale: 1.05, x: 5 } : {}}
            whileTap={canGoForward ? { scale: 0.95 } : {}}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${canGoForward
              ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
            style={{
              outline: canGoForward
                ? "3px solid rgba(239, 68, 68, 0.5)"
                : "none",
              outlineOffset: canGoForward ? "2px" : "0",
            }}
            id="view-more-dates-button"
          >
            View More Dates
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Branch Info Modal */}
      <BranchInfoModal
        isOpen={!!selectedBranchForInfo}
        onClose={() => setSelectedBranchForInfo(null)}
        branch={selectedBranchForInfo}
      />
    </div>
  );
};

export default CalendarScheduler;
