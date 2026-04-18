import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getMatches, expressInterest } from '../services/api';
import { AlertModal } from '../components/Modal';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [matchInsight, setMatchInsight] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', variant: 'default' });

  const fetchMatchesData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMatches();
      // Match controller returns { success: true, data: [...] }
      setMatches(res.data || []);
      setMatchInsight(res.insights || null);
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

  const visibleMatches = matches;
  const remainingCount = matches.length;

  const handleDecline = async (id) => {
    setMatches((prev) => {
      const selected = prev.find((item) => item._id === id);
      if (!selected) return prev;
      return [...prev.filter((item) => item._id !== id), selected];
    });
  };

  const handleExpressInterest = async (matchId) => {
    try {
      setActionLoading(matchId);
      const res = await expressInterest(matchId);

      setMatches((prev) =>
        prev.map((item) => {
          if (item._id !== matchId) return item;

          return {
            ...item,
            interestExpressed: true,
            mutualInterest: res?.data?.mutualInterest || item.mutualInterest,
            canMessage: res?.data?.canMessage || item.canMessage,
          };
        })
      );

      setAlertModal({
        isOpen: true,
        title: 'Interest Expressed',
        message: res?.message || "Interest expressed successfully! They have been notified.",
        variant: 'success',
      });
    } catch (error) {
      console.error("Failed to express interest:", error);
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: error?.message || "Failed to express interest.",
        variant: 'error',
      });
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

    if (matchInsight.reason === 'FILTERS_NO_RESULTS') {
      return 'No profiles matched your selected filters. Try broadening your filters.';
    }

    if (matchInsight.reason === 'NO_MATCHABLE_PROFILES') {
      return 'No profiles are currently available for your criteria.';
    }

    return 'No profiles are currently available. Please check back soon.';
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
            Available Profiles — {getCurrentWeek()}
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#1a1a1a] mb-4">
            {getGreeting()}, {user?.fullname?.split(' ')[0] || 'Member'}
          </h1>
          <p className="text-stone-500 text-base max-w-xl">
            Explore all available opposite-gender profiles. Use filters to narrow by your preferences.
          </p>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <span className="material-symbols-outlined text-base">group</span>
              <span>{remainingCount} {remainingCount === 1 ? 'match' : 'matches'} remaining</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Filtered by gender and selected preferences</span>
            </div>
          </div>
        </div>

        {/* Match Cards */}
        <div className="flex flex-col gap-10">
          {visibleMatches.map((match) => {
            const profile = match.matchedUserDetails;
            const hasIncomingInterest = Boolean(match.interestedInYou && !match.mutualInterest);
            const needsResponse = hasIncomingInterest && !match.interestExpressed;

            return (
              <article
                key={match._id}
                className={`rounded-2xl overflow-hidden border transition-all ${
                  hasIncomingInterest
                    ? 'bg-gradient-to-r from-[#FFF5F9] via-white to-[#FFF8F2] border-pink-200 shadow-[0_20px_50px_-28px_rgba(225,29,72,0.45)]'
                    : 'bg-white border-stone-100 shadow-sm'
                }`}
              >
                {hasIncomingInterest && (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-6 py-3 bg-pink-50/90 border-b border-pink-100">
                    <div className="flex items-center gap-2 text-pink-700">
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      <span className="text-sm font-semibold tracking-wide">Interest Request Waiting</span>
                    </div>
                    <p className="text-xs md:text-sm text-pink-600 font-medium">
                      {needsResponse ? 'Accept to unlock messaging immediately' : 'You have already responded'}
                    </p>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row">
                  {/* Photo Section */}
                  <div className="relative w-full lg:w-[320px] shrink-0">
                    <div
                      className="aspect-[4/5] lg:aspect-auto lg:h-full w-full bg-stone-100 bg-cover bg-center"
                      style={{ backgroundImage: `url('${profile.profilePicture || 'https://via.placeholder.com/320x400'}')` }}
                    ></div>

                    {hasIncomingInterest && (
                      <div className="absolute bottom-4 left-4 bg-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                        They liked your profile
                      </div>
                    )}

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
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                          hasIncomingInterest
                            ? 'bg-pink-100 text-pink-700 border-pink-200'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
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
                        {match.mutualInterest && (
                          <span className="px-3 py-1.5 bg-emerald-50 rounded-full text-sm text-emerald-700 border border-emerald-200 font-semibold">
                            Mutual Interest
                          </span>
                        )}
                        {!match.mutualInterest && match.interestedInYou && (
                          <span className={`px-3 py-1.5 rounded-full text-sm border font-semibold ${
                            hasIncomingInterest
                              ? 'bg-pink-100 text-pink-800 border-pink-300 shadow-sm'
                              : 'bg-pink-50 text-pink-700 border-pink-200'
                          }`}>
                            Interested In You
                          </span>
                        )}
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
                    <div className={`rounded-xl p-6 mb-8 border ${
                      hasIncomingInterest
                        ? 'bg-white/85 border-pink-100 ring-1 ring-pink-100/50'
                        : 'bg-[#FDF8F5] border-orange-50'
                    }`}>
                      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${
                        hasIncomingInterest ? 'text-pink-500' : 'text-stone-400'
                      }`}>
                        {needsResponse ? 'Why They Chose You' : 'Why This Match'}
                      </h3>
                      <ul className="space-y-3">
                        {match.matchReasons?.map((reason, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-stone-600 leading-relaxed">
                            <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${hasIncomingInterest ? 'bg-pink-500' : 'bg-primary'}`}></span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {needsResponse && (
                      <div className="mb-5 rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-pink-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">notifications_active</span>
                        This member is waiting for your response. Accept to unlock conversation.
                      </div>
                    )}

                    {/* Actions - Strict Hierarchy */}
                    <div className="flex items-center gap-4 mt-auto pt-4">
                      {match.canMessage ? (
                        <Link
                          to={`/messages?with=${profile._id}`}
                          className="flex-1 lg:flex-none h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">chat</span>
                          Message Now
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleExpressInterest(match._id)}
                          disabled={actionLoading === match._id || (match.interestExpressed && !match.interestedInYou)}
                          className={`flex-1 lg:flex-none h-12 px-8 text-white rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                            needsResponse
                              ? 'bg-gradient-to-r from-pink-600 to-[#B20B5A] hover:from-pink-700 hover:to-[#93094B] shadow-[0_12px_30px_-16px_rgba(219,39,119,0.8)]'
                              : 'bg-primary hover:bg-primary/90 shadow-sm'
                          }`}
                        >
                          {actionLoading === match._id ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <span className="material-symbols-outlined text-lg">favorite</span>
                          )}
                          {match.interestedInYou && !match.interestExpressed ? 'Accept Interest' : match.interestExpressed ? 'Interest Sent' : 'Express Interest'}
                        </button>
                      )}

                      {/* Secondary CTA */}
                      <Link
                        to={`/match-detail/${profile._id}`}
                        className={`flex-1 lg:flex-none h-12 px-6 rounded-full font-medium text-sm transition-all flex items-center justify-center ${
                          hasIncomingInterest
                            ? 'border border-pink-200 text-pink-700 hover:bg-pink-50 hover:border-pink-300'
                            : 'border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        View Full Profile
                      </Link>

                      {/* Tertiary Action - Decline */}
                      <button
                        onClick={() => handleDecline(match._id)}
                        className={`size-12 rounded-full flex items-center justify-center transition-all ml-auto lg:ml-0 ${
                          hasIncomingInterest
                            ? 'border border-pink-200 hover:border-pink-300 hover:bg-pink-50 text-pink-400 hover:text-pink-500'
                            : 'border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-400 hover:text-stone-500'
                        }`}
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

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        buttonText="Got it"
      />
    </div>
  );
};

export default MemberDashboard;
