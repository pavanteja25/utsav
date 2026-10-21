'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import staticImages from '../images.json';
import {
  fetchSiteSettings,
  fetchCategories,
  fetchGalleryImages,
  fetchTestimonials,
  isSupabaseConfigured,
} from '../lib/supabase';

const CACHE_KEY = 'utsav_dynamic_content_v3';
const CACHE_TIMESTAMP_KEY = 'utsav_cache_timestamp';

// Default initial state (used before any cache or database sync)
const defaultSiteSettings = {
  hero_image: '/images/hero-wedding-garden.webp',
  hero_image_alt: 'Ivory floral wedding mandap beside a lake in the warm evening light',
  hero_eyebrow: 'EVENT PLANNING & DESIGN · INDIA',
  hero_title: 'Moments\nthat stay\nforever.',
  hero_description: 'Thoughtfully planned. Beautifully designed.\nWe turn your special moments into unforgettable memories.',
  story_image_1: '/images/event-100.jpg',
  story_image_2: '/images/event-101.jpg',
  about_image: '/images/event-109.jpg',
  contact_image: '/images/wedding-day-decor/wedding-day-decor-01.jpeg',
  admin_passcode: 'utsav2026',
  updated_at: '2026-01-01T00:00:00Z',
};

const defaultCategories = [
  {
    slug: 'wedding-decor',
    title: 'Wedding Decor',
    parent_slug: null,
    description: 'From intimate pre-wedding rituals to grand mandaps, every setting honours your traditions and tells your love story.',
    cover_image: '/images/wedding-day-decor/wedding-day-decor-01.jpeg',
    cover_alt: 'Sunlit courtyard entrance arch with scalloped frame and hanging floral bells',
    display_order: 1,
  },
  {
    slug: 'birthday-decor',
    title: 'Birthday Decor',
    parent_slug: null,
    description: 'A little wonder, a lot of joy. Thoughtful themes, custom backdrops, artistic floral installations and vibrant celebratory touches.',
    cover_image: '/images/birthday-decor/birthday-01.jpeg',
    cover_alt: 'Enchanted pastel fairytale birthday celebration with floral plinths and personalized signage',
    display_order: 2,
  },
  {
    slug: 'traditional-celebrations',
    title: 'Traditional Celebrations',
    parent_slug: null,
    description: 'From Sankranti and Ugadi to Diwali and sacred rituals, celebrating the rich colours, fragrant marigolds, and sacred togetherness of our heritage.',
    cover_image: '/images/traditional-celebrations/traditional-01.jpeg',
    cover_alt: 'Heritage brass swing cradle ceremony adorned with lotus buds and marigolds',
    display_order: 3,
  },
  {
    slug: 'house-celebrations',
    title: 'House Celebrations',
    parent_slug: null,
    description: 'The warmth of home, thoughtfully celebrated. Intimate poojas, housewarming ceremonies, and beautiful family gatherings.',
    cover_image: '/images/house-celebrations/house-01.jpeg',
    cover_alt: 'Intimate home pooja and housewarming setup with brass pestle, mortar, and floral grinding stones',
    display_order: 4,
  },
  // Subcategories
  {
    slug: 'wedding-day-decor',
    title: 'Wedding Day Decor',
    parent_slug: 'wedding-decor',
    description: 'From the mandap to the smallest table detail, a setting that honours your traditions and tells your story.',
    cover_image: '/images/wedding-day-decor/wedding-day-decor-01.jpeg',
    cover_alt: 'Wedding Day Decor',
    display_order: 1,
  },
  {
    slug: 'engagement',
    title: 'Engagement',
    parent_slug: 'wedding-decor',
    description: 'The first promise deserves a beautiful setting. Bespoke floral backdrops, intimate seating, and a celebration that feels like you.',
    cover_image: '/images/event-112.jpg',
    cover_alt: 'Engagement Decor',
    display_order: 2,
  },
  {
    slug: 'reception',
    title: 'Reception',
    parent_slug: 'wedding-decor',
    description: 'Grand stages, enchanting ambient lighting, and opulent floral statements to celebrate your new beginning with everyone you cherish.',
    cover_image: '/images/event-103.jpg',
    cover_alt: 'Reception Decor',
    display_order: 3,
  },
  {
    slug: 'pellikoduku-pellikuthuru',
    title: 'Pellikoduku & Pellikuthuru',
    parent_slug: 'wedding-decor',
    description: 'Honouring the bride and groom’s sacred new beginnings with rich Telugu traditions, fragrant flowers, and the warmth of family.',
    cover_image: '/images/event-106.jpg',
    cover_alt: 'Telugu Wedding Traditions Decor',
    display_order: 4,
  },
  {
    slug: 'haldi',
    title: 'Haldi',
    parent_slug: 'wedding-decor',
    description: 'Sunshine, marigolds and a little mischief. A bright, playful setting for your happiest pre-wedding moments.',
    cover_image: '/images/event-105.jpg',
    cover_alt: 'Haldi Ceremony Decor',
    display_order: 5,
  },
  {
    slug: 'mehendi',
    title: 'Mehendi',
    parent_slug: 'wedding-decor',
    description: 'Vibrant hues, fragrant henna, and playful festivities. A celebratory setting adorned with floral swings, colorful drapes, and joyful energy.',
    cover_image: '/images/event-104.jpg',
    cover_alt: 'Mehendi Decor',
    display_order: 6,
  },
  {
    slug: 'sangeeth',
    title: 'Sangeeth',
    parent_slug: 'wedding-decor',
    description: 'A stage for your favourite people and your favourite songs. Rich colours, glowing lights and an unforgettable evening.',
    cover_image: '/images/event-102.jpg',
    cover_alt: 'Sangeeth Night Decor',
    display_order: 7,
  },
];

