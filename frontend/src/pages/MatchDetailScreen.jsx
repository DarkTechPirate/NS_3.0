import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { getMatchDetail, expressInterest, declineMatch } from '../services/api';

const MatchDetailScreen = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await getMatchDetail(id);
        if (res.success) {
          setMatch(res.match);
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error fetching match detail:", error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id, navigate]);

  const handleInterest = async () => {
    const res = await expressInterest(id);
    if (res.success) {
      setMatch(prev => ({ ...prev, status: res.status }));
    }
  };

  const handleDecline = async () => {
    await declineMatch(id);
    navigate('/dashboard');
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
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink-light">Match not found.</p>
      </div>
    );
  }

  const imageUrl = match.image || null;

  return (
    <div className="bg-paper text-ink font-body antialiased selection:bg-rajkumari selection:text-white flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-20 xl:w-72 flex-col border-r border-line bg-surface h-full justify-between z-20 shadow-executive transition-all duration-300">
        <div className="flex flex-col gap-8 p-4 xl:p-6">
          <Link to="/" className="flex items-center xl:justify-start justify-center group cursor-pointer">
            <Logo size="md" />
          </Link>
          <nav className="flex flex-col gap-1">
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-ink-light hover:text-ink transition-all group">
              <span className="material-symbols-outlined text-[22px]">dashboard</span>
              <span className="hidden xl:block text-sm font-medium">Home</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-rajkumari/5 text-rajkumari border border-rajkumari/10 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[22px]">group</span>
              <span className="hidden xl:block text-sm font-bold">Matches</span>
            </Link>
            <Link to="/family-view" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-ink-light hover:text-ink transition-all group">
              <span className="material-symbols-outlined text-[22px]">folder_shared</span>
              <span className="hidden xl:block text-sm font-medium">Family View</span>
            </Link>
            <Link to="/messages" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-ink-light hover:text-ink transition-all group">
              <span className="material-symbols-outlined text-[22px]">mail</span>
              <span className="hidden xl:block text-sm font-medium">Messages</span>
            </Link>
          </nav>
        </div>
        <div className="p-4 xl:p-6 border-t border-line">
          <Link to="/create-profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-ink-light hover:text-ink transition-all">
            <span className="material-symbols-outlined text-[22px]">settings</span>
            <span className="hidden xl:block text-sm font-medium">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-paper relative">
        <div className="flex-1 overflow-y-auto scroll-smooth relative z-10">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-14 flex flex-col gap-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-ink-light/70">
              <Link to="/dashboard" className="hover:text-rajkumari transition-colors">Matches</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-ink font-bold">Report: {match.name?.split(' ')[0]}</span>
            </div>

            {/* Header Card */}
            <header className="bg-surface border border-line p-8 md:p-10 shadow-executive rounded-xl flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rajkumari to-ghee"></div>
              <div className="shrink-0 relative">
                <div className="rounded-full p-1.5 border border-line bg-white shadow-sm">
                  {imageUrl ? (
                    <div
                      className="bg-center bg-no-repeat bg-cover rounded-full size-32 md:size-40 grayscale-[10%]"
                      style={{ backgroundImage: `url('${imageUrl}')` }}
                    ></div>
                  ) : (
                    <div className="rounded-full size-32 md:size-40 bg-stone-100 flex items-center justify-center text-stone-400">
                      <span className="material-symbols-outlined text-5xl">person</span>
                    </div>
                  )}
                </div>
                {match.isVerified && (
                  <div className="absolute bottom-2 right-2 bg-rajkumari text-white p-1.5 rounded-full ring-4 ring-white shadow-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left flex flex-col h-full justify-between gap-6">
                <div>
                  <h1 className="text-5xl md:text-6xl font-serif font-medium text-ink tracking-tight">
                    {match.name?.split(' ')[0]}{match.age ? <>, <span className="serif-italic text-ink-light">{match.age}</span></> : ''}
                  </h1>
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mt-3 text-ink-light text-lg font-light">
                    {match.profession && <span>{match.profession}</span>}
                    {match.profession && match.location && <span className="hidden md:inline text-ghee">•</span>}
                    {match.location && <span>{match.location}</span>}
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
                    {match.education && (
                      <span className="px-3 py-1 border border-line rounded text-[11px] font-bold uppercase tracking-widest text-ink-light bg-gray-50">
                        {match.education}
                      </span>
                    )}
                    {match.employer && (
                      <span className="px-3 py-1 border border-line rounded text-[11px] font-bold uppercase tracking-widest text-ink-light bg-gray-50">
                        {match.employer}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                <button
                  onClick={handleDecline}
                  className="h-12 w-full md:w-56 px-6 rounded-full border border-line bg-white text-ink font-bold text-sm hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center"
                >
                  Pass
                </button>
                <button
                  onClick={handleInterest}
                  disabled={match.status === 'interested' || match.status === 'mutual'}
                  className={`h-12 w-full md:w-56 px-6 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                    match.status === 'mutual'
                      ? 'bg-green-500 text-white shadow-green-500/20'
                      : match.status === 'interested'
                        ? 'bg-rajkumari/70 text-white shadow-rajkumari/20'
                        : 'bg-rajkumari text-white hover:bg-rajkumari/90 hover:shadow-glow-pink shadow-rajkumari/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {match.status === 'mutual' ? 'favorite' : 'chat_bubble'}
                  </span>
                  {match.status === 'mutual' ? 'Mutual Match!' : match.status === 'interested' ? 'Interest Sent' : 'Express Interest'}
                </button>
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
                  Based on the information both of you have shared, this pairing shows {match.compatibility?.toLowerCase() || 'promising'} long-term alignment.
                </p>
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface rounded-2xl border border-line p-6 shadow-executive flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                  <div className="z-10 relative flex flex-col h-full justify-between">
                    <p className="text-ink-light/80 text-xs font-semibold uppercase tracking-widest mb-4">Overall Alignment</p>
                    <div>
                      <div className="flex items-baseline gap-0.5 mb-2">
                        <span className="text-3xl font-bold text-ink font-serif">{match.compatibility || 'Moderate'} Alignment</span>
                      </div>
                      <p className="text-xs leading-relaxed text-ink-light">Based on values, lifestyle preferences, and long-term goals.</p>
                    </div>
                  </div>
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-gray-50 rounded-full z-0"></div>
                </div>
                <div className="bg-surface rounded-2xl border border-line p-6 shadow-executive flex flex-col h-full relative group hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-ink-light/80 text-xs font-semibold uppercase tracking-widest">Lifestyle</p>
                    <span className="material-symbols-outlined text-rajkumari opacity-80 text-[20px]">local_cafe</span>
                  </div>
                  <div className="mt-auto space-y-1">
                    {match.lifestyle?.diet && (
                      <p className="text-xs text-ink-light"><span className="font-medium text-ink">Diet:</span> {match.lifestyle.diet}</p>
                    )}
                    {match.lifestyle?.smoking && (
                      <p className="text-xs text-ink-light"><span className="font-medium text-ink">Smoking:</span> {match.lifestyle.smoking}</p>
                    )}
                    {match.lifestyle?.drinking && (
                      <p className="text-xs text-ink-light"><span className="font-medium text-ink">Drinking:</span> {match.lifestyle.drinking}</p>
                    )}
                    {!match.lifestyle?.diet && !match.lifestyle?.smoking && !match.lifestyle?.drinking && (
                      <p className="text-xs text-ink-light">Lifestyle details not yet shared.</p>
                    )}
                  </div>
                </div>
                <div className="bg-surface rounded-2xl border border-line p-6 shadow-executive flex flex-col h-full relative group hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-ink-light/80 text-xs font-semibold uppercase tracking-widest">Personal</p>
                    <span className="material-symbols-outlined text-rajkumari opacity-80 text-[20px]">person</span>
                  </div>
                  <div className="mt-auto space-y-1">
                    {match.religion && <p className="text-xs text-ink-light"><span className="font-medium text-ink">Religion:</span> {match.religion}</p>}
                    {match.community && <p className="text-xs text-ink-light"><span className="font-medium text-ink">Community:</span> {match.community}</p>}
                    {match.motherTongue && <p className="text-xs text-ink-light"><span className="font-medium text-ink">Mother Tongue:</span> {match.motherTongue}</p>}
                    {match.maritalStatus && <p className="text-xs text-ink-light"><span className="font-medium text-ink">Marital Status:</span> {match.maritalStatus}</p>}
                    {!match.religion && !match.community && !match.motherTongue && (
                      <p className="text-xs text-ink-light">Personal details not yet shared.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-t border-line/60 my-2" />

            {/* Why Paired / Considerations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Match Reasons */}
              {match.matchReasons?.length > 0 && (
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
                    {match.matchReasons.map((reason, index) => (
                      <div key={index} className="group bg-surface border border-line p-6 rounded-xl shadow-sm hover:border-rajkumari/30 transition-colors">
                        <div className="flex gap-4">
                          <div className="shrink-0 mt-1">
                            <div className="bg-rose-50 text-rajkumari rounded-lg size-10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[20px]">favorite</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-ink-light text-sm font-light leading-relaxed">{reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Considerations */}
              {match.considerations?.length > 0 && (
                <section className="flex flex-col gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-1.5 rounded-full bg-ghee text-white flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">priority_high</span>
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-ink">Considerations to discuss</h3>
                    </div>
                    <p className="text-ink-light text-sm font-light leading-relaxed pl-11">These are not red flags, but areas where open conversation matters.</p>
                  </div>
                  <div className="flex flex-col gap-4 h-full">
                    {match.considerations.map((item, index) => (
                      <div key={index} className="bg-surface border border-line rounded-xl p-6 relative overflow-hidden flex-1 shadow-sm">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-ghee"></div>
                        <h4 className="text-ink font-bold text-base mb-2 pl-2">{item.topic}</h4>
                        <p className="text-ink-light text-sm font-light leading-relaxed pl-2">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Family Background Section */}
            {(match.family?.fatherName || match.family?.motherName) && (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {match.family.fatherName && (
                      <div className="bg-gray-50 rounded-xl p-5 border border-line">
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Father</p>
                        <p className="text-ink font-medium">{match.family.fatherName}</p>
                        {match.family.fatherOccupation && (
                          <p className="text-ink-light text-sm mt-1">{match.family.fatherOccupation}</p>
                        )}
                      </div>
                    )}
                    {match.family.motherName && (
                      <div className="bg-gray-50 rounded-xl p-5 border border-line">
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Mother</p>
                        <p className="text-ink font-medium">{match.family.motherName}</p>
                        {match.family.motherOccupation && (
                          <p className="text-ink-light text-sm mt-1">{match.family.motherOccupation}</p>
                        )}
                      </div>
                    )}
                  </div>
                  {match.family.siblings && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-line mb-8">
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Siblings</p>
                      <p className="text-ink-light text-sm">{match.family.siblings}</p>
                    </div>
                  )}
                  <div className="pt-8 border-t border-line flex flex-wrap justify-center gap-4">
                    {match.family.familyType && (
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line bg-gray-50 text-xs font-bold text-ink uppercase tracking-wider shadow-sm">
                        <span className="material-symbols-outlined text-sm text-ghee">home</span>
                        {match.family.familyType}
                      </div>
                    )}
                    {match.family.familyValues && (
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line bg-gray-50 text-xs font-bold text-ink uppercase tracking-wider shadow-sm">
                        <span className="material-symbols-outlined text-sm text-ghee">temple_hindu</span>
                        {match.family.familyValues}
                      </div>
                    )}
                    {match.motherTongue && (
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line bg-gray-50 text-xs font-bold text-ink uppercase tracking-wider shadow-sm">
                        <span className="material-symbols-outlined text-sm text-ghee">translate</span>
                        {match.motherTongue}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            <div className="h-16 text-center text-ink-light/40 text-xs font-medium uppercase tracking-widest">
              Confidential Report {user?.fullname ? `• Generated for ${user.fullname}` : ''}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MatchDetailScreen;
