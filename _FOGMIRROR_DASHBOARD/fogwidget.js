/* Fog Mirror floating assistant — persistent on every page, screen-aware */
(function(){
  if(window.__fogw) return; window.__fogw=1;
  var SUPA="https://qrwlyowdzqzkibdzvoek.supabase.co";
  var ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyd2x5b3dkenF6a2liZHp2b2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDIyODEsImV4cCI6MjA4NTgxODI4MX0.5xurzQ0HUECk4_SxlcRdKG-5KCmyQ30b4jyCiyERAoU";
  var sb=null, token=null, busy=false, rec=null, speakOn=true;
  var esc=function(s){return (s==null?'':String(s)).replace(/[&<>]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':'&gt;';});};

  var css=''
   +'#fogb{position:fixed;right:18px;bottom:18px;width:60px;height:60px;border-radius:50%;cursor:pointer;z-index:2147483000;'
   +'background:conic-gradient(from 200deg,#f5b301,#ff7a4d,#ff6aa6,#9b8cff,#3fd8ff,#f5b301);display:flex;align-items:center;justify-content:center;'
   +'box-shadow:0 8px 28px rgba(0,0,0,.45);border:2px solid rgba(255,255,255,.6);transition:.18s}'
   +'#fogb:hover{transform:scale(1.07)}#fogb img{width:34px;height:34px;filter:invert(1)}'
   +'#fogp{position:fixed;right:18px;bottom:88px;width:340px;max-width:92vw;height:460px;max-height:72vh;z-index:2147483000;display:none;flex-direction:column;'
   +'background:#0c1322;border:1px solid rgba(255,255,255,.18);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.6);font-family:system-ui,Segoe UI,Arial,sans-serif;overflow:hidden}'
   +'#fogp.on{display:flex}'
   +'.fwh{display:flex;align-items:center;gap:9px;padding:12px 14px;background:#0a1018;border-bottom:1px solid rgba(255,255,255,.1)}'
   +'.fwh b{color:#f4f8ff;font-size:14px}.fwh span{color:#8aa0c8;font-size:11px;display:block}'
   +'.fwh .x{margin-left:auto;color:#9fb0d0;cursor:pointer;font-size:16px;background:none;border:none}'
   +'.fwbody{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px}'
   +'.fw-you{align-self:flex-end;background:#2a3550;color:#fff;border-radius:12px 12px 3px 12px;padding:8px 11px;font-size:13px;max-width:85%}'
   +'.fw-bot{align-self:flex-start;background:rgba(255,255,255,.06);color:#eaf1ff;border-radius:12px 12px 12px 3px;padding:8px 11px;font-size:13px;max-width:90%;white-space:pre-wrap}'
   +'.fwfoot{display:flex;gap:7px;padding:10px;border-top:1px solid rgba(255,255,255,.1);background:#0a1018}'
   +'.fwfoot input{flex:1;background:#0c1322;border:1px solid rgba(255,255,255,.2);border-radius:10px;color:#fff;font-size:13px;padding:9px 11px;outline:none;font-family:inherit}'
   +'.fwfoot button{border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:13px;padding:0 12px}'
   +'.fwsend{background:linear-gradient(135deg,#3fd8ff,#2fe0a6);color:#06121a}.fwmic{background:#1c1f26;color:#fff;width:40px}'
   +'.fwmic.live{background:#c0392b}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  var logo = (location.pathname.replace(/[^/]*$/,'')||'./')+'icons/logo.svg';
  var root=document.createElement('div');
  root.innerHTML=''
   +'<div id="fogb" title="Talk to Fog Mirror"><img src="'+logo+'" alt="Fog Mirror" onerror="this.style.display=\'none\'"></div>'
   +'<div id="fogp"><div class="fwh"><div><b>Fog Mirror</b><span id="fwctx"></span></div><button class="x" id="fwx">✕</button></div>'
   +'<div class="fwbody" id="fwbody"><div class="fw-bot">Hi — I’m on this page with you. Ask me anything: a customer’s status, a city rule, who owes money. Type or tap the mic.</div></div>'
   +'<div class="fwfoot"><button class="fwmic" id="fwmic" title="Talk">🎤</button><input id="fwin" placeholder="Type your question…"><button class="fwsend" id="fwsend">Send</button></div></div>';
  document.body.appendChild(root);

  var bubble=document.getElementById('fogb'), panel=document.getElementById('fogp'), body=document.getElementById('fwbody'),
      input=document.getElementById('fwin'), micBtn=document.getElementById('fwmic');
  document.getElementById('fwctx').textContent='aware of: '+document.title.slice(0,30);

  function ensureSb(cb){
    if(sb){cb();return;}
    function mk(){ try{ sb=window.supabase.createClient(SUPA,ANON); sb.auth.getSession().then(function(r){ token=(r&&r.data&&r.data.session)?r.data.session.access_token:null; cb(); }); }catch(e){ cb(); } }
    if(window.supabase){mk();} else { var s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'; s.onload=mk; s.onerror=cb; document.head.appendChild(s); }
  }
  function ctx(){ return '[Context: the user is on the "'+document.title+'" page ('+location.pathname+').] '; }
  function add(cls,txt){ var d=document.createElement('div'); d.className=cls; d.textContent=txt; body.appendChild(d); body.scrollTop=body.scrollHeight; return d; }
  function speak(t){ try{ fetch(SUPA+'/functions/v1/elevenlabs-tts',{method:'POST',headers:{'Content-Type':'application/json','apikey':ANON,'Authorization':'Bearer '+(token||ANON)},body:JSON.stringify({text:t.slice(0,600),bot:'Fog Mirror'})}).then(function(r){return r.ok?r.blob():null;}).then(function(b){ if(b) new Audio(URL.createObjectURL(b)).play(); }); }catch(e){} }
  function send(msg){
    msg=(msg||'').trim(); if(!msg||busy)return; busy=true; input.value='';
    add('fw-you',msg); var a=add('fw-bot','…');
    ensureSb(function(){
      if(!token){ a.textContent='Please sign in on the dashboard first, then I can answer.'; busy=false; return; }
      fetch(SUPA+'/functions/v1/coco-router',{method:'POST',headers:{'Content-Type':'application/json','apikey':ANON,'Authorization':'Bearer '+token,'x-execution-depth':'0'},body:JSON.stringify({message:ctx()+msg,channel:'fog-widget'})})
      .then(function(r){return r.json().catch(function(){return{};});})
      .then(function(d){ var t=d.response||d.error||'(no reply)'; a.textContent=t; if(speakOn) speak(t); busy=false; body.scrollTop=body.scrollHeight; })
      .catch(function(){ a.textContent='Could not reach the brain — try again.'; busy=false; });
    });
  }
  function openP(){ panel.classList.add('on'); ensureSb(function(){}); setTimeout(function(){input.focus();},100); }
  function closeP(){ panel.classList.remove('on'); }
  window.fogOpen=openP;

  bubble.onclick=function(){ panel.classList.contains('on')?closeP():openP(); };
  document.getElementById('fwx').onclick=closeP;
  document.getElementById('fwsend').onclick=function(){ send(input.value); };
  input.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); send(input.value); } });

  // talk (one-shot)
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  micBtn.onclick=function(){
    if(!SR){ add('fw-bot','Voice needs Google Chrome — you can still type.'); return; }
    if(rec){ try{rec.stop();}catch(e){} rec=null; micBtn.classList.remove('live'); return; }
    rec=new SR(); rec.lang='en-US'; rec.interimResults=false;
    micBtn.classList.add('live');
    rec.onresult=function(e){ var t=e.results[0][0].transcript; send(t); };
    rec.onend=function(){ micBtn.classList.remove('live'); rec=null; };
    rec.onerror=function(ev){ micBtn.classList.remove('live'); rec=null; if(ev.error==='not-allowed') add('fw-bot','Allow the microphone in your browser to talk, or just type.'); };
    try{ rec.start(); }catch(e){}
  };
})();
