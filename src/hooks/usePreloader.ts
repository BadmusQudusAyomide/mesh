import { useState, useEffect } from 'react';

interface PreloadItem {
  id: string;
  type: 'video' | 'image';
  src: string;
  loaded: boolean;
  error: boolean;
}

export const usePreloader = () => {
  const [preloadedItems, setPreloadedItems] = useState<PreloadItem[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);

  const preloadVideo = (id: string, src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      
      video.onloadedmetadata = () => {
        setPreloadedItems(prev => 
          prev.map(item => 
            item.id === id ? { ...item, loaded: true } : item
          )
        );
        resolve();
      };
      
      video.onerror = () => {
        setPreloadedItems(prev => 
          prev.map(item => 
            item.id === id ? { ...item, error: true } : item
          )
        );
        reject(new Error(`Failed to preload video: ${src}`));
      };
      
      video.src = src;
    });
  };

  const preloadImage = (id: string, src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        setPreloadedItems(prev => 
          prev.map(item => 
            item.id === id ? { ...item, loaded: true } : item
          )
        );
        resolve();
      };
      
      img.onerror = () => {
        setPreloadedItems(prev => 
          prev.map(item => 
            item.id === id ? { ...item, error: true } : item
          )
        );
        reject(new Error(`Failed to preload image: ${src}`));
      };
      
      img.src = src;
    });
  };

  const startPreloading = async (content: Array<{ id: number; type: string; src: string; thumbnail?: string }>) => {
    setIsPreloading(true);
    setPreloadProgress(0);
    
    const items: PreloadItem[] = [];
    
    // Add all content to preload list
    content.forEach(item => {
      if (item.type === 'reel' || item.type === 'video') {
        items.push({
          id: `video-${item.id}`,
          type: 'video',
          src: item.src,
          loaded: false,
          error: false
        });
      }
      
      if (item.thumbnail) {
        items.push({
          id: `image-${item.id}`,
          type: 'image',
          src: item.thumbnail,
          loaded: false,
          error: false
        });
      }
    });
    
    setPreloadedItems(items);
    
    // Preload items in batches to avoid overwhelming the browser
    const batchSize = 3;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(item => {
          if (item.type === 'video') {
            return preloadVideo(item.id, item.src);
          } else {
            return preloadImage(item.id, item.src);
          }
        })
      );
      
      setPreloadProgress(((i + batchSize) / items.length) * 100);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsPreloading(false);
  };

  const isItemPreloaded = (id: string) => {
    const item = preloadedItems.find(item => item.id === id);
    return item?.loaded || false;
  };

  const getPreloadStatus = () => {
    const total = preloadedItems.length;
    const loaded = preloadedItems.filter(item => item.loaded).length;
    const errors = preloadedItems.filter(item => item.error).length;
    
    return {
      total,
      loaded,
      errors,
      progress: total > 0 ? (loaded / total) * 100 : 0
    };
  };

  return {
    startPreloading,
    isItemPreloaded,
    isPreloading,
    preloadProgress,
    getPreloadStatus,
    preloadedItems
  };
}; 