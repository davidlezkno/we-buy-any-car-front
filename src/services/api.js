import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.example.com";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// VIN Decoder API
export const decodeVIN = async (vin) => {
  try {
    // Using NHTSA's free VIN decoder API
    const response = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`,
    );

    const data = response.data.Results[0];

    if (data.ErrorCode !== "0") {
      throw new Error("Invalid VIN number");
    }

    return {
      vin,
      make: data.Make,
      model: data.Model,
      year: data.ModelYear,
      trim: data.Trim,
      bodyClass: data.BodyClass,
      engineSize: data.DisplacementL,
      fuelType: data.FuelTypePrimary,
      transmission: data.TransmissionStyle,
      driveType: data.DriveType,
      vehicleType: data.VehicleType,
      manufacturer: data.Manufacturer,
    };
  } catch (error) {
    console.error("VIN decode error:", error);
    throw new Error(
      "Failed to decode VIN. Please check the number and try again.",
    );
  }
};

// License Plate Lookup
export const decodeLicensePlate = async (plate, state) => {
  try {
    // This would use a real license plate API service
    // For demo purposes, returning mock data
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay

    // Mock response
    return {
      plate,
      state,
      make: "Toyota",
      model: "Camry",
      year: "2020",
      vin: "MOCK1234567890VIN",
      color: "Silver",
      registrationStatus: "Active",
    };
  } catch (error) {
    console.error("License plate lookup error:", error);
    throw new Error(
      "Failed to lookup license plate. Please verify the information.",
    );
  }
};

// Get vehicle makes (popular US brands)
export const getVehicleMakes = async () => {
  return [
    "Toyota",
    "Ford",
    "Honda",
    "Chevrolet",
    "Nissan",
    "Tesla",
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Volkswagen",
    "Hyundai",
    "Kia",
    "Mazda",
    "Subaru",
    "Jeep",
    "Ram",
    "GMC",
    "Lexus",
    "Acura",
    "Infiniti",
    "Dodge",
    "Cadillac",
    "Buick",
    "Lincoln",
    "Volvo",
    "Porsche",
    "Land Rover",
    "Jaguar",
    "Genesis",
  ].sort();
};

// Get models by make
export const getModelsByMake = async (make) => {
  try {
    // Using NHTSA API to get real models
    const response = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${make}?format=json`,
    );

    const models = response.data.Results.map((item) => item.Model_Name);
    return [...new Set(models)].sort();
  } catch (error) {
    console.error("Get models error:", error);
    return [];
  }
};

// Get years (last 30 years)
export const getVehicleYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 30; i--) {
    years.push(i.toString());
  }
  return years;
};

// Get vehicle image
export const getVehicleImage = async (make, _model, _year) => {
  // Get base path
  const basePath = import.meta.env.BASE_URL || "/";

  // Map of vehicle makes to local test images
  const vehicleImageMap = {
    toyota: `${basePath}vehicles/toyota-camry.jpg`,
    honda: `${basePath}vehicles/honda-civic.jpg`,
    ford: `${basePath}vehicles/ford-f150.jpg`,
    bmw: `${basePath}vehicles/bmw-sedan.jpg`,
    chevrolet: `${basePath}vehicles/chevrolet-suv.jpg`,
    tesla: `${basePath}vehicles/tesla-model3.jpg`,
    nissan: `${basePath}vehicles/nissan-altima.jpg`,
  };

  // Get image by make (case insensitive)
  const makeLower = make?.toLowerCase() || "";
  const imageUrl =
    vehicleImageMap[makeLower] || `${basePath}vehicles/default-car.jpg`;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return imageUrl;
};

