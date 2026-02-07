
import { NearEarthObject } from '../types';
import { calculateRiskScore } from './risk';

const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/feed';

/**
 * SYSTEM AUTHORIZED UPLINK KEY
 * Paste your key here if you ever need to rotate it manually.
 */
export const SYSTEM_KEY: string = 'KXRwExHnLSAu5xiX5IjsolZmuQtwWLo4FhZIPvOc';

export const fetchNEOs = async (startDate?: string, endDate?: string): Promise<NearEarthObject[]> => {
  const today = new Date().toISOString().split('T')[0];
  const start = startDate || today;
  
  try {
    const response = await fetch(`${NASA_API_URL}?start_date=${start}&api_key=${SYSTEM_KEY}`);
    
    if (!response.ok) {
      if (response.status === 403) throw new Error('NASA API: Forbidden. Uplink Key Invalid.');
      if (response.status === 429) throw new Error('NASA API: Rate limit exceeded.');
      throw new Error(`NASA Network Error: ${response.status}`);
    }
    
    const data = await response.json();
    const neoList: NearEarthObject[] = [];
    
    if (data.near_earth_objects) {
      Object.values(data.near_earth_objects).forEach((dayNEOs: any) => {
        dayNEOs.forEach((neo: any) => {
          const normalized: NearEarthObject = {
            ...neo,
            risk_score: calculateRiskScore(neo)
          };
          neoList.push(normalized);
        });
      });
    }
    
    // Default sorting removed to satisfy request. Returns data in API provided sequence.
    return neoList;
  } catch (error: any) {
    console.error("Cosmic Link Failure:", error.message);
    throw error;
  }
};
