// ChangeAppointment component for displaying appointment change options
import { memo } from "react";
import { ArrowRight } from "lucide-react";
import Button from "../UI/Button";

const ChangeAppointment = ({
  imageUrl,
  text,
  vehicleInfo,
  onButton1Click,
  onButton2Click,
  button1Label = "CHANGE APPOINTMENT",
  button2Label = "NEW VALUATION *",
}) => {
  return (
    <section className="py-8 md:py-12">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          {/* Image */}
          {imageUrl && (
            <div className="mb-6 md:mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center mx-auto" style={{ maxWidth: "400px" }}>
              <img
                src={imageUrl}
                alt="Vehicle"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {/* Vehicle Valuation Info */}
          {vehicleInfo && (
            <div className="mb-6 md:mb-8 text-center">
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-relaxed">
                Your {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model} was valued on {vehicleInfo.valuationDate} at {vehicleInfo.valuationAmount}*
              </p>
            </div>
          )}

          {/* Appointment Text */}
          {text && (
            <div className="mb-6 md:mb-8 text-center">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                {text}
              </p>
            </div>
          )}

          {/* Question */}
          <div className="mb-6 md:mb-8 text-center">
            <p className="text-lg md:text-xl font-bold text-gray-900">
              What Would You Like to Do Now?
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
            {onButton1Click && (
              <Button
                size="lg"
                onClick={onButton1Click}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full sm:w-auto px-6 py-3 text-base font-bold"
                style={{
                  background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                  color: "#FFFFFF",
                  borderColor: "#000000",
                }}
              >
                {button1Label}
              </Button>
            )}
            {onButton2Click && (
              <Button
                size="lg"
                onClick={onButton2Click}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full sm:w-auto px-6 py-3 text-base font-bold"
                style={{
                  background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                  color: "#FFFFFF",
                  borderColor: "#000000",
                }}
              >
                {button2Label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(ChangeAppointment);

