# lori-portfolio-chat-webflow.js

<!-- Paste this single block into a Webflow Embed element (once per page). -->
<script>
(function(){
  // ===== Utilities =====
  const norm=(s)=>s.toLowerCase().replace(/[^a-z0-9\s]/g,"").trim();
  function scoreMatch(q,t){if(!q)return 0;const a=norm(q),b=norm(t);if(a===b)return 3; if(b.startsWith(a))return 2; if(b.includes(a))return 1; return 0;}
  function el(tag,attrs={},children=[]){const n=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==="style"&&typeof v==="object")Object.assign(n.style,v);else if(k.startsWith("on")&&typeof v==="function")n.addEventListener(k.slice(2),v);else if(v!==undefined&&v!==null)n.setAttribute(k,String(v));}for(const c of[].concat(children))n.append(c&&c.nodeType?c:document.createTextNode(String(c)));return n}
  function lighten(hex,amt){try{const c=hex.replace('#','');const num=parseInt(c.length===3?c.replace(/(.)/g,'$1$1'):c,16);const r=Math.min(255,((num>>16)&255)+amt);const g=Math.min(255,((num>>8)&255)+amt);const b=Math.min(255,(num&255)+amt);return`rgb(${r}, ${g}, ${b})`}catch{return hex}}

  // ===== Widget constructor =====
  function Widget(cfg){
    const {
      mount='body',
      brand='#2563eb',
      title='What can I help you with?',
      contactEmail='hello@example.com',
      suggestions=['About me','Projects','Skills','Resume','Contact'],
      faqs=[
        {question:'About me',answer:"Hi! I'm <your name>, a <your role>."},
        {question:'Projects',answer:'Realtime dashboard, visual diff tool, ML-aided search.'},
        {question:'Skills',answer:'TypeScript, React/Next.js, Node, Python, Postgres, AWS.'},
        {question:'Resume',answer:'Ask me for a link or grab it from the top nav.'},
        {question:'Contact',answer:'Email me at hello@example.com — I reply within 24h.'},
      ],
      storageKey='portfolio-chat:webflow'
    } = cfg || {};

    // Colors
    const brand100=lighten(brand,180), brand200=lighten(brand,160), brand300=lighten(brand,120), brand600=brand;

    // Shadow DOM root
    const host=el('div');
    const shadow=host.attachShadow({mode:'open'});

    // Styles (scoped)
    const css=el('style');
    css.textContent=`
      :host { all: initial; }
      *, *::before, *::after { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
      .launcher { position: fixed; bottom: 24px; right: 24px; width: 64px; height: 64px; border-radius: 999px; display:flex; align-items:center; justify-content:center; color:#fff; box-shadow:0 10px 20px rgba(0,0,0,.15); cursor:pointer; border:0; z-index: 999999; }
      .launcher:focus-visible { outline: 3px solid var(--brand-300); outline-offset: 2px; }
      .panel { position: fixed; bottom: 108px; right: 24px; width: 340px; max-width: calc(100vw - 32px); height: 520px; display:none; flex-direction:column; background:#fff; color:#111; border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,.2); border:1px solid #eee; overflow:hidden; z-index: 999999; }
      .panel.open { display:flex; }
      .header { padding:12px 16px; color:#fff; font-weight:600; font-size:14px; }
      .log { flex:1; padding:16px; overflow-y:auto; display:flex; flex-direction:column; gap:12px; }
      .bubble { display:inline-block; max-width:75%; padding:8px 10px; border-radius:16px; white-space:pre-wrap; font-size:13px; color:#111; }
      .row { display:flex; }
      .row.user { justify-content:flex-end; }
      .row.assistant, .row.system { justify-content:flex-start; }
      .bubble.user { background: var(--brand-100); }
      .bubble.assistant, .bubble.system { background: var(--brand-200); }
      .suggestions { margin-top: 6px; display:flex; flex-direction:column; gap:8px; align-items:flex-end; }
      .sugg { background:#fff; border:1px solid #e5e7eb; border-radius:999px; padding:8px 12px; font-size:13px; color:#111; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,.04); }
      .sugg:hover { box-shadow:0 2px 6px rgba(0,0,0,.08); }
      .input { padding:10px 12px; border-top:1px solid #eee; }
      .inputRow { display:flex; gap:8px; }
      .text { flex:1; border:1px solid #d1d5db; border-radius:8px; padding:10px 12px; font-size:14px; }
      .send { border-radius:8px; padding:10px 12px; border:0; color:#fff; cursor:pointer; }
      .footer { text-align:center; padding:10px; font-size:12px; color:#6b7280; border-top:1px solid #eee; }
      .footer a { color: var(--brand-600); }
    `;

    // CSS vars for brand
    const vars=el('style');
    vars.textContent=`:host{ --brand-100:${brand100}; --brand-200:${brand200}; --brand-300:${brand300}; --brand-600:${brand600}; }`;

    // Launcher (inline SVG icon)
    const launcher=el('button',{class:'launcher',title:'Open chat','aria-label':'Open chat'});
    launcher.style.background=brand600;
    launcher.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 8h10M7 12h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M21 12a8.996 8.996 0 0 1-13.18 7.79L3 21l1.21-4.82A9 9 0 1 1 21 12Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity=".08"/></svg>';

    // Panel
    const panel=el('div',{class:'panel',role:'dialog','aria-label':'Portfolio chat widget','aria-live':'polite'});
    const header=el('div',{class:'header'},'Chat with me'); header.style.background=brand600;
    const log=el('div',{class:'log',role:'log'});
    const inputWrap=el('div',{class:'input'});
    const inputRow=el('div',{class:'inputRow'});
    const input=el('input',{class:'text',type:'text',placeholder:'Ask about projects, skills, resume…',id:'pcw-input'});
    const send=el('button',{class:'send'},'Send'); send.style.background=brand600;
    inputRow.append(input,send); inputWrap.append(inputRow);
    const footer=el('div',{class:'footer'});
    footer.innerHTML='Still have questions? <a href="#" data-mailto>Email me</a>';

    panel.append(header,log,inputWrap,footer);
    shadow.append(vars,css,launcher,panel);

    // Mount
    const mountEl=typeof mount==='string'?document.querySelector(mount):mount; (mountEl||document.body).appendChild(host);

    // State
    let messages=[{role:'system',content:title}];
    try{const saved=localStorage.getItem(storageKey); if(saved) messages=JSON.parse(saved);}catch{}

    // Render helpers
    function appendMessage(role,content,showSuggestions){
      const row=el('div',{class:`row ${role}`});
      const bubble=el('div',{class:`bubble ${role}`});
      bubble.textContent=content; row.append(bubble); log.append(row);
      if(showSuggestions){
        const box=el('div',{class:'suggestions'});
        for(const s of suggestions||[]){
          const b=el('button',{class:'sugg',title:`Ask: ${s}`},s);
          b.addEventListener('click',()=>handleUserInput(s));
          box.append(b);
        }
        log.append(box);
      }
      log.scrollTo({top:log.scrollHeight,behavior:'smooth'});
    }
    function persist(){try{localStorage.setItem(storageKey,JSON.stringify(messages));}catch{}}
    function getBestAnswer(q){let best=null; for(const qa of (faqs||[])){const s=scoreMatch(q,qa.question); if(s>0&&(!best||s>best.s||(s===best.s&&qa.question.length>best.qa.question.length))) best={qa,s};} return best&&best.qa.answer}

    function handleUserInput(text){
      const content=String(text||'').trim(); if(!content) return;
      messages.push({role:'user',content});
      let reply=getBestAnswer(content)|| (faqs&&faqs.length?`I couldn't find an exact match. Try one of the suggestions below, or ask about: ${faqs.slice(0,3).map(x=>x.question).join(', ')}.`:`I couldn't find that. Try rephrasing or add more detail.`);
      const qn=norm(content); if(qn.includes('email')||qn.includes('contact')) reply+=`\n\nYou can email me at ${contactEmail}.`;
      messages.push({role:'assistant',content:reply}); messages.push({role:'system',content:'Anything else I can help with?'});
      persist(); renderAll();
    }

    function renderAll(){
      log.innerHTML='';
      messages.forEach((m,i)=>{ appendMessage(m.role,m.content,(i===0||(m.role==='system'&&i!==0))); });
      const mail=footer.querySelector('[data-mailto]'); if(mail) { mail.setAttribute('href',`mailto:${contactEmail}`); }
    }

    // Interactions
    launcher.addEventListener('click',()=>{ const isOpen=panel.classList.toggle('open'); launcher.setAttribute('aria-expanded',String(isOpen)); if(isOpen) setTimeout(()=>input.focus(),0); });
    send.addEventListener('click',()=>{ handleUserInput(input.value); input.value=''; input.focus(); });
    input.addEventListener('keydown',(e)=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send.click(); }});

    // Initial render
    renderAll();

    // Public API
    this.open=()=>{ panel.classList.add('open'); input.focus(); };
    this.close=()=>{ panel.classList.remove('open'); };
    this.reset=()=>{ messages=[{role:'system',content:title}]; persist(); renderAll(); };
  }

  // Expose + init helper
  window.PortfolioChatWidget={ init:(config)=>new Widget(config) };

  // ===== EDIT BELOW WITH YOUR CONTENT (optional quick start) =====
  // If you want, set your config here and you won't need a second <script> tag.
  window.PortfolioChatWidget.init({
    brand:'#2563eb',
    title:'What can I help you with?',
    contactEmail:'you@domain.com',
    suggestions:['About me','Projects','Skills','Resume','Contact'],
    faqs:[
      {question:'About me',answer:"I'm a full‑stack engineer focused on Next.js + Node."},
      {question:'Projects',answer:'Realtime dashboard, visual diff tool, ML‑aided search.'},
      {question:'Skills',answer:'TypeScript, React/Next.js, Node, Python, Postgres, AWS.'},
      {question:'Resume',answer:'Ask me for a link or grab it from the top nav.'},
      {question:'Contact',answer:'Email me at you@domain.com — I reply within 24h.'},
    ]
  });
})();
</script>
