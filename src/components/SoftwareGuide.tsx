import React, { useState } from "react";
import { Terminal, Copy, Check, Save, Settings, Wifi, Github, Globe } from "lucide-react";
import { AppConfig } from "../types";

interface SoftwareGuideProps {
  config: AppConfig;
}

export function SoftwareGuide({ config }: SoftwareGuideProps) {
  const [mode, setMode] = useState<"github" | "api">("github");
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(label);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const setupCommandsGithub = [
    {
      title: "1. Kloon jouw GitHub Pages Repository op de Pi",
      description: "Log in op je Raspberry Pi via SSH en kloon jouw repository direct naar een lokale map:",
      command: "git clone <JOUW_GITHUB_REPOSITORY_URL> ~/weerstation && cd ~/weerstation",
      notes: "Vervang de URL met de exacte HTTPS of SSH URL van jouw GitHub repository (bijvoorbeeld: https://github.com/gebruikersnaam/weerstation.git)."
    },
    {
      title: "2. Richt een Virtuele Python Omgeving in",
      description: "Het is sterk aanbevolen om een virtuele omgeving in te richten om pakketconflicten te voorkomen:",
      command: "python3 -m venv venv && source venv/bin/activate",
      notes: "Zorg dat venv is geactiveerd voordat je libraries installeert of scripts start (te herkennen aan (venv) voor je terminal prompt)."
    },
    {
      title: "3. Installeer de DHT20 Sensor Driver",
      description: "Aangezien de DHT20 intern de AHT20 chip gebruikt, installeren we de officiële Adafruit AHTx0 driver:",
      command: "pip3 install adafruit-circuitpython-ahtx0",
      notes: "Zorg dat je I2C interface aan staat (stap 1 uit de API gids)."
    },
    {
      title: "4. Schakel Git Credential Opslag in (Eenmalig)",
      description: "Om te zorgen dat het Python script op de achtergrond automatisch je metingen kan committen en pushen zonder steeds om je wachtwoord te vragen:",
      command: "git config --global credential.helper store",
      notes: "Als je de eerste keer handmatig 'git push' typt, vul dan je GitHub gebruikersnaam in en gebruik je Personal Access Token (PAT) als wachtwoord. Git onthoudt dit vanaf dat moment veilig op de Pi!"
    }
  ];

  const setupCommandsApi = [
    {
      title: "1. Activeer I2C Interface",
      description: "I2C staat standaard uitgeschakeld in Raspbian. Open de Pi configuratietool:",
      command: "sudo raspi-config",
      notes: "Navigeer naar Interface Options -> I2C -> Selecteer 'Yes' / 'Ja' -> Selecteer Finish en start de Pi opnieuw op indien gevraagd."
    },
    {
      title: "2. Installeer Systeempakketten en Test Connectie",
      description: "Installeer I2C hulpprogramma's om te controleren of de sensor correct is verbonden op I2C-adres 0x38:",
      command: "sudo apt-get update && sudo apt-get install -y i2c-tools python3-pip python3-venv",
      notes: "Voer na installatie uit: 'sudo i2cdetect -y 1'. Je moet de sensor zien verschijnen op adres 38!"
    },
    {
      title: "3. Richt een Python Virtuele Omgeving in",
      description: "Het is sterk aanbevolen om een virtuele omgeving in te richten om Python pakketconflicten te voorkomen:",
      command: "mkdir -p ~/dht20_monitor && cd ~/dht20_monitor\npython3 -m venv venv\nsource venv/bin/activate",
      notes: "Na het activeren installeer je de benodigde Python libraries."
    },
    {
      title: "4. Installeer de Python Libraries",
      description: "We gebruiken de Adafruit AHTx0 library en de requests library om data via wifi te verzenden:",
      command: "pip3 install adafruit-circuitpython-ahtx0 requests",
      notes: "Dit installeert ook alle benodigde driver-componenten op je Pi."
    }
  ];

  const pythonScriptGithub = `import time
import os
import json
import subprocess
import uuid
from datetime import datetime

# ==============================================================================
# CONFIGURATIE JOUW WEERSTATION (GITHUB PAGES METHODE)
# ==============================================================================
# Dit is het pad naar het databestand binnen je gekloonde GitHub repository.
# De React app leest dit bestand uit op GitHub Pages om de grafieken te vullen!
JSON_REL_PATH = "public/data.json"
MAX_HISTORY_ITEMS = 200      # Maximaal aantal opgeslagen metingen om JSON klein te houden
MEASUREMENT_INTERVAL = 600   # Meetinterval in seconden (600 s = elke 10 minuten)

try:
    import board
    import busio
    import adafruit_ahtx0
    print("✓ Hardware libraries succesvol geladen.")
except ImportError:
    print("❌ Kon board of adafruit_ahtx0 niet importeren.")
    print("Zorg dat je in een geactiveerde virtualenv zit en voer uit:")
    print("pip3 install adafruit-circuitpython-ahtx0")
    exit(1)

# Initialiseer I2C bus en DHT20 Sensor (DHT20 maakt gebruik van AHT20 registers)
try:
    i2c = busio.I2C(board.SCL, board.SDA)
    sensor = adafruit_ahtx0.AHTx0(i2c)
    print("✓ DHT20 Sensor succesvol geïnitialiseerd!")
except Exception as e:
    print(f"❌ Fout bij initialisatie van sensor: {e}")
    print("Controleer je GPIO-bedrading en raspi-config I2C status.")
    exit(1)

print("Start metingen. Data wordt periodiek gepusht naar GitHub.")
print("Druk op Ctrl+C om te stoppen.\\n")

while True:
    try:
        # Lees de sensorwaarden uit
        temperature = sensor.temperature
        humidity = sensor.relative_humidity
        
        # Rond af op 1 decimaal
        temperature = round(temperature, 1)
        humidity = round(humidity, 1)
        
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Temp: {temperature}°C | Vocht: {humidity}%")
        
        # Bepaal het bestandspad (ondersteunt zowel public/data.json als directe folder layout)
        target_path = JSON_REL_PATH
        if not os.path.exists(target_path) and os.path.exists("data.json"):
            target_path = "data.json"
            
        # Zorg dat de map bestaat indien nog niet aangemaakt
        dir_name = os.path.dirname(target_path)
        if dir_name and not os.path.exists(dir_name):
            os.makedirs(dir_name)
            
        data = {"history": []}
        if os.path.exists(target_path):
            try:
                with open(target_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except:
                pass
                
        # Creëer unieke meting in het exact juiste formaat
        new_entry = {
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"), # ISO schema UTC
            "temperature": temperature,
            "humidity": humidity,
            "source": "physical"
        }
        
        data["history"].append(new_entry)
        
        # Beperk de geschiedenis tot MAX_HISTORY_ITEMS
        if len(data["history"]) > MAX_HISTORY_ITEMS:
            data["history"] = data["history"][-MAX_HISTORY_ITEMS:]
            
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            
        # Push de wijzigingen automatisch via Git commands
        print("🚀 Wijziging toevoegen, committen en pushen naar GitHub...")
        subprocess.run(["git", "add", target_path], check=True)
        commit_msg = f"Weer update: {temperature}°C, {humidity}%"
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)
        subprocess.run(["git", "push"], check=True)
        print("✓ Succesvol geregistreerd en gepusht naar GitHub!")
        
    except Exception as e:
        print(f"❌ Fout tijdens meetcyclus: {e}")
        print("Zorg ervoor dat Git inloggegevens zijn opgeslagen en netwerk actief is.")
        
    print(f"Wacht {MEASUREMENT_INTERVAL} seconden tot de volgende meting...\\n")
    time.sleep(MEASUREMENT_INTERVAL)
`;

  const pythonScriptApi = `import time
import board
import busio
import adafruit_ahtx0
import requests

# 1. API Configuratie (Gegenereerd door de website)
API_URL = "${config.endpointUrl}"
API_KEY = "${config.apiKey}"

# 2. Initialiseer I2C bus en DHT20/AHT20 Sensor
try:
    i2c = busio.I2C(board.SCL, board.SDA)
    sensor = adafruit_ahtx0.AHTx0(i2c)
    print("✓ DHT20 Sensor succesvol geïnitialiseerd!")
except Exception as e:
    print(f"✗ Fout bij initialisatie van sensor: {e}")
    print("Controleer de bedrading en zorg dat de I2C interface aan staat.")
    exit(1)

# 3. Meet- en verzendcyclus
print(f"Start metingen. Data wordt verzonden naar: {API_URL}")
print("Druk op Ctrl+C om de script te stoppen.\\n")

while True:
    try:
        # Lees de sensorwaarden uit
        temperature = sensor.temperature
        humidity = sensor.relative_humidity
        
        # Rond af op 1 decimaal
        temperature = round(temperature, 1)
        humidity = round(humidity, 1)
        
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Temp: {temperature}°C | Vocht: {humidity}%")
        
        # Bereid de payload en headers voor
        payload = {
            "temperature": temperature,
            "humidity": humidity,
            "source": "physical"
        }
        
        headers = {
            "X-API-Key": API_KEY,
            "Content-Type": "application/json"
        }
        
        # Verstuur data via WiFi
        response = requests.post(API_URL, json=payload, headers=headers, timeout=5)
        
        if response.status_code == 201:
            print("  ✓ Data succesvol verzonden naar het dashboard!")
        else:
            print(f"  ✗ Fout bij verzenden ({response.status_code}): {response.text}")
            
    except Exception as e:
        print(f"  ✗ Meetfout of netwerkfout: {e}")
        
    # Meet elke 10 seconden
    time.sleep(10)
`;

  return (
    <div className="space-y-8" id="software-guide-container">
      {/* Overview Card */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              Pi Configuratie &amp; Software
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed mt-1">
              Selecteer hieronder jouw gewenste koppeling. Sven's autonome <strong>GitHub Pages koppeling</strong> slaat data op op de Pi en pusht dit direct door in je repository. Geen API sleutel of actieve backend nodig!
            </p>
          </div>
          
          {/* Architecture Switcher Tabs */}
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-stretch md:self-auto shrink-0">
            <button
              onClick={() => setMode("github")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wide font-bold rounded-lg transition-all ${
                mode === "github"
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/15"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              GitHub Pages (Geen API)
            </button>
            <button
              onClick={() => setMode("api")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wide font-bold rounded-lg transition-all ${
                mode === "api"
                  ? "bg-slate-800 text-indigo-400 border border-indigo-500/15"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Live API Koppeling (Dev)
            </button>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-white text-md px-1 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            {mode === "github" ? "GitHub Pages Stappenplan" : "WiFi API Stappenplan"}
          </h3>
          
          {(mode === "github" ? setupCommandsGithub : setupCommandsApi).map((item, index) => (
            <div key={index} className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-2xs space-y-3">
              <span className={`text-xs font-semibold font-mono tracking-wide block ${
                mode === "github" ? "text-emerald-400" : "text-indigo-400"
              }`}>
                {item.title}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              
              <div className="bg-slate-950 rounded-lg p-3 text-xs text-indigo-300 font-mono flex justify-between items-center group border border-slate-850">
                <span className="truncate select-all select-text">{item.command}</span>
                <button
                  onClick={() => copyToClipboard(item.command, `cmd-${mode}-${index}`)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0 ml-2 animate-none"
                  title="Kopieer commando"
                >
                  {copiedScript === `cmd-${mode}-${index}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {item.notes && (
                <div className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded border border-slate-855">
                  Tip: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Python Script Card */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-slate-200 flex flex-col justify-between shadow-xl space-y-4">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  mode === "github"
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                    : "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                }`}></div>
                <div>
                  <h3 className="font-display font-semibold text-white text-sm">
                    {mode === "github" ? "monitor_github.py Script" : "monitor.py Script"}
                  </h3>
                  <p className="text-[10px] text-slate-500">Volledig werkende, autonome code voor je Raspberry Pi</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(mode === "github" ? pythonScriptGithub : pythonScriptApi, "python-script")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 active:bg-slate-800 text-slate-200 text-xs rounded-lg transition-all border border-slate-700 cursor-pointer"
              >
                {copiedScript === "python-script" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Gekopieerd!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Kopieer Code
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 mb-2 leading-relaxed">
              {mode === "github" ? (
                <>
                  Dit bestand staat al voor je klaar in je repository als <code className="text-emerald-400 font-mono">monitor_github.py</code>. 
                  Het voegt metingen toe aan <code className="text-emerald-400 font-mono">public/data.json</code> en voert een automatische <code className="text-emerald-400">git commit && git push</code> uit.
                </>
              ) : (
                <>
                  Maak een bestand genaamd <code className="text-indigo-400 font-mono">monitor.py</code> op je Pi en plak de onderstaande code erin. 
                  <strong> De API URL en Sleutel zijn al ingevuld!</strong>
                </>
              )}
            </p>

            <div className="bg-slate-950/80 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-[380px] border border-slate-850 text-sky-305">
              <pre>{mode === "github" ? pythonScriptGithub : pythonScriptApi}</pre>
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 text-[11px] text-slate-300 flex gap-3 mt-2">
            <Wifi className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              {mode === "github" ? (
                <>
                  <span className="font-semibold block text-emerald-300">GitHub Pages Werking:</span>
                  Elke {mode === "github" ? "10 minuten" : "10 seconden"} leest de Pi de DHT20 uit, past het lokale JSON-bestand aan, en pusht dit naar GitHub. GitHub Pages update de site, en de browser laadt de vernieuwde data automatisch en toont het op deze website!
                </>
              ) : (
                <>
                  <span className="font-semibold block text-indigo-300">Netwerk WiFi Koppeling:</span>
                  De Pi maakt direct verbinding met jouw Express backend server en schiet de metingen elke 10 seconden live door via een WiFi netwerkverbinding.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
