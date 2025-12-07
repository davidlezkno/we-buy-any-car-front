/**
 * NonDrivableVehicleInfo - Information for vehicles that don't run
 * Implements Single Responsibility Principle (SRP)
 */

/**
 * Non-drivable vehicle information component
 * @param {Object} props - Component props
 * @param {Function} props.onRestart - Handler to restart valuation
 */
const NonDrivableVehicleInfo = ({ onRestart }) => {
  const handleRestart = () => {
    onRestart();
    // Scroll to main element after page loads
    setTimeout(() => {
      const mainElement = document.querySelector('main.flex-grow');
      if (mainElement) {
        mainElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <p className="text-lg md:text-xl text-gray-900 mb-4 leading-relaxed">
              Thank you for confirming your vehicle does <strong>NOT</strong> run and
              drive. To give you an estimate of value* we need to understand more about
              your vehicle.
            </p>
            <p className="text-base md:text-lg text-gray-800 mb-4 leading-relaxed">
              Please contact your local Branch Manager <strong>Annie Thomas</strong> at
              We Buy Any Car<sup>®</sup> Pompano Beach by calling{' '}
              <a
                href="tel:9545460418"
                className="text-blue-600 hover:text-blue-800 underline font-semibold"
              >
                (954) 546-0418
              </a>
              . Once we know the specific problem (e.g., dead battery, bad
              transmission), we can provide a better estimate.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
              <p className="text-base text-gray-800 leading-relaxed">
                <strong>Keep in mind</strong> that we do buy non-running vehicles but
                do not offer a towing service. You will need to make your own
                arrangements to bring the vehicle to your local We Buy Any Car
                <sup>®</sup> branch for appraisal.
              </p>
            </div>
            <p className="text-base text-gray-700 mt-6">
              If you made a mistake and the vehicle <strong>does</strong> run and
              drive,{' '}
              <button
                onClick={handleRestart}
                className="text-blue-600 hover:text-blue-800 underline font-semibold"
                id="restart-valuation-button"
              >
                click here
              </button>{' '}
              to get a new valuation.
            </p>
          </div>
        </div>

        {/* Trust badges - Right column */}
        <div className="lg:col-span-1 space-y-4">
          {/* BBB Badge */}
          <div className="bg-blue-600 text-white p-4 rounded-lg text-center">
            <div className="text-xs font-bold mb-2">BBB</div>
            <div className="text-xs font-semibold">ACCREDITED</div>
            <div className="text-xs font-semibold">BUSINESS</div>
          </div>

          {/* Trustpilot Badge */}
          <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="text-green-600 text-lg">★</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-green-600 text-sm">
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-gray-900 mb-1">TrustScore 4.9</div>
              <div className="text-xs text-gray-600">68,037 opiniones</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonDrivableVehicleInfo;
