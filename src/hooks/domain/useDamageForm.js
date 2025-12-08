/**
 * useDamageForm Hook - Vehicle damage form management
 * Implements Single Responsibility Principle (SRP)
 */

import { useState, useCallback, useEffect } from 'react';
import { getComponentList, getFaultTypeList } from '../../services/api';

/**
 * Zone options for damage selection
 */
export const DAMAGE_ZONE_OPTIONS = [
  { value: '1', label: 'Behind the Wheel' },
  { value: '4', label: 'Driver Side Front' },
  { value: '2', label: 'Driver Side Front Interior' },
  { value: '13', label: 'Driver Side Rear' },
  { value: '14', label: 'Driver Side Rear Interior' },
  { value: '5', label: 'Front' },
  { value: '7', label: 'Passenger Side Front' },
  { value: '8', label: 'Passenger Side Front Interior' },
  { value: '9', label: 'Passenger Side Rear' },
  { value: '10', label: 'Passenger Side Rear Interior' },
  { value: '11', label: 'Rear' },
  { value: '12', label: 'Rear Interior' },
  { value: '3', label: 'Roof Panel' },
  { value: '17', label: 'Test Drive' },
  { value: '6', label: 'Under the Hood' },
  { value: '16', label: 'Undercarriage' },
  { value: '15', label: 'Vehicle Disclosure Items' },
];

/**
 * Custom hook for damage form management
 * @returns {Object} Damage form state and methods
 */
export function useDamageForm() {
  const [damageZone, setDamageZone] = useState('');
  const [damageComponent, setDamageComponent] = useState('');
  const [damageType, setDamageType] = useState('');
  const [damageList, setDamageList] = useState([]);
  const [componentOptions, setComponentOptions] = useState([]);
  const [faultOptions, setFaultOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * Load component options when zone changes
   */
  useEffect(() => {
    if (damageZone) {
      const loadComponents = async () => {
        setLoading(true);
        try {
          const components = await getComponentList(damageZone);
          setComponentOptions(components);
          setDamageComponent('');
          setDamageType('');
          setFaultOptions([]);
        } catch (err) {
          console.error('Error loading components:', err);
          setComponentOptions([]);
        } finally {
          setLoading(false);
        }
      };
      loadComponents();
    } else {
      setComponentOptions([]);
      setDamageComponent('');
      setDamageType('');
      setFaultOptions([]);
    }
  }, [damageZone]);

  /**
   * Load fault type options when component changes
   */
  useEffect(() => {
    if (damageComponent) {
      const loadFaultTypes = async () => {
        setLoading(true);
        try {
          const faults = await getFaultTypeList(damageComponent);
          setFaultOptions(faults);
          setDamageType('');
        } catch (err) {
          console.error('Error loading fault types:', err);
          setFaultOptions([]);
        } finally {
          setLoading(false);
        }
      };
      loadFaultTypes();
    } else {
      setFaultOptions([]);
      setDamageType('');
    }
  }, [damageComponent]);

  /**
   * Add damage to list
   */
  const addDamage = useCallback(() => {
    if (damageZone && damageComponent && damageType) {
      const newDamage = {
        zone: damageZone,
        component: damageComponent,
        type: damageType,
        zoneLabel: DAMAGE_ZONE_OPTIONS.find(z => z.value === damageZone)?.label || '',
        componentLabel: componentOptions.find(c => c.value === damageComponent)?.label || '',
        typeLabel: faultOptions.find(f => f.value === damageType)?.label || '',
      };
      
      setDamageList(prev => [...prev, newDamage]);
      
      // Reset form
      setDamageZone('');
      setDamageComponent('');
      setDamageType('');
      setComponentOptions([]);
      setFaultOptions([]);
    }
  }, [damageZone, damageComponent, damageType, componentOptions, faultOptions]);

  /**
   * Remove damage from list
   * @param {number} index - Index of damage to remove
   */
  const removeDamage = useCallback((index) => {
    setDamageList(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Clear all damages
   */
  const clearDamages = useCallback(() => {
    setDamageList([]);
    setDamageZone('');
    setDamageComponent('');
    setDamageType('');
    setComponentOptions([]);
    setFaultOptions([]);
  }, []);

  /**
   * Check if add damage button should be enabled
   */
  const canAddDamage = damageZone && damageComponent && damageType;

  return {
    damageZone,
    damageComponent,
    damageType,
    damageList,
    componentOptions,
    faultOptions,
    loading,
    canAddDamage,
    zoneOptions: DAMAGE_ZONE_OPTIONS,
    setDamageZone,
    setDamageComponent,
    setDamageType,
    addDamage,
    removeDamage,
    clearDamages,
  };
}
