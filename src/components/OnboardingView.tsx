import React, { useState } from 'react';
import { useMealDirect } from '../store';
import { CAMPUSES, PRESET_LOCATIONS } from '../mockData';
import { AppShell, GlassPanel } from './CommonUI';
import { MapPin, Phone, Check, ShieldAlert, Library, Home, ChevronRight, Globe } from 'lucide-react';
import { COUNTRIES, validateCountryPhone } from '../utils/countries';

export const OnboardingView: React.FC = () => {
  const { completeOnboarding, navigateTo } = useMealDirect();
  
  // States
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [localPhone, setLocalPhone] = useState('');
  const [selectedCampus, setSelectedCampus] = useState(CAMPUSES[0].id);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Group locations
  const filteredLocs = PRESET_LOCATIONS.filter(loc => loc.campusId === selectedCampus);
  const zoneAHostels = filteredLocs.filter(loc => loc.zone === 'Zone A' && loc.type === 'Hostel');
  const zoneADepts = filteredLocs.filter(loc => loc.zone === 'Zone A' && loc.type === 'Department');
  const zoneBHostels = filteredLocs.filter(loc => loc.zone === 'Zone B' && loc.type === 'Hostel');
  const zoneBDepts = filteredLocs.filter(loc => loc.zone === 'Zone B' && loc.type === 'Department');

  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate
    if (!validateCountryPhone(selectedCountry, localPhone)) {
      setErrorMessage(`Please provide a valid phone number for ${selectedCountry.name}. e.g. ${selectedCountry.example}`);
      return;
    }

    if (!selectedLocation) {
      setErrorMessage('Please select a valid preset hostel or department terminal desk for your drops.');
      return;
    }

    setIsSubmitting(true);

    const finalPhoneNumber = selectedCountry.code === 'OTHER'
      ? localPhone.trim()
      : `${selectedCountry.dialCode}${localPhone.trim().replace(/^0/, '')}`;

    setTimeout(() => {
      completeOnboarding(finalPhoneNumber, selectedCampus, selectedLocation);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <AppShell activeTab="none">
      <div className="max-w-xl mx-auto py-4" id="onboarding_form">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black tracking-widest text-emerald-deep uppercase bg-emerald-deep/5 px-2.5 py-1 rounded">Step 2 of 2</span>
            <h2 className="font-display font-black text-2xl text-emerald-strong mt-1.5" id="onboarding_header">Completing Your Onboarding</h2>
            <p className="text-xs text-muted-grey">Tell us where to drop your hot meal deliveries.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-xs text-danger font-semibold rounded-2xl flex items-start gap-2.5 animate-fade-in">
            <ShieldAlert className="w-5 h-5 text-danger shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleFinishOnboarding} className="flex flex-col gap-6">
          {/* Section 1: Contact Phone */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <Phone className="w-5 h-5 text-emerald-deep" />
              <h3 className="font-display font-bold text-sm text-emerald-strong">Emergency Contact Mobile</h3>
            </div>
            
            <p className="text-xs text-muted-grey mb-4 leading-relaxed">
              Required for SMS notifications when the courier rider arrives at your preset zone desk.
            </p>

            <div className="flex gap-2.5">
              <div className="w-1/3 shrink-0 relative">
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const found = COUNTRIES.find(c => c.code === e.target.value);
                    if (found) {
                      setSelectedCountry(found);
                      setLocalPhone('');
                    }
                  }}
                  className="w-full px-3.5 py-3.5 bg-neutral-50/50 hover:bg-neutral-50 border border-emerald-deep/15 rounded-xl font-bold text-xs focus:ring-2 focus:ring-emerald-deep focus:outline-none appearance-none cursor-pointer h-full text-ink-deep"
                  id="onboarding_country_select"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.dialCode}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-grey text-[9px]">
                  ▼
                </div>
              </div>

              <div className="flex-1 relative">
                <input
                  type="tel"
                  placeholder={selectedCountry.code === 'OTHER' ? '+234 803 123 4567' : selectedCountry.placeholder}
                  value={localPhone}
                  onChange={(e) => {
                    // Normalize and strip non-digit characters unless it's OTHER (which needs '+' for dialcode)
                    const allowedChars = selectedCountry.code === 'OTHER' ? /[^\d+]/g : /\D/g;
                    setLocalPhone(e.target.value.replace(allowedChars, ''));
                  }}
                  className="w-full px-4 py-3 bg-white border border-emerald-deep/15 rounded-xl font-mono text-sm focus:ring-2 focus:ring-emerald-deep focus:outline-none font-bold text-ink-deep"
                  required
                  id="onboarding_phone_input"
                />
              </div>
            </div>
            <span className="text-[10px] text-muted-grey mt-2 block font-medium">
              Format: {selectedCountry.example}
            </span>
          </GlassPanel>

          {/* Section 2: Choose Preset Dispatch Terminal */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <MapPin className="w-5 h-5 text-emerald-deep" />
              <h3 className="font-display font-bold text-sm text-emerald-strong">Select Preset Dispatch Terminal</h3>
            </div>

            <p className="text-xs text-muted-grey mb-4 leading-relaxed">
              Meal Direct operates <strong>batch delivery</strong> to eliminate delays. Registering your most common hostel residency or department building wing ensures flawless timing.
            </p>

            {/* Campus Selector */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-muted-grey block mb-1.5 uppercase">Select Campus Unit</label>
              <select
                value={selectedCampus}
                onChange={(e) => {
                  setSelectedCampus(e.target.value);
                  setSelectedLocation('');
                }}
                className="w-full px-4 py-3 bg-white border border-emerald-deep/15 rounded-xl font-medium text-xs focus:ring-2 focus:ring-emerald-deep cursor-pointer focus:outline-none"
              >
                {CAMPUSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Structured Card Grid Selection */}
            <div className="space-y-6">
              {/* ZONE A */}
              <div>
                <span className="text-[10px] font-bold tracking-wider text-emerald-strong bg-emerald-deep/5 px-2.5 py-1 rounded-full uppercase">Zone A Dispatch Terminals</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                  {/* Hostels */}
                  {zoneAHostels.map(loc => (
                    <button
                      type="button"
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl text-left border transition text-xs cursor-pointer ${
                        selectedLocation === loc.id
                          ? 'border-emerald-deep bg-emerald-deep/6 text-emerald-strong font-semibold'
                          : 'border-neutral-100 hover:border-emerald-deep/20 hover:bg-neutral-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Home className="w-4 h-4 text-emerald-deep/80 shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </div>
                      {selectedLocation === loc.id && <Check className="w-4 h-4 text-emerald-deep shrink-0 ml-2" />}
                    </button>
                  ))}

                  {/* Departments */}
                  {zoneADepts.map(loc => (
                    <button
                      type="button"
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl text-left border transition text-xs cursor-pointer ${
                        selectedLocation === loc.id
                          ? 'border-emerald-deep bg-emerald-deep/6 text-emerald-strong font-semibold'
                          : 'border-neutral-100 hover:border-emerald-deep/20 hover:bg-neutral-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Library className="w-4 h-4 text-emerald-deep/80 shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </div>
                      {selectedLocation === loc.id && <Check className="w-4 h-4 text-emerald-deep shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* ZONE B */}
              <div>
                <span className="text-[10px] font-bold tracking-wider text-mango-warm bg-mango-warm/5 px-2.5 py-1 rounded-full uppercase">Zone B Dispatch Terminals</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                  {/* Hostels */}
                  {zoneBHostels.map(loc => (
                    <button
                      type="button"
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl text-left border transition text-xs cursor-pointer ${
                        selectedLocation === loc.id
                          ? 'border-emerald-deep bg-emerald-deep/6 text-emerald-strong font-semibold'
                          : 'border-neutral-100 hover:border-emerald-deep/20 hover:bg-neutral-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Home className="w-4 h-4 text-emerald-deep/80 shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </div>
                      {selectedLocation === loc.id && <Check className="w-4 h-4 text-emerald-deep shrink-0 ml-2" />}
                    </button>
                  ))}

                  {/* Departments */}
                  {zoneBDepts.map(loc => (
                    <button
                      type="button"
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl text-left border transition text-xs cursor-pointer ${
                        selectedLocation === loc.id
                          ? 'border-emerald-deep bg-emerald-deep/6 text-emerald-strong font-semibold'
                          : 'border-neutral-100 hover:border-emerald-deep/20 hover:bg-neutral-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Library className="w-4 h-4 text-emerald-deep/80 shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </div>
                      {selectedLocation === loc.id && <Check className="w-4 h-4 text-emerald-deep shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Sticky Onboarding Actions */}
          <div className="mt-4 pb-8 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-10 py-4.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-emerald-deep/20 text-emerald-strong/40 cursor-not-allowed'
                  : 'bg-emerald-deep hover:bg-emerald-strong text-white hover:scale-[1.01] active:scale-95 cursor-pointer shadow-lg shadow-emerald-deep/15'
              }`}
              id="onboarding_submit_btn"
            >
              <span>{isSubmitting ? 'Registering...' : 'Save & Enter Dashboard'}</span>
              {!isSubmitting && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
};
