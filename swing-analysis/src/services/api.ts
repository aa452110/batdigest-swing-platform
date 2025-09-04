// API service for communicating with Cloudflare Worker

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export type VideoSubmission = {
  id: number;
  submissionId: string;
  athleteName: string;
  cameraAngle: string;
  notes: string;
  status: string;
  createdAt: string;
  r2Key: string;
  videoSize: number;
  userId: number;
  coachCode?: string;
  analysisResult?: string;
  analyzedAt?: string;
  // When available, the API should return a direct analyzed video URL
  downloadUrl?: string;
};

export const api = {
  async getPendingSubmissions(): Promise<VideoSubmission[]> {
    try {
      const response = await fetch(`${API_BASE}/api/submissions?status=pending`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.submissions || [];
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      return [];
    }
  },

  async getAllSubmissions(): Promise<VideoSubmission[]> {
    try {
      const response = await fetch(`${API_BASE}/api/submissions`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.submissions || [];
    } catch (error) {
      console.error('Failed to fetch all submissions:', error);
      return [];
    }
  },

  async getVideoUrl(r2Key: string): Promise<string> {
    // For now, construct the R2 public URL directly
    // Later we might want to get a signed URL from the Worker
    return `https://swing-videos.r2.dev/${r2Key}`;
  },

  async updateSubmissionStatus(submissionId: string, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/submission/${submissionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update submission status:', error);
      return false;
    }
  },
};
