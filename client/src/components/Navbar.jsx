import React from 'react';
import { Shield, Users, Search, UserPlus, Briefcase, Award } from 'lucide-react';

import { clubConfig } from '../config/clubConfig';

export default function Navbar({ activeTab, setActiveTab, onOpenLookup, onOpenRegister }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('public')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {clubConfig.logoImage ? (
              <img 
                src={clubConfig.logoImage} 
                alt="Club Logo" 
                className="w-10 h-10 object-contain rounded-xl shadow-md group-hover:scale-105 transition-transform" 
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5 text-amber-400" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-lg text-white">{clubConfig.name}</span>
                <span className="text-amber-400 font-bold text-xs px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                  {clubConfig.subName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide font-medium">{clubConfig.tagline}</p>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('public')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'public'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Club Overview
            </button>
            <button
              onClick={onOpenLookup}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <Search className="w-4 h-4 text-amber-400" />
              Check Status & Dues
            </button>
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              Join Club
            </button>
          </nav>

          {/* Admin Portal Tab */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600'
              }`}
            >
              <Shield className={`w-4 h-4 ${activeTab === 'admin' ? 'text-amber-400' : 'text-blue-400'}`} />
              <span>Admin Portal</span>
              <span className="text-[10px] bg-slate-700/80 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-400/20">
                Admin
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
