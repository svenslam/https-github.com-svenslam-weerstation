import React from "react";
import { Cpu, Info, HelpCircle } from "lucide-react";

interface PinProps {
  pinNumber: number;
  name: string;
  type: "power3v" | "power5v" | "gnd" | "i2c" | "gpio" | "other";
  isConnected?: boolean;
  connectedTo?: string;
}

export function WiringGuide() {
  const pins: PinProps[] = [
    { pinNumber: 1, name: "3.3V Power", type: "power3v", isConnected: true, connectedTo: "DHT20 VDD (Pin 1)" },
    { pinNumber: 2, name: "5.3V Power", type: "power5v" },
    { pinNumber: 3, name: "SDA (GPIO 2)", type: "i2c", isConnected: true, connectedTo: "DHT20 SDA (Pin 2)" },
    { pinNumber: 4, name: "5.0V Power", type: "power5v" },
    { pinNumber: 5, name: "SCL (GPIO 3)", type: "i2c", isConnected: true, connectedTo: "DHT20 SCL (Pin 4)" },
    { pinNumber: 6, name: "GND (Aarde)", type: "gnd", isConnected: true, connectedTo: "DHT20 GND (Pin 3)" },
    { pinNumber: 7, name: "GPIO 4", type: "gpio" },
    { pinNumber: 8, name: "TXD (GPIO 14)", type: "other" },
    { pinNumber: 9, name: "GND (Aarde)", type: "gnd" },
    { pinNumber: 10, name: "RXD (GPIO 15)", type: "other" },
    { pinNumber: 11, name: "GPIO 17", type: "gpio" },
    { pinNumber: 12, name: "GPIO 18", type: "gpio" },
    { pinNumber: 13, name: "GPIO 27", type: "gpio" },
    { pinNumber: 14, name: "GND (Aarde)", type: "gnd" },
    { pinNumber: 15, name: "GPIO 22", type: "gpio" },
    { pinNumber: 16, name: "GPIO 23", type: "gpio" },
    { pinNumber: 17, name: "3.3V Power", type: "power3v" },
    { pinNumber: 18, name: "GPIO 24", type: "gpio" },
    { pinNumber: 19, name: "MOSI (GPIO 10)", type: "other" },
    { pinNumber: 20, name: "GND (Aarde)", type: "gnd" },
    { pinNumber: 21, name: "MISO (GPIO 9)", type: "other" },
    { pinNumber: 22, name: "GPIO 25", type: "gpio" },
    { pinNumber: 23, name: "SCLK (GPIO 11)", type: "other" },
    { pinNumber: 24, name: "CE0 (GPIO 8)", type: "other" },
    { pinNumber: 25, name: "GND (Aarde)", type: "gnd" },
    { pinNumber: 26, name: "CE1 (GPIO 7)", type: "other" },
    { pinNumber: 27, name: "ID_SD (I2C EEPROM)", type: "other" },
    { pinNumber: 28, name: "ID_SC (I2C EEPROM)", type: "other" },
    { pinNumber: 29, name: "GPIO 5", type: "gpio" },
    { pinNumber: 30, name: "GND (Aarde)", type: "gnd" },
    { pinNumber: 31, name: "GPIO 6", type: "gpio" },
    { pinNumber: 32, name: "GPIO 12", type: "gpio" },
    { pinNumber: 33, name: "GPIO 13", type: "gpio" },
    { pinNumber: 34, name: "GND (Aarde)", type: "gnd" },
    { pinNumber: 35, name: "GPIO 19", type: "gpio" },
    { pinNumber: 36, name: "GPIO 16", type: "gpio" },
    { pinNumber: 37, name: "GPIO 26", type: "gpio" },
    { pinNumber: 38, name: "GPIO 20", type: "gpio" },
    { pinNumber: 39, name: "GND (Aarde)", type: "gnd" },
    { pinNumber: 40, name: "GPIO 21", type: "gpio" },
  ];

  const getPinBg = (type: string, isConnected?: boolean) => {
    if (isConnected) return "bg-emerald-500/10 text-emerald-400 font-bold shadow-xs scale-102 border-2 border-emerald-500/50 animate-pulse";
    switch (type) {
      case "power3v": return "bg-amber-500/10 text-amber-400 border border-amber-500/25";
      case "power5v": return "bg-rose-500/10 text-rose-450 border border-rose-500/25";
      case "gnd": return "bg-slate-800 text-slate-350 border border-slate-700/60";
      case "i2c": return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25";
      case "gpio": return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
      default: return "bg-slate-950/40 text-slate-505 border border-slate-900";
    }
  };

  return (
    <div className="space-y-8" id="wiring-guide-container">
      {/* Intro en info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
          <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            DHT20 I2C Sensor & Raspberry Pi 3B
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            De <strong className="text-white">DHT20</strong> is een moderne temperatuur- en vochtigheidssensor. In tegenstelling tot de 
            oudere DHT11 of DHT22, gebruikt de DHT20 een <strong className="text-white">I2C interface</strong> in plaats van een eigen single-wire-protocol. 
            Dit maakt de DHT20 veel betrouwbaarder, nauwkeuriger en eenvoudiger aan te sluiten op de Raspberry Pi 3B: er zijn geen 
            complexe timing-gevoelige drivers of externe pull-up weerstanden nodig, aangezien de I2C bus van de Pi ingebouwde pull-ups heeft!
          </p>
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 flex gap-3 text-sm text-amber-300">
            <Info className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold block text-amber-350">Belangrijk:</span>
              Schakel de Raspberry Pi altijd volledig uit en trek de voedingskabel los voordat u draden op de GPIO-pinnen aansluit. Dit voorkomt kortsluiting!
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">Specificaties</span>
            <h3 className="font-display font-bold text-white text-lg mt-1 mb-3">DHT20 Sensor</h3>
            <ul className="text-xs text-slate-300 space-y-2 font-sans">
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Voedingsspanning:</span>
                <span className="font-semibold font-mono text-emerald-400">2.5V - 5.5V (3.3V aanbevolen)</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Bereik Temp:</span>
                <span className="font-semibold font-mono text-white">-40°C tot +80°C (+/- 0.5°C)</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Bereik Vochtigheid:</span>
                <span className="font-semibold font-mono text-white">0 - 100% RH (+/- 3% RH)</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>I2C Adres:</span>
                <span className="font-semibold font-mono text-emerald-400">0x38 (Vast adres)</span>
              </li>
              <li className="flex justify-between pb-1">
                <span>Signaaltype:</span>
                <span className="font-semibold font-mono text-slate-500">Digitaal I2C</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-850 text-[11px] text-slate-505">
            Intern is de DHT20 gebaseerd op de <strong>AHT20</strong> chip. Veel standard AHT20 bibliotheken werken direct met de DHT20.
          </div>
        </div>
      </div>

      {/* Aansluitschema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Connection details */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-6">
          <h3 className="text-lg font-display font-semibold text-white">1. Aansluittabel</h3>
          
          <div className="overflow-hidden border border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-950/60 text-slate-400 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Pin DHT20</th>
                  <th className="py-3 px-4">Functie</th>
                  <th className="py-3 px-4">Kleur Draad (advies)</th>
                  <th className="py-3 px-4">Raspberry Pi 3B Pin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-350">
                <tr className="hover:bg-slate-800/10">
                  <td className="py-3 px-4 font-semibold font-mono text-emerald-400">Pin 1 (VDD)</td>
                  <td className="py-3 px-4">Stroomvoorziening (3.3V)</td>
                  <td className="py-3 px-4"><span className="inline-block w-3.5 h-3.5 bg-red-500 rounded-sm mr-2 align-middle border border-red-500/20"></span>Rood</td>
                  <td className="py-3 px-4 font-mono font-medium text-amber-405">Pin 1 (3.3V Power)</td>
                </tr>
                <tr className="hover:bg-slate-800/10">
                  <td className="py-3 px-4 font-semibold font-mono text-emerald-400">Pin 2 (SDA)</td>
                  <td className="py-3 px-4">I2C Data Signaal</td>
                  <td className="py-3 px-4"><span className="inline-block w-3.5 h-3.5 bg-yellow-400 rounded-sm mr-2 align-middle border border-yellow-450/20"></span>Geel / Blauw</td>
                  <td className="py-3 px-4 font-mono font-medium text-indigo-400">Pin 3 (GPIO 2 / SDA)</td>
                </tr>
                <tr className="hover:bg-slate-800/10">
                  <td className="py-3 px-4 font-semibold font-mono text-emerald-400">Pin 3 (GND)</td>
                  <td className="py-3 px-4">Massa / Aarde</td>
                  <td className="py-3 px-4"><span className="inline-block w-3.5 h-3.5 bg-slate-800 rounded-sm mr-2 align-middle border border-slate-700/20"></span>Zwart</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-400">Pin 6 (GND)</td>
                </tr>
                <tr className="hover:bg-slate-800/10">
                  <td className="py-3 px-4 font-semibold font-mono text-emerald-400">Pin 4 (SCL)</td>
                  <td className="py-3 px-4">I2C Klok Signaal</td>
                  <td className="py-3 px-4"><span className="inline-block w-3.5 h-3.5 bg-sky-500 rounded-sm mr-2 align-middle border border-sky-400/20"></span>Groen / Wit</td>
                  <td className="py-3 px-4 font-mono font-medium text-indigo-400">Pin 5 (GPIO 3 / SCL)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm">Belangrijke Aantekeningen</h4>
            <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
              <li>Plaats de DHT20 rechtop zodat luchtcirculatie de metingen niet hindert.</li>
              <li>Gebruik bij voorkeur vrouwtje-naar-vrouwtje (F/F) breadboard-kabels (jumper wires).</li>
              <li>I2C kabels kunnen relatief lang zijn (tot een paar meter zonder noemenswaardige storing), maar houd ze voor betrouwbaarheid onder de 1 meter.</li>
            </ul>
          </div>
        </div>

        {/* GPIO Pinout */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-slate-300 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-display font-semibold text-white">Raspberry Pi 3B GPIO Pinout</h3>
              <p className="text-[11px] text-slate-500">Interactief GPIO-schema van de 40-pins header</p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[9px] font-mono">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">3.3V</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">5V</span>
              <span className="px-1.5 py-0.5 rounded bg-stone-700 text-stone-300">GND</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">I2C</span>
            </div>
          </div>

          {/* Visual pin header */}
          <div className="grid grid-cols-2 gap-x-4 text-xs font-mono max-h-120 overflow-y-auto pr-1">
            {/* Column 1: Odd pins (Left) */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Linkerrij (Oneven)</div>
              {pins.filter(p => p.pinNumber % 2 !== 0).map((pin) => (
                <div 
                  key={pin.pinNumber}
                  className={`flex items-center justify-between p-1.5 rounded-lg transition-all ${getPinBg(pin.type, pin.isConnected)}`}
                >
                  <span className="text-[10px] text-slate-500 font-bold mr-1">{pin.pinNumber}</span>
                  <span className="truncate text-[11px] font-medium flex-1 text-right mr-1.5">{pin.name}</span>
                  {pin.isConnected && (
                    <span className="text-[8px] uppercase bg-emerald-950 text-emerald-300 px-1 py-0.5 rounded border border-emerald-500/40">CONN</span>
                  )}
                </div>
              ))}
            </div>

            {/* Column 2: Even pins (Right) */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Rechterrij (Even)</div>
              {pins.filter(p => p.pinNumber % 2 === 0).map((pin) => (
                <div 
                  key={pin.pinNumber}
                  className={`flex items-center justify-start p-1.5 rounded-lg transition-all ${getPinBg(pin.type, pin.isConnected)}`}
                >
                  {pin.isConnected && (
                    <span className="text-[8px] uppercase bg-emerald-950 text-emerald-300 px-1 py-0.5 rounded border border-emerald-500/40 mr-1.5 font-bold">CONN</span>
                  )}
                  <span className="truncate text-[11px] font-medium flex-1">{pin.name}</span>
                  <span className="text-[10px] text-slate-505 font-bold ml-1">{pin.pinNumber}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
