/**
 * =========================================================================
 * WEDDING TURF DAY - MASTER CONFIGURATION
 * =========================================================================
 * ALL personal details, dates, venue info, story captions, jersey size chart,
 * and event text can be customized right here!
 *
 * Simply edit the values below to update the entire invitation website.
 */

export const config = {
  // Couple Information
  couple: {
    brideName: "Ananya",
    groomName: "Rohan",
    brideNickname: "The Spin Queen",
    groomNickname: "The Power Hitter",
    hashtag: "#AnanyaBowledRohan",
    tagline: "Before the vows, let's settle the score on the pitch! 🏏✨",
    heroSubtitle: "A relaxed, fun-filled pre-wedding cricket face-off, tug-of-war, and dinner under the floodlights.",
    heroImage: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=80",
    ringPhoto: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
  },

  // Event Dates & Timings (Guests can pick one preferred date)
  dates: [
    {
      id: "2026-01-28",
      shortDate: "Jan 28",
      fullDate: "Wednesday, Jan 28, 2026",
      dayName: "Wednesday",
      time: "5:00 PM – 8:00 PM",
      label: "Jan 28 (Wed)",
      isoTimestamp: "2026-01-28T17:00:00",
    },
    {
      id: "2026-01-29",
      shortDate: "Jan 29",
      fullDate: "Thursday, Jan 29, 2026",
      dayName: "Thursday",
      time: "5:00 PM – 8:00 PM",
      label: "Jan 29 (Thu)",
      isoTimestamp: "2026-01-29T17:00:00",
    },
  ],

  // Countdown target date (First event date)
  countdownTarget: "2026-01-28T17:00:00",

  // Venue Details
  venue: {
    name: "Kick-Off Arena & Cricket Turf",
    shortLocation: "Bandra West, Mumbai",
    address: "Off Linking Road, Next to St. Andrew's Grounds, Bandra West, Mumbai 400050",
    googleMapsUrl: "https://maps.google.com/?q=Bandra+West+Mumbai+Cricket+Turf",
    embedQuery: "Bandra West Mumbai",
    dressCode: "Athletic / Sneakers Chic (Custom jerseys will be provided!)",
    parkingNote: "Free parking and valet available at the venue gates.",
    turfType: "FIFA-grade all-weather turf with LED stadium floodlights",
  },

  // Teams Configuration (Team Bride vs Team Groom)
  teams: {
    bride: {
      id: "bride",
      name: "Team Bride",
      subtitle: "The Sassy Sixers & Spin Masters",
      captain: "Captain Ananya",
      colorName: "Rose Gold & Blush",
      primaryHex: "#e11d48", // rose-600
      secondaryHex: "#ffe4e6", // rose-100
      badgeGradient: "from-rose-500 to-pink-600",
      accentBg: "bg-rose-50 border-rose-200 text-rose-800",
      icon: "Crown", // Lucide icon
      motto: "Grace, glam, and clean boundary strokes!",
      jerseyDesign: "Rose pink sports mesh with golden squad numbers",
    },
    groom: {
      id: "groom",
      name: "Team Groom",
      subtitle: "The Power Hitters & Pace Attack",
      captain: "Captain Rohan",
      colorName: "Royal Cobalt & Navy",
      primaryHex: "#2563eb", // blue-600
      secondaryHex: "#dbeafe", // blue-100
      badgeGradient: "from-blue-600 to-indigo-700",
      accentBg: "bg-blue-50 border-blue-200 text-blue-800",
      icon: "Zap", // Lucide icon
      motto: "Maximum power, high energy, and no mercy on the pitch!",
      jerseyDesign: "Royal blue dri-fit with metallic white accents",
    },
  },

  // Evening Timeline
  timeline: [
    {
      step: 1,
      time: "5:00 PM",
      title: "Arrival & Jersey Handover",
      description: "Check in, collect your personalized match jersey, hydrate with fresh mocktails, and lace up your sneakers.",
      icon: "Shirt",
      highlight: false,
    },
    {
      step: 2,
      time: "5:45 PM",
      title: "The Big Clash: Team Bride vs Team Groom",
      description: "An electrifying 8-a-side box cricket match with umpire reviews, mystery powerplay overs, and sideline cheer squads!",
      icon: "Trophy",
      highlight: true,
    },
    {
      step: 3,
      time: "6:45 PM",
      title: "The Ultimate Tug-of-War",
      description: "Bride's side vs Groom's side on the center turf line! Raw strength, loud cheers, and eternal bragging rights.",
      icon: "Flame",
      highlight: false,
    },
    {
      step: 4,
      time: "7:15 PM",
      title: "Trophy Ceremony & Cake Cutting",
      description: "Crowing the Turf Champions, popping confetti, cutting the celebratory turf cake, and clicking squad pictures.",
      icon: "Cake",
      highlight: false,
    },
    {
      step: 5,
      time: "7:30 PM",
      title: "Dinner & Post-Match Chill",
      description: "Gourmet food stations, sliders, live chaat, woodfired bites, music, and chilling out as the wedding week begins.",
      icon: "Utensils",
      highlight: false,
    },
  ],

  // Hidden, easy-to-enable "Surprise Segment"
  // Toggle enabled to TRUE whenever the bride & groom decide the surprise function!
  surpriseSegment: {
    enabled: false, // Set to true to automatically insert this into the timeline
    positionAfterStep: 3, // Shows right after Tug-of-War
    time: "7:00 PM",
    title: "Surprise Sangeet Teaser & Dance Battle 💃🕺",
    description: "An impromptu 10-minute flashmob & dance face-off before we head to the cake!",
    icon: "Sparkles",
  },

  // Jersey Size Chart (Measurements in cm)
  jerseySizeChart: [
    { size: "XS", chest: 86, length: 64, shoulder: 40 },
    { size: "S", chest: 91, length: 66, shoulder: 42 },
    { size: "M", chest: 97, length: 69, shoulder: 44 },
    { size: "L", chest: 102, length: 71, shoulder: 46 },
    { size: "XL", chest: 107, length: 74, shoulder: 48 },
    { size: "XXL", chest: 112, length: 76, shoulder: 50 },
    { size: "3XL", chest: 117, length: 78, shoulder: 52 },
  ],

  // "Our Story" Photo Gallery with Moments & Captions
  gallery: [
    {
      id: 1,
      title: "Where It All Started",
      caption: "Met at a college sports fest 6 years ago — Rohan tried to bowl Ananya out, and she hit him for a 6 over long-on!",
      image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80",
      tag: "First Encounter",
    },
    {
      id: 2,
      title: "Sunday Box Cricket Sundays",
      caption: "Countless weekend matches where rivalries were born and post-match chai bonded us for life.",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80",
      tag: "Turf Memories",
    },
    {
      id: 3,
      title: "The Sunset Proposal",
      caption: "Under the golden sky in Goa, Rohan bent the knee with the ring hidden inside a mini cricket ball.",
      image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80",
      tag: "She Said Yes!",
    },
    {
      id: 4,
      title: "Ready for the Big Match",
      caption: "Before the sherwanis and lehengas, we just want to jump into jerseys and play our hearts out with you all!",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
      tag: "Turf Day Countdown",
    },
  ],

  // Organizers Contact Info (Footer)
  contacts: [
    {
      role: "Team Bride Manager",
      name: "Pooja (Bride's Sister)",
      phone: "+91 98765 43210",
      whatsapp: "919876543210",
    },
    {
      role: "Team Groom Captain Assistant",
      name: "Kabir (Groom's Best Friend)",
      phone: "+91 91234 56789",
      whatsapp: "919123456789",
    },
  ],

  // WhatsApp Share invitation message template
  whatsAppInviteText: "Hey! 🏏✨ Join us for Ananya & Rohan's Pre-Wedding Turf Day! We're having an epic cricket clash, custom jerseys, tug-of-war, and dinner before the wedding. Pick your team and RSVP here: ",
};
