import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const MatchDetailScreen = () => {
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
              <span className="text-ink font-bold">Report: Siddharth</span>
            </div>

            {/* Header Card */}
            <header className="bg-surface border border-line p-8 md:p-10 shadow-executive rounded-xl flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rajkumari to-ghee"></div>
              <div className="shrink-0 relative">
                <div className="rounded-full p-1.5 border border-line bg-white shadow-sm">
                  <div 
                    className="bg-center bg-no-repeat bg-cover rounded-full size-32 md:size-40 grayscale-[10%]"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBNIF1Fvrf0tvumKDOr19WRhOpDpva5kx-9_Y0nqcynUy9LLACCBoBrTYZPPIPuYLRUUTowPnuaV1JYEakgoojCMa3l8fH85_RJOPwCb0p1xvhQDOc3m0FB9Lr9jibMWm0zmPnW2lzXUVq77hgjcFDB6KpDpYJad0xlwZRAJZm6N5ozG7zIHLOUdO8hIig829KopIQh9MixyNnQQhwkXkkYPBHgbeJm_5ZO02ux5dmM1Iq79ipVV6EIArWiQDyhPGWAitrdHFgkzfHh')" }}
                  ></div>
                </div>
                <div className="absolute bottom-2 right-2 bg-rajkumari text-white p-1.5 rounded-full ring-4 ring-white shadow-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left flex flex-col h-full justify-between gap-6">
                <div>
                  <h1 className="text-5xl md:text-6xl font-serif font-medium text-ink tracking-tight">Siddharth, <span className="serif-italic text-ink-light">32</span></h1>
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mt-3 text-ink-light text-lg font-light">
                    <span>Investment Banker</span>
                    <span className="hidden md:inline text-ghee">•</span>
                    <span>Mumbai</span>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
                    <span className="px-3 py-1 border border-line rounded text-[11px] font-bold uppercase tracking-widest text-ink-light bg-gray-50">MBA (Wharton)</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                <button className="h-12 w-full md:w-56 px-6 rounded-full border border-line bg-white text-ink font-bold text-sm hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center">
                  Pass
                </button>
                <button className="h-12 w-full md:w-56 px-6 rounded-full bg-rajkumari text-white font-bold text-sm hover:bg-rajkumari/90 hover:shadow-glow-pink transition-all flex items-center justify-center gap-2 shadow-lg shadow-rajkumari/20">
                  <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                  Express Interest
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
                  Based on the information both of you have shared, this pairing shows strong long-term alignment.
                </p>
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface rounded-2xl border border-line p-6 shadow-executive flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                  <div className="z-10 relative flex flex-col h-full justify-between">
                    <p className="text-ink-light/80 text-xs font-semibold uppercase tracking-widest mb-4">Overall Alignment</p>
                    <div>
                      <div className="flex items-baseline gap-0.5 mb-2">
                        <span className="text-3xl font-bold text-ink font-serif">Strong Alignment</span>
                      </div>
                      <p className="text-xs leading-relaxed text-ink-light">Based on values, lifestyle preferences, and long-term goals.</p>
                    </div>
                  </div>
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-gray-50 rounded-full z-0"></div>
                </div>
                <div className="bg-surface rounded-2xl border border-line p-6 shadow-executive flex flex-col h-full relative group hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-ink-light/80 text-xs font-semibold uppercase tracking-widest">Core Values</p>
                    <span className="material-symbols-outlined text-rajkumari opacity-80 text-[20px]">balance</span>
                  </div>
                  <div className="mt-auto">
                    <span className="text-2xl font-bold text-ink font-serif block mb-2">High Resonance</span>
                    <p className="text-xs leading-relaxed text-ink-light">Strong alignment on family planning, financial outlook, and spirituality.</p>
                  </div>
                </div>
                <div className="bg-surface rounded-2xl border border-line p-6 shadow-executive flex flex-col h-full relative group hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-ink-light/80 text-xs font-semibold uppercase tracking-widest">Lifestyle Fit</p>
                    <span className="material-symbols-outlined text-rajkumari opacity-80 text-[20px]">local_cafe</span>
                  </div>
                  <div className="mt-auto">
                    <span className="text-2xl font-bold text-ink font-serif block mb-2">Good Balance</span>
                    <p className="text-xs leading-relaxed text-ink-light">Compatible daily routines. Slight divergence on urban vs. suburban living.</p>
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
                  <div className="group bg-surface border border-line p-6 rounded-xl shadow-sm hover:border-rajkumari/30 transition-colors">
                    <div className="flex gap-4">
                      <div className="shrink-0 mt-1">
                        <div className="bg-rose-50 text-rajkumari rounded-lg size-10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">work</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-ink font-bold text-base mb-1">Career Trajectory</h4>
                        <p className="text-ink-light text-sm font-light leading-relaxed">Both of you prioritize career growth but have indicated a desire to balance high-pressure roles with regular international travel.</p>
                      </div>
                    </div>
                  </div>
                  <div className="group bg-surface border border-line p-6 rounded-xl shadow-sm hover:border-rajkumari/30 transition-colors">
                    <div className="flex gap-4">
                      <div className="shrink-0 mt-1">
                        <div className="bg-rose-50 text-rajkumari rounded-lg size-10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">diversity_3</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-ink font-bold text-base mb-1">Family Ethos</h4>
                        <p className="text-ink-light text-sm font-light leading-relaxed">Shared belief in a joint-family structure initially, transitioning to independent living. Both value frequent extended family gatherings.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
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
                  <div className="bg-surface border border-line rounded-xl p-6 relative overflow-hidden flex-1 shadow-sm">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-ghee"></div>
                    <h4 className="text-ink font-bold text-base mb-2 pl-2">Geographic Preference</h4>
                    <p className="text-ink-light text-sm font-light leading-relaxed pl-2">
                      Siddharth is currently based in Mumbai and has expressed a strong preference for staying in a major metro. You have indicated an openness to tier-2 cities. This is a potential point of negotiation for long-term settlement.
                    </p>
                  </div>
                  <div className="bg-surface border border-line rounded-xl p-6 relative overflow-hidden flex-1 shadow-sm">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-ghee"></div>
                    <h4 className="text-ink font-bold text-base mb-2 pl-2">Dietary Habits</h4>
                    <p className="text-ink-light text-sm font-light leading-relaxed pl-2">
                      You are strictly vegetarian, while Siddharth is non-vegetarian. While he noted he is comfortable dining at vegetarian restaurants, this lifestyle difference should be discussed early.
                    </p>
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
                <div className="prose prose-lg text-ink-light mx-auto text-justify">
                  <p className="mb-6 text-lg leading-relaxed font-light first-letter:text-5xl first-letter:font-serif first-letter:text-rajkumari first-letter:mr-3 first-letter:float-left">
                    Siddharth comes from a close-knit family of medical professionals based in South Mumbai. His father, Dr. Rajesh, is a cardiac surgeon, and his mother, Dr. Meera, runs a private pathology practice. They emphasize education and humility above all else.
                  </p>
                  <p className="text-lg leading-relaxed font-light">
                    He has one younger sister currently pursuing her Masters in Architecture in London. The family dynamic is described as "liberal yet grounded," with a tradition of annual family retreats. They are looking for a partner who values family integration but maintains her own strong professional identity.
                  </p>
                </div>
                <div className="mt-10 pt-10 border-t border-line flex flex-wrap justify-center gap-4">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line bg-gray-50 text-xs font-bold text-ink uppercase tracking-wider shadow-sm">
                    <span className="material-symbols-outlined text-sm text-ghee">home</span>
                    Nuclear Family
                  </div>
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line bg-gray-50 text-xs font-bold text-ink uppercase tracking-wider shadow-sm">
                    <span className="material-symbols-outlined text-sm text-ghee">temple_hindu</span>
                    Moderate
                  </div>
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-line bg-gray-50 text-xs font-bold text-ink uppercase tracking-wider shadow-sm">
                    <span className="material-symbols-outlined text-sm text-ghee">translate</span>
                    English / Hindi
                  </div>
                </div>
              </div>
            </section>

            <div className="h-16 text-center text-ink-light/40 text-xs font-medium uppercase tracking-widest">
              Confidential Report • Generated for Dr. Aris
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MatchDetailScreen;
