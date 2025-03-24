
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/animation.css'

// Function to hide the initial loader
const hideLoader = () => {
  const loader = document.getElementById('root-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 300); // Wait for fade out animation before removing
  }
};

// Render the app with React
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Hide the loader after React has rendered
// Using requestIdleCallback if available for better performance, otherwise setTimeout
if ('requestIdleCallback' in window) {
  // @ts-ignore - TypeScript might not recognize requestIdleCallback
  window.requestIdleCallback(hideLoader);
} else {
  setTimeout(hideLoader, 100);
}
