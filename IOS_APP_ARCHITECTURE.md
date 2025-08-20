# BatDigest Swing Analysis iOS App Architecture

## Overview
A native iOS application that enables parents to record, upload, and receive professional analysis of their child's baseball/softball swing mechanics. The app will integrate with the existing web-based swing analysis platform.

## Core Objectives
1. **Simple Video Capture** - Easy-to-use recording interface optimized for capturing batting swings
2. **Reliable Upload** - Robust video upload with progress tracking and retry capabilities
3. **Analysis Delivery** - Push notifications and in-app viewing of completed analyses
4. **Parent-Friendly UX** - Intuitive interface designed for non-technical parents

## 1. User Flow & Features

### 1.1 Onboarding Flow
```
Launch App → Welcome Screen → Sign Up/Sign In → Profile Setup → Tutorial → Main Dashboard
```

**Key Features:**
- Email/Phone authentication
- Child athlete profiles (multiple children per account)
- Optional team/coach association
- Push notification permissions
- Camera/photo library permissions

### 1.2 Core User Journey
```
Dashboard → New Recording → Capture Video → Review → Add Details → Upload → Track Progress → View Analysis
```

**Recording Features:**
- Pre-recording checklist (proper angle, lighting, distance)
- Recording guidelines overlay
- Slow-motion capture support (120/240 fps)
- Multiple angle support (front/side view)
- Trim/edit video before upload
- Save draft recordings

**Upload Features:**
- Background upload support
- Upload queue management
- Pause/resume capability
- Cellular data usage controls
- Automatic retry on failure
- Progress indicators

**Analysis Features:**
- Push notification on completion
- In-app analysis viewer
- Frame-by-frame playback
- Side-by-side comparison
- Drawing/annotation tools
- Export/share analysis
- History of all analyses

## 2. Technical Architecture

### 2.1 Technology Stack
```
Frontend:
- Swift/SwiftUI (iOS 15+)
- AVFoundation (video capture)
- Core Data (local storage)
- Combine (reactive programming)

Backend Integration:
- REST API communication
- WebSocket for real-time updates
- AWS S3 for video storage
- Firebase Cloud Messaging (push notifications)

Video Processing:
- VideoToolbox (compression)
- AVAsset (video manipulation)
- Metal (GPU acceleration for filters)
```

### 2.2 App Structure
```
BatDigestSwingAnalysis/
├── App/
│   ├── BatDigestApp.swift
│   ├── AppDelegate.swift
│   └── SceneDelegate.swift
├── Core/
│   ├── Network/
│   │   ├── APIClient.swift
│   │   ├── Endpoints.swift
│   │   └── NetworkMonitor.swift
│   ├── Storage/
│   │   ├── CoreDataStack.swift
│   │   ├── UserDefaults+Extensions.swift
│   │   └── KeychainManager.swift
│   ├── Video/
│   │   ├── VideoCapture.swift
│   │   ├── VideoProcessor.swift
│   │   └── VideoUploader.swift
│   └── Services/
│       ├── AuthenticationService.swift
│       ├── AnalysisService.swift
│       └── NotificationService.swift
├── Features/
│   ├── Authentication/
│   ├── Recording/
│   ├── Upload/
│   ├── Analysis/
│   └── Profile/
├── Shared/
│   ├── Components/
│   ├── Extensions/
│   └── Utilities/
└── Resources/
    ├── Assets.xcassets
    └── Localizable.strings
```

## 3. Data Models

### 3.1 Core Entities

```swift
// User Profile
struct User {
    let id: UUID
    let email: String
    let name: String
    let phoneNumber: String?
    let subscriptionTier: SubscriptionTier
    let createdAt: Date
}

// Athlete Profile
struct Athlete {
    let id: UUID
    let userId: UUID
    let name: String
    let birthDate: Date
    let battingStance: BattingStance // left, right, switch
    let team: String?
    let position: String?
    let skillLevel: SkillLevel
}

// Video Recording
struct VideoRecording {
    let id: UUID
    let athleteId: UUID
    let localURL: URL
    let duration: TimeInterval
    let frameRate: Int
    let angle: CameraAngle // front, side, other
    let recordedAt: Date
    let uploadStatus: UploadStatus
    let metadata: VideoMetadata
}

// Analysis Result
struct Analysis {
    let id: UUID
    let videoId: UUID
    let athleteId: UUID
    let status: AnalysisStatus
    let metrics: SwingMetrics
    let recommendations: [Recommendation]
    let coachNotes: String?
    let videoURL: URL?
    let annotatedVideoURL: URL?
    let createdAt: Date
}

// Swing Metrics
struct SwingMetrics {
    let batSpeed: Double
    let timeToContact: Double
    let swingPlane: Double
    let bodyRotation: Double
    let weightTransfer: WeightTransferMetric
    let followThrough: FollowThroughMetric
}
```

### 3.2 API Structure

