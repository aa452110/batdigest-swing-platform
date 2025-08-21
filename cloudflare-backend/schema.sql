-- Submissions table for video analysis requests
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Player info
  player_name TEXT NOT NULL,
  height TEXT,
  weight INTEGER,
  age INTEGER,
  batting_stance TEXT DEFAULT 'right',
  
  -- Video metadata
  video_r2_key TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  duration REAL,
  fps INTEGER,
  metadata TEXT, -- JSON string
  camera_angle TEXT DEFAULT 'side',
  
  -- Submission details
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  player_notes TEXT,
  status TEXT DEFAULT 'pending', -- pending, uploading, processing, ready, analyzed, failed
  error_message TEXT,
  coach_id TEXT,
  priority INTEGER DEFAULT 0,
  
  -- Additional player info
  team TEXT,
  position TEXT,
  skill_level TEXT,
  bat_size TEXT,
  bat_type TEXT,
  league TEXT,
  age_group TEXT,
  
  -- Analysis results
  analysis_id TEXT,
  analysis_url TEXT,
  coach_notes TEXT
);

-- Analyses table for coach analysis sessions
CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  coach_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  timeline_json TEXT, -- Annotation timeline data
  recording_r2_key TEXT, -- Coach's recorded analysis video
  recording_url TEXT,
  duration REAL,
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, deleted
  
  FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'individual', -- team, individual, academy
  subscription TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_account ON submissions(account_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_analyses_submission ON analyses(submission_id);
CREATE INDEX IF NOT EXISTS idx_analyses_coach ON analyses(coach_id);