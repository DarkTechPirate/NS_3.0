import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

const MemberDashboard = () => {
  const [declinedMatches, setDeclinedMatches] = useState([]);

  const matches = [
    {
      id: 1,
      name: "Rohan",
      age: 29,
      location: "Mumbai",
      height: "5'11\"",
      education: "MBA, Wharton School",
      profession: "Product Director",
      timeline: "Within 6–12 months",
      isVerified: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC89ut01yTgADvam3KjU8fg9T2nnF7-2SQtSBP-NAgbDSfGfnT56aJNeJLa9im3uGvEGDNOkpD9HA93bKXHj6JbPsYTMZWyndHs94HEjAa8aOTiGhOeg57fWTxv3b-fYjbhQ7e7ga7lyBhp4sn-6ZG6z6AexaIK_VGqAU3vG5ttMZWMKA9fy5Jcb1LURPDWEuLfxRHekXnJvRSMUkEctO5D0zoEUwt_cXMIVlJJAQLX5N1J1qPUikIi7Qo0IkHFhiOK73cCmm58s9Cx",
      tags: ["Vegetarian", "Values Family", "Hindi & English", "Non-Smoker"],
      whyThisMatch: [
        "Rohan shares your interest in sustainable living and mindful consumption.",
        "Both of you value a nuclear family setup while staying close to extended family.",
        "Similar professional ambitions with emphasis on work-life balance."
      ]
    },
    {
      id: 2,
      name: "Arjun",
      age: 31,
      location: "Bangalore",
      height: "6'0\"",
      education: "MS, Stanford University",
      profession: "Senior Architect",
      timeline: "Within 1 year",
      isVerified: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDesdToYoelRVZ59vCAJX-pBYamIhetumhG6CvQutaPYdFpcPmfwKcA4jqIRt9hO4RtJjHeJabTnNhcBZKI59dfxUfnievvczhNEgb48diu0UVYioLVa9QBtr1IZynuEbO5hJ_KvN8ElE5x_cyC1p06oBGdkUeNlGvZRlHGFnuCNaoiqYDVnYkZb_B6G_BLnFBk_b0e0gEzcSXXaS3n5BPGyeZ5W_rAojip2fKvFp-Wr8kAyPFrPx9Mv9ujN9o90gSGISY4T1sMqlNn",
      tags: ["Classical Music", "Outdoor Activities", "Non-Smoker", "Moderate Drinker"],
      whyThisMatch: [
        "Arjun enjoys outdoor activities and hiking, aligning with your interests.",
        "Compatible career expectations with mutual respect for personal space.",
        "Shared appreciation for art and cultural experiences."
      ]
    },
    {
      id: 3,
      name: "Vikram",
      age: 30,
      location: "London, UK",
      height: "5'10\"",
      education: "PhD, Cambridge",
      profession: "Research Economist",
      timeline: "Within 6 months",
      isVerified: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDb69ocGE-dlZbZh3uhN5hCPhr51fhbqWaLiYq0gLz5rmJ7hdlsYruH2xgwoM3EYa73AnXbKSxSQ7E6SMGlt6wpsAv6R_mZGln5wN29yYTwMZA1m-gXYrrToKqv5nU9GpqbT_rbqgzk58b14MkH9YsTf-q2j2Blv3k-ZCOBpb6LEO8uD0sCUJMuxw4bTYl7KmGAqTRa2TAY2x1NkqoAGpauuyRb5u3jUazUzzSvMdyw-i0K0J1YopuVSCNRp-Qb5-Bcv0OxXzR0azcI",
      tags: ["Book Lover", "Eggetarian", "Open to Relocation", "Tamil & English"],
      whyThisMatch: [
        "Vikram comes from a family of academics, aligning with your educational values.",
        "Open to relocating to India, matching your preference to settle domestically.",
        "Shared love for literature and intellectual conversations."
      ]
    }
  ];

  const visibleMatches = matches.filter(m => !declinedMatches.includes(m.id));
  const remainingCount = visibleMatches.length;

  const handleDecline = (id) => {
    setDeclinedMatches([...declinedMatches, id]);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const options = { month: 'short', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
  };

  return (
    <div className="bg-[#FDFBF9] text-[#1a1a1a] font-display min-h-screen flex flex-col antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100">
        <div className="px-6 md:px-12 lg:px-20 mx-auto max-w-6xl h-16 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            <Link to="/dashboard" className="text-[#1a1a1a] text-sm font-semibold">My Matches</Link>
            <Link to="/family-view" className="text-stone-400 text-sm font-medium hover:text-stone-600 transition-colors">Family View</Link>
            <Link to="/messages" className="text-stone-400 text-sm font-medium hover:text-stone-600 transition-colors">Messages</Link>
            <Link to="/create-profile" className="text-stone-400 text-sm font-medium hover:text-stone-600 transition-colors">Profile</Link>
          </nav>
          <div className="flex items-center gap-4">
            <div 
              className="size-10 rounded-full bg-stone-200 bg-cover bg-center border-2 border-white shadow-sm"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD__-DD2CtOEJUgPG4WAHBPKWSmZLS3b0IGYVyAQ5OXGFMQA1C0z5McOmIy5OgdS3CmgyVp7pH9MBmGmwhA_A-4187fUaLY5caOy8Aa_vYAIiwp5_8xBKYat5FG0B6LLyURSU_nDQaTCD508N9jUcX8JimS4u4BBgf19wfYmGapvgHM19-QQcrJmpwBn4kF6XBauxYarkg4OhYcKA3WBqNTjEWkVf1N2zHrurNqujT675gbM_Nens5MzJelBsjul1yU545gexWerj8R')" }}
            ></div>
          </div>
        </div>
      </header>

      <main className="flex-grow px-6 md:px-12 lg:px-20 py-10 mx-auto w-full max-w-6xl">
        {/* Header Section */}
        <div className="mb-12">
          <p className="text-xs font-medium tracking-widest uppercase text-stone-400 mb-2">
            Weekly Selection – {getCurrentWeek()}
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1a1a1a] mb-4">
            {getGreeting()}, Sarah
          </h1>
          <p className="text-stone-500 text-base max-w-xl">
            Your personal concierge has curated these introductions based on your values and preferences.
          </p>
          
          {/* Subtle Status Indicators */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>Next selection in 3 days</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <span className="material-symbols-outlined text-base">group</span>
              <span>{remainingCount} {remainingCount === 1 ? 'match' : 'matches'} remaining</span>
            </div>
          </div>
        </div>

        {/* Match Cards */}
        <div className="flex flex-col gap-10">
          {visibleMatches.map((match) => (
            <article 
              key={match.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Photo Section */}
                <div className="relative w-full lg:w-[320px] shrink-0">
                  <div 
                    className="aspect-[4/5] lg:aspect-auto lg:h-full w-full bg-stone-100 bg-cover bg-center"
                    style={{ backgroundImage: `url('${match.image}')` }}
                  ></div>
                  {/* Verification Badge */}
                  {match.isVerified && (
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-[#1a1a1a] flex items-center gap-1.5 shadow-sm">
                      <span className="material-symbols-outlined text-sm text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      Verified
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-8 lg:p-10 flex flex-col">
                  {/* Profile Summary */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h2 className="text-2xl font-serif font-medium text-[#1a1a1a]">
                          {match.name}, {match.age}
                        </h2>
                        <p className="text-stone-500 mt-1">{match.location}</p>
                      </div>
                      <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border border-amber-100">
                        {match.timeline}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 mt-3">
                      {match.height && <span>{match.height}</span>}
                      <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                      <span>{match.education}</span>
                      <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                      <span>{match.profession}</span>
                    </div>
                  </div>

                  {/* Alignment Tags */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {match.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1.5 bg-stone-50 rounded-full text-sm text-stone-600 border border-stone-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Why This Match */}
                  <div className="bg-[#FDF8F5] rounded-xl p-6 mb-8 border border-orange-50">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">
                      Why This Match
                    </h3>
                    <ul className="space-y-3">
                      {match.whyThisMatch.map((reason, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-stone-600 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions - Strict Hierarchy */}
                  <div className="flex items-center gap-4 mt-auto pt-4">
                    {/* Primary CTA */}
                    <button className="flex-1 lg:flex-none h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-lg">favorite</span>
                      Express Interest
                    </button>
                    
                    {/* Secondary CTA */}
                    <Link 
                      to="/match-detail" 
                      className="flex-1 lg:flex-none h-12 px-6 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700 rounded-full font-medium text-sm transition-all flex items-center justify-center"
                    >
                      View Full Profile
                    </Link>
                    
                    {/* Tertiary Action - Decline */}
                    <button 
                      onClick={() => handleDecline(match.id)}
                      className="size-12 rounded-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-500 transition-all ml-auto lg:ml-0"
                      title="Pass"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {visibleMatches.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl text-stone-400">group</span>
            </div>
            <h2 className="text-xl font-serif font-medium text-[#1a1a1a] mb-2">No matches remaining</h2>
            <p className="text-stone-500 max-w-md mx-auto">
              You've reviewed all introductions for this week. Your next curated selection will arrive in 3 days.
            </p>
          </div>
        )}

        {/* Privacy Note */}
        {visibleMatches.length > 0 && (
          <div className="mt-16 text-center">
            <p className="text-sm text-stone-400 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">lock</span>
              Your profile is only visible to members you express interest in.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MemberDashboard;
