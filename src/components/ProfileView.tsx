import React, { useState, useEffect, useRef } from 'react';
import { useMealDirect } from '../store';
import { CAMPUSES, PRESET_LOCATIONS } from '../mockData';
import { AppShell, GlassPanel } from './CommonUI';
import { User, Phone, MapPin, Check, ShieldAlert, Library, Home, Bookmark, Activity, Heart, Award } from 'lucide-react';
import * as d3 from 'd3';

interface SpendData {
  weekLabel: string;
  spendAmount: number;
  mostOrderedCategory: string;
  healthyIndex: number; // 0-100 rating
  tip: string;
}

const spendHistory: SpendData[] = [
  {
    weekLabel: 'Wk 19',
    spendAmount: 7500,
    mostOrderedCategory: 'Protein Mains',
    healthyIndex: 88,
    tip: 'Splendid protein-to-carb balance! Your orders consisting of charcoal grilled quarter poultry with sweet potatos aligned well with fiber targets.'
  },
  {
    weekLabel: 'Wk 20',
    spendAmount: 9200,
    mostOrderedCategory: 'Traditional Swallow',
    healthyIndex: 78,
    tip: 'Your intake of local vegetable egusi satisfies mineral needs. Balance high carbohydrate swallows by opting for smaller custom portions.'
  },
  {
    weekLabel: 'Wk 21',
    spendAmount: 5800,
    mostOrderedCategory: 'Grains & Salad',
    healthyIndex: 94,
    tip: 'Optimal performance! Fueling with Jollof rice paired with excess plantain dodo and raw salads meets clean fuel standards.'
  },
  {
    weekLabel: 'Wk 22',
    spendAmount: 12400,
    mostOrderedCategory: 'Mains & Poultry',
    healthyIndex: 82,
    tip: 'High energy consumption. Great charcoal protein ratios; remember to include fresh green sides to aid cellular assimilation!'
  },
  {
    weekLabel: 'Wk 23',
    spendAmount: 10100,
    mostOrderedCategory: 'Healthy Wraps',
    healthyIndex: 90,
    tip: 'Excellent choice. Double-garlic beef shawarma wraps are rich in proteins. Standardizing snack frequencies keeps study focus sharp!'
  },
];

