export type UserRole = "tourist" | "admin" | "partner" | "police" | "embassy";

export interface UserMetadata {
  full_name?: string;
  avatar_url?: string | null;
  role?: UserRole;
  nationality?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  user_metadata?: UserMetadata;
}

export type KycStatus = "unverified" | "under_review" | "verified" | "rejected" | "expired" | "revoked";

export interface UnifiedKyc {
  id?: string;
  user_id?: string;
  tourist_id?: string;
  full_name?: string;
  nationality?: string;
  passport_number?: string;
  passport_expiry?: string;
  visa_type?: string;
  visa_number?: string;
  entry_date?: string;
  exit_date?: string;
  stay_address?: string;
  emergency_contact?: string;
  blood_group?: string;
  status?: KycStatus;
  status_reason?: string;
  created_at?: string;
  updated_at?: string;
  verified_at?: string;
  profile_photo_url?: string;
  documents?: Record<string, any>;
  biometrics?: {
    face_snapshot?: string;
    liveness_passed?: boolean;
    liveness_score?: number;
    fastapi_face_match?: any;
    mrz_intelligence?: any;
  };
}

export interface Geofence {
  id: string;
  name: string;
  category: "safe_corridor" | "restricted" | "high_risk" | "scam_hotspot";
  latitude: number;
  longitude: number;
  radiusMeters: number;
  distanceMeters?: number;
  distanceKm?: string;
  description: string;
  safetyAdvisory: string;
  isInside?: boolean;
  isApproaching?: boolean;
}

export interface GeofenceCheckResult {
  success: boolean;
  touristLocation: {
    latitude: number;
    longitude: number;
    speedKph?: number;
  };
  overallStatus: "SAFE" | "ADVISORY" | "WARNING" | "RESTRICTED";
  insideGeofence: boolean;
  activeAlert: {
    type: string;
    level: "CRITICAL" | "HIGH" | "ADVISORY";
    title: string;
    message: string;
    geofence: Geofence;
    emergencyNumber?: string;
  } | null;
  nearestGeofence: Geofence | null;
  proximityGeofences: Geofence[];
  anomalyDetected?: boolean;
}

export interface SosAlert {
  id?: string;
  user_id?: string;
  category: "medical" | "crime" | "harassment" | "disaster" | "general";
  latitude?: number | null;
  longitude?: number | null;
  address_text?: string;
  notes?: string;
  responder?: string;
  reference?: string;
  status?: "active" | "dispatched" | "resolved";
  created_at?: string;
}

export interface ConsentRequest {
  id: string;
  user_id: string;
  requester: string;
  requester_type: "hotel" | "telecom" | "rental" | "attraction" | "authority";
  purpose: string;
  attributes: string[];
  shared_attributes?: string[];
  status: "pending" | "approved" | "denied";
  created_at: string;
  expires_at?: string;
}

export interface DynamicQrResponse {
  success: boolean;
  token: string;
  expiresAt: number;
  issuedAt: number;
  ttlSeconds: number;
  nonce: string;
  mode: "dynamic_rotating" | "offline_credential";
  shareUrl: string;
  fields: { key: string; label: string; value: string }[];
  touristId: string;
}

export interface Complaint {
  id?: string;
  user_id?: string;
  category: string;
  vendor_name?: string;
  amount?: string;
  currency?: string;
  location_name?: string;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  status?: "submitted" | "under_investigation" | "action_taken" | "resolved";
  reference_no?: string;
  created_at?: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  intent?: string;
  provider?: string;
}
