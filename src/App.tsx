import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Cpu, 
  BookOpen, 
  Play, 
  Settings, 
  Info,
  Layers,
  Sparkles,
  Wifi,
  Github,
  CheckCircle,
  Clock,
  Thermometer,
  Droplets
} from "lucide-react";

import { DashboardView } from "./components/DashboardView";
import { WiringGuide } from "./components/WiringGuide";
import { SoftwareGuide } from "./components/SoftwareGuide";
import { TesterPanel } from "./components/TesterPanel";
import { Measurement, AppConfig, TabType } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [telemetry, setTelemetry] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorString, setErrorString] = useState<string | null>(null);
  
  const [config, setConfig] = useState<AppConfig>({
    apiKey: "pi_dht20_secure_token_abc123",
    appUrl: "http://localhost:3000",
    endpointUrl: "http://localhost:3000/api/telemetry"
  });

  // Fetch configuration parameters from Express back-end
  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err: any) {
      console.warn("Could not retrieve backend config parameters, using default state", err);
    }
  };

  // Fetch telemetry measurement values from Express back-end (or fallback to static data.json for GitHub Pages)
  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/telemetry");
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data.history || []);
        setErrorString(null);
      } else {
        // Fallback to static data.json (e.g., when hosted on GitHub Pages)
        const staticRes = await fetch("./data.json");
        if (staticRes.ok) {
          const data = await staticRes.json();
          setTelemetry(data.history || []);
          setErrorString(null);
        } else {
          setErrorString("Kon de telemetriegegevens niet ophalen via API of data.json.");
        }
      }
    } catch (err: any) {
      // Netwerkfout fallback (e.g. server offline, hosting on static github pages)
      try {
        const staticRes = await fetch("./data.json");
        if (staticRes.ok) {
          const data = await staticRes.json();
          setTelemetry(data.history || []);
          setErrorString(null);
        } else {
          setErrorString("Verbindingsfout met server en geen lokale data.json: " + (err.message || err));
        }
      } catch (staticErr: any) {
        setErrorString("Verbindingsfout met server: " + (err.message || err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Phase 1: Initialize values
    const init = async () => {
      await fetchConfig();
      await fetchTelemetry();
    };
    init();

    // Set up active polling interval to fetch data every 6 seconds so user's Pi updates show up live
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Tabs styling helper
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <Activity className="w-4 h-4" /> },
    { id: "wiring", label: "Hardware & Pins", icon: <Cpu className="w-4 h-4" /> },
    { id: "software", label: "Pi Code (Python)", icon: <BookOpen className="w-4 h-4" /> },
    { id: "testing", label: "Simulator & Testen", icon: <Play className="w-4 h-4" /> },
  ];

  const latest = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col justify-between">
      {/* Top Header Command Bar */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 shrink-0 relative overflow-hidden">
        {/* Abstract cyber glow lines */}
        <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent pointer-events-none"></div>
        
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 md:gap-3">
                <span className="font-bold text-lg tracking-tight text-white">
                  SensorLink <span className="text-emerald-400">v2.4</span>
                </span>
                
                {latest ? (
                  <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 font-mono rounded-lg px-2 py-0.5 md:px-2.5 md:py-1">
                    <span className="flex items-center gap-0.5 text-xs text-rose-400 font-bold">
                      <Thermometer className="w-3.5 h-3.5" />
                      {latest.temperature.toFixed(1)}°C
                    </span>
                    <span className="text-slate-700 font-light text-xs">|</span>
                    <span className="flex items-center gap-0.5 text-xs text-sky-400 font-bold">
                      <Droplets className="w-3.5 h-3.5" />
                      {latest.humidity.toFixed(1)}%
                    </span>
                    <span className="text-slate-700 font-light text-xs">|</span>
                    <span className={`text-[9.5px] uppercase font-semibold tracking-wider px-1.5 py-0.2 rounded-sm ${
                      latest.source === "virtual" 
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {latest.source === "virtual" ? "Sim" : "Fysiek"}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] bg-slate-850 text-slate-500 border border-slate-800 font-mono rounded px-1.5 py-0.5">
                    geen telemetry
                  </span>
                )}

                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold font-mono rounded px-1.5 py-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE
                </span>
              </div>
            </div>
          </div>

          {/* Quick status box on header right */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden md:flex flex-col items-end text-right border-r border-slate-800 pr-4">
              <span className="text-[10px] text-slate-500">WiFi-Target AP URL</span>
              <span className="text-blue-400 font-semibold truncate max-w-44 select-all" title={config.appUrl}>
                {config.appUrl.replace(/^https?:\/\//, '')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Pi 3B: Online</span>
            </div>
            
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs">
              <span>WiFi: Strong</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Tabbed Interface Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Error Announcement */}
        {errorString && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 text-sm text-rose-450 animate-bounce">
            <Info className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <span className="font-semibold block">Verbindingsprobleem met server:</span>
              {errorString}
            </div>
          </div>
        )}

        {/* Tab selection menu */}
        <div className="flex flex-wrap gap-1.5 items-center bg-slate-900 p-1 rounded-xl border border-slate-800/80 shadow-inner">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-lg transition-all cursor-pointer ${
                  isSelected 
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/15 shadow-sm scale-102" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content viewer with Framer Motion transitions */}
        <div className="min-h-120">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "dashboard" && (
                <DashboardView 
                  data={telemetry} 
                  config={config} 
                  isLoading={isLoading} 
                  onRefresh={fetchTelemetry} 
                />
              )}
              {activeTab === "wiring" && <WiringGuide />}
              {activeTab === "software" && <SoftwareGuide config={config} />}
              {activeTab === "testing" && (
                <TesterPanel 
                  config={config} 
                  onRefreshData={fetchTelemetry} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Informative Step-by-Step Overview widget for standard setup */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs flex items-center justify-center font-mono">1</span>
              <h4 className="font-semibold text-white text-sm">Hardware bekabelen</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-8">
              Sluit de VDD, GND, SDA en SCL draden van je DHT20 sensor aan op de Raspberry Pi 3B GPIO-pinnen volgens onze pinout graphics.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-xs flex items-center justify-center font-mono">2</span>
              <h4 className="font-semibold text-white text-sm">Activeer I2C en zet script</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-8">
              Kwalificeer I2C via <code className="text-indigo-400 bg-slate-950 px-1 py-0.5 rounded text-[10px] border border-slate-800">raspi-config</code>, installeer de Adafruit python library en kopieer onze code.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-xs flex items-center justify-center font-mono">3</span>
              <h4 className="font-semibold text-white text-sm">Verstuur WiFi data</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-8">
              Start het python-script op de Pi. De data wordt via wifi live naar deze website verstuurd en is direct zichtbaar op de recharts grafieken!
            </p>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-6 shrink-0 mt-8">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
          <div>
            <span>© 2026 PiDHT20 IoT Monitor | SvenOptimum Project</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" /> WiFi cloud telemetry ingest active
            </span>
            <span className="border-l border-slate-800 pl-4">DHT20 I2C Module</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
