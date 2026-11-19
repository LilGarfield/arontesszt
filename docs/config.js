/* =============================================================================
   DADDY'S BIRTHDAY QUEST — CENTRAL CONFIGURATION
   -----------------------------------------------------------------------------
   Everything editable lives in this one file.
   Change the questions, answers, gift contents, messages, photos and timings
   here. No need to touch index.html, styles.css or app.js.

   Valid answer checking: strings are compared after lower-casing, removing
   accents (á -> a), punctuation, spaces and hyphens. So "Tim Berners-Lee",
   "timbernerslee" and "TIM_BERNERSLEE" all count as the same answer.
   ============================================================================= */

window.QUEST_CONFIG = {
  /* -------------------------------------------------------------------------
     1. LOADING SCREEN — typewriter lines. Keep these exact if you want the
        original joke. pauseBefore / speed are in milliseconds.
     ------------------------------------------------------------------------- */
  intro: {
    prompt: "system32/root>",   // the CMD-style prompt shown before every line
    lines: [
      { text: "Tölt befelé...",                   pauseBefore: 250,  speed: 60, className: "dim" },
      { text: "Daddy, nyugi nem lesz sok idő",    pauseBefore: 750,  speed: 48 },
      { text: "TÉNYLEG NEM LESZ SOK IDŐ ESKÜ",    pauseBefore: 1050, speed: 38, className: "loud" },
      { text: "na kész :)",                       pauseBefore: 2000, speed: 85, className: "ok" }
    ],
    holdAfter: 950,       // pause after the last line before the game appears
    exitDuration: 650     // fade-out length (ms)
  },

  /* -------------------------------------------------------------------------
     2. MAIN MENU TEXT
     ------------------------------------------------------------------------- */
  header: {
    eyebrow: "// KUKORIKU JOREGGELT KIVANOK MINDENKINEK //",
    title: ["DADDY", "SZÜLINAPI KÜLDETÉSE"],
    subtitle: "Válaszd az utad, Sukár Daddy.",
    footerHint: "Tipp: a már kinyitott ajándékokat újra meg tudod nézni. Daddy. ;)"
  },

  /* -------------------------------------------------------------------------
     3. SHARED REACTION TEXTS
     ------------------------------------------------------------------------- */
  reactions: {
    success: [
      "HELL YEAH LOWKEY",
      "NA EZ AZ.",
      "DADDY MODE: UNLOCKED",
      "IJA ANDREW BÜSZKE RÁD",
      "ZSENI VAGY ;)"
    ],
    wrong: [
      "Nem. De közel! (nem, de tényleg nem)",
      "Hmmm. Daddy, gondolkodj még.",
      "A kereső a barátod. Vagy a chatgpt...",
      "Ez nem az. Na mégegyszer.",
      "A rendszer nem engedi. Én tudom. Én írtam..."
    ],
    locked: [
      "Előbb az előző ajándékot, Daddy.",
      "Sorba kell állni, Sukár Daddy.",
      "Ez még zárva van. Old meg az előzőt."
    ]
  },

  /* -------------------------------------------------------------------------
     4. THE FIVE GIFTS
        - colors: pixel gift box palette
        - challenge.accepted: any of these answers opens the gift
        - content: blocks shown after opening
          block types: "text" | "ascii" | "image" | "badge"
     ------------------------------------------------------------------------- */
  gifts: [
    {
      id: "nyelv",
      name: "AZ APU KÓD",
      colors: { body: "#5632a8", dark: "#332064", lid: "#7b57d6", ribbon: "#ffd166", glow: "#a98bff" },
      challenge: {
        title: "01 // NYELVI PRÓBA",
        clue: "Na Daddy, hogy van kínaiul az, hogy APu?",
        instruction: "Írd be a két kínai karaktert VAGY a kiejtést. Mindkettő jó.",
        placeholder: "Ide írd be a választ",
        accepted: ["阿爸", "爸爸", "aba", "abà", "a ba", "apu kínaiul"],
        hint: "Két kínai karakter, vagy az ejtést is beírhatod",
        wrong: ["Próbáld meg kínaiul. Nem magyarul, Daddy."]
      },
      successLine: "SZENT SZÓ, DADDY.",
      content: [
        { type: "badge", kicker: "HIVATALOS IGAZOLÁS", title: "KÍNAI DADDY", text: "Igazoljuk, hogy Daddy legalább EGY szót tud kínaiul. Ez több, mint amit mi tudunk." },
        { type: "ascii", text: "  .--.    .--.\n ( Apu )--( 爸 )\n  '--'    '--'\n   TISZTA NYELVZSENI" }
      ]
    },
    {
      id: "detektiv",
      name: "A NYOMOZÁS",
      colors: { body: "#167a7a", dark: "#0d4e52", lid: "#25a6a3", ribbon: "#ff8fa3", glow: "#4fe0d6" },
      challenge: {
        title: "02 // INTERNET DETEKTÍV",
        clue: "Ki írta az első weboldalt, és küldte el az első webcímet 1990-ben? Egy embert keresünk.",
        instruction: "A teljes nevet vagy csak a vezetéknevet is elfogadjuk.",
        placeholder: "Vezetéknév, kötőjellel is jó",
        accepted: ["Tim Berners-Lee", "Berners-Lee", "Tim Berners Lee", "Timothy Berners-Lee", "bernerslee", "Krisz", "Andrew"],
        hint: "A CERN-nél dolgozott. A vezetéknevében van egy kötőjel: ___ -Lee.",
        wrong: ["Ő nem írta az első weboldalt. Keress picit tovább."]
      },
      successLine: "NYOMOZÓ DADDY.",
      content: [
        { type: "image", src: "assets/wanted-placeholder.svg", caption: "KÖRÖZÖTT: SUKÁR DADDY // Bűne: túl jól néz ki" },
        { type: "text", text: "Ügyes, ügyes, megtaláltad. A keresési előzményeid mostantól bizalmasan kezelt adatok. kac-kac" }
      ]
    },
    {
      id: "rejtek",
      name: "A VÁLASZ",
      colors: { body: "#b5462f", dark: "#7d2c1c", lid: "#e2664a", ribbon: "#ffe066", glow: "#ff9b7a" },
      challenge: {
        title: "03 // REJTÉLYES KERESÉS",
        clue: "Keresd meg: mi a válasz az életre, az univerzumra és minden másra? A kereső egyetlen számot fog kiírni.",
        instruction: "Számjegyekkel írd be. Szöveggel is elfogadjuk.",
        placeholder: "két szám (vagyis egyben)",
        accepted: ["42", "negyvenkettő", "negyvenketto"],
        hint: "Egy híres sci-fi könyvben olvasható. Egy kék bolygó is van a történetben. Két számjegy.",
        wrong: ["A kereső szerint ez nem az. Na mégegyszer."]
      },
      successLine: "A RENDSZER TUDJA.",
      content: [
        { type: "ascii", text: "> az élet értelmének keresése...\n> internet keresése...\n> válasz: 42\n> biztosság: 100%\n\n[ OK ]" },
        { type: "text", text: "Megvan a válasz. A kérdést sajnos senki nem tudja, de azért gratulálok." }
      ]
    },
    {
      id: "spanyol",
      name: "A FORDÍTÁS",
      colors: { body: "#b8860b", dark: "#7d5c05", lid: "#e6ac1f", ribbon: "#7ee0ff", glow: "#ffd75e" },
      challenge: {
        title: "04 // KULTÚRIS TESZT",
        clue: "Spanyolul hogy van hogy daddy? Olyan, mint a 'sukár daddy', csak egy kicsit buzisabb.",
        instruction: "Egy szó. Ékezet nélkül is jó.",
        placeholder: "Hajrá Áron, ebben nem segítek...",
        accepted: ["papi", "papá", "papa", "papi daddy"],
        hint: "Mondtam hogy tényleg nem segítek... :c",
        wrong: ["EZ MOST KOMOLY?!?"]
      },
      successLine: "OLÉ, DADDY.",
      content: [
        { type: "badge", kicker: "SZÓTÁR · DADDY NYELVJÁRÁS", title: "PAPI", text: "/'pa.pi/ — főnév. Nem tudom mit írjak róla, mehetsz tovább :>" },
        { type: "text", text: "Ez az ajándék hivatalosan is meleg." }
      ]
    },
    {
      id: "vegso",
      name: "A VÉGSŐ KULCS",
      colors: { body: "#5b2a86", dark: "#3a1a5c", lid: "#8a4dc4", ribbon: "#ffd1e8", glow: "#d49bff" },
      challenge: {
        title: "05 // AZ UTOLSÓ AJÁNDÉK",
        clue: "Nem kell keresned, nem kell fordítanod. Csak be kell írnod, mit ünneplünk ma.",
        instruction: "Egy szó. Komolyan. Ez az utolsó kód.",
        placeholder: "mi van ma?",
        accepted: ["születésnap", "szuletésnap", "születésnapot", "szuletnap", "szülinap", "szulinap", "birthday", "boldog születésnapot"],
        hint: "NAAAA csak tudod már, NAAAA :DDD",
        wrong: ["Nem. De rögtön rájössz."]
      },
      successLine: "KULCS ELFOGADVA.",
      content: [
        { type: "text", text: "Készen állsz? Tedd le a telefont egy pillanatra. Mostantól nem a quest számít." },
        { type: "ascii", text: "  >> CLOSING QUEST.EXE\n  >> LOADING MEMORIES ..." }
      ],
      leadsToFinale: true
    }
  ],

  /* -------------------------------------------------------------------------
     5. FINAL GIFTS OPENING (cinematic part)
        Replace every message with your own. Keep them short — one breath each.
        hold = how long the line stays on screen (ms).
     ------------------------------------------------------------------------- */
  finale: {
    blackoutMs: 1500,       // pure black pause before the first message
    fadeMs: 900,            // fade in / out length
    messages: [
      { text: "Apu.", hold: 2400 },
      { text: "Ma születésnapod van.", hold: 3000 },
      { text: "És igen, tudom, ezt amúgy is tudod.", hold: 3200 },
      { text: "De azért meg kellett ünnepelni.", hold: 3000 },
      { text: "Voltak dolgok, amik nem úgy alakultak, ahogy terveztük.", hold: 3800 },
      { text: "És voltak olyanok is, amik miatt érdemes volt végigmenni rajtuk.", hold: 4300 },
      { text: "Te ezek közül az egyik vagy.", hold: 3200 },
      { text: "Köszönöm, hogy ilyen vagy. Komolyan.", hold: 3200 },
      { text: "Kívánok még sok olyan napot, amikor így röhögünk semmin.", hold: 3600 },
      { text: "Boldog születésnapot, Daddy.", hold: 4200 }
    ],

    /* Music starts exactly when the first photo enters the screen.
       startSecond = where in the song playback begins (7 = the 7th second). */
    music: {
      src: "assets/audio/birthday-song.mp3",
      startSecond: 7,
      volume: 0.75
    },

    credits: {
      rollDurationMs: 52000, // total length of the rolling credits
      blocks: [
        { type: "line", text: "SUKÁR DADDY" },
        { type: "line", text: "aki mindig megérdemelt egy saját weboldalt", style: "italic" },
        { type: "space", size: "large" },
        { type: "photos", layout: "single", images: [
          { src: "assets/photos/photo-1.svg", caption: "IDE TEGYED AZ ELSŐ KÉPET" }
        ] },
        { type: "photos", layout: "pair", images: [
          { src: "assets/photos/photo-2.svg", caption: "KÉP 02" },
          { src: "assets/photos/photo-3.svg", caption: "KÉP 03" }
        ] },
        { type: "space", size: "small" },
        { type: "line", text: "Emlékek, amiket nem kellett megmagyarázni." , style: "italic" },
        { type: "space", size: "large" },
        { type: "photos", layout: "single", images: [
          { src: "assets/photos/photo-4.svg", caption: "KÉP 04" }
        ] },
        { type: "photos", layout: "pair", images: [
          { src: "assets/photos/photo-5.svg", caption: "KÉP 05" },
          { src: "assets/photos/photo-6.svg", caption: "KÉP 06" }
        ] },
        { type: "space", size: "large" },
        { type: "line", text: "Szeretettel: Krisztián ( Andrew ) " },
        { type: "line", text: "és még sok születésnap. ♥", style: "italic" }
      ]
    }
  },

  /* -------------------------------------------------------------------------
     6. SOUND — short sounds are generated with the Web Audio API,
        so there are no audio files to download.
     ------------------------------------------------------------------------- */
  sound: { enabledByDefault: true }
};
