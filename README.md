# 01010010-00110101-00110100

A lightweight, in-game mod loader for [RALLY52](https://rally52.com/). 

(everything last checked on rally52 update v0.9.3.5)

Instead of installing a bunch of separate Tampermonkey scripts, this gives you a single interface to manage add-ons, UI tweaks, and cosmetic mods right from the game's settings menu.

### Features
- Injects directly into the game's Settings menu.
- Tap the word "SETTINGS" 5 times to reveal the mod tabs.
- One-click installs and uninstalls (uses `window.__r52ModCleanup` to cleanly reset the game state).
- Auto-loads your enabled mods when you refresh the page.
- Uses `GM_xmlhttpRequest` to bypass CORS/CSP when fetching mods from GitHub.
- Includes a "Fixes" tab for signature paints and resetting glitched states.

### Installation
1. Install a userscript manager for your browser (Tampermonkey, Userscripts for iOS, etc).
2. Copy the [Mod Hub Loader script](https://github.com/Terybery453423/01010010-00110101-00110100/blob/main/mod_hub.txt).
3. Paste the script into Tampermonkey, or other userscript manager and save
4. Open RALLY52, go to Settings, and tap "Settings" exactly 5 times.
5. The MODS and FIXES tabs will appear. Open MODS to browse the store.

### Available Mods
- **Custom Model Loader** (`glb_gtlf_loader`) - Swaps the default car for your own 3D model.
- **Squash & Stretch** (`squash_stretch`) - Adds bouncy, cartoon-style physics animations to the car.
- **No Dust** (`no_dust`) - Disables tire dust trails.
- **Golden Gate Bridge** (`bridge`) - Replaces your vehicle with the Golden Gate Bridge.
- **Trippy Paint** (`trippy`) - Generates neon paint patterns and pushes them to your profile.
- **Signature Paint** (`signature.json`) - Apply a custom RLE paint payload via the Fixes tab.

### Contributing
Want to add a mod?
1. Fork the repository.
2. Add your `.js` file to the `/mods` folder.
3. Add your metadata to `store.json`.
4. Open a Pull Request.

### Disclaimer
This project is fan-made and not affiliated with the developers of RALLY52. Use mods at your own risk. Client-side mods are generally safe, but game updates can break functionality at any time. Don't use mods to ruin the experience for other players.




### License
This project is licensed under the GNU General Public License v3.0 (GPLv3). See the [LICENSE](LICENSE) file for details. 

*Note: This license applies to the Mod Hub loader itself. Individual mods submitted to the `/mods` folder remain the intellectual property of their respective creators unless otherwise specified.*