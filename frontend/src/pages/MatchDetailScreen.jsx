import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getMatchDetail, expressInterest } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MatchDetailScreen = () => {
  const { user } = useAuth();
  const { id: routeUserId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = routeUserId || queryParams.get('id');

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchDetail();
    }
  }, [userId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getMatchDetail(userId);
      setMatch(res.data);
    } catch (error) {
      console.error("Failed to fetch match detail", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!match) return;
    try {
      setActionLoading(true);
      const res = await expressInterest(match._id);
      setMatch((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          interestExpressed: true,
          mutualInterest: res?.data?.mutualInterest || prev.mutualInterest,
          canMessage: res?.data?.canMessage || prev.canMessage,
        };
      });
      alert(res?.message || "Interest expressed successfully!");
    } catch (error) {
      console.error("Failed to express interest", error);
      alert(error || "Failed to express interest");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rajkumari/30 border-t-rajkumari rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-10">
        <h2 className="text-2xl font-serif font-medium text-ink mb-4">Profile Not Found</h2>
        <p className="text-ink-light mb-8">We couldn't find the profile you're looking for.</p>
        <Link to="/dashboard" className="px-8 py-3 bg-rajkumari text-white rounded-full font-bold">Back to Matches</Link>
      </div>
    );
  }

  const profile = match.matchedUser;

  return (
    <div className="bg-paper text-ink font-body antialiased selection:bg-rajkumari selection:text-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 overflow-y-auto scroll-smooth relative z-10">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-14 flex flex-col gap-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-ink-light/70">
            <Link to="/dashboard" className="hover:text-rajkumari transition-colors">Matches</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-ink font-bold">Report: {profile.fullname}</span>
          </div>

          {/* Header Card */}
          <header className="bg-surface border border-line p-8 md:p-10 shadow-executive rounded-xl flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rajkumari to-ghee"></div>
            <div className="shrink-0 relative">
              <div className="rounded-full p-1.5 border border-line bg-white shadow-sm">
                <div 
                  className="bg-center bg-no-repeat bg-cover rounded-full size-32 md:size-40 grayscale-[10%]"
                  style={{ backgroundImage: `url('${profile.profilePicture || 'https://via.placeholder.com/160x160'}')` }}
                ></div>
              </div>
              {profile.isVerified && (
                <div className="absolute bottom-2 right-2 bg-rajkumari text-white p-1.5 rounded-full ring-4 ring-white shadow-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left flex flex-col h-full justify-between gap-6">
              <div>
                <h1 className="text-5xl md:text-6xl font-serif font-medium text-ink tracking-tight">{profile.fullname}, <span className="serif-italic text-ink-light">{profile.age}</span></h1>
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mt-3 text-ink-light text-lg font-light">
                  <span>{profile.careerDetails?.profession}</span>
                  <span className="hidden md:inline text-ghee">•</span>
                  <span>{profile.addresses?.[0]?.city}</span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
                  <span className="px-3 py-1 border border-line rounded text-[11px] font-bold uppercase tracking-widest text-ink-light bg-gray-50">{profile.careerDetails?.education}</span>
                  {match.mutualInterest && (
                    <span className="px-3 py-1 border border-emerald-200 rounded text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50">Mutual Interest</span>
                  )}
                  {!match.mutualInterest && match.interestedInYou && (
                    <span className="px-3 py-1 border border-pink-200 rounded text-[11px] font-bold uppercase tracking-widest text-pink-700 bg-pink-50">Interested In You</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto shrink-0 mt-2 md:mt-0">
              <button className="h-12 w-full md:w-56 px-6 rounded-full border border-line bg-white text-ink font-bold text-sm hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center">
                Pass
              </button>
              {match.canMessage ? (
                <Link
                  to={`/messages?with=${profile._id}`}
                  className="h-12 w-full md:w-56 px-6 rounded-full bg-rajkumari text-white font-bold text-sm hover:bg-rajkumari/90 hover:shadow-glow-pink transition-all flex items-center justify-center gap-2 shadow-lg shadow-rajkumari/20"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  Message Now
                </Link>
              ) : (
                <button 
                  onClick={handleExpressInterest}
                  disabled={actionLoading || (match.interestExpressed && !match.interestedInYou)}
                  className="h-12 w-full md:w-56 px-6 rounded-full bg-rajkumari text-white font-bold text-sm hover:bg-rajkumari/90 hover:shadow-glow-pink transition-all flex items-center justify-center gap-2 shadow-lg shadow-rajkumari/20 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                  )}
                  {match.interestedInYou && !match.interestExpressed ? 'Accept Interest' : match.interestExpressed ? 'Interest Sent' : 'Express Interest'}
                </button>
              )}
            </div>
          </header>

          {/* Compatibility Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-4 pr-0 lg:pr-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px w-8 bg-rajkumari"></div>
                <span className="text-rajkumari font-bold text-xs tracking-[0.2em] uppercase">Executive Summary</span>
              </div>
              <h2 className="text-4xl font-serif font-medium text-ink leading-[1.15]">Compatibility<br/><span className="serif-italic text-ink-light">Breakdown</span></h2>
              <p className="text-ink-light leading-relaxed font-light mt-2 border-l-2 border-line pl-4">
                Based on the information both of you have shared, this pairing shows {match.compatibility.toLowerCase()} long-term alignment.
              </p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface rounded-2xl border border-line p-6 shadow-executive flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                <div className="z-10 relative flex flex-col h-full justify-between">
                  <p className="text-ink-light/80 text-xs font-semibold uppercase tracking-widest mb-4">Overall Alignment</p>
                  <div>
                    <div className="flex items-baseline gap-0.5 mb-2">
                      <span className="text-3xl font-bold text-ink font-serif">{match.compatibility} Alignment</span>
                    </div>
                    <p className="text-xs leading-relaxed text-ink-light">Compatibility Score: {match.score}%</p>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gray-50 rounded-full z-0"></div>
              </div>
              <div className="bg-surface rounded-2xl border border-line p-6 shadow-executive flex flex-col h-full relative group hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-start mb-6">
                  <p className="text-ink-light/80 text-xs font-semibold uppercase tracking-widest">Community</p>
                  <span className="material-symbols-outlined text-rajkumari opacity-80 text-[20px]">balance</span>
                </div>
                <div className="mt-auto">
                  <span className="text-2xl font-bold text-ink font-serif block mb-2">{profile.personalDetails?.community}</span>
                  <p className="text-xs leading-relaxed text-ink-light">Alignment confirmed on family traditions and cultural values.</p>
                </div>
              </div>
              <div className="bg-surface rounded-2xl border border-line p-6 shadow-executive flex flex-col h-full relative group hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-start mb-6">
                  <p className="text-ink-light/80 text-xs font-semibold uppercase tracking-widest">Lifestyle Fit</p>
                  <span className="material-symbols-outlined text-rajkumari opacity-80 text-[20px]">local_cafe</span>
                </div>
                <div className="mt-auto">
                  <span className="text-2xl font-bold text-ink font-serif block mb-2">{profile.lifestyleDetails?.diet}</span>
                  <p className="text-xs leading-relaxed text-ink-light">Compatible daily routines and shared lifestyle preferences.</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-t border-line/60 my-2" />

          {/* Why Paired / Considerations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <section className="flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 rounded-full bg-rajkumari text-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-ink">Why we paired you</h3>
                </div>
                <p className="text-ink-light text-sm font-light leading-relaxed pl-11">These are the strongest points of alignment identified during curation.</p>
              </div>
              <div className="flex flex-col gap-4">
                {match.matchReasons?.map((reason, index) => (
                  <div key={index} className="group bg-surface border border-line p-6 rounded-xl shadow-sm hover:border-rajkumari/30 transition-colors">
                    <div className="grid grid-cols-[40px_1fr] gap-4 items-start">
                      <div className="bg-rose-50 text-rajkumari rounded-lg size-10 flex items-center justify-center mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">stars</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h4 className="text-ink font-bold text-base leading-tight">Point of Resonance</h4>
                        <p className="text-ink-light text-sm font-light leading-relaxed">{reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Background Details */}
            <section className="flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 rounded-full bg-ghee text-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-ink">Profile Details</h3>
                </div>
                <p className="text-ink-light text-sm font-light leading-relaxed pl-11">Professional and personal background information.</p>
              </div>
              <div className="bg-surface border border-line rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-stone-100 pb-3">
                    <span className="text-ink-light text-sm font-medium uppercase tracking-wider">Profession</span>
                    <span className="text-ink font-bold text-sm">{profile.careerDetails?.profession}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-3">
                    <span className="text-ink-light text-sm font-medium uppercase tracking-wider">Employer</span>
                    <span className="text-ink font-bold text-sm">{profile.careerDetails?.employer}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-3">
                    <span className="text-ink-light text-sm font-medium uppercase tracking-wider">Education</span>
                    <span className="text-ink font-bold text-sm">{profile.careerDetails?.education}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-3">
                    <span className="text-ink-light text-sm font-medium uppercase tracking-wider">Height</span>
                    <span className="text-ink font-bold text-sm">{profile.personalDetails?.height} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-light text-sm font-medium uppercase tracking-wider">Diet</span>
                    <span className="text-ink font-bold text-sm">{profile.lifestyleDetails?.diet}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Family Background Section */}
          <section className="bg-surface p-8 md:p-12 rounded-xl border border-line shadow-executive mt-4 relative">
            <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none">
              <span className="material-symbols-outlined text-9xl text-ink">history_edu</span>
            </div>
            <div className="max-w-3xl mx-auto relative z-10">
              <div className="text-center mb-10">
                <span className="text-rajkumari font-bold text-xs tracking-[0.3em] uppercase mb-3 block">Family Background</span>
                <h3 className="text-4xl font-serif font-medium text-ink">The Family Ecosystem</h3>
                <div className="w-16 h-1 bg-ghee mx-auto mt-6"></div>
              </div>
              <div className="grid md:grid-cols-2 gap-8 text-ink-light">
                <div className="space-y-4">
                   <h4 className="text-ink font-bold font-serif text-lg">Parental Background</h4>
                   <p className="text-sm leading-relaxed font-light">
                     Father is a {profile.familyDetails?.fatherOccupation}. <br/>
                     Mother is a {profile.familyDetails?.motherOccupation}.
                   </p>
                </div>
                <div className="space-y-4">
                   <h4 className="text-ink font-bold font-serif text-lg">Family Structure</h4>
                   <p className="text-sm leading-relaxed font-light">
                     Belongs to a {profile.familyDetails?.familyType} family. <br/>
                     Has {profile.familyDetails?.siblings} siblings.
                   </p>
                </div>
              </div>
              <div className="mt-10 pt-10 border-t border-line flex flex-wrap justify-center gap-4">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line bg-gray-50 text-xs font-bold text-ink uppercase tracking-wider shadow-sm">
                  <span className="material-symbols-outlined text-sm text-ghee">home</span>
                  {profile.familyDetails?.familyType} Family
                </div>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line bg-gray-50 text-xs font-bold text-ink uppercase tracking-wider shadow-sm">
                  <span className="material-symbols-outlined text-sm text-ghee">temple_hindu</span>
                  {profile.personalDetails?.community}
                </div>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line bg-gray-50 text-xs font-bold text-ink uppercase tracking-wider shadow-sm">
                  <span className="material-symbols-outlined text-sm text-ghee">translate</span>
                  English
                </div>
              </div>
            </div>
          </section>

          <div className="h-16 text-center text-ink-light/40 text-xs font-medium uppercase tracking-widest">
            Confidential Report • Generated for {user?.fullname || 'Member'}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MatchDetailScreen;
