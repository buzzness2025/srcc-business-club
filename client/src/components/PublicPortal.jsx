import React from 'react';
import { 
  TrendingUp, Users, Award, Calendar, ChevronRight, CheckCircle2, 
  ShieldCheck, Phone, CreditCard, Sparkles, BookOpen, Target, ArrowRight 
} from 'lucide-react';
import { clubConfig } from '../config/clubConfig';

export default function PublicPortal({ onOpenLookup, onOpenRegister, onGoToAdmin }) {
  const executives = [
    { name: "Tanvir Ahmed", role: "President", id: "SRCC-001", dept: "Marketing & Strategy", blood: "B+" },
    { name: "Nusrat Jahan", role: "Vice President", id: "SRCC-002", dept: "Corporate Relations", blood: "A+" },
    { name: "Shafiqul Islam", role: "General Secretary", id: "SRCC-003", dept: "Operations", blood: "O+" },
    { name: "Farhana Yasmin", role: "Treasurer", id: "SRCC-004", dept: "Finance & Accounts", blood: "AB+" },
  ];

  const pillars = [
    {
      icon: TrendingUp,
      title: "Case Analysis & Strategy",
      desc: "Comprehensive training on national and international business case competitions with structured problem-solving frameworks."
    },
    {
      icon: Award,
      title: "Corporate Mentorship",
      desc: "Direct networking sessions with C-suite executives, corporate leaders, and alumni across leading multinationals and startups."
    },
    {
      icon: BookOpen,
      title: "Skill Development Labs",
      desc: "Hands-on workshops on Financial Modeling, Data Analytics, Brand Pitching, and Business Plan development."
    },
    {
      icon: Target,
      title: "Industrial Exposures",
      desc: "Exclusive industrial tours, interactive case simulations, and leadership summits held throughout the academic calendar."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-16 pb-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Official Portal of SRCC Business Club
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Shaping Future <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">Corporate Leaders</span> & Innovators
            </h1>
            
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              SRCC Business Club is the premier platform empowering ambitious minds with corporate competence, 
              strategic business thinking, and leadership excellence.
            </p>

            {/* Quick Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onOpenLookup}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <CreditCard className="w-5 h-5" />
                Check Member Status & Dues
              </button>
              
              <button
                onClick={onOpenRegister}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
              >
                <Users className="w-5 h-5" />
                Apply for Membership
              </button>

              <button
                onClick={onGoToAdmin}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all"
              >
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Admin Portal
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 p-4 rounded-2xl text-center">
              <div className="text-3xl font-extrabold text-white">50 ৳</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Monthly Member Fee</div>
            </div>
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 p-4 rounded-2xl text-center">
              <div className="text-3xl font-extrabold text-amber-400">1.5 Yrs</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Active Club Tenure</div>
            </div>
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 p-4 rounded-2xl text-center">
              <div className="text-3xl font-extrabold text-blue-400">18+</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Annual Competitions</div>
            </div>
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 p-4 rounded-2xl text-center">
              <div className="text-3xl font-extrabold text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Transparent Records</div>
            </div>
          </div>
        </div>
      </section>

      {/* Club Membership Policy Highlight */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Official Membership Policy
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Standardized Monthly Contribution (50 TK)</h2>
              <p className="text-slate-600 text-sm max-w-2xl">
                Every member contributes <strong>50 TK per month</strong> from their official join date up to 
                their <strong>1.5 years (18 months)</strong> tenure. All contributions directly fund business case workshops, 
                networking events, certificates, and logistics.
              </p>
            </div>
            <button
              onClick={onOpenLookup}
              className="whitespace-nowrap px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
            >
              Check Your Due Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">What We Do at SRCC Business Club</h2>
            <p className="text-slate-600 mt-2 text-sm">Empowering students through structured learning, competition prep, and corporate bridge programs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{pillar.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Showcase */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Executive Panel</div>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Club Leadership (2025–2026)</h2>
              <p className="text-slate-600 text-sm mt-1">Dedicated committee leading initiatives and operations.</p>
            </div>
            <button
              onClick={onGoToAdmin}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Manage all club members & dues in Admin
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {executives.map((exec, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                    {exec.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{exec.name}</h3>
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {exec.role}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Member ID:</span>
                    <span className="font-mono font-bold text-slate-800">{exec.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-800">{exec.dept}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Blood Group:</span>
                    <span className="font-bold text-red-600">{exec.blood}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-sm py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-amber-400 font-bold">
                S
              </div>
              <span className="text-white font-bold text-base">SRCC Business Club</span>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} SRCC Business Club. Membership fee policy: 50 TK/month for 1.5-year tenure.
            </p>
            <div className="flex items-center gap-4 text-xs font-medium">
              <button onClick={onOpenLookup} className="hover:text-white transition-colors">Dues Verification</button>
              <button onClick={onOpenRegister} className="hover:text-white transition-colors">Join Club</button>
              <button onClick={onGoToAdmin} className="text-amber-400 hover:text-amber-300 font-semibold">Admin Panel</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
