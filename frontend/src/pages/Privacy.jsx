import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      
      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-text-charcoal font-serif mb-8">Privacy Policy</h1>
          <p className="text-text-muted mb-8">Last updated: December 21, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">1. Introduction</h2>
              <p className="text-text-muted leading-relaxed mb-4">
                Welcome to Namma Sambandhi ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our matrimony platform.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">2. Information We Collect</h2>
              <p className="text-text-muted leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 text-text-muted space-y-2 mb-4">
                <li>Personal details (name, date of birth, gender, height)</li>
                <li>Contact information (email, phone number, address)</li>
                <li>Educational and professional background</li>
                <li>Family information</li>
                <li>Photographs and profile media</li>
                <li>Preferences and values related to marriage</li>
                <li>Communication data between matches</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">3. How We Use Your Information</h2>
              <p className="text-text-muted leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-text-muted space-y-2 mb-4">
                <li>Create and manage your account</li>
                <li>Match you with compatible profiles based on your preferences</li>
                <li>Facilitate communication between matched members</li>
                <li>Verify member identities and credentials</li>
                <li>Improve our services and user experience</li>
                <li>Send you important updates and notifications</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">4. Data Protection</h2>
              <p className="text-text-muted leading-relaxed mb-4">
                We implement industry-standard security measures to protect your personal information. All data is encrypted during transmission and storage. Access to personal information is restricted to authorized personnel only.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 my-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-1">security</span>
                  <div>
                    <h4 className="font-bold text-text-charcoal mb-2">Your Privacy is Our Priority</h4>
                    <p className="text-text-muted text-sm">Your profile is never visible to the public and is only shown to matches you explicitly approve. We never sell your data to third parties.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">5. Sharing Your Information</h2>
              <p className="text-text-muted leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-text-muted space-y-2 mb-4">
                <li>With matched members based on your consent settings</li>
                <li>With service providers who assist in platform operations</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">6. Your Rights</h2>
              <p className="text-text-muted leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-text-muted space-y-2 mb-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">7. Contact Us</h2>
              <p className="text-text-muted leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-text-charcoal font-medium mt-4">
                Email: privacy@nammasambandhi.com<br/>
                Phone: +91 98765 43210
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