// Get vehicle valuation based on collected information
export const getVehicleValuation = async (vehicleData, _userInfo) => {
  try {
    // This would call your backend API to get real valuation
    // For now, we'll calculate a realistic estimate based on vehicle data

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Base value calculation
    const year = parseInt(vehicleData.year) || 2020;
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    // Base values by year (example)
    const baseValues = {
      2024: 40000,
      2023: 35000,
      2022: 30000,
      2021: 25000,
      2020: 20000,
      2019: 18000,
      2018: 16000,
      2017: 14000,
      2016: 12000,
      2015: 10000,
    };

    let baseValue = baseValues[year] || Math.max(5000, 40000 - age * 2500);

    // Adjust for mileage
    const mileage = parseInt(
      vehicleData.odometer || vehicleData.mileage || 50000,
    );
    if (mileage < 30000) {
      baseValue *= 1.15;
    } else if (mileage < 50000) {
      baseValue *= 1.05;
    } else if (mileage > 100000) {
      baseValue *= 0.75;
    } else if (mileage > 150000) {
      baseValue *= 0.6;
    }

    // Adjust for condition
    if (vehicleData.runsAndDrives === "No") {
      baseValue *= 0.5;
    }
    if (vehicleData.hasIssues === "Yes") {
      baseValue *= 0.85;
    }
    if (vehicleData.hasAccident === "Yes") {
      baseValue *= 0.8;
    }
    if (vehicleData.hasClearTitle === "No") {
      baseValue *= 0.7;
    }

    // Make/model adjustments (example premiums)
    const premiumMakes = [
      "Tesla",
      "BMW",
      "Mercedes-Benz",
      "Audi",
      "Porsche",
      "Lexus",
    ];
    if (premiumMakes.includes(vehicleData.make)) {
      baseValue *= 1.2;
    }

    // Add small variance for realism
    const variance = (Math.random() - 0.5) * 0.1; // ±5%
    const finalValue = Math.round(baseValue * (1 + variance));

    return {
      success: true,
      valuation: finalValue,
      currency: "USD",
      formattedValue: `$${finalValue.toLocaleString()}`,
      timestamp: new Date().toISOString(),
      vehicleInfo: {
        year: vehicleData.year,
        make: vehicleData.make,
        model: vehicleData.model,
        mileage: mileage,
        condition: {
          runsAndDrives: vehicleData.runsAndDrives,
          hasIssues: vehicleData.hasIssues,
          hasAccident: vehicleData.hasAccident,
          hasClearTitle: vehicleData.hasClearTitle,
        },
      },
    };
  } catch (error) {
    console.error("Get valuation error:", error);
    // Return a default value on error
    return {
      success: false,
      valuation: 10000,
      currency: "USD",
      formattedValue: "$10,000",
      error: error.message,
    };
  }
};

// Submit vehicle for offer
export const submitVehicleOffer = async (
  vehicleData,
  userInfo,
  appointmentInfo,
) => {
  try {
    // This would submit to your backend API
    const response = await apiClient.post("/api/offers", {
      vehicle: vehicleData,
      user: userInfo,
      appointment: appointmentInfo,
      timestamp: new Date().toISOString(),
    });

    return response.data;
  } catch (error) {
    console.error("Submit offer error:", error);
    // For demo, return mock success
    return {
      success: true,
      offerId: "OFFER-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      estimatedValue: Math.floor(Math.random() * 30000) + 5000,
    };
  }
};

// Find nearby stores
export const findNearbyStores = async (_zipCode) => {
  try {
    // Mock store data
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
      {
        id: 1,
        name: "We Buy Any Car - Downtown",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        phone: "(555) 123-4567",
        hours: "Mon-Sat: 9AM-7PM, Sun: 10AM-5PM",
        distance: "2.3 miles",
        rating: 4.8,
        coordinates: { lat: 40.7128, lng: -74.006 },
      },
      {
        id: 2,
        name: "We Buy Any Car - Midtown",
        address: "456 Park Avenue",
        city: "New York",
        state: "NY",
        zipCode: "10022",
        phone: "(555) 234-5678",
        hours: "Mon-Sat: 9AM-7PM, Sun: 10AM-5PM",
        distance: "3.7 miles",
        rating: 4.7,
        coordinates: { lat: 40.7589, lng: -73.9851 },
      },
      {
        id: 3,
        name: "We Buy Any Car - Brooklyn",
        address: "789 Atlantic Avenue",
        city: "Brooklyn",
        state: "NY",
        zipCode: "11238",
        phone: "(555) 345-6789",
        hours: "Mon-Sat: 9AM-7PM, Sun: 10AM-5PM",
        distance: "5.1 miles",
        rating: 4.9,
        coordinates: { lat: 40.6782, lng: -73.9442 },
      },
    ];
  } catch (error) {
    console.error("Find stores error:", error);
    return [];
  }
};

// Get component list (for damage selection)
// Options are the same regardless of zone
export const getComponentList = async (_zoneId) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Static options based on provided HTML
    return [
      { value: "9", label: "Bumper" },
      { value: "103", label: "Bumper - Metal" },
      { value: "23", label: "Grille" },
      { value: "4", label: "Hood" },
      { value: "28", label: "Lights" },
      { value: "60", label: "Windshield" },
    ];
  } catch (error) {
    console.error("Get component list error:", error);
    return [];
  }
};

// Get fault type list (for damage type selection)
// Options are the same regardless of component
export const getFaultTypeList = async (_componentId) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Static options based on provided HTML
    return [
      { value: "17", label: "Dent" },
      { value: "68", label: "Dent - Large" },
      { value: "36", label: "Rust" },
    ];
  } catch (error) {
    console.error("Get fault type list error:", error);
    return [];
  }
};

export default apiClient;