const defaultTestimonials = [
  {
    id: 'test-1',
    client_name: 'Ananya & Karthik',
    event_type: 'Wedding',
    quote: 'Every little detail felt like us. The colours, the flowers, the entire feeling — simply beautiful.',
    rating: 5,
    is_visible: true,
    display_order: 1,
  },
  {
    id: 'test-2',
    client_name: 'Srinivas Rao Family',
    event_type: 'Family celebration',
    quote: 'Our traditions were at the heart of everything. It felt warm, personal and wonderfully effortless.',
    rating: 5,
    is_visible: true,
    display_order: 2,
  },
  {
    id: 'test-3',
    client_name: 'Deepika & Rohit',
    event_type: 'Engagement',
    quote: 'From the first idea to the final candle, our celebration came together so thoughtfully.',
    rating: 5,
    is_visible: true,
    display_order: 3,
  },
];

const ContentContext = createContext(null);

// Synchronously load cache from localStorage during component initialization
function getSynchronousCachedContent() {
  if (typeof window === 'undefined') {
    return {
      siteSettings: defaultSiteSettings,
      categories: defaultCategories,
      testimonials: defaultTestimonials,
      dynamicGallery: {},
      isHydratedFromCache: false,
    };
  }

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.siteSettings) {
        return {
          siteSettings: { ...defaultSiteSettings, ...parsed.siteSettings },
          categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : defaultCategories,
          testimonials: parsed.testimonials && parsed.testimonials.length > 0 ? parsed.testimonials : defaultTestimonials,
          dynamicGallery: parsed.dynamicGallery || {},
          isHydratedFromCache: true,
        };
      }
    }
  } catch (err) {
    console.warn('Utsav Content cache parse error:', err);
  }

  return {
    siteSettings: defaultSiteSettings,
    categories: defaultCategories,
    testimonials: defaultTestimonials,
    dynamicGallery: {},
    isHydratedFromCache: false,
  };
}

