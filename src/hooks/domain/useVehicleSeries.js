/**
 * useVehicleSeries Hook - Vehicle series and body type management
 * Implements Single Responsibility Principle (SRP)
 */

import { useState, useCallback, useEffect } from 'react';
import { getSeries, getImageVehicle } from '../../services/vehicleService';

/**
 * Custom hook for vehicle series operations
 * @param {Object} vehicleInfo - Vehicle year, make, model
 * @returns {Object} Series state and methods
 */
export function useVehicleSeries(vehicleInfo) {
  const [listSeries, setListSeries] = useState([]);
  const [listBodyTypes, setListBodyTypes] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch series for vehicle
   */
  const fetchSeries = useCallback(async () => {
    if (!vehicleInfo?.year || !vehicleInfo?.make || !vehicleInfo?.model) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const series = await getSeries(
        vehicleInfo.year,
        vehicleInfo.model,
        vehicleInfo.make
      );
      setListSeries(series);
      
      // Auto-select first series if only one
      if (series.length > 0) {
        const uniqueSeries = [...new Set(series.map(item => item.series))];
        if (uniqueSeries.length === 1) {
          setSelectedSeries(uniqueSeries[0]);
        } else {
          setSelectedSeries(series[0].series);
        }
        
        // Load initial image
        if (series[0]?.imageUrl) {
          loadImage(series[0].imageUrl);
        }
      }
      
      return series;
    } catch (err) {
      console.error('Error getting series:', err);
      setError(err.message || 'Failed to fetch series');
      return [];
    } finally {
      setLoading(false);
    }
  }, [vehicleInfo?.year, vehicleInfo?.make, vehicleInfo?.model]);

  /**
   * Load vehicle image
   * @param {string} url - Image URL
   */
  const loadImage = useCallback(async (url) => {
    if (!url) return;
    
    try {
      const image = await getImageVehicle(url);
      setImageUrl(image);
    } catch (err) {
      console.error('Error getting image:', err);
    }
  }, []);

  /**
   * Handle series selection change
   * @param {string} series - Selected series
   */
  const handleSeriesChange = useCallback((series) => {
    setSelectedSeries(series);
    setSelectedBodyType('');
    
    if (series) {
      const bodyTypes = listSeries.filter(item => item.series === series);
      setListBodyTypes(bodyTypes);
      
      // Auto-select if only one body type
      if (bodyTypes.length === 1) {
        setSelectedBodyType(bodyTypes[0].bodystyle);
      }
    } else {
      setListBodyTypes([]);
    }
  }, [listSeries]);

  /**
   * Handle body type selection change
   * @param {string} bodyType - Selected body type
   */
  const handleBodyTypeChange = useCallback((bodyType) => {
    setSelectedBodyType(bodyType);
    
    // Update image based on body type
    const selected = listBodyTypes.find(item => item.bodystyle === bodyType);
    if (selected?.imageUrl) {
      loadImage(selected.imageUrl);
    }
  }, [listBodyTypes, loadImage]);

  /**
   * Get unique series options
   */
  const seriesOptions = listSeries.length > 0 
    ? [...new Set(listSeries.map(item => item.series))]
    : [];

  /**
   * Get body type options
   */
  const bodyTypeOptions = listBodyTypes.map(item => item.bodystyle);

  /**
   * Check if series selection should be disabled
   */
  const isSeriesDisabled = listSeries.length === 0 || seriesOptions.length === 1;

  /**
   * Check if body type selection should be disabled
   */
  const isBodyTypeDisabled = listBodyTypes.length === 0 || listBodyTypes.length === 1;

  // Auto-fetch series when vehicle info changes
  useEffect(() => {
    if (vehicleInfo?.year && vehicleInfo?.make && vehicleInfo?.model) {
      fetchSeries();
    }
  }, [vehicleInfo?.year, vehicleInfo?.make, vehicleInfo?.model, fetchSeries]);

  // Update body types when series changes
  useEffect(() => {
    if (selectedSeries && listSeries.length > 0) {
      const bodyTypes = listSeries.filter(item => item.series === selectedSeries);
      setListBodyTypes(bodyTypes);
      
      if (bodyTypes.length === 1) {
        setSelectedBodyType(bodyTypes[0].bodystyle);
      }
    }
  }, [selectedSeries, listSeries]);

  return {
    listSeries,
    listBodyTypes,
    selectedSeries,
    selectedBodyType,
    imageUrl,
    loading,
    error,
    seriesOptions,
    bodyTypeOptions,
    isSeriesDisabled,
    isBodyTypeDisabled,
    fetchSeries,
    loadImage,
    handleSeriesChange,
    handleBodyTypeChange,
    setSelectedSeries,
    setSelectedBodyType,
  };
}
