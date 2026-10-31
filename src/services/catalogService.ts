import { requestJson } from './apiClient';
import type { Catalogs } from '../types/mechanic';

export function getMechanicCatalogs() {
  return requestJson<Catalogs>('/api/v1/catalogs/mechanic-report');
}

export function searchMechanicUnits(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ query });
  return requestJson<{ units: Catalogs['units'] }>(
    `/api/v1/catalogs/mechanic-units?${params.toString()}`,
    { signal },
  );
}