export function ContentProvider({ children }) {
  // Synchronous initialization prevents the 1-second flash of old images on hard refresh!
  const [content, setContent] = useState(getSynchronousCachedContent);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  // Sync with Supabase in background
  const refreshContent = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      const [settingsRes, categoriesRes, galleryRes, testimonialsRes] = await Promise.allSettled([
        fetchSiteSettings(),
        fetchCategories(),
        fetchGalleryImages(),
        fetchTestimonials(),
      ]);

      const newSettings = settingsRes.status === 'fulfilled' && settingsRes.value ? settingsRes.value : content.siteSettings;
      const newCategories = categoriesRes.status === 'fulfilled' && categoriesRes.value && categoriesRes.value.length > 0
        ? categoriesRes.value
        : content.categories;
      const newTestimonials = testimonialsRes.status === 'fulfilled' && testimonialsRes.value && testimonialsRes.value.length > 0
        ? testimonialsRes.value
        : content.testimonials;

      // Group gallery images by category_slug
      const newDynamicGallery = {};
      if (galleryRes.status === 'fulfilled' && Array.isArray(galleryRes.value)) {
        galleryRes.value.forEach(img => {
          if (!newDynamicGallery[img.category_slug]) {
            newDynamicGallery[img.category_slug] = [];
          }
          newDynamicGallery[img.category_slug].push({
            id: img.id,
            src: img.src,
            alt: img.alt || 'The Utsav House inspiration',
            caption: img.caption || '',
            display_order: img.display_order || 0,
            is_featured: img.is_featured,
          });
        });
      }

      const updatedPayload = {
        siteSettings: newSettings,
        categories: newCategories,
        testimonials: newTestimonials,
        dynamicGallery: newDynamicGallery,
        isHydratedFromCache: true,
      };

      setContent(updatedPayload);
      setLastSynced(new Date());

      // Save to localStorage for instant hydration on subsequent hard refreshes
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updatedPayload));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
      } catch (storageErr) {
        console.warn('Could not cache content in localStorage:', storageErr);
      }
    } catch (e) {
      console.warn('Error during content refresh:', e);
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  // Initial fetch on mount
  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  // Helper to fetch images for a category (falls back to static images.json if Supabase has none for that category)
  const getCategoryImages = useCallback((key) => {
    // 1. Check dynamic gallery first
    if (content.dynamicGallery && content.dynamicGallery[key] && content.dynamicGallery[key].length > 0) {
      return content.dynamicGallery[key];
    }

    // 2. Map aliases
    let staticKey = key;
    if (key === 'wedding-decor' || key === 'weddings') staticKey = 'wedding-day-decor';
    if (key === 'birthday-decor' || key === 'birthdays') staticKey = 'birthday-decor';
    if (key === 'pellikoduku' || key === 'pellikuthuru') staticKey = 'pellikoduku-pellikuthuru';

    // 3. Fallback to static images.json
    return staticImages[staticKey] || staticImages[key] || staticImages.weddings || [];
  }, [content.dynamicGallery]);

  // Helper to get category title
  const getCategoryTitle = useCallback((slug) => {
    const found = content.categories.find(c => c.slug === slug);
    if (found) return found.title;
    // Fallback format slug to title
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }, [content.categories]);

  // Helper to get category description
  const getCategoryDescription = useCallback((slug) => {
    const found = content.categories.find(c => c.slug === slug);
    return found?.description || '';
  }, [content.categories]);

  // Direct manual cache updater (e.g. immediately after admin saves)
  const setDirectContent = useCallback((updater) => {
    setContent(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('Error caching direct content:', err);
      }
      return next;
    });
  }, []);

  return (
    <ContentContext.Provider
      value={{
        siteSettings: content.siteSettings,
        categories: content.categories,
        testimonials: content.testimonials,
        dynamicGallery: content.dynamicGallery,
        isLoading,
        lastSynced,
        refreshContent,
        setDirectContent,
        getCategoryImages,
        getCategoryTitle,
        getCategoryDescription,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useUtsavContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useUtsavContent must be used within a ContentProvider');
  }
  return context;
}
