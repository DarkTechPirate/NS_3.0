import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your message! We will get back to you shortly.');
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      
      <main className="flex-1 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text-charcoal font-serif mb-4">Contact Us</h1>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Have questions or need assistance? We're here to help you on your journey to finding the perfect match.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-stone-100">
              <h2 className="text-2xl font-bold text-text-charcoal mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-text-charcoal mb-2">Your Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-charcoal mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-charcoal mb-2">Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="membership">Membership Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-charcoal mb-2">Message</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="How can we help you?"
                    rows="5"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-soft flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">send</span>
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-soft border border-stone-100">
                <h2 className="text-2xl font-bold text-text-charcoal mb-6">Get in touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl text-primary">mail</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-charcoal mb-1">Email</h3>
                      <p className="text-text-muted">contact@nammasambandhi.com</p>
                      <p className="text-text-muted">support@nammasambandhi.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl text-secondary">phone</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-charcoal mb-1">Phone</h3>
                      <p className="text-text-muted">+91 98765 43210</p>
                      <p className="text-xs text-text-muted mt-1">Mon-Sat, 9:00 AM - 7:00 PM IST</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl text-green-600">location_on</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-charcoal mb-1">Office</h3>
                      <p className="text-text-muted">123 MG Road, Koramangala</p>
                      <p className="text-text-muted">Bangalore, Karnataka 560034</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-4">Premium Concierge Service</h3>
                <p className="text-white/90 mb-6">
                  As a premium member, you get access to our dedicated concierge team who can assist you with personalized matchmaking.
                </p>
                <button className="w-full bg-white text-primary py-3 rounded-full font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">support_agent</span>
                  Talk to Concierge
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
