import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FaceOffBanner from './components/FaceOffBanner';
import Timeline from './components/Timeline';
import StoryGallery from './components/StoryGallery';
import RsvpForm from './components/RsvpForm';
import VenueSection from './components/VenueSection';
import Footer from './components/Footer';
import AdminView from './components/AdminView';
import RsvpSuccessModal from './components/RsvpSuccessModal';
import { subscribeToRsvps } from './services/db';

export default function App() {
  const [rsvps, setRsvps] = useState([]);
  const [activeView, setActiveView] = useState(() => {
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    if (hash === '#admin' || hash === '#/admin' || pathname === '/admin') {
      return 'admin';
    }
    return 'home';
  });

  const [preselectedTeam, setPreselectedTeam] = useState('bride');
  const [successModalData, setSuccessModalData] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Subscribe to real-time database (Firestore / Local fallback)
  useEffect(() => {
    const unsubscribe = subscribeToRsvps((list) => {
      setRsvps(list || []);
    });

    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash === '#/admin') {
        setActiveView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setActiveView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleNavigateToAdmin = () => {
    window.location.hash = 'admin';
    setActiveView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    window.location.hash = '';
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRsvpSuccess = (savedData) => {
    setSuccessModalData(savedData);
    setIsSuccessModalOpen(true);
  };

  // Render Admin View if on admin route
  if (activeView === 'admin') {
    return (
      <AdminView
        rsvps={rsvps}
        onBackToHome={handleBackToHome}
      />
    );
  }

  // Render Public Invitation Landing Page
  return (
    <div className="min-h-screen bg-festive-cream text-slate-800 font-sans selection:bg-turf-600 selection:text-white">
      {/* Navigation */}
      <Navbar
        onNavigateToAdmin={handleNavigateToAdmin}
        activeView={activeView}
      />

      {/* Main Sections */}
      <main>
        {/* Hero Section with Couple, Countdown & Dates */}
        <Hero />

        {/* Live Team Bride vs Team Groom Face-off & Real-time Squad Counter */}
        <FaceOffBanner
          rsvps={rsvps}
          onSelectTeam={(teamId) => setPreselectedTeam(teamId)}
        />

        {/* Evening Schedule & Visual Timeline */}
        <Timeline />

        {/* "Our Story" Photo Carousel & Lightbox */}
        <StoryGallery />

        {/* Mobile-first RSVP Wizard with Jersey Selector */}
        <RsvpForm
          initialTeam={preselectedTeam}
          onRsvpSuccess={handleRsvpSuccess}
          existingRsvps={rsvps}
        />

        {/* Venue, Turf Info & Google Maps link */}
        <VenueSection />
      </main>

      {/* Footer with Hashtag, Contacts, and Admin Link */}
      <Footer onNavigateToAdmin={handleNavigateToAdmin} />

      {/* Celebratory Post-RSVP Modal with Confetti & Ticket Pass */}
      <RsvpSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        rsvpData={successModalData}
        onEditAgain={() => {
          setIsSuccessModalOpen(false);
          const rsvpEl = document.getElementById('rsvp');
          if (rsvpEl) rsvpEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}
