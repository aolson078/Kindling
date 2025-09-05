export interface UserProfile {
  /** Unique identifier for the user */
  id: string;
  /** Age in years */
  age?: number;
  /** Geographic coordinates */
  location?: { lat: number; lon: number };
  /** List of interest tags */
  interests?: string[];
}

export interface MatchParameters {
  /** Weight for age compatibility (0-1) */
  ageWeight: number;
  /** Weight for distance similarity (0-1) */
  distanceWeight: number;
  /** Weight for shared interests (0-1) */
  interestWeight: number;
  /** Max age difference to consider */
  maxAgeDifference: number;
  /** Max distance (km) to consider */
  maxDistanceKm: number;
}

export const defaultParams: MatchParameters = {
  ageWeight: 0.3,
  distanceWeight: 0.3,
  interestWeight: 0.4,
  maxAgeDifference: 10,
  maxDistanceKm: 50,
};

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aa = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  const R = 6371; // Earth radius in km
  return R * c;
}

export interface MatchResult {
  user: UserProfile;
  score: number;
}

export function scoreMatch(a: UserProfile, b: UserProfile, params: MatchParameters = defaultParams): number {
  let score = 0;

  if (a.age !== undefined && b.age !== undefined) {
    const ageDiff = Math.abs(a.age - b.age);
    const ageScore = 1 - Math.min(ageDiff, params.maxAgeDifference) / params.maxAgeDifference;
    score += ageScore * params.ageWeight;
  }

  if (a.location && b.location) {
    const dist = haversine(a.location, b.location);
    const distScore = 1 - Math.min(dist, params.maxDistanceKm) / params.maxDistanceKm;
    score += distScore * params.distanceWeight;
  }

  if (a.interests && b.interests) {
    const setA = new Set(a.interests);
    const setB = new Set(b.interests);
    const intersection = [...setA].filter((x) => setB.has(x)).length;
    const union = new Set([...a.interests, ...b.interests]).size;
    const interestScore = union ? intersection / union : 0;
    score += interestScore * params.interestWeight;
  }

  return score;
}

export function findMatches(
  user: UserProfile,
  candidates: UserProfile[],
  params: MatchParameters = defaultParams
): MatchResult[] {
  return candidates
    .filter((c) => c.id !== user.id)
    .map((c) => ({ user: c, score: scoreMatch(user, c, params) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function initiateFirstMessage(from: UserProfile, to: UserProfile) {
  return {
    to: to.id,
    message: `Hi ${to.id}, ${from.id} liked your profile!`,
  };
}
