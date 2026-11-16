# MALAMAXING 麻辣烫

A playable low-poly 3D malatang shop game for desktop and mobile.
Walk into the shop, pick ingredients from the display fridge, weigh your
basket on the scale, choose broth and spice level, and try to hit each
guest's target weight without going over their budget.

**Play:** https://lukaswall.github.io/malamaxing/

## How to play
- WASD / arrow keys or the on-screen joystick to walk, drag to look around
- Click / tap the door to enter, click trays to add ingredients to your basket
- The scale and basket bar show live weight and price (charged per gram)
- Hit "Weigh & Serve", choose the broth + spice the guest asked for
- Receipt scores your order accuracy, weight accuracy and speed, plus tip

## Realism notes (prices researched, Nov 2026)
Pay-by-weight rates from real malatang shops, selectable on the title screen:
- YGF Malatang, Barcelona: EUR 2.19 / 100 g, 400 g minimum - Time Out Barcelona (https://www.timeout.es/barcelona/es/noticias/el-restaurante-de-sopas-que-triunfa-en-china-ha-abierto-en-barcelona-y-puedes-elegir-todos-los-ingredientes-del-plato-072825) and Barcelona Secreta (https://barcelonasecreta.com/ygf-malatang-barcelona/)
- Yangguofu Malatang, Berlin: EUR 3.19 / 100 g - official menu (https://yangguofu-mala.de/buffet-und-zutaten/)
- YGF Malatang, New York: USD 15 / lb = USD 3.31 / 100 g - Eater NY (https://ny.eater.com/2024/2/29/24086100/ygf-malatang-hot-pot-east-village-opening)
- Bone Soup Malatang, Toronto: CAD 3.50 / 100 g, ~400 g minimum - menusca.com 2026 price guide (https://menusca.com/mala-tang-menu-prices-canada/)

Typical real bowls are 450-600 g; guest target weights use a 380-600 g range.
Ingredient pick weights are best estimates per piece / small portion
(e.g. fish ball ~20 g, quail egg ~10 g, instant noodle pack ~85 g) -
estimates, not measured values.

## Tech
Plain HTML + Three.js (r160, via jsdelivr CDN). No build step.
