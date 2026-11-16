# Xiaotong Malatang 麻辣烫

A playable low-poly 3D malatang shop game for desktop and mobile. Xiaotong manages the store; Lukas / 卢卡斯 is the cashier. Use tongs to pick one piece at a time, guess the hidden weight, commit to the scale, choose broth and spice, and pay with a simulated game card or cash.

**Play:** https://lukaswall.github.io/malamaxing/

## How to play
- Tap **Open the shop**, then **Enter shop** (WASD/arrows, joystick and drag-to-look also work)
- Tap **+ Ingredients** for easy one-piece picking, or tap trays with the tongs
- Tap **Drinks** for a separate drinks fridge; drinks are not weighed
- Tap **Talk** to use scripted English/Chinese commands, recommendations, and browser speech. Recognition support and installed voices vary by device; typed commands and manual picking remain available. The game does not record or store audio.
- Guess the grams before the reveal. The shop minimum is enforced after locking.
- Minimize the guest ticket, basket and receipt to clear the view. Zoom with mouse wheel, pinch, or +/-.
- **Music** opens real official recordings in a visible YouTube player. Playback, ads, regional availability and autoplay depend on YouTube and the browser.

## Realism notes (prices researched, Nov 2026)
Pay-by-weight rates from real malatang shops, selectable on the title screen:
- YGF Malatang, Barcelona: EUR 2.19 / 100 g, 400 g minimum - Time Out Barcelona (https://www.timeout.es/barcelona/es/noticias/el-restaurante-de-sopas-que-triunfa-en-china-ha-abierto-en-barcelona-y-puedes-elegir-todos-los-ingredientes-del-plato-072825) and Barcelona Secreta (https://barcelonasecreta.com/ygf-malatang-barcelona/)
- Yangguofu Malatang, Berlin: EUR 3.19 / 100 g - official menu (https://yangguofu-mala.de/buffet-und-zutaten/)
- YGF Malatang, New York: USD 15 / lb = USD 3.31 / 100 g - Eater NY (https://ny.eater.com/2024/2/29/24086100/ygf-malatang-hot-pot-east-village-opening)
- Bone Soup Malatang, Toronto: CAD 3.50 / 100 g, ~400 g minimum - menusca.com 2026 price guide (https://menusca.com/mala-tang-menu-prices-canada/)

Ingredient pick weights and drink prices are best estimates per piece / small portion, not measured values. Drinks list uses recognizable examples from Chinese drink guides, not an exhaustive stock list. Song metadata and official URLs are in `music.json`; no recordings are downloaded or hosted here.

## Tech
Plain HTML + Three.js (r160, via jsdelivr CDN). No build step, no paid API and no real payments. `main.js` is the preserved first preview; the current root build is inline for reliable deployment.
