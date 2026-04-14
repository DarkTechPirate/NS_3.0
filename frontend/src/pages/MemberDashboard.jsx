import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getMatches, expressInterest } from '../services/api';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [declinedMatches, setDeclinedMatches] = useState([]);
  const [rotationInfo, setRotationInfo] = useState(null);
  const [matchInsight, setMatchInsight] = useState(null);

  const fetchMatchesData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMatches();
      // Match controller returns { success: true, data: [...] }
      setMatches(res.data || []);
      setRotationInfo(res.rotation || null);
      setMatchInsight(res.insights || null);
      setDeclinedMatches((prev) => prev.filter((id) => (res.data || []).some((m) => m._id === id)));
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatchesData();
    const intervalId = setInterval(fetchMatchesData, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchMatchesData]);

  const visibleMatches = matches.filter(m => !declinedMatches.includes(m._id));
  const remainingCount = visibleMatches.length;

  const handleDecline = async (id) => {
    setDeclinedMatches((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleExpressInterest = async (matchId) => {
    try {
      setActionLoading(matchId);
      await expressInterest(matchId);
      // Optimistically remove from list or show success
      setDeclinedMatches(prev => [...prev, matchId]);
      alert("Interest expressed successfully! They have been notified.");
    } catch (error) {
      console.error("Failed to express interest:", error);
      alert(error || "Failed to express interest.");
    } finally {
      setActionLoading(null);
    }
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

  const getNextRefreshTime = () => {
    if (!rotationInfo?.nextRefreshAt) return null;

    return new Date(rotationInfo.nextRefreshAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEmptyStateMessage = () => {
    if (!matchInsight?.reason) {
      return 'Your curated selections will appear here once our team has reviewed your profile.';
    }

    if (matchInsight.reason === 'MISSING_GENDER') {
      return 'Please complete your gender in profile to receive curated matches.';
    }

    if (matchInsight.reason === 'NO_OPPOSITE_PROFILES') {
      return 'No opposite-gender profiles are available yet. New profiles will appear automatically.';
    }

    if (matchInsight.reason === 'NO_VERIFIED_OPPOSITE_PROFILES') {
      return 'Profiles are available, but none are verified yet. Matches will appear once verification completes.';
    }

    return 'No profiles qualified this cycle. We will refresh your top picks automatically.';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF9] text-[#1a1a1a] font-display min-h-screen flex flex-col antialiased">
      <Header />

      <main className="flex-grow px-6 md:px-12 lg:px-20 py-10 mx-auto w-full max-w-6xl">
        {/* Header Section */}
        <div className="mb-12">
          <p className="text-xs font-medium tracking-widest uppercase text-stone-400 mb-2">
            Weekly Selection — {getCurrentWeek()}
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1a1a1a] mb-4">
            {getGreeting()}, {user?.fullname?.split(' ')[0] || 'Member'}
          </h1>
          <p className="text-stone-500 text-base max-w-xl">
            Your personal concierge has curated these introductions based on your values and preferences.
          </p>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <span className="material-symbols-outlined text-base">group</span>
              <span>{remainingCount} {remainingCount === 1 ? 'match' : 'matches'} remaining</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>
                Refreshes every {rotationInfo?.intervalMinutes || 1} min
                {getNextRefreshTime() ? ` (next: ${getNextRefreshTime()})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Match Cards */}
        <div className="flex flex-col gap-10">
          {visibleMatches.map((match) => {
            const profile = match.matchedUserDetails;
            return (
              <article
                key={match._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Photo Section */}
                  <div className="relative w-full lg:w-[320px] shrink-0">
                    <div
                      className="aspect-[4/5] lg:aspect-auto lg:h-full w-full bg-stone-100 bg-cover bg-center"
                      style={{ backgroundImage: `url('${profile.profilePicture || 'https://via.placeholder.com/320x400'}')` }}
                    ></div>
                    {/* Verification Badge */}
                    {profile.isVerified && (
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
                            {profile.fullname}, {profile.age}
                          </h2>
                          <p className="text-stone-500 mt-1">{profile.addresses?.[0]?.city}, {profile.addresses?.[0]?.state}</p>
                        </div>
                        <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border border-amber-100">
                          {match.compatibility} Alignment
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 mt-3">
                        <span>{profile.personalDetails?.height} cm</span>
                        <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                        <span>{profile.careerDetails?.education}</span>
                        <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                        <span>{profile.careerDetails?.profession}</span>
                      </div>
                    </div>

                    {/* Alignment Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        <span className="px-3 py-1.5 bg-stone-50 rounded-full text-sm text-stone-600 border border-stone-100">
                          {profile.lifestyleDetails?.diet}
                        </span>
                        <span className="px-3 py-1.5 bg-stone-50 rounded-full text-sm text-stone-600 border border-stone-100">
                          {profile.personalDetails?.community}
                        </span>
                        <span className="px-3 py-1.5 bg-stone-50 rounded-full text-sm text-stone-600 border border-stone-100">
                          {profile.familyDetails?.familyType}
                        </span>
                    </div>

                    {/* Why This Match */}
                    <div className="bg-[#FDF8F5] rounded-xl p-6 mb-8 border border-orange-50">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">
                        Why This Match
                      </h3>
                      <ul className="space-y-3">
                        {match.matchReasons?.map((reason, index) => (
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
                      <button 
                        onClick={() => handleExpressInterest(match._id)}
                        disabled={actionLoading === match._id}
                        className="flex-1 lg:flex-none h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {actionLoading === match._id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <span className="material-symbols-outlined text-lg">favorite</span>
                        )}
                        Express Interest
                      </button>

                      {/* Secondary CTA */}
                      <Link
                        to={`/match-detail/${profile._id}`}
                        className="flex-1 lg:flex-none h-12 px-6 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700 rounded-full font-medium text-sm transition-all flex items-center justify-center"
                      >
                        View Full Profile
                      </Link>

                      {/* Tertiary Action - Decline */}
                      <button
                        onClick={() => handleDecline(match._id)}
                        className="size-12 rounded-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-500 transition-all ml-auto lg:ml-0"
                        title="Pass"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty State */}
        {visibleMatches.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl text-stone-400">group</span>
            </div>
            <h2 className="text-xl font-serif font-medium text-[#1a1a1a] mb-2">No matches yet</h2>
            <p className="text-stone-500 max-w-md mx-auto">
              {getEmptyStateMessage()}
            </p>
          </div>
        )}

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
