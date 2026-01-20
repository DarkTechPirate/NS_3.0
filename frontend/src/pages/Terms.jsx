import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      
      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-text-charcoal font-serif mb-8">Terms of Service</h1>
          <p className="text-text-muted mb-8">Last updated: December 21, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">1. Acceptance of Terms</h2>
              <p className="text-text-muted leading-relaxed mb-4">
                By accessing or using Namma Sambandhi's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">2. Eligibility</h2>
              <p className="text-text-muted leading-relaxed mb-4">To use our services, you must:</p>
              <ul className="list-disc pl-6 text-text-muted space-y-2 mb-4">
                <li>Be at least 18 years of age</li>
                <li>Be legally eligible for marriage in your jurisdiction</li>
                <li>Not be currently married (unless legally separated)</li>
                <li>Provide accurate and truthful information</li>
                <li>Complete our verification process</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">3. Membership</h2>
              <p className="text-text-muted leading-relaxed mb-4">
                Namma Sambandhi operates on an application-based membership model. All applications are reviewed by our team, and membership is granted at our sole discretion. We reserve the right to reject any application without providing a reason.
              </p>
              <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-6 my-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl mt-1">verified</span>
                  <div>
                    <h4 className="font-bold text-text-charcoal mb-2">Verification Required</h4>
                    <p className="text-text-muted text-sm">All members must complete our verification process, which includes identity verification, education verification, and background checks.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">4. User Conduct</h2>
              <p className="text-text-muted leading-relaxed mb-4">As a member, you agree to:</p>
              <ul className="list-disc pl-6 text-text-muted space-y-2 mb-4">
                <li>Provide accurate and honest information in your profile</li>
                <li>Treat other members with respect and dignity</li>
                <li>Not share your login credentials with others</li>
                <li>Not use the platform for any illegal or fraudulent purposes</li>
                <li>Not harass, stalk, or intimidate other members</li>
                <li>Not share other members' information without consent</li>
                <li>Report any suspicious or inappropriate behavior</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">5. Premium Services</h2>
              <p className="text-text-muted leading-relaxed mb-4">
                Premium membership provides access to additional features including unlimited profile views, priority matching, concierge services, and more. Subscription fees are billed according to your selected plan and are non-refundable except as required by law.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">6. Intellectual Property</h2>
              <p className="text-text-muted leading-relaxed mb-4">
                All content on the Namma Sambandhi platform, including logos, designs, text, and graphics, is our intellectual property and is protected by copyright laws. You may not reproduce, distribute, or create derivative works without our express written consent.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">7. Limitation of Liability</h2>
              <p className="text-text-muted leading-relaxed mb-4">
                Namma Sambandhi provides a platform for introduction and communication between potential matches. We do not guarantee any specific outcomes or the authenticity of information provided by other members. You acknowledge that meeting other members carries inherent risks.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">8. Termination</h2>
              <p className="text-text-muted leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion. You may also terminate your account at any time by contacting our support team.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">9. Changes to Terms</h2>
              <p className="text-text-muted leading-relaxed mb-4">
                We may update these Terms of Service from time to time. We will notify you of any material changes by posting the new terms on our platform. Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text-charcoal mb-4">10. Contact</h2>
              <p className="text-text-muted leading-relaxed">
                For any questions regarding these Terms of Service, please contact us at:
              </p>
              <p className="text-text-charcoal font-medium mt-4">
                Email: legal@nammasambandhi.com<br/>
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

export default Terms;
