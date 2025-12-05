# ChatApp

A real-time chat application built with React Native and Firebase. This mobile application allows users to register, login, and send text messages and images in real-time with offline support.

## 📱 Features

- **User Authentication**
  - User registration with email and password
  - Secure login with email and password
  - Persistent authentication state (auto-login)
  - Logout functionality

- **Real-time Messaging**
  - Send and receive text messages in real-time
  - Real-time synchronization using Firebase Firestore
  - Message history with timestamps
  - User identification for each message

- **Image Sharing**
  - Upload and share images in chat
  - Image picker integration
  - Base64 image encoding for storage

- **Offline Support**
  - Local storage using AsyncStorage
  - Chat history persists when offline
  - Automatic sync when connection is restored

- **User Interface**
  - Clean and modern UI design
  - Message bubbles with sender identification
  - Responsive layout
  - Loading states and error handling

## 🛠️ Tech Stack

- **Framework**: React Native 0.82.1
- **Language**: TypeScript
- **Navigation**: React Navigation 7.x
- **Backend Services**:
  - Firebase Authentication
  - Cloud Firestore (Real-time database)
- **Storage**:
  - AsyncStorage (Local storage)
  - React Native FS (File system operations)
- **Image Handling**: React Native Image Picker
- **State Management**: React Hooks

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** >= 20.0.0
- **npm** or **yarn**
- **React Native CLI**
- **Android Studio** (for Android development)
  - Android SDK
  - Android Emulator or physical device
- **Xcode** (for iOS development, macOS only)
- **Firebase Account** (for backend services)

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ChatApp.git
cd ChatApp
```

### 2. Install dependencies

```bash
npm install
```

or

```bash
yarn install
```

### 3. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** with Email/Password provider
3. Create a **Firestore Database** in test mode
4. For Android: Download `google-services.json` and place it in `android/app/`
5. Update Firebase configuration in `firebase.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### 4. iOS Setup (macOS only)

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

## 🏃 Running the Application

### Start Metro Bundler

```bash
npm start
```

or

```bash
yarn start
```

### Run on Android

In a new terminal:

```bash
npm run android
```

or

```bash
yarn android
```

### Run on iOS (macOS only)

In a new terminal:

```bash
npm run ios
```

or

```bash
yarn ios
```

## 📁 Project Structure

```
ChatApp/
├── android/                 # Android native code
├── ios/                     # iOS native code
├── screens/                 # Screen components
│   ├── LoginScreen.tsx     # Authentication screen
│   └── ChatScreen.tsx       # Chat interface screen
├── App.tsx                  # Main app component with navigation
├── firebase.ts              # Firebase configuration and utilities
├── storage.ts               # Local storage utilities
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## 🔧 Configuration

### Firebase Firestore Rules

Make sure your Firestore security rules allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Environment Variables

For production, consider using environment variables for Firebase configuration. You can use libraries like `react-native-config` or `react-native-dotenv`.

## 📱 Usage

1. **Register/Login**
   - Open the app
   - Register a new account or login with existing credentials
   - The app will automatically navigate to the chat screen upon successful authentication

2. **Send Messages**
   - Type your message in the input field
   - Tap the send button (→) to send
   - Messages appear in real-time for all users

3. **Share Images**
   - Tap the "+" button to open image picker
   - Select an image from your gallery
   - The image will be uploaded and shared in the chat

4. **Logout**
   - Tap the "Logout" button in the header
   - You will be redirected to the login screen

## 🧪 Testing

Run tests with:

```bash
npm test
```

or

```bash
yarn test
```

## 🐛 Troubleshooting

### Metro Bundler Issues

If you encounter issues with Metro bundler, try clearing the cache:

```bash
npm start -- --reset-cache
```

### Android Build Issues

- Make sure Android SDK is properly configured
- Check that `ANDROID_HOME` environment variable is set
- Clean and rebuild: `cd android && ./gradlew clean && cd ..`

### iOS Build Issues

- Make sure CocoaPods dependencies are installed: `cd ios && pod install && cd ..`
- Clean build folder in Xcode: Product → Clean Build Folder

### Firebase Connection Issues

- Verify Firebase configuration in `firebase.ts`
- Check Firebase console for service status
- Ensure Firestore rules allow authenticated access

## 📝 License

This project is created for educational purposes as part of the Platform-Based Programming (PBP) course.

## 🙏 Acknowledgments

- React Native community
- Firebase team
- All open-source contributors whose libraries made this project possible
