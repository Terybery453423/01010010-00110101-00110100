# 01010010-00110101-00110100

- 🏎️ RALLY52 Mod Hub

A lightweight, in-game mod loader for RALLY52.

Instead of installing a dozen different Tampermonkey scripts, the Mod Hub gives you a single, native-looking interface to manage all your custom add-ons, UI tweaks, and cosmetic mods right from the game's settings menu.

- ✨ Features

· Native UI: Injects directly into the game's settings menu so it doesn't clutter your screen.
· Stealth Trigger: Tap the word "SETTINGS" exactly 5 times to reveal the Mod Hub tabs.
· One-Click Installs: Install and remove mods safely with full window.__r52ModCleanup support. Uninstalling resets the game state cleanly.
· Auto-Load: Remembers which mods you have enabled and loads them automatically on page refresh.
· Bypass CORS/CSP: Uses GM_xmlhttpRequest to securely fetch mods and stores from GitHub.
· Built-in Fixes: A dedicated FIXES tab to apply signature paints and reset glitched states.

- 🛠️ Installation

1. Install a userscript manager for your browser:
   · Tampermonkey (Chrome, Edge, Safari, Firefox)
   · Userscripts (iOS Safari)
2. Copy the Mod Hub Loader script:
   · [here](https://github.com/Terybery453423/01010010-00110101-00110100/blob/main/mod_hub.txt)
3. Open RALLY52 and go to the Settings menu.
4. Tap the word "Settings" exactly 5 times.
5. A new 🔧 MODS and 🛠️ FIXES tab will appear. Click MODS to browse and install available add-ons!

- 📦 Currently Available Mods

· Custom Model Loader (glb_gtlf_loader): Swaps the default game car for your own custom 3D model.
· Squash & Stretch (squash_stretch): Adds bouncy, cartoon-style squash-and-stretch physics animations to the car.
· No Dust (no_dust): Disables all particle and tire dust trails for a much cleaner look.
· Golden Gate Bridge (bridge): Swaps your vehicle for the Golden Gate Bridge (includes a custom download UI).
· Trippy Paint (trippy): Generates crazy neon paint patterns and uploads them directly to your profile.
· Signature Paint (signature.json): Uses the FIXES tab to apply a personal Neon RLE paint payload directly to your Supabase database.

(Note: More mods are actively being developed!)

- 🤝 Contributing

Want to add your own mod to the Hub?

1. Fork this repository.
2. Add your .js file to the /mods folder.
3. Add your mod's metadata to store.json.
4. Open a Pull Request!

- ⚠️ Disclaimer

This project is fan-made and is not affiliated with the developers of RALLY52. Use mods at your own risk. Client-side mods are generally safe, but the developers reserve the right to update their backend and break functionality at any time. Do not use mods to intentionally ruin the experience for other players.