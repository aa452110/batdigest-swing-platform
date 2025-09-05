export interface Env {
  // R2 bucket binding
  VIDEO_BUCKET: R2Bucket;
  
  // D1 database binding
  DB: D1Database;
  
  // Queue binding
  VIDEO_QUEUE: Queue;
  
  // Service binding for email worker
  EMAIL_SERVICE: Fetcher;
  
  // Environment variables
  CORS_ORIGIN: string;
  ENVIRONMENT: string;
}

export interface SubmissionRequest {
  submissionId: string;
  athleteId: string;
  athleteName: string;
  metadata: VideoMetadata;
  angle: string;
  notes?: string;
  athleteInfo?: AthleteInfo;
}

export interface VideoMetadata {
  duration: number;
  frameRate: number;
  resolution: string;
  fileSize: number;
}

export interface AthleteInfo {
  name: string;
  email?: string;
  height?: string;
  weight?: number;
  age?: number;
  battingStance: string;
  team?: string;
  position?: string;
  skillLevel?: string;
  batSize?: string;
  batType?: string;
  league?: string;
  ageGroup?: string;
}

export interface R2UploadResponse {
  uploadURL: string;
  r2Key: string;
  submissionId: string;
}