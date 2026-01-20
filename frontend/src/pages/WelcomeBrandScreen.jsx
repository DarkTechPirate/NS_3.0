import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Footer from '../components/Footer';

const WelcomeBrandScreen = () => {
  return (
    <div className="font-display bg-background-light text-text-charcoal antialiased selection:bg-rajkumari-pink selection:text-white">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Navigation */}
        <Header />

        <main className="flex-grow flex flex-col">
          {/* Hero Section */}
          <section className="relative flex flex-col items-center justify-center pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
              <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-rajkumari-light/30 rounded-full blur-[100px] opacity-60"></div>
              <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-ghee-yellow/10 rounded-full blur-[120px]"></div>
            </div>
            <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
              <div className="space-y-6">
                <span className="inline-block py-1.5 px-5 rounded-full border border-rajkumari-pink/20 bg-rajkumari-light/30 text-rajkumari-pink text-xs font-bold tracking-widest uppercase">
                  Private Members Only
                </span>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[1.1] tracking-tight text-text-charcoal">
                  Designed for <span className="italic text-rajkumari-pink relative inline-block">
                    marriage.
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-ghee-yellow opacity-60" preserveAspectRatio="none" viewBox="0 0 100 10">
                      <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3"></path>
                    </svg>
                  </span>
                </h1>
                <p className="text-lg md:text-2xl text-text-muted font-light max-w-2xl mx-auto leading-relaxed">
                  A private, considered platform for people ready to make a thoughtful marriage decision. Fewer matches. Better decisions.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/onboarding" className="w-full sm:w-auto min-w-[200px] h-14 bg-rajkumari-pink text-white rounded-full font-bold text-base hover:bg-rajkumari-pink/90 transition-all shadow-soft flex items-center justify-center gap-2 group">
                  <span>Apply for Membership</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
                <button className="w-full sm:w-auto min-w-[200px] h-14 bg-white border border-luxury-border text-text-charcoal rounded-full font-medium text-base hover:bg-ghee-light transition-all flex items-center justify-center gap-2 hover:border-ghee-yellow/50">
                  <span>How It Works</span>
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="mt-20 w-full max-w-6xl mx-auto px-4 relative">
              <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-rajkumari-pink/10 border border-white/50 ring-1 ring-black/5 group">
                <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10"></div>
                <img
                  alt="Elegant couple holding hands in dim lighting showing connection"
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 saturate-[0.8]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBefJDzWwlYbKrXDFkSjL7JVNLbTBaI9DyC722DVi-WwqqLsE8WP3A3lZqepF_YfdnyVhlLrvifgedLnr59iyERR6UYarbqWXV3PQ6bhoD576xhZ1UXLmky__YmJWK4Fi5H0bLxWlHBLdf_NBRwzbPN_-4cmZ29oW8ez7ddnfAwYyKiC7MJbO5tPBkyCOA1SQ3cPI8YSPx8ea28fCs9S4GXNJ2zXQd09lSuqfleGvVY1ftCvBJdbQvlmwxntRIYxxDYS43u7aXY_b_j"
                />
                <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end">
                  <div className="hidden md:block">
                    <p className="text-white/90 text-sm font-mono tracking-widest uppercase bg-black/20 backdrop-blur-sm px-3 py-1 rounded">Est. 2024</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-rajkumari-pink animate-pulse"></span>
                    <span className="text-xs font-bold text-text-charcoal tracking-wide">Curated matches. Limited weekly introductions.</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-ghee-yellow/20 rounded-full blur-xl -z-10"></div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 px-6 bg-white border-y border-luxury-border/50 relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#F3C969_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]"></div>
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
                <div>
                  <h2 className="text-3xl md:text-5xl font-serif font-medium mb-6 text-text-charcoal leading-tight">
                    Why discerning individuals choose <span className="italic text-rajkumari-pink">Namma Sambandhi.</span>
                  </h2>
                  <p className="text-text-muted text-lg leading-relaxed">
                    We operate closer to an executive search firm than a dating app. By selectively granting membership, we ensure a community of shared caliber and intent, prioritizing privacy and meaningful outcomes over volume.
                  </p>
                </div>
                <div className="flex justify-end">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-ghee-yellow/30 bg-ghee-light/50">
                    <span className="material-symbols-outlined text-ghee-yellow">verified_user</span>
                    <span className="text-sm font-semibold text-text-charcoal">100% ID Verified Community</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group p-8 rounded-3xl bg-background-light border border-luxury-border hover:border-rajkumari-pink/30 transition-all duration-300 hover:shadow-soft hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-rajkumari-light/20 flex items-center justify-center mb-6 group-hover:bg-rajkumari-pink/10 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-rajkumari-pink/80 group-hover:text-rajkumari-pink transition-colors">lock</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-text-charcoal font-serif">Private by Design</h3>
                  <p className="text-text-muted leading-relaxed">
                    Navigate your search with complete confidence. Your profile remains invisible to the public, revealed only to matches you explicitly approve.
                  </p>
                </div>
                <div className="group p-8 rounded-3xl bg-background-light border border-luxury-border hover:border-rajkumari-pink/30 transition-all duration-300 hover:shadow-soft hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-ghee-light flex items-center justify-center mb-6 group-hover:bg-ghee-yellow/10 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-ghee-yellow group-hover:text-ghee-yellow transition-colors">diversity_1</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-text-charcoal font-serif">Intentional Matching</h3>
                  <p className="text-text-muted leading-relaxed">
                    Experience matches that matter. Our curation focuses on deep compatibility and life goals, saving you time by filtering out misalignment early.
                  </p>
                </div>
                <div className="group p-8 rounded-3xl bg-background-light border border-luxury-border hover:border-rajkumari-pink/30 transition-all duration-300 hover:shadow-soft hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-rajkumari-light/20 flex items-center justify-center mb-6 group-hover:bg-rajkumari-pink/10 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-rajkumari-pink/80 group-hover:text-rajkumari-pink transition-colors">workspace_premium</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-text-charcoal font-serif">Verified Excellence</h3>
                  <p className="text-text-muted leading-relaxed">
                    Connect without compromise. Every member is vetted for education and background, ensuring you meet individuals who match your standard of living.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-24 px-6 bg-background-light border-b border-luxury-border/50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20 max-w-3xl mx-auto">
                <span className="text-rajkumari-pink font-semibold tracking-wider text-sm uppercase mb-3 block">Process</span>
                <h2 className="text-3xl md:text-5xl font-serif text-text-charcoal mb-6">How Membership Works</h2>
                <p className="text-text-muted text-lg">We keep our process transparent and rigorous to maintain the integrity of our community.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-12 relative px-4">
                <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-luxury-border -z-10 border-t border-dashed border-gray-300"></div>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 bg-white border border-luxury-border rounded-full flex items-center justify-center mb-8 shadow-sm group-hover:border-rajkumari-pink transition-colors z-10">
                    <span className="font-serif text-3xl text-rajkumari-pink">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-charcoal mb-3 font-serif">Apply</h3>
                  <p className="text-text-muted text-sm leading-relaxed max-w-xs">Complete a detailed application outlining your background, values, and what you seek in a partner.</p>
                </div>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 bg-white border border-luxury-border rounded-full flex items-center justify-center mb-8 shadow-sm group-hover:border-ghee-yellow transition-colors z-10">
                    <span className="font-serif text-3xl text-ghee-yellow">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-charcoal mb-3 font-serif">Review</h3>
                  <p className="text-text-muted text-sm leading-relaxed max-w-xs">Our screening committee reviews every profile. We verify credentials to ensure safety and quality.</p>
                </div>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 bg-white border border-luxury-border rounded-full flex items-center justify-center mb-8 shadow-sm group-hover:border-rajkumari-pink transition-colors z-10">
                    <span className="font-serif text-3xl text-rajkumari-pink">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-charcoal mb-3 font-serif">Connect</h3>
                  <p className="text-text-muted text-sm leading-relaxed max-w-xs">Once approved, receive limited, highly curated introductions each week based on true compatibility.</p>
                </div>
              </div>
              <div className="mt-16 text-center">
                <Link to="/onboarding" className="bg-text-charcoal text-white px-8 py-3 rounded-full text-sm font-semibold tracking-wide hover:bg-black transition-colors shadow-lg">
                  Start Your Application
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default WelcomeBrandScreen;
