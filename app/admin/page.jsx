'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '../../src/admin.css';
import {
  getSupabase,
  isSupabaseConfigured,
  getSupabaseCredentials,
  uploadImageToSupabase,
  updateSiteSettings,
  upsertCategory,
  deleteCategory as apiDeleteCategory,
  addGalleryImage as apiAddGalleryImage,
  deleteGalleryImage as apiDeleteGalleryImage,
  upsertTestimonial,
  deleteTestimonial as apiDeleteTestimonial,
} from '../../src/lib/supabase';
import { useUtsavContent, ContentProvider } from '../../src/context/ContentContext';
import {
  Lock,
  LogOut,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  FolderTree,
  MessageSquareQuote,
  Upload,
  Trash2,
  Edit3,
  Plus,
  Check,
  AlertCircle,
  Database,
  Sparkles,
  Eye,
  Star,
  Instagram,
  Mail,
  Phone,
} from 'lucide-react';

function AdminDashboardInner() {
  const {
    siteSettings,
    categories,
    testimonials,
    dynamicGallery,
    refreshContent,
    setDirectContent,
    lastSynced,
  } = useUtsavContent();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('images'); // 'images', 'categories', 'gallery', 'testimonials', 'settings'
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [settingsForm, setSettingsForm] = useState(siteSettings);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
  const [gallerySearch, setGallerySearch] = useState('');
  
  // Category Gallery Modal & Lightbox
  const [viewingCategoryPhotos, setViewingCategoryPhotos] = useState(null);
  const [previewLightboxImg, setPreviewLightboxImg] = useState(null);
  
  // Category Edit / Add Modal
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Testimonial Modal
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);

  // Supabase Custom Config state
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');

  // Check existing session
  useEffect(() => {
    const sessionToken = localStorage.getItem('utsav_admin_session');
    if (sessionToken === 'authenticated') {
      setIsAuthenticated(true);
    }
    const creds = getSupabaseCredentials();
    if (creds.url) setCustomUrl(creds.url);
    if (creds.anonKey) setCustomKey(creds.anonKey);
  }, []);

  // Update settingsForm when siteSettings loads
  useEffect(() => {
    if (siteSettings) {
      setSettingsForm(siteSettings);
    }
  }, [siteSettings]);

  const showToast = (text, type = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const targetPass = siteSettings?.admin_passcode || process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'utsav2026';
    if (passcode.trim() === targetPass.trim()) {
      setIsAuthenticated(true);
      localStorage.setItem('utsav_admin_session', 'authenticated');
      setAuthError('');
    } else {
      setAuthError('Incorrect passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('utsav_admin_session');
  };

  // Upload helper for any image input
  const handleFileUpload = async (file, folder, onComplete) => {
    if (!file) return;
    try {
      setIsSaving(true);
      showToast('Uploading image to Supabase Storage...', 'info');
      const publicUrl = await uploadImageToSupabase(file, folder);
      onComplete(publicUrl);
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Image upload failed. Check Supabase credentials & bucket.', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  // 1. Save Website Images / Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (isSupabaseConfigured()) {
        const updated = await updateSiteSettings(settingsForm);
        setDirectContent((prev) => ({ ...prev, siteSettings: updated }));
      } else {
        // Fallback local update
        setDirectContent((prev) => ({ ...prev, siteSettings: settingsForm }));
      }
      showToast('Website images and text updated successfully!', 'success');
      refreshContent();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update settings', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Save / Add Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory?.title || !editingCategory?.slug) {
      showToast('Title and slug are required', 'danger');
      return;
    }
    try {
      setIsSaving(true);
      if (isSupabaseConfigured()) {
        await upsertCategory(editingCategory);
      }
      // Update local state immediately
      setDirectContent((prev) => {
        const existingIdx = prev.categories.findIndex((c) => c.slug === editingCategory.slug);
        let newCategories = [...prev.categories];
        if (existingIdx >= 0) {
          newCategories[existingIdx] = editingCategory;
        } else {
          newCategories.push(editingCategory);
        }
        return { ...prev, categories: newCategories };
      });
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      showToast('Category saved successfully!', 'success');
      refreshContent();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save category', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (slug) => {
    if (!confirm(`Are you sure you want to delete category "${slug}"?`)) return;
    try {
      setIsSaving(true);
      if (isSupabaseConfigured()) {
        await apiDeleteCategory(slug);
      }
      setDirectContent((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.slug !== slug),
      }));
      showToast('Category deleted', 'success');
      refreshContent();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to delete category', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Upload Gallery Image for Category
  const handleAddGalleryImage = async (file, customCategorySlug) => {
    if (!file) return;
    const targetSlug = customCategorySlug || (selectedCategorySlug === 'all' ? 'wedding-day-decor' : selectedCategorySlug);
    try {
      setIsSaving(true);
      showToast(`Uploading to "${targetSlug}" gallery...`, 'info');
      const publicUrl = await uploadImageToSupabase(file, `gallery/${targetSlug}`);
      const newImagePayload = {
        category_slug: targetSlug,
        src: publicUrl,
        alt: `${targetSlug} inspiration moment`,
        caption: '',
        display_order: 0,
        is_featured: false,
      };

      if (isSupabaseConfigured()) {
        await apiAddGalleryImage(newImagePayload);
      }

      setDirectContent((prev) => {
        const catImages = prev.dynamicGallery[targetSlug] || [];
        return {
          ...prev,
          dynamicGallery: {
            ...prev.dynamicGallery,
            [targetSlug]: [newImagePayload, ...catImages],
          },
        };
      });

      showToast('Image added to gallery!', 'success');
      refreshContent();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to upload gallery image', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGalleryImage = async (image) => {
    if (!confirm('Remove this image from category?')) return;
    try {
      setIsSaving(true);
      if (isSupabaseConfigured() && image.id) {
        await apiDeleteGalleryImage(image.id);
      }
      setDirectContent((prev) => {
        const catImages = prev.dynamicGallery[selectedCategorySlug] || [];
        return {
          ...prev,
          dynamicGallery: {
            ...prev.dynamicGallery,
            [selectedCategorySlug]: catImages.filter((img) => img.src !== image.src),
          },
        };
      });
      showToast('Image removed from category gallery', 'success');
      refreshContent();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to delete image', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Save / Add Testimonial
  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    if (!editingTestimonial?.quote || !editingTestimonial?.client_name) {
      showToast('Client name and review quote are required', 'danger');
      return;
    }
    try {
      setIsSaving(true);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(editingTestimonial.id);
      const payload = {
        ...editingTestimonial,
        id: isUuid ? editingTestimonial.id : undefined,
      };

      let saved = payload;
      if (isSupabaseConfigured()) {
        saved = await upsertTestimonial(payload);
      } else {
        saved = { ...payload, id: payload.id || `test-${Date.now()}` };
      }

      setDirectContent((prev) => {
        const existingIdx = prev.testimonials.findIndex((t) => t.id === saved.id);
        let newTestimonials = [...prev.testimonials];
        if (existingIdx >= 0) {
          newTestimonials[existingIdx] = saved;
        } else {
          newTestimonials.unshift(saved);
        }
        return { ...prev, testimonials: newTestimonials };
      });
      setIsTestimonialModalOpen(false);
      setEditingTestimonial(null);
      showToast('Testimonial saved!', 'success');
      refreshContent();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save testimonial', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      setIsSaving(true);
      if (isSupabaseConfigured()) {
        await apiDeleteTestimonial(id);
      }
      setDirectContent((prev) => ({
        ...prev,
        testimonials: prev.testimonials.filter((t) => t.id !== id),
      }));
      showToast('Testimonial deleted', 'success');
      refreshContent();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to delete testimonial', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Save Custom Supabase Credentials
  const handleSaveCredentials = (e) => {
    e.preventDefault();
    if (customUrl) localStorage.setItem('utsav_supabase_url', customUrl.trim());
    if (customKey) localStorage.setItem('utsav_supabase_key', customKey.trim());
    showToast('Supabase credentials saved in browser! Refreshing data...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  // -------------------------------------------------------------
  // RENDER: Passcode Login View (Passcode NOT exposed in UI)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-box">
          <div className="admin-logo-wrapper">
            <span className="logo-crop">
              <img src="/brand/logo-beige.webp" alt="The Utsav House" />
            </span>
          </div>
          <h1>Admin Studio</h1>
          <p>Please enter your passcode to access the website management console.</p>

          {authError && <div className="admin-error-msg">{authError}</div>}

          <form onSubmit={handleLogin}>
            <div className="admin-input-group">
              <label>Console Passcode</label>
              <input
                type="password"
                className="admin-input"
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                required
              />
            </div>
            <button type="submit" className="admin-login-btn">
              <Lock size={16} /> Enter Admin Console
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/" style={{ color: 'var(--admin-muted)', fontSize: '12px', textDecoration: 'underline' }}>
              &larr; Return to main website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Authenticated Dedicated Admin Console (NO PUBLIC HEADER/FOOTER)
  // -------------------------------------------------------------
  const currentCategoryImages = dynamicGallery[selectedCategorySlug] || [];

  return (
    <div className="admin-wrapper">
      {/* Dedicated Admin Header */}
      <header className="admin-header">
        <div className="admin-brand">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div className="admin-brand-logo-wrap">
              <span className="logo-crop">
                <img src="/brand/logo-beige.webp" alt="The Utsav House" />
              </span>
            </div>
          </Link>
          <h2 className="admin-brand-title">The Utsav House</h2>
          <span className="admin-badge">Admin Studio</span>
          {isSupabaseConfigured() ? (
            <span className="status-pill online">
              <Check size={12} /> Supabase Live
            </span>
          ) : (
            <span className="status-pill offline" title="Click 'Supabase Setup' to connect database">
              <AlertCircle size={12} /> Local Cache Mode
            </span>
          )}
        </div>

        <div className="admin-header-actions">
          <button
            className="admin-btn admin-btn-secondary"
            onClick={() => {
              refreshContent();
              showToast('Cache revalidated & refreshed!', 'success');
            }}
            title="Revalidate cache"
          >
            <RefreshCw size={13} />
            <span className="admin-btn-label-desktop">Refresh Cache</span>
            <span className="admin-btn-label-mobile">Refresh</span>
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-secondary"
            title="Open website in new tab"
          >
            <Eye size={13} />
            <span className="admin-btn-label-desktop">View Live Website</span>
            <span className="admin-btn-label-mobile">Live Site</span>
            <ExternalLink size={11} className="admin-btn-label-desktop" />
          </a>
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            onClick={handleLogout}
            title="Log out of admin studio"
          >
            <LogOut size={13} />
            <span className="admin-btn-label-desktop">Log Out</span>
            <span className="admin-btn-label-mobile">Logout</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          <ImageIcon size={16} /> Hero Banner & Social Handles
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <FolderTree size={16} /> Categories & Services
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <Upload size={16} /> Category Gallery Images
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`}
          onClick={() => setActiveTab('testimonials')}
        >
          <MessageSquareQuote size={16} /> Testimonials
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Database size={16} /> Supabase Setup & Passcode
        </button>
      </nav>

      {/* Feedback Toast */}
      {statusMessage.text && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '14px 22px',
            borderRadius: '10px',
            background:
              statusMessage.type === 'danger'
                ? '#c75240'
                : statusMessage.type === 'info'
                ? '#35482e'
                : '#2f693b',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {statusMessage.type === 'danger' ? <AlertCircle size={16} /> : <Check size={16} />}
          {statusMessage.text}
        </div>
      )}

      {/* Main Content Area */}
      <main className="admin-main">
        {/* ======================================================== */}
        {/* TAB 1: WEBSITE IMAGES & HERO */}
        {/* ======================================================== */}
        {activeTab === 'images' && (
          <form onSubmit={handleSaveSettings}>
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3>Hero Banner & Main Visuals</h3>
                  <p>
                    Change the prominent hero image and section images across the website. Changes
                    reflect instantly with anti-flicker cache.
                  </p>
                </div>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={isSaving}>
                  <Check size={14} /> Save All Changes
                </button>
              </div>

              <div className="admin-form-grid">
                {/* Hero Banner Image */}
                <div className="admin-form-col-full">
                  <div className="admin-input-group">
                    <label>Main Hero Banner Image</label>
                    <div className="admin-input-upload-row">
                      <input
                        type="text"
                        className="admin-input"
                        value={settingsForm.hero_image || ''}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, hero_image: e.target.value })
                        }
                        placeholder="Image URL or upload file"
                      />
                      <label className="admin-btn admin-btn-secondary" style={{ cursor: 'pointer' }}>
                        <Upload size={14} /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) =>
                            handleFileUpload(e.target.files[0], 'hero', (url) =>
                              setSettingsForm({ ...settingsForm, hero_image: url })
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="image-preview-card" style={{ maxHeight: '280px' }}>
                      <img src={settingsForm.hero_image} alt="Hero preview" />
                    </div>
                  </div>
                </div>

                {/* Hero Title & Texts */}
                <div className="admin-input-group">
                  <label>Hero Eyebrow</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settingsForm.hero_eyebrow || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, hero_eyebrow: e.target.value })
                    }
                  />
                </div>

                <div className="admin-input-group">
                  <label>Hero Title</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settingsForm.hero_title || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, hero_title: e.target.value })
                    }
                  />
                </div>

                <div className="admin-form-col-full admin-input-group">
                  <label>Hero Subtitle / Description</label>
                  <textarea
                    className="admin-input admin-textarea"
                    value={settingsForm.hero_description || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, hero_description: e.target.value })
                    }
                  />
                </div>

                {/* Social Media & Contact IDs Section */}
                <div className="admin-form-col-full" style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '24px', marginTop: '12px' }}>
                  <h4 style={{ color: 'var(--admin-gold)', fontSize: '15px', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Instagram size={17} /> Social Media Handles & Contact Information
                  </h4>
                  <p style={{ color: 'var(--admin-muted)', fontSize: '12px', margin: '0 0 16px' }}>
                    These handles and numbers are dynamically showcased next to their respective icons in the website footer and contact sections.
                  </p>
                </div>

                <div className="admin-input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Instagram size={14} color="#ceb88e" /> Instagram Handle / Display Name
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settingsForm.instagram_handle || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, instagram_handle: e.target.value })
                    }
                    placeholder="@the_utsavhouse"
                  />
                </div>

                <div className="admin-input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ExternalLink size={14} color="#ceb88e" /> Instagram Profile URL
                  </label>
                  <input
                    type="url"
                    className="admin-input"
                    value={settingsForm.instagram_url || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, instagram_url: e.target.value })
                    }
                    placeholder="https://www.instagram.com/the_utsavhouse/"
                  />
                </div>

                <div className="admin-input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} color="#ceb88e" /> Official Email Address
                  </label>
                  <input
                    type="email"
                    className="admin-input"
                    value={settingsForm.email_address || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, email_address: e.target.value })
                    }
                    placeholder="theutsavhouse@gmail.com"
                  />
                </div>

                <div className="admin-input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="#ceb88e" /> Primary Phone Number
                  </label>
                  <input
                    type="tel"
                    className="admin-input"
                    value={settingsForm.phone_primary || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, phone_primary: e.target.value })
                    }
                    placeholder="+91 96768 37722"
                  />
                </div>

                <div className="admin-input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="#ceb88e" /> Secondary Phone Number
                  </label>
                  <input
                    type="tel"
                    className="admin-input"
                    value={settingsForm.phone_secondary || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, phone_secondary: e.target.value })
                    }
                    placeholder="+91 96768 47722"
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CATEGORIES & SERVICES */}
        {/* ======================================================== */}
        {activeTab === 'categories' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>Categories & Celebration Services</h3>
                <p>
                  Manage event categories, rename category titles, update descriptions, and replace cover
                  images.
                </p>
              </div>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  setEditingCategory({
                    slug: '',
                    title: '',
                    parent_slug: null,
                    description: '',
                    cover_image: '/images/hero-wedding-garden.webp',
                    display_order: categories.length + 1,
                  });
                  setIsCategoryModalOpen(true);
                }}
              >
                <Plus size={14} /> Add New Category
              </button>
            </div>

            <div className="categories-list">
              {categories.map((cat) => {
                const catPhotos = dynamicGallery[cat.slug] || [];
                return (
                  <div key={cat.slug} className="category-item-card">
                    <div className="category-item-thumb">
                      <img src={cat.cover_image || '/images/hero-wedding-garden.webp'} alt={cat.title} />
                      {cat.parent_slug && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: 'rgba(20,27,19,0.85)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '10px',
                            color: 'var(--admin-gold)',
                            border: '1px solid var(--admin-card-border)',
                          }}
                        >
                          Subcategory of: {cat.parent_slug}
                        </span>
                      )}
                    </div>
                    <div className="category-item-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>{cat.title}</h4>
                        <span className="category-photo-badge" style={{ margin: 0 }}>
                          <ImageIcon size={11} /> {catPhotos.length} Photos
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--admin-gold)', margin: '4px 0 8px' }}>
                        Slug: <code>{cat.slug}</code>
                      </span>
                      <p>{cat.description || 'No description added.'}</p>

                      {/* Photo Thumbnail Strip */}
                      {catPhotos.length > 0 && (
                        <div className="category-photo-strip">
                          {catPhotos.slice(0, 4).map((p, idx) => (
                            <div key={p.id || idx} className="category-photo-strip-thumb">
                              <img src={p.src} alt={p.alt} />
                            </div>
                          ))}
                          {catPhotos.length > 4 && (
                            <div className="category-photo-strip-more">
                              +{catPhotos.length - 4}
                            </div>
                          )}
                        </div>
                      )}

                      {/* View & Manage Photos Button */}
                      <button
                        type="button"
                        className="category-view-photos-btn"
                        onClick={() => {
                          setSelectedCategorySlug(cat.slug);
                          setViewingCategoryPhotos(cat);
                        }}
                      >
                        <Eye size={13} /> View & Manage All {catPhotos.length} Photos
                      </button>

                      <div className="category-item-actions">
                        <button
                          className="admin-btn admin-btn-secondary"
                          style={{ flex: 1 }}
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsCategoryModalOpen(true);
                          }}
                        >
                          <Edit3 size={13} /> Edit Category
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleDeleteCategory(cat.slug)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CATEGORY GALLERY IMAGES */}
        {/* ======================================================== */}
        {activeTab === 'gallery' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>Master Media & Gallery Library</h3>
                <p>
                  Browse all 400+ celebration photos or filter by specific category. Upload new photos to any category.
                </p>
              </div>
              <div className="admin-gallery-search-wrap">
                <input
                  type="text"
                  className="admin-input admin-gallery-search-input"
                  placeholder="Search photos..."
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter Chips Bar */}
            <div className="gallery-filter-chips">
              <button
                type="button"
                className={`gallery-filter-chip ${selectedCategorySlug === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategorySlug('all')}
              >
                🌟 All Photos ({Object.values(dynamicGallery).reduce((acc, curr) => acc + curr.length, 0)})
              </button>
              {categories.map((c) => {
                const count = (dynamicGallery[c.slug] || []).length;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    className={`gallery-filter-chip ${selectedCategorySlug === c.slug ? 'active' : ''}`}
                    onClick={() => setSelectedCategorySlug(c.slug)}
                  >
                    {c.title} ({count})
                  </button>
                );
              })}
            </div>

            {/* Direct Upload Dropzone */}
            <label className="image-upload-dropzone" style={{ display: 'block', marginBottom: '28px' }}>
              <Upload size={32} style={{ color: 'var(--admin-gold)', margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-cream)' }}>
                Click or Drop Image to Upload to &ldquo;{selectedCategorySlug === 'all' ? 'wedding-day-decor' : selectedCategorySlug}&rdquo;
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--admin-muted)' }}>
                Directly uploads to Supabase Storage (<code style={{ color: 'var(--admin-gold)' }}>utsav-media</code>)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const targetCategory = selectedCategorySlug === 'all' ? 'wedding-day-decor' : selectedCategorySlug;
                    handleAddGalleryImage(e.target.files[0], targetCategory);
                  }
                }}
              />
            </label>

            {/* Computed Filtered Images */}
            {(() => {
              const allPhotos = Object.entries(dynamicGallery).flatMap(([catSlug, imgs]) =>
                imgs.map((img) => ({ ...img, category_slug: img.category_slug || catSlug }))
              );
              const list = (selectedCategorySlug === 'all' ? allPhotos : dynamicGallery[selectedCategorySlug] || []).filter(
                (img) => {
                  if (!gallerySearch.trim()) return true;
                  const q = gallerySearch.toLowerCase();
                  return (
                    (img.alt && img.alt.toLowerCase().includes(q)) ||
                    (img.category_slug && img.category_slug.toLowerCase().includes(q))
                  );
                }
              );

              return (
                <>
                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: 'var(--admin-gold)', fontSize: '16px' }}>
                      Showing {list.length} {selectedCategorySlug === 'all' ? 'Total Photos across All Categories' : `Photos for "${selectedCategorySlug}"`}
                    </h4>
                  </div>

                  {list.length === 0 ? (
                    <div
                      style={{
                        padding: '48px',
                        textAlign: 'center',
                        background: 'rgba(20,27,19,0.5)',
                        borderRadius: '12px',
                        border: '1px dashed var(--admin-border)',
                      }}
                    >
                      <ImageIcon size={36} style={{ color: 'var(--admin-muted)', marginBottom: '8px' }} />
                      <p style={{ margin: 0, color: 'var(--admin-muted)', fontSize: '13px' }}>
                        No photos found matching your filter.
                      </p>
                    </div>
                  ) : (
                    <div className="admin-gallery-grid">
                      {list.map((img, idx) => (
                        <div key={img.id || idx} className="admin-gallery-card">
                          <img src={img.src} alt={img.alt} />
                          <div className="admin-gallery-card-overlay">
                            <div>
                              <span
                                style={{
                                  fontSize: '10px',
                                  color: 'var(--admin-gold)',
                                  background: 'rgba(0,0,0,0.7)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  display: 'inline-block',
                                  marginBottom: '4px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                }}
                              >
                                {img.category_slug}
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: '#fff',
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {img.alt || 'Category Image'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => setPreviewLightboxImg(img)}
                                title="Enlarge photo"
                              >
                                <Eye size={12} />
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn-danger"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => handleDeleteGalleryImage(img)}
                                title="Delete image"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: TESTIMONIALS */}
        {/* ======================================================== */}
        {activeTab === 'testimonials' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>Client Testimonials & Kind Words</h3>
                <p>Add client reviews, specify event types, and feature them on the website marquee.</p>
              </div>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  setEditingTestimonial({
                    id: '',
                    client_name: '',
                    event_type: 'Wedding',
                    quote: '',
                    rating: 5,
                    is_visible: true,
                    display_order: testimonials.length + 1,
                  });
                  setIsTestimonialModalOpen(true);
                }}
              >
                <Plus size={14} /> Add Testimonial
              </button>
            </div>

            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Event Type</th>
                    <th>Review Quote</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.client_name}</td>
                      <td>
                        <span
                          style={{
                            background: 'rgba(203,179,135,0.15)',
                            color: 'var(--admin-gold)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                          }}
                        >
                          {t.event_type}
                        </span>
                      </td>
                      <td style={{ maxWidth: '380px', color: 'var(--admin-muted)' }}>
                        &ldquo;{t.quote}&rdquo;
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '2px', color: 'var(--admin-gold)' }}>
                          {[...Array(t.rating || 5)].map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" />
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${t.is_visible !== false ? 'online' : 'offline'}`}>
                          {t.is_visible !== false ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 10px' }}
                            onClick={() => {
                              setEditingTestimonial(t);
                              setIsTestimonialModalOpen(true);
                            }}
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 10px' }}
                            onClick={() => handleDeleteTestimonial(t.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SUPABASE SETUP & PASSCODE */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>Supabase Database Configuration & Security</h3>
                <p>
                  Configure your Supabase Project URL and Anon Key directly here, or set them in{' '}
                  <code>.env.local</code>.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCredentials} style={{ marginBottom: '36px' }}>
              <div className="admin-form-grid">
                <div className="admin-input-group">
                  <label>Supabase Project URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://xyzcompany.supabase.co"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--admin-muted)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                    Found in Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project URL
                  </small>
                </div>

                <div className="admin-input-group">
                  <label>Supabase Anon Public API Key</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="eyJhbGciOi..."
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--admin-muted)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                    Found in Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API keys (anon/public)
                  </small>
                </div>

                <div className="admin-form-col-full">
                  <button type="submit" className="admin-btn admin-btn-primary">
                    <Database size={14} /> Save Supabase Connection Keys
                  </button>
                </div>
              </div>
            </form>

            <div
              style={{
                borderTop: '1px solid var(--admin-border)',
                paddingTop: '28px',
                marginTop: '28px',
              }}
            >
              <h4 style={{ color: 'var(--admin-gold)', margin: '0 0 12px' }}>
                Change Admin Login Passcode
              </h4>
              <p style={{ color: 'var(--admin-muted)', fontSize: '12px', marginBottom: '16px' }}>
                Update the secret passcode used to access this admin panel.
              </p>
              <div className="admin-passcode-row">
                <input
                  type="password"
                  className="admin-input"
                  value={settingsForm.admin_passcode || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, admin_passcode: e.target.value })
                  }
                  placeholder="New passcode"
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={async () => {
                    try {
                      if (isSupabaseConfigured()) {
                        await updateSiteSettings(settingsForm);
                      }
                      setDirectContent((prev) => ({ ...prev, siteSettings: settingsForm }));
                      showToast('Passcode updated!', 'success');
                    } catch (e) {
                      showToast('Failed to update passcode', 'danger');
                    }
                  }}
                >
                  Update Passcode
                </button>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--admin-border)',
                paddingTop: '28px',
                marginTop: '28px',
              }}
            >
              <h4 style={{ color: 'var(--admin-gold)', margin: '0 0 8px' }}>
                Database Schema Script
              </h4>
              <p style={{ color: 'var(--admin-muted)', fontSize: '12px' }}>
                The database schema file is ready at{' '}
                <code style={{ color: 'var(--admin-gold)' }}>supabase-schema.sql</code> in the project
                root. Run this in your Supabase SQL Editor to create all tables, storage bucket, and
                policies.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL: CATEGORY EDIT / ADD */}
      {/* ======================================================== */}
      {isCategoryModalOpen && editingCategory && (
        <div className="admin-modal-backdrop" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-card-header">
              <h3>{editingCategory.slug ? 'Edit Category' : 'Add New Category'}</h3>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="admin-input-group">
                <label>Category Title / Name</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingCategory.title || ''}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = editingCategory.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    setEditingCategory({ ...editingCategory, title, slug });
                  }}
                  required
                />
              </div>

              <div className="admin-input-group">
                <label>Category Slug (URL Identifier)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingCategory.slug || ''}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''),
                    })
                  }
                  required
                />
              </div>

              <div className="admin-input-group">
                <label>Parent Category (Optional - for subcategories)</label>
                <select
                  className="admin-input"
                  value={editingCategory.parent_slug || ''}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      parent_slug: e.target.value || null,
                    })
                  }
                >
                  <option value="">None (Top-Level Service)</option>
                  <option value="wedding-decor">Wedding Decor</option>
                  <option value="birthday-decor">Birthday Decor</option>
                  <option value="traditional-celebrations">Traditional Celebrations</option>
                  <option value="house-celebrations">House Celebrations</option>
                </select>
              </div>

              <div className="admin-input-group">
                <label>Description</label>
                <textarea
                  className="admin-input admin-textarea"
                  value={editingCategory.description || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                />
              </div>

              <div className="admin-input-group">
                <label>Cover Image</label>
                <div className="admin-input-upload-row">
                  <input
                    type="text"
                    className="admin-input"
                    value={editingCategory.cover_image || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, cover_image: e.target.value })
                    }
                  />
                  <label className="admin-btn admin-btn-secondary" style={{ cursor: 'pointer' }}>
                    <Upload size={14} /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) =>
                        handleFileUpload(e.target.files[0], 'categories', (url) =>
                          setEditingCategory({ ...editingCategory, cover_image: url })
                        )
                      }
                    />
                  </label>
                </div>
                {editingCategory.cover_image && (
                  <div className="image-preview-card" style={{ height: '160px' }}>
                    <img src={editingCategory.cover_image} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={isSaving}>
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TESTIMONIAL EDIT / ADD */}
      {/* ======================================================== */}
      {isTestimonialModalOpen && editingTestimonial && (
        <div className="admin-modal-backdrop" onClick={() => setIsTestimonialModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-card-header">
              <h3>{editingTestimonial.id ? 'Edit Testimonial' : 'Add Client Testimonial'}</h3>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setIsTestimonialModalOpen(false)}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial}>
              <div className="admin-input-group">
                <label>Client Name / Family</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Ananya & Karthik"
                  value={editingTestimonial.client_name || ''}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, client_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="admin-input-group">
                <label>Event Type</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Wedding, Reception, Haldi"
                  value={editingTestimonial.event_type || ''}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, event_type: e.target.value })
                  }
                  required
                />
              </div>

              <div className="admin-input-group">
                <label>Client Quote / Review</label>
                <textarea
                  className="admin-input admin-textarea"
                  placeholder="Share their words about The Utsav House..."
                  value={editingTestimonial.quote || ''}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })
                  }
                  required
                />
              </div>

              <div className="admin-input-group">
                <label>Star Rating (1 - 5)</label>
                <select
                  className="admin-input"
                  value={editingTestimonial.rating || 5}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, rating: Number(e.target.value) })
                  }
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                </select>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setIsTestimonialModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={isSaving}>
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* MODAL: VIEW ALL CATEGORY PHOTOS */}
      {/* ======================================================== */}
      {viewingCategoryPhotos && (
        <div className="admin-modal-backdrop" onClick={() => setViewingCategoryPhotos(null)}>
          <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-card-header">
              <div>
                <h3>{viewingCategoryPhotos.title} · Photo Gallery</h3>
                <p>
                  {(dynamicGallery[viewingCategoryPhotos.slug] || []).length} photos in this category. You can upload new photos or delete existing ones.
                </p>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setViewingCategoryPhotos(null)}
              >
                Close Gallery
              </button>
            </div>

            {/* Direct Dropzone inside this category */}
            <label className="image-upload-dropzone" style={{ display: 'block', marginBottom: '24px' }}>
              <Upload size={28} style={{ color: 'var(--admin-gold)', margin: '0 auto 6px' }} />
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-cream)' }}>
                Click or Drop Image to Upload to &ldquo;{viewingCategoryPhotos.title}&rdquo;
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAddGalleryImage(e.target.files[0], viewingCategoryPhotos.slug);
                  }
                }}
              />
            </label>

            {/* Grid of all photos */}
            <div className="admin-gallery-grid">
              {(dynamicGallery[viewingCategoryPhotos.slug] || []).map((img, idx) => (
                <div key={img.id || idx} className="admin-gallery-card">
                  <img src={img.src} alt={img.alt} />
                  <div className="admin-gallery-card-overlay">
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#fff',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {img.alt || 'Category Image'}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => setPreviewLightboxImg(img)}
                        title="Enlarge photo"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleDeleteGalleryImage(img)}
                        title="Delete image"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* LIGHTBOX PREVIEW MODAL */}
      {/* ======================================================== */}
      {previewLightboxImg && (
        <div className="admin-modal-backdrop" onClick={() => setPreviewLightboxImg(null)}>
          <div
            style={{
              maxWidth: '85vw',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewLightboxImg.src}
              alt={previewLightboxImg.alt}
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                borderRadius: '12px',
                border: '1px solid var(--admin-card-border)',
                objectFit: 'contain',
              }}
            />
            <div style={{ marginTop: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--admin-cream)' }}>
                {previewLightboxImg.alt || 'Preview'}
              </span>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setPreviewLightboxImg(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ContentProvider>
      <AdminDashboardInner />
    </ContentProvider>
  );
}
