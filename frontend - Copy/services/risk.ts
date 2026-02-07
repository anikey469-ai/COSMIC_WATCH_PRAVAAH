
import { NearEarthObject } from '../types';

/**
 * Risk Analysis Engine Logic
 * 
 * Score components (0-100 scale):
 * 1. Hazard Status: 40 points if `is_potentially_hazardous_asteroid` is true.
 * 2. Diameter: Up to 30 points. Scale: > 1km = 30 pts, linearly down to 0 at 0.05km.
 * 3. Proximity: Up to 30 points. Scale: < 1M km = 30 pts, linearly down to 0 at 7.5M km (the hazard threshold).
 */
export const calculateRiskScore = (neo: any): number => {
  let score = 0;

  // 1. Hazard (40%)
  if (neo.is_potentially_hazardous_asteroid) {
    score += 40;
  }

  // 2. Diameter (30%)
  const maxDiameter = neo.estimated_diameter.kilometers.estimated_diameter_max;
  const diameterScore = Math.min(30, (maxDiameter / 1.0) * 30);
  score += diameterScore;

  // 3. Proximity (30%)
  const closeApproach = neo.close_approach_data[0];
  if (closeApproach) {
    const km = parseFloat(closeApproach.miss_distance.kilometers);
    // Proximity threshold is 7.5 million km for "close"
    const proximityScore = Math.max(0, (1 - (km / 7500000)) * 30);
    score += proximityScore;
  }

  return Math.round(score);
};

export const getRiskColor = (score: number): string => {
  if (score >= 75) return 'text-red-500 bg-red-500/10 border-red-500/20';
  if (score >= 40) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
};

export const getRiskLevel = (score: number): string => {
  if (score >= 75) return 'CRITICAL';
  if (score >= 40) return 'ELEVATED';
  return 'LOW';
};
