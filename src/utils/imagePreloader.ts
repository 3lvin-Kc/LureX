
/**
 * Utility to preload images before they're needed in the UI
 */
export const preloadImages = (imageSources: string[]): Promise<void[]> => {
  const imagePromises = imageSources.map(src => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`);
        resolve(); // Resolve anyway to not block other images
      };
    });
  });
  
  return Promise.all(imagePromises);
};

/**
 * Pre-load critical app images
 */
export const preloadCriticalImages = () => {
  // List images that should be preloaded immediately
  const criticalImages = [
    '/lovable-uploads/593ea609-4f84-4649-804c-d9f554b77a57.png',
    '/lovable-uploads/f5d91462-4a22-42de-9ee6-1406b1391d82.png'
  ];
  
  return preloadImages(criticalImages);
};
