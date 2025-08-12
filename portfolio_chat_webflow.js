/* portfolio_chat_webflow.js — Single-file, self-initializing, CSP-safe
   How to use in Webflow (Project Settings → Custom Code → Footer Code):
   <script
     src="https://raw.githubusercontent.com/USERNAME/REPO/main/portfolio_chat_webflow.js?v=1"
     crossorigin="anonymous"
     data-brand="#2563eb"
     data-title="What can I help you with?"
     data-email="you@domain.com"
     data-suggestions='["About me","Projects","Skills","Resume","Contact"]'
     data-faqs='[
       {"question":"About me","answer":"I’m a full-stack engineer focused on Next.js + Node."},
       {"question":"Projects","answer":"Realtime dashboard, visual diff tool, ML-aided search."},
       {"question":"Skills","answer":"TypeScript, React/Next.js, Node, Python, Postgres, AWS."},
       {"question":"Resume","answer":"Ask me for a link or grab it from the top nav."},
       {"question":"Contact","answer":"Email me at you@domain.com — I reply within 24h."}
     ]'
   ></script>
*/
(function () {
  // ===== Guard: do nothing if already loaded =====
  if (window.__PCW_LOADED__) return;
  window.__PCW_LOADED__ = true;

  // ===== Helpers =====
  function norm(s){ return String(s||"").toLowerCase().replace(/[^a-z0-9\s]/g,"").trim(); }
  function scoreMatch(q,t){
    if(!q) return 0;
    var a=norm(q), b=norm(t);
    if(a===b) return 3; if(b.indexOf(a)===0) return 2; if(b.indexOf(a)>-1) return 1; return 0;
  }
  function el(tag, attrs, children){
    var n=document.createElement(tag);
    attrs = attrs || {};
    for (var k in attrs) {
      var v=attrs[k];
      if (k==="style" && v && typeof v==="object") Object.assign(n.style, v);
      else if (k.slice(0,2)==="on" && typeof v==="function") n.addEventListener(k.slice(2), v);
      else if (v!==undefined && v!==null) n.setAttribute(k, String(v));
    }
    if (children) {
      var arr = Array.isArray(children)? children : [children];
      arr.forEach(function(c){
        n.appendChild(c && c.nodeType ? c : document.createTextNode(String(c)));
      });
    }
    return n;
  }
  function lighten(hex, amt){
    try {
      var c = String(hex).replace('#','');
      var num = parseInt(c.length===3 ? c.replace(/(.)/g,'$1$1') : c, 16);
      var r = Math.min(255, ((num>>16)&255) + amt);
      var g = Math.min(255, ((num>>8)&255) + amt);
      var b = Math.min(255, (num&255) + amt);
      return 'rgb('+r+', '+g+', '+b+')';
    } catch(e){ return hex; }
  }
  function getCurrentScript(){
    // Prefer currentScript; fallback to last matching <script src> tag
    var s = document.currentScript;
    if (s) return s;
    var list = document.getElementsByTagName('script');
    for (var i=list.length-1;i>=0;i--){
      var src = list[i].getAttribute('src')||'';
      if (src.indexOf('portfolio_chat_webflow.js')>-1) return list[i];
    }
    return null;
  }

  // ===== Read config from <script ... data-*> =====
  var scriptEl = getCurrentScript() || {};
  var ds = scriptEl.dataset || {};
  var BRAND = ds.brand || '#2563eb';
  var TITLE = ds.title || 'What can I help you with?';
  var EMAIL = ds.email || 'hello@example.com';

  function parseJSONAttr(key, fallback){
    try {
      var raw = ds[key];
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e){
      return fallback;
    }
  }

  var SUGGESTIONS = parseJSONAttr('suggestions', ["About me","Projects","Skills","Resume","Contact"]);
  var FAQS = parseJSONAttr('faqs', [
    { question: "About me",  answer: "Hi! I’m a developer who loves building thoughtful UIs and robust backends." },
    { question: "Projects",  answer: "Highlights: realtime dashboard, visual diff tool, ML-aided search." },
    { question: "Skills",    answer: "TypeScript, React/Next.js, Node, Python, Postgres, AWS, Playwright, Docker." },
    { question: "Resume",    answer: "Ask me here for a link, or find it in the navigation." },
    { question: "Contact",   answer: "Best way is email — I usually reply within 24 hours." }
  ]);

  // ===== Colors =====
  var BRAND_100 = lighten(BRAND, 180);
  var BRAND_200 = lighten(BRAND, 160);
  var BRAND_300 = lighten(BRAND, 120);
  var BRAND_600 = BRAND;

  // ===== Shadow DOM host =====
  var host = el('div');
  var shadow = host.attachShadow({ mode:'open' });

  // ===== Styles (scoped) =====
  var styles = el('style', {}, [
    ':host{all:initial;}',
    '*,*::before,*::after{box-sizing:border-box;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;}',
    '.launcher{position:fixed;bottom:24px;right:24px;width:64px;height:64px;border-radius:999px;display:flex;align-items:center;justify-content:center;color:#fff;background:'+BRAND_600+';box-shadow:0 10px 20px rgba(0,0,0,.15);cursor:pointer;border:0;z-index:9999999;}',
    '.launcher:focus-visible{outline:3px solid '+BRAND_300+';outline-offset:2px;}',
    '.panel{position:fixed;bottom:108px;right:24px;width:340px;max-width:calc(100vw - 32px);height:520px;display:none;flex-direction:column;background:#fff;color:#111;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.2);border:1px solid #eee;overflow:hidden;z-index:9999999;}',
    '.panel.open{display:flex;}',
    '.header{padding:12px 16px;color:#fff;font-weight:600;font-size:14px;background:'+BRAND_600+';}',
    '.log{flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}',
    '.bubble{display:inline-block;max-width:75%;padding:8px 10px;border-radius:16px;white-space:pre-wrap;font-size:13px;color:#111;}',
    '.row{display:flex;}',
    '.row.user{justify-content:flex-end;}',
    '.row.assistant,.row.system{justify-content:flex-start;}',
    '.bubble.user{background:'+BRAND_100+';}',
    '.bubble.assistant,.bubble.system{background:'+BRAND_200+';}',
    '.suggestions{margin-top:6px;display:flex;flex-direction:column;gap:8px;align-items:flex-end;}',
    '.sugg{background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:8px 12px;font-size:13px;color:#111;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.04);}',
    '.sugg:hover{box-shadow:0 2px 6px rgba(0,0,0,.08);}',
    '.input{padding:10px 12px;border-top:1px solid #eee;}',
    '.inputRow{display:flex;gap:8px;}',
    '.text{flex:1;border:1px solid #d1d5db;border-radius:8px;padding:10px 12px;font-size:14px;}',
    '.send{border-radius:8px;padding:10px 12px;border:0;color:#fff;background:'+BRAND_600+';cursor:pointer;}',
    '.footer{text-align:center;padding:10px;font-size:12px;color:#6b7280;border-top:1px solid #eee;}',
    '.footer a{color:'+BRAND_600+';text-decoration:underline;}'
  ].join('\n'));

  // ===== Elements =====
  var launcher = el('button', { class:'launcher', title:'Open chat', 'aria-label':'Open chat' });
  launcher.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 8h10M7 12h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M21 12a8.996 8.996 0 0 1-13.18 7.79L3 21l1.21-4.82A9 9 0 1 1 21 12Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".08"/></svg>';

  var panel  = el('div', { class:'panel', role:'dialog', 'aria-label':'Portfolio chat widget', 'aria-live':'polite' });
  var header = el('div', { class:'header' }, 'Chat with me');
  var log    = el('div', { class:'log', role:'log' });
  var inputWrap = el('div', { class:'input' });
  var inputRow  = el('div', { class:'inputRow' });
  var input = el('input', { class:'text', type:'text', placeholder:'Ask about projects, skills, resume…', id:'pcw-input' });
  var send  = el('button', { class:'send' }, 'Send');
  var footer = el('div', { class:'footer' });
  footer.innerHTML = 'Still have questions? <a href="mailto:'+EMAIL+'">Email me</a>';

  inputRow.appendChild(input);
  inputRow.appendChild(send);
  inputWrap.appendChild(inputRow);

  panel.appendChild(header);
  panel.appendChild(log);
  panel.appendChild(inputWrap);
  panel.appendChild(footer);

  shadow.appendChild(styles);
  shadow.appendChild(launcher);
  shadow.appendChild(panel);

  // Mount host into page
  (document.body || document.documentElement).appendChild(host);

  // ===== State =====
  var messages = [{ role:'system', content: TITLE }];

  function appendMessage(role, content, showSuggestions){
    var row = el('div', { class:'row '+role });
    var bubble = el('div', { class:'bubble '+role });
    bubble.textContent = content;
    row.appendChild(bubble);
    log.appendChild(row);

    if (showSuggestions) {
      var box = el('div', { class:'suggestions' });
      (SUGGESTIONS||[]).forEach(function(s){
        var b = el('button', { class:'sugg', title:'Ask: '+s }, s);
        b.addEventListener('click', function(){ handleUserInput(s); });
        box.appendChild(b);
      });
      log.appendChild(box);
    }
    log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
  }

  function getBestAnswer(q){
    var best = null;
    (FAQS||[]).forEach(function(qa){
      var s = scoreMatch(q, qa.question);
      if (s>0 && (!best || s>best.s || (s===best.s && qa.question.length > best.qa.question.length))){
        best = { qa: qa, s: s };
      }
    });
    return best ? best.qa.answer : null;
  }

  function handleUserInput(text){
    var content = String(text||'').trim();
    if (!content) return;
    messages.push({ role:'user', content: content });

    var reply = getBestAnswer(content);
    if (!reply) {
      var top = (FAQS||[]).slice(0,3).map(function(x){ return x.question; }).join(', ');
      reply = (FAQS && FAQS.length)
        ? "I couldn't find an exact match. Try one of the suggestions below, or ask about: "+ top + "."
        : "I couldn't find that. Try rephrasing or add more detail.";
    }
    var qn = norm(content);
    if (qn.indexOf('email')>-1 || qn.indexOf('contact')>-1) {
      reply += "\n\nYou can email me at " + EMAIL + ".";
    }

    messages.push({ role:'assistant', content: reply });
    messages.push({ role:'system', content: 'Anything else I can help with?' });

    renderAll();
  }

  function renderAll(){
    log.innerHTML = '';
    messages.forEach(function(m, i){
      appendMessage(m.role, m.content, (i===0 || (m.role==='system' && i!==0)));
    });
  }

  // ===== Interactions =====
  launcher.addEventListener('click', function(){
    var open = panel.classList.toggle('open');
    launcher.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(function(){ input.focus(); }, 0);
  });

  send.addEventListener('click', function(){
    handleUserInput(input.value);
    input.value = '';
    input.focus();
  });

  input.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      send.click();
    }
  });

  // ===== Initial render =====
  renderAll();

  // ===== Expose minimal API (optional) =====
  window.PortfolioChatWidget = {
    open: function(){ panel.classList.add('open'); try{ input.focus(); }catch(e){} },
    close: function(){ panel.classList.remove('open'); },
    reset: function(){ messages=[{role:'system',content:TITLE}]; renderAll(); }
  };
})();
