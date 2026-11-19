'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PublicContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col justify-center min-h-[calc(100vh-4rem)]">

      {/* Header Section */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold tracking-wider uppercase">
          <Mail className="w-3.5 h-3.5" /> {t('contact', 'badge')}
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold theme-text-primary tracking-tight">
          {t('contact', 'title')}
        </h1>
        <p className="theme-text-secondary text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
          {t('contact', 'subtitle')}
        </p>
      </div>

      {/* Main Grid: Info Cards + Contact Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info Column */}
        <div className="md:col-span-5 relative overflow-hidden p-8 md:p-10 rounded-3xl border theme-border theme-bg-card shadow-lg space-y-8 flex flex-col justify-between h-full">
          <div>
            <h2 className="text-2xl font-serif font-bold theme-text-primary mb-2">
              {t('contact', 'infoTitle')}
            </h2>
            <p className="text-xs theme-text-secondary leading-relaxed font-sans mb-8">
              {t('contact', 'infoSubtitle')}
            </p>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold theme-text-primary uppercase tracking-wider">
                    {t('contact', 'address')}
                  </h3>
                  <p className="text-xs theme-text-secondary mt-1 leading-relaxed">
                    {t('contact', 'addressVal')}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold theme-text-primary uppercase tracking-wider">
                    {t('contact', 'phone')}
                  </h3>
                  <p className="text-xs theme-text-secondary mt-1 font-mono">
                    +998 (62) 349-11-22
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold theme-text-primary uppercase tracking-wider">
                    {t('contact', 'email')}
                  </h3>
                  <p className="text-xs theme-text-secondary mt-1 font-mono">
                    ixm313@piima.uz
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold theme-text-primary uppercase tracking-wider">
                    {t('contact', 'officeHours')}
                  </h3>
                  <p className="text-xs theme-text-secondary mt-1 leading-relaxed">
                    {t('contact', 'officeHoursVal')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="md:col-span-7 relative overflow-hidden p-8 md:p-10 rounded-3xl border theme-border theme-bg-card shadow-lg">
          <h2 className="text-2xl font-serif font-bold theme-text-primary mb-2">
            {t('contact', 'formTitle')}
          </h2>
          <p className="text-xs theme-text-secondary mb-8 leading-relaxed font-sans">
            {t('contact', 'formSubtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-mono font-bold theme-text-primary block uppercase tracking-wider">
                {t('contact', 'fullName')} <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3.5 rounded-2xl theme-bg-page border theme-border text-xs font-sans theme-text-primary focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-mono font-bold theme-text-primary block uppercase tracking-wider">
                {t('contact', 'emailAddress')} <span className="text-rose-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-3.5 rounded-2xl theme-bg-page border theme-border text-xs font-sans theme-text-primary focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-mono font-bold theme-text-primary block uppercase tracking-wider">
                {t('contact', 'message')} <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message or inquiry here..."
                className="w-full px-4 py-3.5 rounded-2xl theme-bg-page border theme-border text-xs font-sans theme-text-primary focus:outline-none focus:border-emerald-500 transition-colors resize-none shadow-inner"
              />
            </div>

            {/* Feedback Messages */}
            {success && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t('contact', 'successMsg')}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending...' : t('contact', 'sendBtn')}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
