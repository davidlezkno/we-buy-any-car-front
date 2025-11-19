import { motion } from "framer-motion";

const LoadingSpinner = ({ size = "md", message = "Loading..." }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className={`${sizes[size]} border-4 border-gray-200 border-t-primary-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {message && <p className="mt-4 text-gray-600 font-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
