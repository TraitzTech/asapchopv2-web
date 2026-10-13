importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);
// // Initialize the Firebase app in the service worker by passing the generated config
// Same public web app config as src/firebase.js (project asapchop-5dedf).
const firebaseConfig = {
  apiKey: "AIzaSyBrtLMK7CQUSyeqxDsstjMVqfoF32mHeiQ",
  authDomain: "asapchop-5dedf.firebaseapp.com",
  projectId: "asapchop-5dedf",
  storageBucket: "asapchop-5dedf.firebasestorage.app",
  messagingSenderId: "800335530798",
  appId: "1:800335530798:web:d21c1af53adf15944488bf",
  measurementId: "G-Y2CERPY1KV",
};

firebase?.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase?.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
