import React from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  Thermometer, 
  Droplets, 
  Activity, 
  HelpCircle, 
  Clock, 
  Cpu, 
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Measurement, AppConfig } from "../types";

interface DashboardViewProps {
  data: Measurement[];
  config: AppConfig;
  isLoading: boolean;
  onRefresh: () => void;
}

export function DashboardView({ data, config, isLoading, onRefresh }: DashboardViewProps) {
  // Helper to get latest measurement
  const latest = data.length > 0 ? data[data.length - 1] : null;

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (data.length === 0) return { minTemp: 0, maxTemp: 0, avgTemp: 0, minHum: 0, maxHum: 0, avgHum: 0 };
    
    let totalTemp = 0;
    let totalHum = 0;
    let minTemp = Infinity;
    let maxTemp = -Infinity;
    let minHum = Infinity;
    let maxHum = -Infinity;

    data.forEach((item) => {
      totalTemp += item.temperature;
      totalHum += item.humidity;
      if (item.temperature < minTemp) minTemp = item.temperature;
      if (item.temperature > maxTemp) maxTemp = item.temperature;
      if (item.humidity < minHum) minHum = item.humidity;
      if (item.humidity > maxHum) maxHum = item.humidity;
    });

    return {
      minTemp: Math.round(minTemp * 10) / 10,
      maxTemp: Math.round(maxTemp * 10) / 10,
      avgTemp: Math.round((totalTemp / data.length) * 10) / 10,
      minHum: Math.round(minHum * 10) / 10,
      maxHum: Math.round(maxHum * 10) / 10,
      avgHum: Math.round((totalHum / data.length) * 10) / 10,
    };
  }, [data]);

  // Format chart data
  const chartData = React.useMemo(() => {
    return data.map((item) => {
      const time = new Date(item.timestamp);
      return {
        ...item,
        formattedTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        formattedDate: time.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      };
    });
  }, [data]);

  // Determine trend icon & color based on last two metrics
  const getTrend = (type: "temp" | "hum") => {
    if (data.length < 2) return { text: "Stabiel", color: "text-slate-400 bg-slate-800 border-slate-700", icon: <TrendingUp className="w-4 h-4" /> };
    const latestVal = type === "temp" ? data[data.length - 1].temperature : data[data.length - 1].humidity;
    const previousVal = type === "temp" ? data[data.length - 2].temperature : data[data.length - 2].humidity;
    const diff = latestVal - previousVal;

    if (diff > 0.1) {
      return {
        text: `+${diff.toFixed(1)} ${type === "temp" ? "°C" : "%"}`,
        color: type === "temp" ? "text-rose-400 bg-rose-500/10 border-rose-500/20" : "text-sky-400 bg-sky-500/10 border-sky-500/20",
        icon: <ArrowUpRight className="w-4 h-4" />
      };
    } else if (diff < -0.1) {
      return {
        text: `${diff.toFixed(1)} ${type === "temp" ? "°C" : "%"}`,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        icon: <ArrowDownRight className="w-4 h-4" />
      };
    } else {
      return {
        text: "Stabiel",
        color: "text-slate-400 bg-slate-800 border-slate-750",
        icon: <TrendingUp className="w-4 h-4" />
      };
    }
  };

  const tempTrend = getTrend("temp");
  const humTrend = getTrend("hum");

  return (
    <div className="space-y-6" id="dashboard-view-container">
      {/* Top Telemetry Live Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Temperature Gauge Card */}
        <div className="md:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/5 to-transparent rounded-full -mr-8 -mt-8 opacity-60"></div>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5" />
                Temperatuur
              </span>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-md border ${tempTrend.color} flex items-center gap-1`}>
                {tempTrend.icon}
                {tempTrend.text}
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-light text-white tracking-tight">
                {latest ? latest.temperature.toFixed(1) : "---"}
              </span>
              <span className="text-xl font-light text-slate-500">°C</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              Min: <strong className="text-slate-200">{stats.minTemp}°C</strong>
            </span>
            <span className="flex items-center gap-1">
              Gem: <strong className="text-slate-200">{stats.avgTemp}°C</strong>
            </span>
            <span className="flex items-center gap-1">
              Max: <strong className="text-slate-200">{stats.maxTemp}°C</strong>
            </span>
          </div>
        </div>

        {/* Humidity Gauge Card */}
        <div className="md:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-500/5 to-transparent rounded-full -mr-8 -mt-8 opacity-60"></div>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                Luchtvochtigheid
              </span>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-md border ${humTrend.color} flex items-center gap-1`}>
                {humTrend.icon}
                {humTrend.text}
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-light text-white tracking-tight">
                {latest ? latest.humidity.toFixed(1) : "---"}
              </span>
              <span className="text-xl font-light text-slate-500">% RH</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              Min: <strong className="text-slate-200">{stats.minHum}%</strong>
            </span>
            <span className="flex items-center gap-1">
              Gem: <strong className="text-slate-200">{stats.avgHum}%</strong>
            </span>
            <span className="flex items-center gap-1">
              Max: <strong className="text-slate-200">{stats.maxHum}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Graphical Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Chart */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-semibold text-white text-sm">Temperatuurverloop</h3>
              <p className="text-[10px] text-slate-500">Laatste meetgeschiedenis (°C)</p>
            </div>
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" title="Metingsbronactief"></span>
          </div>

          <div className="h-64 text-xs font-mono">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-2">
                <Activity className="w-6 h-6 animate-pulse" />
                <span>Geen meetgegevens ontvangen...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="formattedTime" stroke="#475569" tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#475569" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff' }}
                    labelFormatter={(label) => `Tijd: ${label}`}
                  />
                  <Area type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Humidity Chart */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-semibold text-white text-sm">Vochtigheidsverloop</h3>
              <p className="text-[10px] text-slate-500">Relatieve vochtigheidsgraad (%)</p>
            </div>
            <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.6)]" title="Vochtbronactief"></span>
          </div>

          <div className="h-64 text-xs font-mono">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-2">
                <Activity className="w-6 h-6 animate-pulse" />
                <span>Geen meetgegevens ontvangen...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="formattedTime" stroke="#475569" tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#475569" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff' }}
                    labelFormatter={(label) => `Tijd: ${label}`}
                  />
                  <Area type="monotone" dataKey="humidity" name="Vocht (% RH)" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorHum)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Integration Monitoring Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection status config info */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold text-emerald-400 font-mono tracking-wider block uppercase">
              Web Ontvanger API
            </span>
            <h3 className="font-display font-semibold text-white text-sm mt-0.5">Integratie Status</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Jouw Raspberry Pi kan metingen direct naar de cloud zenden door HTTP POST-requests te sturen. De server 
              luistert live op de volgende configuratiegegevens:
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800 font-mono text-[11px]">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium block">HTTP ENDPOINT:</span>
              <div className="p-2.5 bg-slate-950 text-slate-300 rounded-lg truncate select-all border border-slate-800">
                {config.endpointUrl}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-medium block">API BEVEILIGINGSTOKEN (HEADER X-API-KEY):</span>
              <div className="p-2.5 bg-slate-950 text-indigo-300 font-semibold rounded-lg truncate select-all border border-slate-800 flex items-center justify-between">
                <span>{config.apiKey}</span>
                <span className="shrink-0 text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Event Activity Feed */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-display font-semibold text-white text-sm">Live Ontvangstlogboek (Max. 5)</h3>
              <p className="text-[10px] text-slate-500">Verversingen vinden live plaats op de server</p>
            </div>
            <button 
              onClick={onRefresh}
              className="text-xs uppercase tracking-wider font-semibold text-slate-200 hover:text-white font-mono bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1.5 rounded-lg active:bg-slate-800 cursor-pointer"
            >
              🔄 Ververs Data
            </button>
          </div>

          <div className="overflow-x-auto">
            {data.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 select-none">
                Er is nog geen telemetrie ontvangen. Zend een testmeting via het simulator-tabblad!
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[9px]">
                    <th className="py-2">Tijdstip</th>
                    <th className="py-2">Bron</th>
                    <th className="py-2 text-right">Temperatuur</th>
                    <th className="py-2 text-right">Luchtvochtigheid</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-350">
                  {data.slice(-5).reverse().map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/20">
                      <td className="py-2.5 text-slate-500 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5">
                        {item.source === "virtual" ? (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase text-[8px] border border-slate-700 font-bold">
                            ⚙ Simulator
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase text-[8px] border border-amber-500/25 font-bold">
                            🍓 Physical Pi
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-rose-400">
                        {item.temperature.toFixed(1)}°C
                      </td>
                      <td className="py-2.5 text-right font-semibold text-sky-400">
                        {item.humidity.toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Geldig
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
