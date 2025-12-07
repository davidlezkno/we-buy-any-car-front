/**
 * Hooks index - Central export point for all hooks
 */

// Utility hooks
export { useToggle } from './utils/useToggle';
export { useDisclosure } from './utils/useDisclosure';
export { useAsync } from './utils/useAsync';
export { useDebounce } from './utils/useDebounce';
export { useLocalStorage } from './utils/useLocalStorage';
export { useScrollLock } from './utils/useScrollLock';
export { useMediaQuery } from './utils/useMediaQuery';

// Domain hooks
export { useVehicleSearch } from './domain/useVehicleSearch';
export { useAppointmentBooking } from './domain/useAppointmentBooking';
export { useValuation } from './domain/useValuation';

// MakeModel Flow hooks
export { useMakeModelFlow } from './domain/useMakeModelFlow';
export { useCustomerJourney } from './domain/useCustomerJourney';
export { useVehicleSeries } from './domain/useVehicleSeries';
export { useBranches } from './domain/useBranches';
export { useDamageForm } from './domain/useDamageForm';
export { useFlowState } from './domain/useFlowState';