```swift
// API Endpoints
enum API {
    static let baseURL = "https://api.batdigest.com/v1"
    
    enum Endpoints {
        case login
        case register
        case uploadVideo
        case getAnalysis(id: String)
        case listAnalyses
        case getUploadURL
        case updateProfile
    }
}

// Request/Response Models
struct UploadRequest {
    let athleteId: UUID
    let videoData: Data
    let metadata: VideoMetadata
}

struct AnalysisResponse {
    let analysisId: UUID
    let status: String
    let estimatedCompletion: Date?
    let result: Analysis?
}
```

## 4. Video Processing Pipeline

### 4.1 Capture Pipeline
```
Camera Setup → Recording → Local Processing → Compression → Upload Queue
```

**Processing Steps:**
1. **Capture Configuration**
   - Resolution: 1080p minimum, 4K preferred
   - Frame rate: 60fps minimum, 120/240fps for slow-motion
   - Stabilization: Optical + Digital
   - Focus: Continuous autofocus with subject tracking

2. **Local Processing**
   - Auto-trim dead space
   - Brightness/contrast adjustment
   - Rotation correction
   - Watermark overlay (optional)

3. **Compression**
   - H.264/H.265 codec
   - Maintain quality while reducing file size
   - Target: <100MB for 30-second clip

4. **Upload Strategy**
   - Chunked upload for large files
   - Resume capability
   - Background upload task
   - Retry with exponential backoff

### 4.2 Analysis Integration
```
Upload Complete → Server Processing → AI Analysis → Results Ready → Push Notification → Display Results
```

## 5. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup and configuration
- [ ] Authentication system
- [ ] Basic navigation structure
- [ ] Core Data setup
- [ ] API client foundation

### Phase 2: Video Capture (Weeks 3-4)
- [ ] Camera interface
- [ ] Recording controls
- [ ] Video preview/playback
- [ ] Basic editing (trim)
- [ ] Local storage management

### Phase 3: Upload System (Weeks 5-6)
- [ ] Upload queue implementation
- [ ] Background upload tasks
- [ ] Progress tracking
- [ ] Error handling and retry logic
- [ ] Network monitoring

### Phase 4: Analysis Display (Weeks 7-8)
- [ ] Analysis list view
- [ ] Detailed analysis screen
- [ ] Video player with annotations
- [ ] Metrics visualization
- [ ] Comparison tools

### Phase 5: Polish & Features (Weeks 9-10)
- [ ] Push notifications
- [ ] Offline mode
- [ ] Performance optimization
- [ ] Analytics integration
- [ ] Settings and preferences

### Phase 6: Testing & Launch (Weeks 11-12)
- [ ] Unit testing
- [ ] Integration testing
- [ ] Beta testing program
- [ ] Bug fixes and refinements
- [ ] App Store submission

## 6. Key Technical Considerations

### 6.1 Performance
- Lazy loading for video lists
- Thumbnail generation and caching
- Progressive video loading
- Memory management for video processing
- Background task optimization

### 6.2 Security
- Keychain storage for credentials
- Certificate pinning for API calls
- Encrypted local storage
- Secure video upload (presigned URLs)
- GDPR/COPPA compliance for minors

### 6.3 Offline Capabilities
- Queue videos for upload when online
- Cache recent analyses
- Sync when connection restored
- Local draft management
- Conflict resolution

### 6.4 User Experience
- Intuitive onboarding flow
- Clear recording guidelines
- Real-time upload progress
- Meaningful error messages
- Accessibility support (VoiceOver)

## 7. Third-Party Integrations

### Required Services
- **AWS S3**: Video storage
- **Firebase**: Push notifications, analytics
- **Stripe**: Payment processing (if in-app purchases)
- **Sentry**: Crash reporting and monitoring
- **MixPanel/Amplitude**: User analytics

### Optional Enhancements
- **Coach Portal API**: Direct coach sharing
- **Social Sharing**: Facebook, Instagram stories
- **Video Analysis SDK**: Enhanced computer vision
- **Team Management API**: League/team integration

## 8. Success Metrics

### Technical KPIs
- Upload success rate >95%
- Average upload time <2 minutes
- Crash-free rate >99%
- App launch time <2 seconds
- Video processing time <30 seconds

### User KPIs
- Daily active users
- Videos uploaded per user
- Analysis completion rate
- User retention (30-day)
- App Store rating >4.5

## 9. Future Enhancements

### Version 2.0
- Live streaming to coach
- Multi-angle sync recording
- AR swing path overlay
- Voice coaching integration
- Team/group features

### Version 3.0
- AI-powered instant feedback
- 3D swing reconstruction
- Peer comparison features
- Training drill library
- Progress tracking dashboard

## Next Steps

1. **Validate Requirements**: Review with stakeholders
2. **Design Mockups**: Create UI/UX designs
3. **Setup Development Environment**: Xcode project, dependencies
4. **Begin Phase 1**: Start with authentication and core structure
5. **Establish CI/CD**: Automated testing and deployment

---

This architecture provides a solid foundation for building a professional-grade iOS app for swing analysis video uploads. The modular structure allows for iterative development while maintaining code quality and scalability.