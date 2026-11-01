(() => {
  'use strict';
  const studio = document.querySelector('#editor .writer-studio');
  const box = document.getElementById('writingBox');
  if (!studio || !box) return;
  const style = document.createElement('style');
  style.textContent = `
  #editor .writer-studio{display:block}#editor .toolbox{display:none}
  .article-journey{max-width:960px;margin:0 auto 32px;color:#0f1a2b}
  .article-journey [hidden]{display:none!important}
  .aj-steps{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;margin:24px 0 30px}
  .aj-step{border:0;background:transparent;color:#55606c;cursor:pointer;min-height:72px;padding:6px 0;font:inherit;font-size:13px;line-height:1.5}
  .aj-step i{display:block;width:22px;height:22px;border:2px solid #c89d5c;border-radius:50%;margin:0 auto 10px;background:#fff}
  .aj-step[aria-current=step]{color:#0f1a2b;font-weight:bold}.aj-step[aria-current=step] i{background:#c89d5c;box-shadow:0 0 0 4px #f2ede4}
  .aj-panel{background:#fff;border:1px solid #dfd5c4;border-radius:8px;padding:32px}
  .aj-panel h3{font-size:26px;margin:0 0 16px;color:#0f1a2b}.aj-panel label{display:block;margin:18px 0 8px;font-weight:bold}
  .aj-panel textarea,.aj-panel input[type=text]{display:block;width:100%;min-width:0;padding:14px;border:1px solid #c9beac;border-radius:6px;background:#fffdfa;color:#0f1a2b;font:inherit;line-height:1.9}
  .aj-panel textarea{min-height:160px;resize:vertical}.aj-panel input[type=checkbox]{width:18px;height:18px;margin-left:10px;accent-color:#0f1a2b}
  .aj-actions{display:flex;justify-content:space-between;gap:12px;margin-top:22px;flex-wrap:wrap}
  .aj-actions button,.aj-command{border:1px solid #c89d5c;border-radius:6px;padding:12px 22px;font:inherit;font-weight:bold;cursor:pointer;background:#0f1a2b;color:white}
  .aj-actions button:disabled{opacity:.4;cursor:default}.aj-actions button:first-child{background:white;color:#0f1a2b}
  .article-journey :focus-visible{outline:3px solid #9c762d;outline-offset:3px}
  .aj-status{min-height:28px;color:#465760;font-size:14px;line-height:1.8;margin:12px 0}
  .article-journey .editor{box-shadow:none;border-radius:6px}.article-journey .editor-tools{flex-wrap:wrap}
  @media(max-width:600px){.aj-panel{padding:18px}.aj-panel h3{font-size:22px}.aj-step{font-size:11px}.aj-steps{gap:3px}.aj-panel .editor-top{flex-wrap:wrap;gap:12px}}
  `;
  document.head.append(style);
  const journey = document.createElement('div');
  journey.className = 'article-journey';
  const labels = ['الفكرة','التخطيط','المقدمة','العرض','الخاتمة','المقال','المراجعة'];
  const titles = ['ما الفكرة التي يستحق أن نكتب عنها؟','رتّبي خيط أفكارك','كيف تستقبلين القارئة؟','طوّري فكرتك وأقنعي القارئة','ما الأثر الذي تريدين تركه؟','مقالك بصوتك','راجعي مقالك قبل الإرسال'];
  const definitions = [
    [['topic','موضوع المقال','مثال: كيف يصنع العلم أثرًا في المجتمع؟'],['message','الفكرة الرئيسة','ما الرأي أو الرسالة التي تريدين توصيلها؟']],
    [['plan','الأفكار والأدلة','رتّبي الأفكار، واكتبي لكل فكرة شاهدًا أو مثالًا مناسبًا.']],
    [['intro','المقدمة','مهّدي للموضوع وحددي فكرته دون استباق التفاصيل.']],
    [['body','العرض والأدلة','فقرة لكل فكرة، مع تفسير ومثال وروابط واضحة.']],
    [['ending','الخاتمة','اجمعي خلاصة فكرتك واتركي أثرًا دون تكرار المقدمة حرفيًا.']]
  ];
  const steps = document.createElement('nav');
  steps.className = 'aj-steps'; steps.setAttribute('aria-label','مراحل كتابة المقال');
  journey.append(steps);
  const panels = [], fields = {};
  let current = 0, uid = '', storageFailed = false;
  const status = document.createElement('p'); status.className = 'aj-status'; status.setAttribute('role','status');
  labels.forEach((label,i) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'aj-step';
    button.innerHTML = '<i aria-hidden="true"></i>'; button.append(document.createTextNode(label));
    button.onclick = () => show(i); steps.append(button);
    const panel = document.createElement('section'); panel.className = 'aj-panel';
    const title = document.createElement('h3'); title.textContent = titles[i]; title.tabIndex = -1; panel.append(title);
    (definitions[i] || []).forEach(([key,label,placeholder]) => {
      const caption = document.createElement('label'); caption.htmlFor = 'aj-'+key; caption.textContent = label;
      const input = document.createElement(key === 'topic' ? 'input' : 'textarea');
      if(key === 'topic') input.type = 'text'; input.id = 'aj-'+key; input.placeholder = placeholder;
      input.addEventListener('input',save); fields[key] = input; panel.append(caption,input);
    });
    panels.push(panel); journey.append(panel);
  });
  studio.before(journey); panels[5].append(studio);
  const assemble = document.createElement('button'); assemble.type = 'button'; assemble.className = 'aj-command';
  assemble.textContent = 'جمع الأجزاء في المحرر'; panels[5].insertBefore(assemble,studio);
  assemble.onclick = () => {
    const parts = ['intro','body','ending'].map(k=>fields[k].value.trim());
    if(parts.some(p=>!p)){status.textContent='أكملي المقدمة والعرض والخاتمة أولًا، أو اكتبي مباشرة في المحرر.';return;}
    if(box.value.trim() && !window.confirm('استبدال النص الموجود في المحرر بالأجزاء الجديدة؟')) return;
    box.value = parts.join('\n\n'); box.dispatchEvent(new Event('input',{bubbles:true}));
    status.textContent='تم جمع الأجزاء. راجعي ترابط الفقرات في المحرر.';
  };
  const checks = ['المقدمة واضحة وتمهّد للموضوع.','لكل فقرة فكرة ودليل أو مثال مناسب.','الأفكار مترابطة وتخدم الموضوع.','الخاتمة تلخص الفكرة وتترك أثرًا.','راجعت الإملاء والترقيم وصحة الشواهد.'];
  checks.forEach((text,i)=>{
    const label = document.createElement('label'), input = document.createElement('input');
    input.type='checkbox'; input.id='aj-check-'+i; fields['check'+i]=input;
    input.onchange=save; label.append(input,document.createTextNode(text)); panels[6].append(label);
  });
  const submit = document.getElementById('submitDraft');
  if(submit) panels[6].append(submit);
  const originalSubmit = submit;
  if(originalSubmit) originalSubmit.addEventListener('click',event=>{
    if(!checks.every((_,i)=>fields['check'+i].checked)){
      event.stopImmediatePropagation(); status.textContent='أكملي بنود المراجعة قبل إرسال المقال.';
    }
  },true);
  const actions = document.createElement('div'); actions.className='aj-actions';
  const prev=document.createElement('button'), next=document.createElement('button');
  prev.type=next.type='button'; prev.textContent='السابق';next.textContent='التالي';
  prev.onclick=()=>show(current-1);next.onclick=()=>show(current+1);
  actions.append(prev,next);journey.append(status,actions);
  function show(n,focus=true){
    current=Math.max(0,Math.min(n,6));panels.forEach((p,i)=>p.hidden=i!==current);
    [...steps.children].forEach((b,i)=>{if(i===current)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    prev.disabled=current===0;next.hidden=current===6;
    if(focus)panels[current].querySelector('h3').focus({preventScroll:true});
  }
  function save(){
    if(!uid){status.textContent='التخطيط مؤقت إلى أن تسجلي الدخول. المقال الكامل يُحفظ من زر حفظ.';return;}
    const data={};Object.entries(fields).forEach(([k,f])=>data[k]=f.type==='checkbox'?f.checked:f.value);
    try{sessionStorage.setItem('simtArticlePlan:'+uid,JSON.stringify(data));storageFailed=false;}
    catch{storageFailed=true;}
    status.textContent=storageFailed?'تعذر حفظ التخطيط في هذه الجلسة.':'حُفظ التخطيط في جلسة المتصفح الحالية.';
  }
  window.addEventListener('simtStudentContext',event=>{
    const nextUid=event.detail?.uid || ''; if(nextUid===uid)return;
    uid=nextUid;let data={};
    try{data=JSON.parse(sessionStorage.getItem('simtArticlePlan:'+uid)||'{}');}catch{}
    Object.entries(fields).forEach(([k,f])=>{if(f.type==='checkbox')f.checked=data[k]===true;else f.value=typeof data[k]==='string'?data[k]:'';});
    status.textContent='';show(0,false);
  });
  show(0,false);
})();
