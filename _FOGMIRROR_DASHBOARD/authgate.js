/* RHDP17 · Fog Mirror — shared auth gate (v1)
   Include once per internal page, before </body>:  <script src="./authgate.js" defer></script>
   Reuses the existing Supabase Microsoft (azure) sign-in from index.html.
   Idempotent: no-ops on any page that already has its own #gate (e.g. index.html).
   NOTE: a front-end gate is the FIRST layer only. Real security requires the edge
   functions to verify the caller's JWT + allowlist server-side (see LOCKDOWN checklist). */
(function(){
  if(window.__authgate) return; window.__authgate=1;
  if(document.getElementById('gate')) return;               // page self-gates already
  var SUPA="https://qrwlyowdzqzkibdzvoek.supabase.co";
  var ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyd2x5b3dkenF6a2liZHp2b2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDIyODEsImV4cCI6MjA4NTgxODI4MX0.5xurzQ0HUECk4_SxlcRdKG-5KCmyQ30b4jyCiyERAoU";

  function loadSDK(cb){ var s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'; s.onload=cb; s.onerror=cb; document.head.appendChild(s); }

  function injectGate(){
    if(document.getElementById('agate')) return;
    var css=document.createElement('style');
    css.textContent=''
     +'#agate{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;'
     +'background:radial-gradient(900px 600px at 50% 18%,rgba(63,216,255,.12),transparent 60%),'
     +'radial-gradient(800px 600px at 50% 120%,rgba(155,140,255,.12),transparent 60%),#070b14;font-family:system-ui,Segoe UI,Arial,sans-serif}'
     +'#agate .c{text-align:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.24);border-radius:22px;padding:42px 44px;max-width:400px;box-shadow:0 30px 80px rgba(0,0,0,.55)}'
     +'#agate h2{color:#fff;font-size:21px;font-weight:800;margin:6px 0 2px}#agate p{color:#c8d4ee;font-size:13px;margin:0}'
     +'#agate .b{margin-top:20px;display:inline-flex;align-items:center;gap:9px;cursor:pointer;border:none;border-radius:11px;padding:12px 20px;font-size:14px;font-weight:700;color:#06121a;background:linear-gradient(135deg,#3fd8ff,#2fe0a6)}'
     +'#agate .n{color:#8aa0c8;font-size:11.5px;margin-top:16px;line-height:1.5}'
     +'#achip{position:fixed;right:14px;top:12px;z-index:2147483600;display:none;align-items:center;gap:8px;font:600 11.5px system-ui;'
     +'color:#c8d4ee;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:11px;padding:6px 11px}'
     +'#achip .e{color:#fff}#achip .o{cursor:pointer;color:#3fd8ff}';
    document.head.appendChild(css);
    var g=document.createElement('div'); g.id='agate';
    g.innerHTML='<div class="c"><h2>Fog Mirror — Command Center</h2><p>Richard Haro Drafting &amp; Planning, Inc.</p>'
     +'<button class="b" onclick="window.signIn&&window.signIn()">Sign in with Microsoft</button>'
     +'<div class="n">Use your <b>@rhdpinc.com</b> account.<br>Internal dashboard — authorized staff only.</div></div>';
    document.body.appendChild(g);
    var chip=document.createElement('div'); chip.id='achip';
    chip.innerHTML='<span class="e"></span><span class="o" onclick="window.signOut&&window.signOut()">sign out</span>';
    document.body.appendChild(chip);
  }
  function showGate(v){ var g=document.getElementById('agate'); if(g) g.style.display=v?'flex':'none'; }
  function showChip(email){ var c=document.getElementById('achip'); if(c){ c.style.display='flex'; c.querySelector('.e').textContent=email||''; } }

  function boot(){
    if(!(window.supabase&&window.supabase.createClient)){ return loadSDK(boot); }
    var sb=window.__sb||(window.__sb=window.supabase.createClient(SUPA,ANON));
    injectGate();
    window.signIn=function(){ sb.auth.signInWithOAuth({provider:'azure',options:{scopes:'email openid profile',redirectTo:location.origin+location.pathname}}).catch(function(){ alert('Sign-in could not start. Please try again.'); }); };
    window.signOut=function(){ sb.auth.signOut().catch(function(){}).then(function(){ location.replace(location.pathname); }); };
    function apply(session){
      if(!session){ showGate(true); showChip(''); document.getElementById('achip').style.display='none'; return; }
      var email=((session.user&&session.user.email)||'').toLowerCase();
      window.__authToken=session.access_token; window.__authEmail=email;
      showGate(false); showChip(email);
      if(typeof window.onAuthReady==='function'){ try{ window.onAuthReady(session.access_token,email); }catch(e){} }
    }
    sb.auth.onAuthStateChange(function(_e,session){ apply(session); });
    sb.auth.getSession().then(function(res){ apply(res&&res.data&&res.data.session); }).catch(function(){ showGate(true); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
