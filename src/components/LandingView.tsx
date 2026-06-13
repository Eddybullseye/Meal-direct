import React, { useState } from 'react';
import { useMealDirect } from '../store';
import { CAMPUSES, DELIVERY_SLOTS, formatNGN } from '../mockData';
import { AppShell, GlassPanel } from './CommonUI';
import { Sparkles, ArrowRight, ShieldCheck, HelpCircle, GraduationCap, MapPin, Clock } from 'lucide-react';

export const LandingView: React.FC = () => {
  const { user, navigateTo } = useMealDirect();
  const [selectedCampus, setSelectedCampus] = useState(CAMPUSES[0].id);

  const handleCTA = () => {
    if (user) {
      if (user.isOnboarded) {
        navigateTo('/home');
      } else {
        navigateTo('/onboarding');
      }
    } else {
      navigateTo('/auth/sign-in');
    }
  };

  return (
    <AppShell activeTab="none">
      {/* Editorial Hero Branding Section */}
      <section className="text-center py-12 md:py-18 px-4" id="landing_hero">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-deep/5 border border-emerald-deep/12 text-emerald-strong text-xs font-bold mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-mango-warm fill-mango-warm" />
          <span>Exclusive Venue Scheduled Lunch & Dinner Dispatch</span>
        </div>
        
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-emerald-strong tracking-tight leading-none mb-6">
          Delicious Campus Meals,<br />
          <span className="text-mango-warm">Dispatched Right on Schedule</span>
        </h2>
        
        <p className="text-sm md:text-base text-muted-grey max-w-xl mx-auto leading-relaxed mb-8">
          Serving <strong>Venite University</strong> launch students with batch delivery drop-offs straight to preset secure hostel & department counters. No cold meals. No delivery delays. Flat ₦150 dispatch fee.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={handleCTA}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-deep hover:bg-emerald-strong text-white font-bold rounded-2xl transition duration-200 cursor-pointer shadow-lg shadow-emerald-deep/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group text-sm"
            id="landing_cta_btn"
          >
            <span>{user ? 'Enter Dashboard' : 'Order Campus Food'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>
          
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-4 bg-white/60 hover:bg-white text-emerald-strong font-semibold rounded-2xl transition cursor-pointer border border-emerald-deep/10 text-center text-sm"
          >
            See Schedule times
          </a>
        </div>
      </section>

      {/* Active Campus Availability Card */}
      <section className="mb-12" id="campus_selector_section">
        <GlassPanel className="border-t-[4px] border-t-emerald-deep">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-emerald-deep/6 rounded-2xl text-emerald-strong">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-emerald-strong" id="campus_title">Currently Serving:</h3>
                <p className="text-xs text-muted-grey mt-0.5">We strictly dispatch within authenticated campus perimeters.</p>
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full md:w-64 px-4 py-3 bg-white border border-emerald-deep/15 rounded-xl font-medium text-xs focus:ring-2 focus:ring-emerald-deep cursor-pointer focus:outline-none"
                aria-label="Active campus selection"
              >
                {CAMPUSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-emerald-deep/8 flex items-center gap-2 text-emerald-strong text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-deep animate-ping" />
            <span>Launch Phase: 3 active vendors fully certified with real-time slot cutoff timers.</span>
          </div>
        </GlassPanel>
      </section>

      {/* Spacing Flow explaining exact rules */}
      <section className="py-8 scroll-mt-20" id="how-it-works">
        <h3 className="font-display text-2xl font-black text-center text-emerald-strong mb-2">
          The 3 Golden Campus Rules
        </h3>
        <p className="text-center text-xs text-muted-grey mb-10 max-w-md mx-auto">
          Understand how Meal Direct keeps dispatch timing pristine and cost extremely low for Venite University.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-emerald-deep/8 flex flex-col items-start shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-mango-warm/15 text-mango-warm font-bold flex items-center justify-center font-display text-lg mb-4">
              1
            </div>
            <h4 className="font-display font-bold text-sm text-emerald-strong mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-deep" />
              Mind the 60-Min Cutoff
            </h4>
            <p className="text-xs text-muted-grey leading-relaxed">
              We batch-dispatch exactly at scheduled times: 8:00, 10:00, 12:00, 14:00, 17:00, and 19:00. Ordering closes strictly <strong>60 minutes</strong> before each slot.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-emerald-deep/8 flex flex-col items-start shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-deep/10 text-emerald-strong font-bold flex items-center justify-center font-display text-lg mb-4">
              2
            </div>
            <h4 className="font-display font-bold text-sm text-emerald-strong mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-deep" />
              Collect at Preset Desks
            </h4>
            <p className="text-xs text-muted-grey leading-relaxed">
              Select your specific hostel block or departmental terminal. Courier riders deliver safely in batches, so they drop-off directly to trusted zone coordinators. No delays!
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-emerald-deep/8 flex flex-col items-start shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-mango-warm/15 text-mango-warm font-bold flex items-center justify-center font-display text-lg mb-4">
              3
            </div>
            <h4 className="font-display font-bold text-sm text-emerald-strong mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-deep" />
              One Takeaway, 3 Spoons
            </h4>
            <p className="text-xs text-muted-grey leading-relaxed">
              To minimize packaging volume, one order constitutes a cohesive takeaway box. You can request up to 3 plastic spoons for group snacking if required!
            </p>
          </div>
        </div>
      </section>

      {/* Available Slots Preview */}
      <section className="mt-12 bg-emerald-strong rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl" id="delivery_slots_schedule">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-deep rounded-full opacity-20 blur-2xl" />
        
        <div className="relative z-10">
          <h3 className="font-display text-xl font-bold mb-2">Our Dispatch Slates Today</h3>
          <p className="text-xs text-emerald-100 mb-6 max-w-sm">Ordering closes precisely 1 hour before arrival. Food stays hot in thermal courier boxes.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DELIVERY_SLOTS.map(s => (
              <div key={s.id} className="bg-emerald-deep/40 rounded-2xl p-4 border border-white/8 text-center backdrop-blur-sm shadow-sm hover:border-white/20 transition">
                <span className="font-mono text-xs font-bold text-mango-warm">{s.time}</span>
                <p className="text-[10px] font-bold mt-1 text-white truncate leading-tight">{s.label.split('(')[0]}</p>
                <span className="inline-block mt-2 text-[8px] bg-emerald-deep/60 px-1.5 py-0.5 rounded text-emerald-200">
                  Cutoff {parseInt(s.time.split(':')[0]) - 1}:00
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust guarantees */}
      <section className="mt-12 text-center" id="landing_help">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-grey">
          <HelpCircle className="w-4 h-4 text-emerald-deep" />
          <span>Need support? All operations have a certified <strong>Escalation Gate</strong> to solve packaging or food quality queries.</span>
        </div>
      </section>
    </AppShell>
  );
};
