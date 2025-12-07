import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MapPin, Globe, Mail } from "lucide-react";

const BranchInfoModal = ({ isOpen, onClose, branch }) => {
  if (!isOpen || !branch) return null;

  // Branch data - esto debería venir de una API en producción
  const branchData = {
    union: {
      name: "Union",
      state: "NJ",
      address: "2565 Route 22 West",
      suite: "Suite E",
      city: "Union, NJ 07083",
      phone: "(908) 873-6460",
      phoneRaw: "9088736460",
      email: "union.nj@webuyanycarusa.com",
      mapUrl: "https://maps.google.com/maps?cid=5275190412442297199",
      webPage: "/sell-car/new-jersey-nj/union",
      image: "https://publiccdn.webuyanycarusa.com/branchimages/We Buy Any Car Union NJ_thumbnail.jpg",
      hours: {
        Monday: "10a.m. - 1p.m., 2p.m. - 7p.m.",
        Tuesday: "Closed",
        Wednesday: "10a.m. - 1p.m., 2p.m. - 7p.m.",
        Thursday: "11a.m. - 2p.m., 3p.m. - 8p.m.",
        Friday: "10a.m. - 1p.m., 2p.m. - 7p.m.",
        Saturday: "9a.m. - 1p.m., 2p.m. - 6p.m.",
        Sunday: "Closed",
      },
      description: "It can be a headache trying to sell a car in Union, NJ. That's why webuyanycar.com has opened a branch in your local area. Our streamlined process makes it quick and easy to sell a car. Start by getting an online valuation to find out how much your car is worth. Once complete, you can easily finalize the transaction by booking an appointment and bringing your car into our conveniently located branch. The best part is you'll leave with a check in hand which you can cash right away! We are the fast, safe and fair way to sell a vehicle in Union, NJ.",
      areasServed: "Clark, Cranford, Elizabeth, Garwood, Hillside, Irvington, Kenilworth, Linden, Maplewood, Millburn, Mountainside, Roselle Park, Roselle, Short Hills, South Orange, Springfield, Summit, Union, Vauxhall, Westfield",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.5!2d-74.3083!3d40.688244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c3b2b3c3c3c3c3%3A0x3c3c3c3c3c3c3c3c!2s2565%20Route%2022%20West%2C%20Suite%20E%2C%20Union%2C%20NJ%2007083!5e0!3m2!1sen!2sus!4v1234567890",
    },
    plainfield: {
      name: "Plainfield",
      state: "NJ",
      address: "Address TBD",
      suite: "",
      city: "Plainfield, NJ",
      phone: "(908) 873-6950",
      phoneRaw: "9088736950",
      email: "plainfield.nj@webuyanycarusa.com",
      mapUrl: "https://maps.google.com/maps",
      webPage: "/sell-car/new-jersey-nj/plainfield",
      image: "",
      hours: {
        Monday: "10a.m. - 1p.m., 2p.m. - 7p.m.",
        Tuesday: "Closed",
        Wednesday: "10a.m. - 1p.m., 2p.m. - 7p.m.",
        Thursday: "11a.m. - 2p.m., 3p.m. - 8p.m.",
        Friday: "10a.m. - 1p.m., 2p.m. - 7p.m.",
        Saturday: "9a.m. - 1p.m., 2p.m. - 6p.m.",
        Sunday: "Closed",
      },
      description: "We Buy Any Car Plainfield branch information.",
      areasServed: "Plainfield and surrounding areas",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.5!2d-74.3083!3d40.688244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQxJzE3LjciTiA3NMKwMTgnMjkuOSJX!5e0!3m2!1sen!2sus!4v1234567890",
    },
  };

  const data = branch;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal - More compact */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white rounded-lg shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Compact header */}
          <div
            className="flex items-center justify-between p-3 md:p-4 sticky top-0 z-20 rounded-t-lg"
            style={{ backgroundColor: "#20B24D" }}
          >
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white" style={{ fontFamily: "inherit" }}>
                {data.name}
              </h2>
              <p className="text-white/90 text-xs md:text-sm mt-0.5" style={{ fontFamily: "inherit" }}>
                Call us at {data.phone}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-300 transition-colors p-1 flex-shrink-0 z-30"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content - More compact layout */}
          <div className="p-3 md:p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
              {/* Column 1: Map */}
              <div className="md:col-span-1">
                <div className="branch-map rounded-lg overflow-hidden" style={{ height: "250px" }}>
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={data.mapEmbedUrl}
                  ></iframe>
                </div>
              </div>

              {/* Column 2: Branch Details */}
              <div className="md:col-span-1">
                <div className="branch-details-wrapper">
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      {data.name}, {data.state}
                    </h3>
                    <div className="branch-address space-y-2 text-sm">
                      <div>
                        <p className="text-gray-700">
                          {data.address}
                          {data.suite && (
                            <>
                              <br />
                              {data.suite}
                            </>
                          )}
                          <br />
                          {data.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-primary-600 text-xs">
                        <Phone className="w-3 h-3" />
                        <a href={`tel:${data.phoneRaw}`} className="hover:underline">
                          {data.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Branch Image */}
                  {data.image && (
                    <div className="mb-3">
                      <a href={data.webPage} target="_blank" rel="noopener noreferrer">
                        <img
                          src={data.image}
                          alt={`We Buy Any Car ${data.name}`}
                          className="rounded w-full max-w-[100px]"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </a>
                    </div>
                  )}

                  {/* Branch Links - more compact */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-primary-600">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <a
                        href={data.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Map and Directions
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary-600">
                      <Globe className="w-3 h-3 flex-shrink-0" />
                      <a
                        href={data.webPage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {data.name} Web Page
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary-600">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <a
                        href={`mailto:${data.email}`}
                        className="hover:underline"
                      >
                        {data.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Hours */}
              <div className="md:col-span-1">
                <div className="branch-timings-outer">
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    Opening Hours
                  </h3>
                  <div className="branch-timing-wrapper">
                    <table className="w-full text-xs">
                      <tbody>
                        {Object.entries(data.hours).map(([day, hours], index) => (
                          <tr key={day + "-" + index} className="border-b border-gray-200">
                            <td className="py-1 font-semibold text-gray-700 pr-2">
                              {day}
                            </td>
                            <td className="py-1 text-gray-600">
                              {hours}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-2 text-xs text-gray-500 italic">
                      * Branches close for lunch between listed time intervals
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description and areas served - more compact */}
            <div className="grid grid-cols-1 md:grid-cols-10 gap-4 text-sm">
              <div className="md:col-span-10">
                <p className="text-gray-700 leading-relaxed mb-2">{data.description}</p>
                <p className="text-gray-700 mb-2">
                  Click to see a full list of all{" "}
                  <a
                    href="https://www.webuyanycarusa.com/sell-car/north-jersey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    We Buy Any Car North Jersey Branches
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong>Areas Served:</strong> {data.areasServed}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BranchInfoModal;

