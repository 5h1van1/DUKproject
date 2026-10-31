import React, { useState, useMemo } from 'react';
import { config } from '../config';
import { deleteRsvp, resetDemoData, isFirebaseReady } from '../services/db';
import {
  Lock,
  Download,
  Search,
  Filter,
  Trash2,
  Users,
  Shirt,
  Calendar,
  Crown,
  Zap,
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  Database,
} from 'lucide-react';

export default function AdminView({ rsvps = [], onBackToHome }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('turf_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [jerseyFilter, setJerseyFilter] = useState('all');

  // Correct passcode from environment variable with fallback
  const correctPasscode = import.meta.env.VITE_ADMIN_PASSCODE || 'turf2026';

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode.trim() === correctPasscode.trim()) {
      setIsAuthenticated(true);
      sessionStorage.setItem('turf_admin_auth', 'true');
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('turf_admin_auth');
  };

  const handleDelete = async (docId, name) => {
    if (window.confirm(`Are you sure you want to remove RSVP for "${name}"?`)) {
      await deleteRsvp(docId);
    }
  };

  // Summary Metrics calculations
  const totalGuests = rsvps.length;
  const brideCount = rsvps.filter((r) => r.team === 'bride').length;
  const groomCount = rsvps.filter((r) => r.team === 'groom').length;
  
  const dateCounts = useMemo(() => {
    const counts = {};
    config.dates.forEach((d) => {
      counts[d.id] = rsvps.filter((r) => r.preferredDate === d.id).length;
    });
    return counts;
  }, [rsvps]);

  const jerseyStats = useMemo(() => {
    const sizeMap = {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
      '3XL': 0,
    };
    let totalJerseysNeeded = 0;
    let noJerseyCount = 0;

    rsvps.forEach((r) => {
      if (r.needsJersey && r.jerseySize && r.jerseySize !== 'None') {
        totalJerseysNeeded++;
        if (sizeMap[r.jerseySize] !== undefined) {
          sizeMap[r.jerseySize]++;
        } else {
          sizeMap[r.jerseySize] = (sizeMap[r.jerseySize] || 0) + 1;
        }
      } else {
        noJerseyCount++;
      }
    });

    return { sizeMap, totalJerseysNeeded, noJerseyCount };
  }, [rsvps]);

  // Filtered RSVPs
  const filteredRsvps = useMemo(() => {
    return rsvps.filter((r) => {
      const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesTeam = teamFilter === 'all' || r.team === teamFilter;
      const matchesDate = dateFilter === 'all' || r.preferredDate === dateFilter;
      const matchesJersey =
        jerseyFilter === 'all' ||
        (jerseyFilter === 'needed' && r.needsJersey) ||
        (jerseyFilter === 'none' && !r.needsJersey);

      return matchesSearch && matchesTeam && matchesDate && matchesJersey;
    });
  }, [rsvps, searchQuery, teamFilter, dateFilter, jerseyFilter]);

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['Player Name', 'Squad', 'Preferred Date', 'Needs Jersey', 'Jersey Size', 'Last Updated'];
    const rows = filteredRsvps.map((r) => [
      `"${r.name || ''}"`,
      r.team === 'bride' ? 'Team Bride' : 'Team Groom',
      r.preferredDate || '',
      r.needsJersey ? 'Yes' : 'No',
      r.needsJersey ? r.jerseySize : 'None',
      r.updatedAt || r.createdAt || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TurfDay_RSVPs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PASSCODE LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-center text-white shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-amber-400 border border-slate-700 shadow-md mb-4">
            <Lock className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-black text-white">Organizer Portal</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Enter the admin passcode to view guest counts, jersey orders, and export RSVP lists.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setPasscodeError(false);
                }}
                placeholder="Enter admin passcode"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-3 px-4 text-center text-sm font-medium text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                autoFocus
              />
              {passcodeError && (
                <p className="mt-2 text-xs font-semibold text-rose-400">
                  Incorrect passcode. (Default: {correctPasscode})
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 transition-colors uppercase tracking-wider"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-4">
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Public Invitation</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title="Return to Public Site"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-base font-extrabold flex items-center gap-2">
                <span>Organizer Dashboard</span>
                <span className="text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-300 px-2 py-0.5 border border-amber-400/30">
                  ADMIN
                </span>
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Database className="h-3 w-3 text-emerald-400" />
                <span>
                  {isFirebaseReady ? 'Live Firestore Sync (Cloud)' : 'Local Demo Storage (Fallback)'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
        {/* SUMMARY CARDS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Card 1: Total Guests */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Total Guests</span>
              <Users className="h-4 w-4 text-turf-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalGuests}</div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1">Confirmed RSVPs</span>
          </div>

          {/* Card 2: Squad Split */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Team Lineup</span>
              <div className="flex gap-1">
                <Crown className="h-3.5 w-3.5 text-rose-500" />
                <Zap className="h-3.5 w-3.5 text-blue-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-rose-600">{brideCount}</span>
              <span className="text-xs text-slate-400 font-bold">vs</span>
              <span className="text-xl sm:text-2xl font-black text-blue-600">{groomCount}</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              {totalGuests > 0 ? `${Math.round((brideCount / totalGuests) * 100)}% Bride / ${Math.round((groomCount / totalGuests) * 100)}% Groom` : '0%'}
            </span>
          </div>

          {/* Card 3: Date Breakdown */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Per Date</span>
              <Calendar className="h-4 w-4 text-amber-500" />
            </div>
            <div className="space-y-0.5">
              {config.dates.map((d) => (
                <div key={d.id} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{d.shortDate}:</span>
                  <span className="font-mono font-bold text-slate-900">{dateCounts[d.id] || 0}</span>
                </div>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">5:00 PM to 8:00 PM</span>
          </div>

          {/* Card 4: Jerseys Total */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Jerseys Needed</span>
              <Shirt className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600">
              {jerseyStats.totalJerseysNeeded}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              {jerseyStats.noJerseyCount} opted out of jersey
            </span>
          </div>
        </div>

        {/* JERSEY SIZE BREAKDOWN BAR (Crucial for bulk ordering!) */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Shirt className="h-4 w-4 text-emerald-600" />
                <span>Jersey Order Breakdown by Size (Vendor Tally)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Exact count for placing printing and manufacturing orders.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
              Total Order: {jerseyStats.totalJerseysNeeded} pcs
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {Object.entries(jerseyStats.sizeMap).map(([size, count]) => (
              <div
                key={size}
                className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 hover:bg-slate-100 transition-colors"
              >
                <span className="text-xs font-bold text-slate-600 uppercase">{size}</span>
                <span className="text-lg font-black text-slate-900 mt-0.5">{count}</span>
                <span className="text-[10px] text-slate-400">pcs</span>
              </div>
            ))}
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by player name..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-turf-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Team Filter */}
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Teams</option>
              <option value="bride">Team Bride</option>
              <option value="groom">Team Groom</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Dates</option>
              {config.dates.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.shortDate}
                </option>
              ))}
            </select>

            {/* Jersey Filter */}
            <select
              value={jerseyFilter}
              onChange={(e) => setJerseyFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Jersey Status</option>
              <option value="needed">Needs Jersey</option>
              <option value="none">No Jersey</option>
            </select>

            {/* Reset Demo Data button (for convenient local testing) */}
            <button
              onClick={() => {
                if (window.confirm('Reset local demo guest list?')) {
                  resetDemoData();
                }
              }}
              title="Reset Demo RSVPs"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* RESPONSES TABLE */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Showing {filteredRsvps.length} of {rsvps.length} responses
            </span>
          </div>

          {filteredRsvps.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm font-semibold">No RSVPs match your search/filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTeamFilter('all');
                  setDateFilter('all');
                  setJerseyFilter('all');
                }}
                className="mt-2 text-xs text-turf-700 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Player Name</th>
                    <th className="px-4 py-3">Squad</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Jersey Size</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRsvps.map((rsvp) => {
                    const isBride = rsvp.team === 'bride';
                    const dateObj = config.dates.find((d) => d.id === rsvp.preferredDate);

                    return (
                      <tr key={rsvp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {rsvp.name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              isBride
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {isBride ? <Crown className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                            {isBride ? 'Team Bride' : 'Team Groom'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {dateObj ? dateObj.shortDate : rsvp.preferredDate}
                        </td>
                        <td className="px-4 py-3">
                          {rsvp.needsJersey ? (
                            <span className="font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                              {rsvp.jerseySize}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No Jersey</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(rsvp.id, rsvp.name)}
                            title="Delete RSVP"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
