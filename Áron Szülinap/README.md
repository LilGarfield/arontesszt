# Daddy's Birthday Quest 🎁

Egy interaktív születésnapi rejtélyjáték Áronnak (Daddy / Apu / Sukár Daddy).
Két részre tagolódik: egy abszurd, pixeles terminal-quest, majd egy csendes,
cinematikus filmes befejezés.

## Indítás

Nyisd meg az `index.html`-t egy modern böngészőben. Nincs build lépés, nincs
telepítés, nincs szerver (bár egy egyszerű `python -m http.server` is jó lehet).

## Testreszabás – minden egy fájlban

**Minden szöveg, kérdés, válasz, ajándéktartalom, üzenet és kép a [`config.js`](config.js)
fájlban van.** A többi fájlt nem kell szerkesztened.

| Mit akarsz változtatni | Hol |
| --- | --- |
| Betöltő szövegek és időzítés | `CFG.intro` |
| Főcím, alcím | `CFG.header` |
| Sikeres / hibás reakciók | `CFG.reactions` |
| Kérdések, elfogadott válaszok, tippek | `CFG.gifts[].challenge` |
| Ajándékok tartalma | `CFG.gifts[].content` |
| Ajándékok színei | `CFG.gifts[].colors` |
| 10 filmes üzenet | `CFG.finale.messages` |
| Stáblista, képek, feliratok | `CFG.finale.credits` |
| Hang alapértelmezése | `CFG.sound` |

### Válaszok

Az `accepted` tömb bármely eleme kinyitja az ajándékot. A rendszer
kisbetűsít, eltávolítja az ékezeteket, a központozást és a szóközöket,
így ezek mindegyike elfogadott:

```
"Tim Berners-Lee"  =  "timbernerslee"  =  "TIM_BERNERSLEE"
"születésnap"      =  "szuletésnap"    =  "SZÜLETÉSNAP!"
```

### Tartalom-blokkok

Az ajándék `content` tömbjében ezek a típusok használhatók:

- `{ type: "text", text: "..." }` – egyszerű szöveg
- `{ type: "ascii", text: "..." }` – zöld terminal-szöveg (`\n` sorokhoz)
- `{ type: "image", src: "...", caption: "..." }` – kép + felirat
- `{ type: "badge", kicker: "...", title: "...", text: "..." }` – oklevél-szerű kártya

### Fotók cseréje

1. Tegyél be saját képeket az `assets/photos/` mappába (jpg, png, webp – bármi).
2. Írd át az elérési utat `CFG.finale.credits.blocks`-ban a `src` mezőben.
3. A `layout` lehet `"single"` (egy nagy kép) vagy `"pair"` (kép mellett kép,
   mobilon egymás alatt).

A mellékelt SVG-k **placeholderek** – nyilvánvalóan jelezve vannak, hogy
le kell őket cserélni. Ugyanígy a `wanted-placeholder.svg` is az.

### Személyes adatok

A config tudatosan csak **placeholdereket** tartalmaz személyes adatok helyett
(pl. `[IDE A TE NEVED VAGY NEVEITEK]`). Ezeketírd át saját szövegre.

## Viselkedés

- Az ajándékok **sorrendben** nyithatók: a következő csak az előző
  megoldása után érhető el (előtte halványítva, „ZÁROLVA” felirattal,
  kattintásra rövid üzenet jelenik meg). A már kinyitott ajándékok
  `localStorage`-ban maradnak, és bármikor újra megnyithatók.
- Az ötödik ajándék megoldása után a játék teljesen eltűnik, 1,5 másodperc
  teljes feketét követően elindul a 10 üzenet, majd a stáblista.
- A stáblista alatt a képek fokozatosan, gördülő mozgással jelennek meg.
- A játék hangjait a Web Audio API generálja – ezekhez nincsenek hangfájlok.
  A stáblista alatt, **pontosan az első kép megjelenésekor** elindul a
  `CFG.finale.music.src`-ben megadott dal a `startSecond` másodperctől
  (alapból a 7.-től). A fájl az `assets/audio/birthday-song.mp3`; cseréld le,
  ha másik zenét szeretnél. A `HANG: BE/KI` gomb erre is hatással van, és a
  beállítás megmarad.
- A `prefers-reduced-motion` beállítást a oldal tiszteletben tartja: ilyenkor
  nincs hosszú görgető animáció, a stáblista simán végiggörgethető.
- Az `ÚJRAJÁTSZÁS` gomb kétszeri megnyomásával (biztonsági okból) nullázódik
  az összes ajándék. A film végén lévő gomb egy kattintással indít újra.

## Fájlok

```
index.html      – szerkezet
styles.css      – pixelvilág + filmes világ stílusai
config.js       – MINDEN szerkeszthető tartalom
app.js          – játéklogika, animációk, hang, tárolás
assets/         – placeholder képek (kicserélhetők)
```
