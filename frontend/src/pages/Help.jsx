import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const Help = () => {
  const faqs = [
    {
      question: "How does Namma Sambandhi work?",
      answer: "Namma Sambandhi is a premium matrimony platform that uses a rigorous vetting process to curate high-quality matches. After you apply, our team reviews your profile and verifies your credentials. Once approved, you receive limited, highly curated introductions each week based on deep compatibility analysis."
    },
    {
      question: "What makes Namma Sambandhi different from other matrimony sites?",
      answer: "Unlike traditional matrimony sites that focus on volume, we prioritize quality. We limit the number of matches you receive each week to ensure each introduction is meaningful. Our verification process is thorough, and we focus on deep compatibility based on values, lifestyle, and long-term goals."
    },
    {
      question: "How is my privacy protected?",
      answer: "Your privacy is our top priority. Your profile is never visible to the public and is only shown to matches you explicitly approve. All data is encrypted, and we never share your information with third parties."
    },
    {
      question: "What is Family View mode?",
      answer: "Family View mode allows parents or family members to participate in the search process with the member's consent. They can view curated profiles and shortlist potential matches on behalf of their family member."
    },
    {
      question: "How long does the verification process take?",
      answer: "Our verification process typically takes 3-5 business days. We verify educational credentials, professional background, and identity documents to ensure the authenticity of every member."
    },
    {
      question: "Can I cancel my membership?",
      answer: "Yes, you can cancel your membership at any time. Please contact our support team for assistance with cancellation and refund policies."
    }
  ];

  const [openFaq, setOpenFaq] = React.useState(0);

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-text-charcoal font-serif mb-6">
              How can we help you?
            </h1>
            <p className="text-lg text-text-muted mb-8">
              Find answers to common questions or get in touch with our support team.
            </p>
            <div className="relative max-w-xl mx-auto">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xl">search</span>
              <input 
                type="text" 
                placeholder="Search for help..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-full text-base focus:outline-none focus:border-primary shadow-soft"
              />
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/create-profile" className="group p-6 bg-white rounded-2xl border border-stone-200 hover:border-primary/30 hover:shadow-soft transition-all">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-2xl text-primary">person_add</span>
                </div>
                <h3 className="text-lg font-bold text-text-charcoal mb-2">Getting Started</h3>
                <p className="text-sm text-text-muted">Learn how to create your profile and start your journey.</p>
              </Link>
              
              <Link to="/dashboard" className="group p-6 bg-white rounded-2xl border border-stone-200 hover:border-primary/30 hover:shadow-soft transition-all">
                <div className="size-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <span className="material-symbols-outlined text-2xl text-secondary">favorite</span>
                </div>
                <h3 className="text-lg font-bold text-text-charcoal mb-2">Finding Matches</h3>
                <p className="text-sm text-text-muted">Understand how our matching algorithm works.</p>
              </Link>
              
              <Link to="/contact" className="group p-6 bg-white rounded-2xl border border-stone-200 hover:border-primary/30 hover:shadow-soft transition-all">
                <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <span className="material-symbols-outlined text-2xl text-green-600">support_agent</span>
                </div>
                <h3 className="text-lg font-bold text-text-charcoal mb-2">Contact Support</h3>
                <p className="text-sm text-text-muted">Get in touch with our dedicated support team.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-text-charcoal font-serif text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="border border-stone-200 rounded-xl overflow-hidden"
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 transition-colors"
                  >
                    <span className="font-semibold text-text-charcoal pr-4">{faq.question}</span>
                    <span className={`material-symbols-outlined text-text-muted transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5">
                      <p className="text-text-muted leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-text-charcoal mb-4">Still have questions?</h2>
            <p className="text-text-muted mb-8">Our support team is here to help you 24/7.</p>
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-soft"
            >
              <span className="material-symbols-outlined">mail</span>
              Contact Us
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Help;
