import React, { useState } from "react";
import { Play, RotateCcw, Monitor, Send, HelpCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { AppConfig } from "../types";

interface TesterPanelProps {
  config: AppConfig;
  onRefreshData: () => void;
}

export function TesterPanel({ config, onRefreshData }: TesterPanelProps) {
  const [temperature, setTemperature] = useState<number>(22.5);
  const [humidity, setHumidity] = useState<number>(50.0);
  const [isSending, setIsSending] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "--- Raspberry Pi 3B Console Simulator ---",
    "[Systeem] Linux raspbian 11 (bullseye) gestart.",
    "[Systeem] I2C bus gedetecteerd op /dev/i2c-1.",
    "[Systeem] DHT20 sensor gedetecteerd op I2C adres 0x38.",
    "[Systeem] Wifi verbinding tot stand gebracht: SSID 'ThuisNetwerk_5G'",
    "[Info] Klaar om handmatige metingen te versturen!"
  ]);

  const addLog = (message: string) => {
    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-15));
  };

  const handleSendSimulatedData = async () => {
    setIsSending(true);
    addLog(`Uitlezen DHT20... Temp=${temperature.toFixed(1)}°C, RH=${humidity.toFixed(1)}%`);
    
    // Simulate minor network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      addLog(`Versturen via WiFi naar: ${config.endpointUrl}`);
      
      const response = await fetch("/api/telemetry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": config.apiKey,
        },
        body: JSON.stringify({
          temperature,
          humidity,
          source: "virtual",
        }),
      });

      const result = await response.json();

      if (response.status === 201) {
        addLog(`✓ Server response: HTTP 201 Created (Success)`);
        addLog(`✓ Telemetrie opgeslagen! ID: ${result.measurement?.id}`);
        onRefreshData();
      } else {
        addLog(`✗ Foutmelding server: HTTP ${response.status} - ${result.error || 'Onbekende fout'}`);
      }
    } catch (err: any) {
      addLog(`✗ HTTP POST netwerkfout: ${err.message || err}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetTelemetry = async () => {
    if (!window.confirm("Weet je zeker dat je alle opgeslagen meetgegevens wilt wissen?")) {
      return;
    }
    
    try {
      addLog("Wissen van alle metingen op de server...");
      const response = await fetch("/api/telemetry/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": config.apiKey,
        },
      });

      if (response.ok) {
        addLog("✓ Server geschiedenis succesvol gereset.");
        onRefreshData();
      } else {
        const result = await response.json();
        addLog(`✗ Fout bij resetten: ${result.error || 'Onbekende fout'}`);
      }
    } catch (err: any) {
      addLog(`✗ Netwerkfout bij reset: ${err.message || err}`);
    }
  };

  const handleRandomizeSliders = () => {
    const randomTemp = parseFloat((15 + Math.random() * 20).toFixed(1));
    const randomHum = parseFloat((30 + Math.random() * 55).toFixed(1));
    setTemperature(randomTemp);
    setHumidity(randomHum);
    addLog(`Gereedschap gesimuleerd: Sliders aangepast naar ${randomTemp}°C en ${randomHum}%`);
  };

  return (
    <div className="space-y-6" id="tester-panel-container">
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
        <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
          <Monitor className="w-5 h-5 text-emerald-400" />
          Interactieve Pi Simulator &amp; API Testen
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Nog geen fysieke Raspberry Pi bij de hand? Geen probleem! Gebruik deze simulator om handmatig meetwaarden te 
          simuleren. Wanneer je op de <strong className="text-white">"Verstuur Virtuele Meting"</strong> knop klikt, voert deze app een echte 
          HTTP POST-aanroep uit naar de Express server met jouw API-sleutel, net zoals het Python-script op de fysieke Pi dat doet!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders in left / top column */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider font-mono">Simulator Besturing</h3>
            
            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-300">Simuleer Temperatuur</span>
                <span className="font-bold font-mono text-rose-400 text-lg">{temperature.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="-10.0"
                max="50.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500 border border-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-10°C</span>
                <span>Klimaattemperatuur</span>
                <span>50°C</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-300">Simuleer Luchtvochtigheid</span>
                <span className="font-bold font-mono text-sky-400 text-lg">{humidity.toFixed(1)}% RH</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="100.0"
                step="0.1"
                value={humidity}
                onChange={(e) => setHumidity(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500 border border-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% RH</span>
                <span>Luchtvochtigheidsgraad</span>
                <span>100% RH</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={handleSendSimulatedData}
                disabled={isSending}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 cursor-pointer text-sm font-sans"
              >
                <Send className="w-4 h-4 text-slate-950" />
                {isSending ? "Verzenden..." : "Verstuur Virtuele Meting"}
              </button>
              
              <button
                onClick={handleRandomizeSliders}
                className="p-3 bg-slate-800 hover:bg-slate-755 active:bg-slate-800 text-slate-200 rounded-xl transition-all font-mono text-xs cursor-pointer border border-slate-700"
                title="Willekeurige waarden"
              >
                🎲 Mix
              </button>
            </div>

            <button
              onClick={handleResetTelemetry}
              className="w-full py-2 bg-rose-950/15 hover:bg-rose-950/30 text-rose-400 font-mono text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-rose-900/35"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Alle Meetgegevens op Server
            </button>
          </div>
        </div>

        {/* Console outputs on right / bottom column */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between min-h-[320px]">
          <div className="space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/70"></div>
                <span className="text-[11px] font-mono text-slate-400 ml-2">pi@raspberrypi:~</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded">
                Virtual Pi Terminal Logs
              </span>
            </div>
            
            {/* Terminal body */}
            <div className="font-mono text-[11px] text-amber-250/90 leading-relaxed overflow-y-auto max-h-60 space-y-1 select-text scrollbar-thin scrollbar-thumb-slate-800 p-2">
              {consoleLogs.map((log, index) => {
                let colorClass = "text-amber-200/90";
                if (log.includes("✓")) colorClass = "text-emerald-400";
                if (log.includes("✗")) colorClass = "text-rose-400";
                if (log.includes("[Systeem]")) colorClass = "text-slate-500";
                if (log.includes("Uitlezen")) colorClass = "text-sky-305";
                
                return (
                  <div key={index} className={colorClass}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-450 space-y-1">
            <div className="flex items-center gap-1 text-slate-300 font-semibold font-mono">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              Wat gebeurt hier onder de motorkap?
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Er wordt een HTTP POST-request gedaan naar <code className="text-emerald-400">/api/telemetry</code>. 
              De JSON-payload bevat de gewenste <code className="text-rose-400">temperature</code>, <code className="text-sky-400">humidity</code> en de beveiligingstoken in de header <code className="text-slate-305 font-mono">X-API-Key</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
