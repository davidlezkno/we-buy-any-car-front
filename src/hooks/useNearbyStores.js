// Hook encapsulates store lookup logic so appointment flows remain focused on presentation.
import { useEffect, useState } from "react";
import { findNearbyStores } from "../services/api";

/**
 * Returns stores near a ZIP code alongside loading state.
 * @param {string} zipCode
 */
const useNearbyStores = (zipCode) => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStores = async () => {
      if (!zipCode || zipCode.length !== 5) {
        setStores([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await findNearbyStores(zipCode);
        setStores(response);
      } finally {
        setIsLoading(false);
      }
    };

    loadStores();
  }, [zipCode]);

  return { stores, isLoading };
};

export default useNearbyStores;
