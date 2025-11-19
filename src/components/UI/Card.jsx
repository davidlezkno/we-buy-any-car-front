import { motion } from "framer-motion";
import clsx from "clsx";

const Card = ({ children, hover = false, className, onClick, ...props }) => {
  const cardClass = hover ? "card-hover" : "card";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(cardClass, className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
