/* RHDP17 — Read Aloud. Add <script src="./readaloud.js" defer></script> to any page
   and it gets a floating "🔊 Read aloud" button that speaks the page's content.
   It tries the natural OpenAI voice (Supabase `tts` function) first; if that fails
   for any reason it falls back to the browser's built-in voice so it always works.
   It reads #readaloud-target if present, else #out / #reply, else the main content. */
(function () {
  if (window.__readaloud) return; window.__readaloud = 1;

  var SUPA = "https://qrwlyowdzqzkibdzvoek.supabase.co";
  var ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyd2x5b3dkenF6a2liZHp2b2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDIyODEsImV4cCI6MjA4NTgxODI4MX0.5xurzQ0HUECk4_SxlcRdKG-5KCmyQ30b4jyCiyERAoU";
  var VOICE = "nova";           // natural OpenAI voice
  var MAX_TOTAL = 8000;         // hard cap on chars we'll read
  var CHUNK = 1400;             // tts function caps input ~1500; stay under it

  function makeBtn() {
    if (document.getElementById('__ra_btn')) return;
    var btn = document.createElement('button');
    btn.id = '__ra_btn';
    btn.textContent = '🔊 Read aloud';
    btn.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483000;background:#C8962E;color:#0d0d0d;border:none;border-radius:26px;padding:13px 22px;font:800 15px system-ui,Segoe UI,Arial;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.45)';

    var speaking = false;
    var audio = null;      // current <audio> element (natural voice)
    var stopped = false;

    function target() {
      var t = document.getElementById('readaloud-target') || document.getElementById('out') || document.getElementById('reply');
      if (t && t.innerText && t.innerText.trim()) return t.innerText.trim();
      var m = document.querySelector('main, .wrap, .card, article') || document.body;
      return (m.innerText || '').trim();
    }

    // split text into <=CHUNK pieces at sentence / space boundaries
    function chunks(txt) {
      txt = txt.slice(0, MAX_TOTAL);
      var out = [], i = 0;
      while (i < txt.length) {
        var end = Math.min(i + CHUNK, txt.length);
        if (end < txt.length) {
          var slice = txt.slice(i, end);
          var cut = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('\n'), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
          if (cut > CHUNK * 0.5) end = i + cut + 1;
        }
        out.push(txt.slice(i, end).trim());
        i = end;
      }
      return out.filter(Boolean);
    }

    function reset() { speaking = false; stopped = true; btn.textContent = '🔊 Read aloud'; }

    function stop() {
      stopped = true;
      try { if (audio) { audio.pause(); audio.src = ''; audio = null; } } catch (e) {}
      try { speechSynthesis.cancel(); } catch (e) {}
      reset();
    }

    // Fallback: browser voice for the whole text
    function browserVoice(txt) {
      try {
        var u = new SpeechSynthesisUtterance(txt.slice(0, MAX_TOTAL));
        u.rate = 1.0; u.onend = reset; u.onerror = reset;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
        speaking = true; btn.textContent = '⏹ Stop';
      } catch (e) { reset(); }
    }

    // Natural voice: fetch each chunk from the tts function and play in order
    async function naturalVoice(parts) {
      for (var k = 0; k < parts.length; k++) {
        if (stopped) return;
        var res;
        try {
          res = await fetch(SUPA + "/functions/v1/tts", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': ANON, 'Authorization': 'Bearer ' + ANON },
            body: JSON.stringify({ text: parts[k], voice: VOICE })
          });
        } catch (e) { res = null; }
        if (stopped) return;
        if (!res || !res.ok) {
          // network / function failed → finish the rest with the browser voice
          if (k === 0) { browserVoice(parts.join(' ')); return; }
          browserVoice(parts.slice(k).join(' ')); return;
        }
        var blob = await res.blob();
        if (stopped) return;
        await new Promise(function (resolve) {
          audio = new Audio(URL.createObjectURL(blob));
          audio.onended = resolve; audio.onerror = resolve;
          audio.play().catch(function () { resolve(); });
        });
      }
      if (!stopped) reset();
    }

    btn.onclick = function () {
      if (speaking) { stop(); return; }
      var txt = target(); if (!txt) return;
      stopped = false; speaking = true; btn.textContent = '⏹ Stop';
      naturalVoice(chunks(txt));
    };

    window.addEventListener('beforeunload', stop);
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', makeBtn); else makeBtn();
})();
