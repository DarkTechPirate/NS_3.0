import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getMatches, updateFamilyReview } from '../services/api';

const FamilyViewMode = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [shortlisted, setShortlisted] = useState([]);
  const [notes, setNotes] = useState({});
  const [flagged, setFlagged] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const result = await getMatches();
      if (result.success) {
        setProfiles(result.matches);
        setShortlisted(result.matches.filter(m => m.familyShortlisted).map(m => m.id));
        setFlagged(result.matches.filter(m => m.familyFlagged).map(m => m.id));
        const initialNotes = {};
        result.matches.forEach(m => { if (m.familyNotes) initialNotes[m.id] = m.familyNotes; });
        setNotes(initialNotes);
      } else {
        setError(result.message || 'Failed to load profiles');
      }
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  const handleShortlist = (id) => {
    const newValue = !shortlisted.includes(id);
    setShortlisted(newValue ? [...shortlisted, id] : shortlisted.filter(i => i !== id));
    updateFamilyReview(id, { familyShortlisted: newValue });
  };

  const handleFlag = (id) => {
    const newValue = !flagged.includes(id);
    setFlagged(newValue ? [...flagged, id] : flagged.filter(i => i !== id));
    updateFamilyReview(id, { familyFlagged: newValue });
  };

  const handleNoteChange = (id, note) => {
    setNotes({ ...notes, [id]: note });
  };

  const handleNoteDone = (id) => {
    setActiveNoteId(null);
    updateFamilyReview(id, { familyNotes: notes[id] || '' });
  };

  return (
    <div className="bg-[#FDFBF9] text-[#1a1a1a] font-display min-h-screen flex flex-col antialiased">
      {/* Family Mode Banner - MANDATORY */}
      <div className="bg-stone-800 text-white py-3 px-6 text-center">
        <p className="text-sm font-medium flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base">family_restroom</span>
          Viewing in Family Mode — Final decisions are made by the profile owner.
        </p>
      </div>

      {/* Header */}
      <Header />

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="bg-white border-b border-stone-100 py-6 px-6 md:px-12 lg:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <select className="px-4 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-600 bg-white focus:outline-none focus:border-stone-400">
                <option>Community</option>
                <option>Brahmin</option>
                <option>Kshatriya</option>
                <option>Any</option>
              </select>
              <select className="px-4 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-600 bg-white focus:outline-none focus:border-stone-400">
                <option>Education</option>
                <option>Postgraduate</option>
                <option>Graduate</option>
                <option>Doctorate</option>
              </select>
              <select className="px-4 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-600 bg-white focus:outline-none focus:border-stone-400">
                <option>Location</option>
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Bangalore</option>
              </select>
              <select className="px-4 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-600 bg-white focus:outline-none focus:border-stone-400">
                <option>Family Structure</option>
                <option>Nuclear</option>
                <option>Joint</option>
                <option>Any</option>
              </select>
              <select className="px-4 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-600 bg-white focus:outline-none focus:border-stone-400">
                <option>Lifestyle</option>
                <option>Vegetarian</option>
                <option>Non-Vegetarian</option>
                <option>Eggetarian</option>
              </select>
              <button className="px-4 py-2.5 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors">
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow px-6 md:px-12 lg:px-20 py-10 mx-auto w-full max-w-6xl">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1a1a1a] mb-3">
            Family Review
          </h1>
          <p className="text-stone-500 text-base max-w-2xl">
            Review these profiles from a family and long-term perspective. You can shortlist, add notes, or flag profiles for discussion with the profile owner.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin mb-4"></div>
            <p className="text-stone-500">Loading profiles...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-stone-300 mb-4 block">error</span>
            <p className="text-stone-500">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && profiles.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-stone-300 mb-4 block">group</span>
            <p className="text-stone-500">No profiles to review yet. Check back later!</p>
          </div>
        )}

        {/* Profile Cards */}
        {!loading && !error && profiles.length > 0 && (
          <div className="flex flex-col gap-8">
            {profiles.map((profile) => (
              <article
                key={profile.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm border ${flagged.includes(profile.id)
                  ? 'border-amber-200'
                  : shortlisted.includes(profile.id)
                    ? 'border-green-200'
                    : 'border-stone-100'
                  }`}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Photo Section - Protected */}
                  <div className="relative w-full lg:w-[280px] shrink-0">
                    <div
                      className="aspect-[4/5] lg:aspect-auto lg:h-full w-full bg-stone-100 bg-cover bg-center"
                      style={{ backgroundImage: profile.image ? `url('${profile.image}')` : 'none' }}
                    >
                      {!profile.image && (
                        <div className="flex items-center justify-center h-full">
                          <span className="material-symbols-outlined text-6xl text-stone-300">person</span>
                        </div>
                      )}
                    </div>
                    {/* Photo Protection Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                    {/* Verification Badge */}
                    {profile.isVerified && (
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-[#1a1a1a] flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-sm text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        Verified
                      </div>
                    )}
                    {/* Shortlist/Flag Indicators */}
                    {shortlisted.includes(profile.id) && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Shortlisted
                      </div>
                    )}
                    {flagged.includes(profile.id) && (
                      <div className="absolute top-4 right-4 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Flagged
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-8 flex flex-col">
                    {/* Profile Overview */}
                    <div className="mb-6">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h2 className="text-xl font-serif font-medium text-[#1a1a1a]">
                          {profile.name}{profile.age ? `, ${profile.age}` : ''}
                        </h2>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${profile.compatibility === 'Strong'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : profile.compatibility === 'Moderate'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-stone-50 text-stone-600 border border-stone-200'
                          }`}>
                          {profile.compatibility || 'Developing'} Alignment
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
                        {profile.location && <span>{profile.location}</span>}
                        {profile.height && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                            <span>{profile.height}</span>
                          </>
                        )}
                        {profile.education && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                            <span>{profile.education}</span>
                          </>
                        )}
                      </div>
                      {profile.profession && (
                        <p className="text-sm text-stone-600 mt-2">{profile.profession}</p>
                      )}
                    </div>

                    {/* Family & Background - PROMINENT */}
                    {(profile.family?.father || profile.family?.mother || profile.family?.siblings) && (
                      <div className="bg-stone-50 rounded-xl p-5 mb-6 border border-stone-100">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">family_restroom</span>
                          Family Background
                        </h3>
                        <div className="space-y-2 text-sm">
                          {profile.family.father && (
                            <div className="flex">
                              <span className="text-stone-400 w-20 shrink-0">Father:</span>
                              <span className="text-stone-700">{profile.family.father}</span>
                            </div>
                          )}
                          {profile.family.mother && (
                            <div className="flex">
                              <span className="text-stone-400 w-20 shrink-0">Mother:</span>
                              <span className="text-stone-700">{profile.family.mother}</span>
                            </div>
                          )}
                          {profile.family.siblings && (
                            <div className="flex">
                              <span className="text-stone-400 w-20 shrink-0">Siblings:</span>
                              <span className="text-stone-700">{profile.family.siblings}</span>
                            </div>
                          )}
                          {profile.family.familyType && (
                            <div className="flex">
                              <span className="text-stone-400 w-20 shrink-0">Type:</span>
                              <span className="text-stone-700">{profile.family.familyType}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Two Column Layout */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* Why This Match - Family Framing */}
                      {profile.matchReasons && profile.matchReasons.length > 0 && (
                        <div className="bg-[#F8FAF8] rounded-xl p-5 border border-green-50">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                            Why This Match
                          </h3>
                          <ul className="space-y-2">
                            {profile.matchReasons.map((reason, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-stone-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Points for Discussion */}
                      {profile.considerations && profile.considerations.length > 0 && (
                        <div className="bg-[#FFFBF5] rounded-xl p-5 border border-amber-50">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                            Points for Discussion
                          </h3>
                          <ul className="space-y-3">
                            {profile.considerations.map((point, index) => (
                              <li key={index} className="text-sm">
                                <span className="font-medium text-stone-700">{point.topic}:</span>
                                <span className="text-stone-500 ml-1">{point.detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Private Notes */}
                    {activeNoteId === profile.id ? (
                      <div className="mb-6">
                        <textarea
                          className="w-full p-4 border border-stone-200 rounded-xl text-sm text-stone-700 resize-none focus:outline-none focus:border-stone-400"
                          rows={3}
                          placeholder="Add private notes about this profile..."
                          value={notes[profile.id] || ''}
                          onChange={(e) => handleNoteChange(profile.id, e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleNoteDone(profile.id)}
                            className="text-sm text-stone-500 hover:text-stone-700"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ) : notes[profile.id] && (
                      <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">Your Notes</h4>
                            <p className="text-sm text-stone-600">{notes[profile.id]}</p>
                          </div>
                          <button
                            onClick={() => setActiveNoteId(profile.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions - Family View Specific */}
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-stone-100">
                      {/* Shortlist / Recommend */}
                      <button
                        onClick={() => handleShortlist(profile.id)}
                        className={`h-11 px-5 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${shortlisted.includes(profile.id)
                          ? 'bg-green-500 text-white'
                          : 'border border-green-200 text-green-700 hover:bg-green-50'
                          }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {shortlisted.includes(profile.id) ? 'check' : 'bookmark'}
                        </span>
                        {shortlisted.includes(profile.id) ? 'Shortlisted' : 'Shortlist'}
                      </button>

                      {/* Add Notes */}
                      <button
                        onClick={() => setActiveNoteId(profile.id)}
                        className="h-11 px-5 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-600 rounded-full font-medium text-sm transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">note_add</span>
                        {notes[profile.id] ? 'Edit Notes' : 'Add Notes'}
                      </button>

                      {/* Flag for Discussion */}
                      <button
                        onClick={() => handleFlag(profile.id)}
                        className={`h-11 px-5 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${flagged.includes(profile.id)
                          ? 'bg-amber-500 text-white'
                          : 'border border-amber-200 text-amber-700 hover:bg-amber-50'
                          }`}
                      >
                        <span className="material-symbols-outlined text-lg">flag</span>
                        {flagged.includes(profile.id) ? 'Flagged' : 'Flag for Discussion'}
                      </button>

                      {/* View Full Profile */}
                      <Link
                        to={`/match-detail/${profile.id}`}
                        className="h-11 px-5 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-600 rounded-full font-medium text-sm transition-all flex items-center gap-2 ml-auto"
                      >
                        View Full Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Privacy Note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-stone-400 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">info</span>
            Notes and shortlists are private and visible only to family members with access.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FamilyViewMode;
