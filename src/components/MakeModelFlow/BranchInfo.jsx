/**
 * BranchInfo - Displays nearest branch information
 * Implements Single Responsibility Principle (SRP)
 */

/**
 * Branch information component
 * @param {Object} props - Component props
 * @param {Object} props.branch - Branch data
 */
const BranchInfo = ({ branch }) => {
  if (!branch) return null;

  const { branchLocation, distance } = branch;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg text-center -mt-6 md:mt-0" style={{marginTop:'0', borderRadius: '0'}}> 
      <div className="text-lg md:text-xl font-bold text-gray-900 mb-4">
        Your nearest branch is
        <br />
        {distance} miles away
      </div>
      
      <hr className="border-t border-gray-300 my-6 max-w-xs mx-auto" />
      
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        {branchLocation?.branchName}
      </h1>
      
      <p className="mb-6">
        <a
          href={branchLocation?.mapURL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-800 underline"
        >
          {branchLocation?.address1}
          <br />
          {branchLocation?.city}, {branchLocation?.state} {branchLocation?.zipCode}
        </a>
      </p>
      
      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        {branchLocation?.branchPhone && (
          <a
            href={`tel:${branchLocation.branchPhone}`}
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center"
          >
            Call {branchLocation.branchPhone}
          </a>
        )}
        
        {branchLocation?.branchEmail && (
          <a
            href={`mailto:${branchLocation.branchEmail}`}
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center"
          >
            Email the Branch
          </a>
        )}
      </div>
    </div>
  );
};

export default BranchInfo;