export const ProfileView: React.FC = () => {
  const { user, updateProfile, savedLocationIds, toggleSaveLocation } = useMealDirect();

  // If user is null, fallback values
  const [fullName, setFullName] = useState(user?.fullName || 'Gbenga Venite');
  const [phone, setPhone] = useState(user?.phone || '08012345678');
  const [selectedCampus, setSelectedCampus] = useState(user?.campusId || CAMPUSES[0].id);
  const [selectedLocation, setSelectedLocation] = useState(user?.defaultLocationId || '');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; txt: string } | null>(null);

  // D3 ref & state
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(4); // Wk 23 by default

  // Filter locations
  const filteredLocs = PRESET_LOCATIONS.filter(loc => loc.campusId === selectedCampus);
  const zoneAHostels = filteredLocs.filter(loc => loc.zone === 'Zone A' && loc.type === 'Hostel');
  const zoneADepts = filteredLocs.filter(loc => loc.zone === 'Zone A' && loc.type === 'Department');
  const zoneBHostels = filteredLocs.filter(loc => loc.zone === 'Zone B' && loc.type === 'Hostel');
  const zoneBDepts = filteredLocs.filter(loc => loc.zone === 'Zone B' && loc.type === 'Department');

  const validatePhone = (num: string): boolean => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('+234')) {
      return clean.length === 14 && /^\+234\d{10}$/.test(clean);
    }
    if (clean.startsWith('0')) {
      return clean.length === 11 && /^0\d{10}$/.test(clean);
    }
    return false;
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!fullName.trim()) {
      setMsg({ type: 'error', txt: 'Please specify a valid name for courier contact.' });
      return;
    }

    if (!validatePhone(phone)) {
      setMsg({ type: 'error', txt: 'Please provide a valid Nigerian phone number (11 digits starting with 0).' });
      return;
    }

    if (!selectedLocation) {
      setMsg({ type: 'error', txt: 'Please select an authorized preset hostel or department desk terminal.' });
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      updateProfile(fullName, phone, selectedCampus, selectedLocation);
      setIsSaving(false);
      setMsg({ type: 'success', txt: 'Your contact profiles and default dispatch terminal were saved.' });
    }, 1000);
  };

  // Render D3 chart
  useEffect(() => {
    if (!svgRef.current) return;

    const d3Container = d3.select(svgRef.current);
    d3Container.selectAll('*').remove();

    const margin = { top: 30, right: 15, bottom: 35, left: 55 };
    const width = 500;
    const height = 230;

    const svg = d3Container
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%');

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale
    const xScale = d3.scaleBand()
      .domain(spendHistory.map(d => d.weekLabel))
      .range([0, chartWidth])
      .padding(0.4);

    // Y scale
    const yScale = d3.scaleLinear()
      .domain([0, 15000])
      .nice()
      .range([chartHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.15)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      );

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickSize(5))
      .attr('font-size', '10px')
      .attr('color', '#374151')
      .selectAll('text')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-weight', '500')
      .style('fill', '#4B5563');

    // Y Axis
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat(d => `₦${(Number(d)).toLocaleString()}`)
      )
      .attr('font-size', '10px')
      .attr('color', '#374151')
      .selectAll('text')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-weight', '500')
      .style('fill', '#4B5563');

    // Drawing bars
    const bars = g.selectAll('.bar')
      .data(spendHistory)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.weekLabel) || 0)
      .attr('y', d => yScale(d.spendAmount))
      .attr('width', xScale.bandwidth())
      .attr('height', d => chartHeight - yScale(d.spendAmount))
      .attr('rx', 6)
      .attr('fill', (d, i) => i === selectedWeek ? '#10b981' : '#111827')
      .attr('opacity', (d, i) => i === selectedWeek ? 1.0 : 0.6)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease');

    // Bar Labels
    g.selectAll('.label')
      .data(spendHistory)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (xScale(d.weekLabel) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.spendAmount) - 8)
      .attr('text-anchor', 'middle')
      .text(d => `₦${(d.spendAmount).toLocaleString()}`)
      .style('font-size', '9px')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-weight', '700')
      .style('fill', (d, i) => i === selectedWeek ? '#065f46' : '#374151');

    // Interactive behaviors
    bars.on('mouseover', function(event, d) {
      d3.select(this)
        .attr('opacity', 1.0)
        .attr('fill', '#059669');
    })
    .on('mouseout', function(event, d) {
      const idx = spendHistory.indexOf(d);
      d3.select(this)
        .attr('fill', idx === selectedWeek ? '#10b981' : '#111827')
        .attr('opacity', idx === selectedWeek ? 1.0 : 0.6);
    })
    .on('click', function(event, d) {
      const idx = spendHistory.indexOf(d);
      setSelectedWeek(idx);
    });

  }, [selectedWeek]);

  return (
    <AppShell activeTab="profile">
      <section className="mb-6" id="profile_header">
        <div>
          <span className="text-[10px] font-black tracking-widest text-emerald-deep uppercase bg-emerald-deep/5 px-2.5 py-1 rounded">PRESET DESKS</span>
          <h2 className="font-display font-black text-2xl text-emerald-strong mt-1.5" id="profile_headline">Profile & Settings</h2>
          <p className="text-xs text-muted-grey">Manage your registered phone numbers, pinned buildings, and meal health metrics.</p>
        </div>
      </section>

      {msg && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-start gap-2 animate-fade-in ${
          msg.type === 'success' ? 'bg-emerald-deep/6 border border-emerald-deep/12 text-emerald-strong' : 'bg-red-50 border border-red-200 text-danger'
        }`}>
          {msg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
          <span>{msg.txt}</span>
        </div>
      )}

      {/* Campus Healthy Nutritional Habits & Spending Analytics Card */}
      <GlassPanel className="p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-deep" />
            <h3 className="font-display font-bold text-sm text-emerald-strong">Nutritional Habits & Spending tracker</h3>
          </div>
          <span className="text-[9px] font-bold text-emerald-deep bg-emerald-deep/5 px-2 py-0.5 rounded uppercase">Interactive D3 Engine</span>
        </div>
        <p className="text-xs text-muted-grey mb-4 font-normal">
          Click any weekly bar on the chart below to inspect category details, check your dietary health rating, and unlock nutrient insights!
        </p>

        {/* D3 Canvas container */}
        <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 flex items-center justify-center mb-5">
          <div className="w-full max-w-sm md:max-w-md">
            <svg ref={svgRef} className="w-full h-auto" />
          </div>
        </div>

        {/* Dynamic Detail Insights box */}
        <div className="bg-white p-4.5 rounded-2xl border border-emerald-deep/10 shadow-xs relative overflow-hidden transition-all duration-300">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 bg-emerald-deep/5 rounded-full blur-xs pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-light-grey/15">
            <div>
              <span className="text-[9px] font-mono font-black text-muted-grey uppercase">Selected Period</span>
              <h4 className="font-display font-black text-xs text-ink-deep mt-0.5">{spendHistory[selectedWeek].weekLabel} (Spending Period)</h4>
            </div>

            <div className="flex gap-4">
              <div>
                <span className="text-[9px] font-mono font-black text-muted-grey uppercase block">Top Category</span>
                <span className="text-xs font-bold text-emerald-strong">{spendHistory[selectedWeek].mostOrderedCategory}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono font-black text-muted-grey uppercase block">Dietary Health Ratio</span>
                <span className="text-xs font-black text-emerald-deep flex items-center gap-0.5 justify-end">
                  <Heart className="w-3.5 h-3.5 fill-current text-rose-500 shrink-0" />
                  <span>{spendHistory[selectedWeek].healthyIndex}%</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs leading-relaxed text-[#2D3331]">
            <div className="flex gap-2 items-start">
              <Award className="w-4 h-4 text-emerald-deep shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[11px] text-ink-deep leading-tight">Campus Nutrition Advisor Insight:</p>
                <p className="text-muted-grey text-[11px] mt-1">{spendHistory[selectedWeek].tip}</p>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Contact details */}
        <GlassPanel className="p-6">
          <h3 className="font-display font-bold text-sm text-emerald-strong mb-4 flex items-center gap-1.5">
            <User className="w-4.5 h-4.5 text-emerald-deep" />
            Basic Contact profile
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-muted-grey block mb-1.5 uppercase">Full Student Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-emerald-deep/15 rounded-xl text-xs focus:ring-2 focus:ring-emerald-deep focus:outline-none font-semibold"
                required
                id="profile_name_input"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-muted-grey block mb-1.5 uppercase">Contact phone number (Nigerian)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-grey">
                  <Phone className="w-4 h-4 text-emerald-deep" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-emerald-deep/15 rounded-xl text-xs focus:ring-2 focus:ring-emerald-deep focus:outline-none font-semibold font-mono"
                  required
                  id="profile_phone_input"
                />
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Pinned shortcuts overview panel */}
        {savedLocationIds.length > 0 && (
          <GlassPanel className="p-6">
            <h3 className="font-display font-bold text-sm text-emerald-strong mb-3 flex items-center gap-1.5">
              <Bookmark className="w-4.5 h-4.5 text-[#F3B33D] fill-current" />
              Your Pinned Delivery Shortcuts ({savedLocationIds.length})
            </h3>
            <p className="text-xs text-muted-grey mb-3.5 leading-relaxed">
              These campus locations are actively bookmarked as checkout shortcut cards. Tap any shortcut card below to instantly configure it as your main default dispatch terminal desk!
            </p>
            <div className="flex flex-wrap gap-2">
              {savedLocationIds.map(locId => {
                const loc = PRESET_LOCATIONS.find(l => l.id === locId);
                if (!loc) return null;
                const isDefault = selectedLocation === locId;
                return (
                  <div
                    key={locId}
                    onClick={() => setSelectedLocation(locId)}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center justify-between gap-3 ${
                      isDefault
                        ? 'bg-emerald-deep/6 border-emerald-deep text-emerald-strong font-bold'
                        : 'bg-white border-neutral-100 hover:border-emerald-deep/20 text-[#374151]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-emerald-deep shrink-0" />
                      <span className="truncate">{loc.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveLocation(locId);
                      }}
                      className="text-[#F3B33D] hover:text-red-500 transition cursor-pointer shrink-0"
                      title="Unpin location"
                    >
                      ★
                    </button>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        )}

        {/* Dispatch terminal desks preset */}
        <GlassPanel className="p-6">
          <h3 className="font-display font-bold text-sm text-emerald-strong mb-4 flex items-center gap-1.5">
            <MapPin className="w-4.5 h-4.5 text-emerald-deep" />
            Default Dispatch terminal preset
          </h3>

          <p className="text-xs text-muted-grey mb-4 leading-relaxed">
            Choose your primary campus delivery terminal below. Standard batch deliveries are packaged and dispatched directly to these terminals. Use the bookmark star shortcut to pin/unpin structures for instant checkout selectors.
          </p>

          <div className="mb-6">
            <label className="text-[9px] font-bold text-muted-grey block mb-1.5 uppercase">Active Campus Node</label>
            <select
              value={selectedCampus}
              onChange={(e) => {
                setSelectedCampus(e.target.value);
                setSelectedLocation('');
              }}
              className="w-full px-4 py-3 bg-white border border-emerald-deep/15 rounded-xl font-medium text-xs focus:ring-2 focus:ring-emerald-deep cursor-pointer focus:outline-none font-semibold"
            >
              {CAMPUSES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-6">
            {/* ZONE A */}
            <div>
              <span className="text-[9px] font-black tracking-wider text-emerald-strong bg-emerald-deep/5 px-2 py-0.5 rounded uppercase">Zone A Terminals</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {zoneAHostels.map(loc => {
                  const isPinned = savedLocationIds.includes(loc.id);
                  return (
                    <div
                      key={loc.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition text-xs ${
                        selectedLocation === loc.id
                          ? 'border-emerald-deep bg-emerald-deep/6'
                          : 'border-neutral-100 hover:border-emerald-deep/20 hover:bg-neutral-50/50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedLocation(loc.id)}
                        className="flex-1 flex items-center gap-2 truncate text-left cursor-pointer font-bold text-emerald-strong"
                      >
                        <Home className="w-4 h-4 text-emerald-deep/80 shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </button>
                      
                      <div className="flex items-center gap-1 px-1 shrink-0">
                        {selectedLocation === loc.id && <Check className="w-3.5 h-3.5 text-emerald-deep" />}
                        <button
                          type="button"
                          onClick={() => toggleSaveLocation(loc.id)}
                          className={`p-1.5 rounded-lg transition active:scale-90 cursor-pointer ${
                            isPinned
                              ? 'text-amber-500'
                              : 'text-neutral-300 hover:text-neutral-500'
                          }`}
                          title={isPinned ? "Unpin building" : "Pin building for quick shortcuts"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {zoneADepts.map(loc => {
                  const isPinned = savedLocationIds.includes(loc.id);
                  return (
                    <div
                      key={loc.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition text-xs ${
                        selectedLocation === loc.id
                          ? 'border-emerald-deep bg-emerald-deep/6'
                          : 'border-neutral-100 hover:border-emerald-deep/20 hover:bg-neutral-50/50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedLocation(loc.id)}
                        className="flex-1 flex items-center gap-2 truncate text-left cursor-pointer font-bold text-emerald-strong"
                      >
                        <Library className="w-4 h-4 text-emerald-deep/80 shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </button>
                      
                      <div className="flex items-center gap-1 px-1 shrink-0">
                        {selectedLocation === loc.id && <Check className="w-3.5 h-3.5 text-emerald-deep" />}
                        <button
                          type="button"
                          onClick={() => toggleSaveLocation(loc.id)}
                          className={`p-1.5 rounded-lg transition active:scale-90 cursor-pointer ${
                            isPinned
                              ? 'text-amber-500'
                              : 'text-neutral-300 hover:text-neutral-500'
                          }`}
                          title={isPinned ? "Unpin building" : "Pin building for quick shortcuts"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ZONE B */}
            <div>
              <span className="text-[9px] font-black tracking-wider text-mango-warm bg-mango-warm/5 px-2 py-0.5 rounded uppercase">Zone B Terminals</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {zoneBHostels.map(loc => {
                  const isPinned = savedLocationIds.includes(loc.id);
                  return (
                    <div
                      key={loc.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition text-xs ${
                        selectedLocation === loc.id
                          ? 'border-emerald-deep bg-emerald-deep/6'
                          : 'border-neutral-100 hover:border-emerald-deep/20 hover:bg-neutral-50/50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedLocation(loc.id)}
                        className="flex-1 flex items-center gap-2 truncate text-left cursor-pointer font-bold text-emerald-strong"
                      >
                        <Home className="w-4 h-4 text-emerald-deep/80 shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </button>
                      
                      <div className="flex items-center gap-1 px-1 shrink-0">
                        {selectedLocation === loc.id && <Check className="w-3.5 h-3.5 text-emerald-deep" />}
                        <button
                          type="button"
                          onClick={() => toggleSaveLocation(loc.id)}
                          className={`p-1.5 rounded-lg transition active:scale-90 cursor-pointer ${
                            isPinned
                              ? 'text-amber-500'
                              : 'text-neutral-300 hover:text-neutral-500'
                          }`}
                          title={isPinned ? "Unpin building" : "Pin building for quick shortcuts"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {zoneBDepts.map(loc => {
                  const isPinned = savedLocationIds.includes(loc.id);
                  return (
                    <div
                      key={loc.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition text-xs ${
                        selectedLocation === loc.id
                          ? 'border-emerald-deep bg-emerald-deep/6'
                          : 'border-neutral-100 hover:border-emerald-deep/20 hover:bg-neutral-50/50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedLocation(loc.id)}
                        className="flex-1 flex items-center gap-2 truncate text-left cursor-pointer font-bold text-emerald-strong"
                      >
                        <Library className="w-4 h-4 text-emerald-deep/80 shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </button>
                      
                      <div className="flex items-center gap-1 px-1 shrink-0">
                        {selectedLocation === loc.id && <Check className="w-3.5 h-3.5 text-emerald-deep" />}
                        <button
                          type="button"
                          onClick={() => toggleSaveLocation(loc.id)}
                          className={`p-1.5 rounded-lg transition active:scale-90 cursor-pointer ${
                            isPinned
                              ? 'text-amber-500'
                              : 'text-neutral-300 hover:text-neutral-500'
                          }`}
                          title={isPinned ? "Unpin building" : "Pin building for quick shortcuts"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </GlassPanel>

        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-4 bg-emerald-deep hover:bg-emerald-strong text-white font-bold text-xs rounded-2xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
          id="profile_save_btn"
        >
          <span>{isSaving ? 'Saving Profile...' : 'Save Dispatch Settings'}</span>
        </button>
      </form>
    </AppShell>
  );
};
