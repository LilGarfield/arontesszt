/* =============================================================================
   DADDY'S BIRTHDAY QUEST — application logic
   No dependencies. All content comes from window.QUEST_CONFIG (config.js).
   ============================================================================= */
(function () {
  "use strict";

  var CFG = window.QUEST_CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) document.body.classList.add("reduced-motion");

  var STORE = { unlocked: "dq.unlocked.v1", sound: "dq.sound.v1" };

  function readStore(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function writeStore(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  var state = {
    unlocked: new Set(readStore(STORE.unlocked, [])),
    sound: readStore(STORE.sound, CFG.sound.enabledByDefault),
    current: null,
    lastFocus: null,
    finaleStarted: false,
    creditsStarted: false,
    creditsDone: false,
    musicStarted: false,
    finaleTimer: null,
    musicTimer: null
  };

  var els = {
    loader: $("loader"), loaderLines: $("loader-lines"),
    game: $("game"), grid: $("gift-grid"),
    pips: $("progress-pips"), count: $("progress-count"),
    modal: $("modal-backdrop"), modalTitle: $("modal-title"), clue: $("modal-clue"),
    instruction: $("modal-instruction"), form: $("answer-form"), input: $("answer-input"),
    feedback: $("answer-feedback"), hint: $("modal-hint"), hintBtn: $("hint-btn"),
    reveal: $("reveal"), revealMessage: $("reveal-message"), revealTitle: $("reveal-title"),
    revealContent: $("reveal-content"), revealClose: $("reveal-close"),
    finale: $("finale"), messageStage: $("message-stage"), message: $("finale-message"),
    credits: $("credits"), finaleEnd: $("finale-end"), skip: $("skip-btn"),
    music: $("credits-music"), toast: $("toast")
  };

  /* ============================== AUDIO ============================== */
  var audioCtx = null;
  function tone(freq, dur, type, volume, delay) {
    if (!state.sound) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
      var t = audioCtx.currentTime + (delay || 0);
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || "square";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume || 0.03, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    } catch (e) { /* audio is a bonus, never a blocker */ }
  }
  function sfxCorrect() { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.13, "square", 0.028, i * 0.085); }); }
  function sfxWrong() { tone(170, 0.16, "sawtooth", 0.018, 0); tone(125, 0.2, "sawtooth", 0.018, 0.1); }
  function sfxOpen() { tone(330, 0.08, "square", 0.022, 0); tone(494, 0.11, "square", 0.022, 0.09); }
  function sfxFinale() { [261.6, 329.6, 392, 523.3].forEach(function (f, i) { tone(f, 1.4, "sine", 0.02, i * 0.36); }); }

  /* ============================= LOADER ============================== */
  function typeInto(el, spec) {
    if (reduced) { el.insertAdjacentText("beforeend", spec.text); return Promise.resolve(); }
    var caret = document.createElement("span");
    caret.className = "caret";
    caret.setAttribute("aria-hidden", "true");
    el.appendChild(caret);
    return new Promise(function (resolve) {
      var i = 0;
      function step() {
        if (i < spec.text.length) {
          caret.insertAdjacentText("beforebegin", spec.text.charAt(i));
          i++;
          setTimeout(step, (spec.speed || 50) + Math.random() * 16 - 8);
        } else {
          setTimeout(resolve, spec.pauseBefore || 0);
        }
      }
      step();
    });
  }

  async function runLoader() {
    for (var i = 0; i < CFG.intro.lines.length; i++) {
      var old = els.loaderLines.querySelector(".caret");
      if (old) old.remove();
      var spec = CFG.intro.lines[i];
      var line = document.createElement("p");
      if (spec.className) line.className = spec.className;
      var prompt = document.createElement("span");
      prompt.className = "cmd-prompt";
      prompt.textContent = (CFG.intro.prompt || "system32/root>") + " ";
      prompt.setAttribute("aria-hidden", "true");
      line.appendChild(prompt);
      els.loaderLines.appendChild(line);
      await typeInto(line, spec);
    }
    if (reduced) {
      els.loader.classList.add("is-hidden");
      showGame();
      return;
    }
    await wait(CFG.intro.holdAfter);
    els.loader.classList.add("is-leaving");
    await wait(CFG.intro.exitDuration);
    els.loader.classList.add("is-hidden");
    showGame();
  }

  function showGame() {
    els.game.classList.remove("is-hidden");
    renderGifts();
    updateProgress();
  }

  /* ============================== GIFTS ============================== */
  function giftArt() {
    return '' +
      '<svg class="gift__art" viewBox="0 0 100 100" shape-rendering="crispEdges" aria-hidden="true">' +
        '<rect x="20" y="87" width="60" height="5" fill="#000" opacity=".45"/>' +
        '<g class="gift__box">' +
          '<rect x="18" y="46" width="64" height="38" fill="var(--body)"/>' +
          '<rect x="18" y="46" width="64" height="4" fill="var(--dark)"/>' +
          '<rect x="18" y="80" width="64" height="4" fill="var(--dark)"/>' +
          '<rect x="18" y="46" width="4" height="38" fill="var(--dark)"/>' +
          '<rect x="78" y="46" width="4" height="38" fill="var(--dark)"/>' +
          '<rect x="46" y="46" width="8" height="38" fill="var(--ribbon)"/>' +
          '<rect x="18" y="62" width="64" height="6" fill="var(--ribbon)" opacity=".85"/>' +
          '<rect x="18" y="62" width="64" height="2" fill="#fff" opacity=".16"/>' +
          '<rect x="25" y="54" width="3" height="3" fill="#fff" opacity=".2"/>' +
          '<rect x="72" y="72" width="3" height="3" fill="#fff" opacity=".2"/>' +
        '</g>' +
        '<g class="gift__lid">' +
          '<rect x="12" y="34" width="76" height="13" fill="var(--lid)"/>' +
          '<rect x="12" y="34" width="76" height="3" fill="#fff" opacity=".22"/>' +
          '<rect x="12" y="44" width="76" height="3" fill="var(--dark)"/>' +
          '<rect x="46" y="34" width="8" height="13" fill="var(--ribbon)"/>' +
          '<rect x="40" y="24" width="9" height="10" fill="var(--ribbon)"/>' +
          '<rect x="51" y="24" width="9" height="10" fill="var(--ribbon)"/>' +
          '<rect x="45" y="29" width="10" height="5" fill="var(--ribbon)"/>' +
          '<rect x="42" y="22" width="7" height="5" fill="var(--ribbon)" opacity=".85"/>' +
          '<rect x="51" y="22" width="7" height="5" fill="var(--ribbon)" opacity=".85"/>' +
        '</g>' +
      '</svg>';
  }

  var giftButtons = [];
  var toastTimer = null;

  // The quest is sequential: a gift opens only once the previous one is solved.
  function isGiftAvailable(i) {
    return i === 0 || state.unlocked.has(i - 1);
  }

  function showToast(text) {
    els.toast.textContent = text;
    els.toast.classList.remove("is-hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.add("is-hidden"); }, 2300);
  }

  function refreshGiftStates() {
    giftButtons.forEach(function (btn, i) {
      var unlocked = state.unlocked.has(i);
      var available = isGiftAvailable(i);
      btn.classList.toggle("is-unlocked", unlocked);
      btn.classList.toggle("is-locked", !available);
      btn.setAttribute("aria-disabled", String(!available));
      var status = !available ? "ZÁROLVA" : (unlocked ? "NYITVA" : "ZÁRVA");
      var label = btn.querySelector(".gift__status");
      if (label) label.textContent = status;
    });
  }

  function renderGifts() {
    els.grid.innerHTML = "";
    giftButtons = CFG.gifts.map(function (gift, i) {
      var c = gift.colors;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gift";
      btn.setAttribute("aria-label", "Ajándék " + (i + 1) + ": " + gift.name);
      btn.style.cssText = "--i:" + i + ";--body:" + c.body + ";--dark:" + c.dark +
        ";--lid:" + c.lid + ";--ribbon:" + c.ribbon + ";--glow:" + c.glow;
      btn.innerHTML =
        '<span class="gift__glow"></span>' +
        '<span class="gift__float">' +
          '<span class="gift__q">?</span>' +
          '<i class="spark s1"></i><i class="spark s2"></i><i class="spark s3"></i><i class="spark s4"></i>' +
          giftArt() +
        '</span>' +
        '<span class="gift__name">' + gift.name + '</span>' +
        '<span class="gift__status">ZÁRVA</span>';
      btn.addEventListener("click", function () { onGiftClick(i, btn); });
      els.grid.appendChild(btn);
      return btn;
    });
    refreshGiftStates();
  }

  function updateProgress() {
    els.pips.innerHTML = CFG.gifts.map(function (_, i) {
      return '<span class="pip' + (state.unlocked.has(i) ? " is-on" : "") + '"></span>';
    }).join("");
    els.count.textContent = state.unlocked.size + " / " + CFG.gifts.length;
  }

  function onGiftClick(i, btn) {
    if (state.finaleStarted) return;
    if (!isGiftAvailable(i)) {
      showToast(pick(CFG.reactions.locked));
      sfxWrong();
      return;
    }
    state.lastFocus = btn;
    if (state.unlocked.has(i)) { showReveal(i); return; }
    openChallenge(i);
  }

  /* =========================== CHALLENGE ============================= */
  function openChallenge(i) {
    var gift = CFG.gifts[i];
    state.current = i;
    els.modalTitle.textContent = gift.challenge.title;
    els.clue.textContent = gift.challenge.clue;
    els.instruction.textContent = gift.challenge.instruction;
    els.input.value = "";
    els.input.placeholder = gift.challenge.placeholder || "a válaszod...";
    els.feedback.textContent = "";
    els.feedback.className = "feedback";
    els.input.classList.remove("is-wrong");
    els.hint.textContent = gift.challenge.hint || "";
    els.hint.classList.add("is-hidden");
    els.hintBtn.textContent = "TIPP";
    els.form.querySelector("button[type=submit]").disabled = false;
    els.modal.classList.remove("is-hidden");
    setTimeout(function () { els.input.focus(); }, 120);
  }

  function closeChallenge() {
    els.modal.classList.add("is-hidden");
    state.current = null;
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  function normalize(v) {
    return String(v == null ? "" : v)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[\u2010-\u2015\_.,!?;:'"()\[\]{}]/g, "")
      .replace(/\s+/g, "");
  }

  function isCorrect(value, gift) {
    var answer = normalize(value);
    if (!answer) return false;
    return gift.challenge.accepted.some(function (ok) { return normalize(ok) === answer; });
  }

  els.hintBtn.addEventListener("click", function () {
    var showing = !els.hint.classList.contains("is-hidden");
    els.hint.classList.toggle("is-hidden", showing);
    els.hintBtn.textContent = showing ? "TIPP" : "TIPP ELREJTÉSE";
  });

  els.form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (state.current === null) return;
    var gift = CFG.gifts[state.current];
    var value = els.input.value.trim();

    if (!value) {
      els.feedback.textContent = "Írj valamit, Daddy.";
      els.input.classList.remove("is-wrong");
      void els.input.offsetWidth;
      els.input.classList.add("is-wrong");
      sfxWrong();
      return;
    }

    if (isCorrect(value, gift)) {
      els.feedback.textContent = "✔ " + (gift.successLine || pick(CFG.reactions.success));
      els.feedback.className = "feedback is-good";
      els.form.querySelector("button[type=submit]").disabled = true;
      sfxCorrect();
      var index = state.current;
      setTimeout(function () {
        closeChallenge();
        unlockGift(index);
      }, reduced ? 120 : 620);
    } else {
      var wrongList = gift.challenge.wrong || CFG.reactions.wrong;
      els.feedback.textContent = pick(wrongList);
      els.feedback.className = "feedback";
      els.input.classList.remove("is-wrong");
      void els.input.offsetWidth;
      els.input.classList.add("is-wrong");
      sfxWrong();
      els.input.focus();
    }
  });

  $("modal-close").addEventListener("click", closeChallenge);
  els.modal.addEventListener("click", function (e) { if (e.target === els.modal) closeChallenge(); });

  /* ============================= REVEAL ============================== */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function renderBlock(block) {
    if (block.type === "text") return "<p>" + escapeHtml(block.text) + "</p>";
    if (block.type === "ascii") return "<pre>" + escapeHtml(block.text) + "</pre>";
    if (block.type === "image") {
      return '<figure><img src="' + escapeHtml(block.src) + '" alt="' + escapeHtml(block.caption || "") + '">' +
        (block.caption ? "<figcaption>" + escapeHtml(block.caption) + "</figcaption>" : "") + "</figure>";
    }
    if (block.type === "badge") {
      return '<div class="reveal-badge">' +
        (block.kicker ? '<p class="reveal-badge__kicker">' + escapeHtml(block.kicker) + "</p>" : "") +
        (block.title ? '<p class="reveal-badge__title">' + escapeHtml(block.title) + "</p>" : "") +
        '<p class="reveal-badge__text">' + escapeHtml(block.text || "") + "</p></div>";
    }
    return "";
  }

  function showReveal(i) {
    var gift = CFG.gifts[i];
    els.revealMessage.textContent = pick(CFG.reactions.success);
    els.revealTitle.textContent = gift.name;
    els.revealContent.innerHTML = (gift.content || []).map(renderBlock).join("");
    if (gift.leadsToFinale) {
      els.revealClose.textContent = "TOVÁBB A VÉGÉHEZ ▸";
      els.revealClose.onclick = startFinale;
    } else {
      els.revealClose.textContent = "VISSZA A JÁTÉKHOZ";
      els.revealClose.onclick = closeReveal;
    }
    els.reveal.classList.remove("is-hidden");
    setTimeout(function () { els.revealClose.focus(); }, 150);
  }

  function closeReveal() {
    els.reveal.classList.add("is-hidden");
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  function unlockGift(i) {
    state.unlocked.add(i);
    writeStore(STORE.unlocked, Array.from(state.unlocked));
    updateProgress();
    refreshGiftStates(); // the next gift in line becomes available
    var btn = giftButtons[i];
    if (btn) {
      btn.classList.add("is-opening");
      btn.querySelector(".gift__q").textContent = "!";
      sfxOpen();
      setTimeout(function () {
        btn.classList.remove("is-opening");
        btn.classList.add("is-unlocked");
        btn.querySelector(".gift__q").textContent = "✓";
        showReveal(i);
        if (CFG.gifts[i].leadsToFinale) {
          state.finaleTimer = setTimeout(startFinale, reduced ? 2200 : 4200);
        }
      }, reduced ? 60 : 620);
    }
  }

  /* ============================= FINALE ============================== */
  function startFinale() {
    if (state.finaleStarted) return;
    state.finaleStarted = true;
    clearTimeout(state.finaleTimer);
    els.reveal.classList.add("is-hidden");
    els.game.classList.add("is-gone");
    document.documentElement.style.overflow = "hidden";
    sfxFinale();

    setTimeout(function () {
      els.game.classList.add("is-hidden");
      els.finale.classList.remove("is-hidden");
      els.skip.classList.remove("is-hidden");
      runMessages();
    }, reduced ? 60 : 760);
  }

  async function runMessages() {
    if (!reduced) await wait(CFG.finale.blackoutMs);
    els.message.style.setProperty("--fade", (CFG.finale.fadeMs / 1000) + "s");
    var messages = CFG.finale.messages;

    for (var i = 0; i < messages.length; i++) {
      if (state.creditsStarted) return; // user skipped ahead
      els.message.textContent = messages[i].text;
      els.message.classList.remove("is-visible", "is-leaving");
      if (!reduced) await wait(80);
      els.message.classList.add("is-visible");
      var hold = reduced ? Math.min(messages[i].hold || 2800, 1100) : (messages[i].hold || 2800);
      await wait(hold);
      if (i === messages.length - 1) break; // the last line becomes the first credit
      els.message.classList.add("is-leaving");
      await wait(reduced ? 40 : CFG.finale.fadeMs);
    }
    startCredits();
  }

  function buildCredits() {
    var blocks = CFG.finale.credits.blocks || [];
    els.credits.innerHTML = blocks.map(function (b) {
      if (b.type === "line") {
        return '<p class="credit-line' + (b.style === "italic" ? " is-italic" : "") + '">' + escapeHtml(b.text) + "</p>";
      }
      if (b.type === "space") {
        return '<div class="credit-space credit-space--' + (b.size === "large" ? "large" : "small") + '"></div>';
      }
      if (b.type === "photos") {
        var layout = b.layout === "pair" ? "pair" : "single";
        var imgs = (b.images || []).map(function (im) {
          return '<figure class="credit-photo"><img loading="lazy" src="' + escapeHtml(im.src) +
            '" alt="' + escapeHtml(im.caption || "Emlék") + '">' +
            (im.caption ? "<figcaption>" + escapeHtml(im.caption) + "</figcaption>" : "") + "</figure>";
        }).join("");
        return '<div class="photo-group photo-group--' + layout + '">' + imgs + "</div>";
      }
      return "";
    }).join("");

    // The very same element that was centred on screen becomes the first
    // credit line — no duplicate text, no crossfade to a second copy.
    els.message.classList.remove("is-visible", "is-leaving");
    els.message.classList.add("is-credit");
    els.credits.insertBefore(els.message, els.credits.firstChild);

    els.credits.style.setProperty("--roll", (CFG.finale.credits.rollDurationMs / 1000) + "s");
  }

  /* ---- Music: begins on the exact frame the first photo enters the screen ---- */
  // A blob URL is always seekable, even on simple static servers that do not
  // support HTTP Range requests. On file:// we fall back to the direct path.
  function prepareMusic() {
    var cfg = CFG.finale.music || {};
    if (!els.music || !cfg.src) return;
    els.music.volume = Math.max(0, Math.min(1, cfg.volume == null ? 0.75 : cfg.volume));
    var direct = function () { els.music.src = cfg.src; els.music.load(); };
    if (window.fetch && window.URL && URL.createObjectURL && location.protocol !== "file:") {
      fetch(cfg.src).then(function (res) {
        if (!res.ok) throw new Error("audio fetch failed");
        return res.blob();
      }).then(function (blob) {
        els.music.src = URL.createObjectURL(blob);
        els.music.load();
      }).catch(direct);
    } else {
      direct();
    }
  }

  function startCreditsMusic() {
    if (state.musicStarted || !state.sound) return;
    state.musicStarted = true;
    clearTimeout(state.musicTimer);
    var cfg = CFG.finale.music || {};
    var audio = els.music;
    if (!audio || !cfg.src) return;

    var play = function () {
      try {
        if (cfg.startSecond) audio.currentTime = cfg.startSecond;
      } catch (e) { /* metadata not ready yet */ }
      var p = audio.play();
      if (p && p.catch) p.catch(function () { /* autoplay may be blocked */ });
    };
    if (audio.readyState >= 1) play();
    else audio.addEventListener("loadedmetadata", play, { once: true });
  }

  function watchFirstPhoto() {
    var first = els.credits.querySelector(".credit-photo");
    if (!first) { startCreditsMusic(); return; }
    (function check() {
      if (first.getBoundingClientRect().top < window.innerHeight - 1) {
        startCreditsMusic(); // the photo is now on screen
        return;
      }
      state.musicTimer = setTimeout(check, 50);
    })();
  }

  function startCredits() {
    if (state.creditsStarted) return;
    state.creditsStarted = true;
    buildCredits();
    els.credits.classList.remove("is-hidden");
    els.messageStage.classList.add("is-hidden");
    els.credits.classList.add("is-active");

    if (reduced) {
      finishCredits(true);
      els.finale.scrollTop = 0;
      return;
    }

    // The whole track — final sentence AND all photos — starts moving together.
    // setTimeout (not rAF) so this still runs if the tab is in the background.
    setTimeout(function () {
      els.credits.classList.add("is-rolling");
      watchFirstPhoto();
    }, 30);
    els.credits.addEventListener("animationend", function (e) {
      if (e.target === els.credits) finishCredits();
    });
  }

  function finishCredits(reducedMode) {
    if (state.creditsDone) return;
    state.creditsDone = true;
    if (!reducedMode) {
      els.credits.classList.remove("is-rolling");
      els.credits.style.transform = "translateY(calc(-100% + 12vh))";
    }
    startCreditsMusic(); // covers skip / reduced-motion as well
    els.finaleEnd.classList.remove("is-hidden");
    els.skip.classList.add("is-hidden");
  }

  els.skip.addEventListener("click", function () {
    if (!state.creditsStarted) startCredits();
    else finishCredits(reduced);
  });

  /* ============================== CHROME ============================= */
  function updateSoundChip() {
    var chip = $("sound-toggle");
    chip.textContent = state.sound ? "HANG: BE" : "HANG: KI";
    chip.setAttribute("aria-pressed", String(state.sound));
  }

  $("sound-toggle").addEventListener("click", function () {
    state.sound = !state.sound;
    writeStore(STORE.sound, state.sound);
    updateSoundChip();
    if (state.sound) sfxOpen();
    else if (els.music) els.music.pause();
  });

  var resetArmed = false;
  var resetTimer = null;
  function disarmReset() {
    resetArmed = false;
    $("reset-btn").textContent = "ÚJRAJÁTSZÁS";
    $("reset-btn").classList.remove("is-confirm");
  }
  $("reset-btn").addEventListener("click", function () {
    if (!resetArmed) {
      resetArmed = true;
      this.textContent = "BIZTOS?";
      this.classList.add("is-confirm");
      clearTimeout(resetTimer);
      resetTimer = setTimeout(disarmReset, 3500);
      return;
    }
    restart();
  });

  $("finale-restart").addEventListener("click", restart);
  function restart() {
    try { window.localStorage.removeItem(STORE.unlocked); } catch (e) {}
    window.location.reload();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!els.modal.classList.contains("is-hidden")) closeChallenge();
      else if (!els.reveal.classList.contains("is-hidden") && !CFG.gifts[state.current || 0].leadsToFinale) closeReveal();
      return;
    }
    if (e.key === "Tab") {
      var active = !els.modal.classList.contains("is-hidden") ? els.modal :
                   !els.reveal.classList.contains("is-hidden") ? els.reveal : null;
      if (!active) return;
      var items = active.querySelectorAll('button:not([disabled]), input, a[href]');
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* =============================== BOOT ============================== */
  $("header-eyebrow").textContent = CFG.header.eyebrow;
  $("header-title").innerHTML = CFG.header.title.map(function (line) {
    return "<span>" + escapeHtml(line) + "</span>";
  }).join("");
  $("header-subtitle").textContent = CFG.header.subtitle;
  $("footer-hint").textContent = CFG.header.footerHint;
  prepareMusic();
  updateSoundChip();
  runLoader();
})();
