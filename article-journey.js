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
  .aj-route-hidden{display:none!important}
  body.aj-focused .hero-wrap{min-height:0;padding-bottom:0;background:#fff;border-bottom:1px solid #dfd5c4}
  body.aj-focused .hero-wrap::before,body.aj-focused .hero-wrap::after,body.aj-focused .hero{display:none!important}
  body.aj-focused .hero-wrap nav{margin-bottom:0;padding-top:16px;padding-bottom:16px}
  body.aj-focused .nav-links{flex-wrap:nowrap;overflow:auto;max-width:100%;gap:18px}
  body.aj-focused .nav-links a{white-space:nowrap;font-size:14px}
  body.aj-focused .nav-links a:not([href="#editor"]):not([href="#training"]):not([href="#my-work"]):not([href="#lexicon"]){display:none}
  body.aj-focused .nav-links a[aria-current=page]{border-bottom:2px solid #c89d5c;color:#0f1a2b}
  body.aj-focused main>section{padding-top:32px;min-height:65vh}
  body.aj-focused #editor .section-title h2{font-size:30px}
  body.aj-focused .simt-guide{display:none}
  .aj-start,.aj-utility{max-width:960px;margin:0 auto 24px}
  .aj-start{text-align:center;padding:32px 12px 56px}.aj-start img{width:80px;height:80px;object-fit:contain;margin-bottom:18px}
  .aj-start h3{font-size:26px;color:#0f1a2b;margin-bottom:24px}
  .aj-start-actions{display:flex;justify-content:center;gap:16px;flex-wrap:wrap}
  .aj-start-actions button{padding:16px 24px;border:1px solid #c89d5c;border-radius:6px;font:inherit;font-weight:bold;cursor:pointer;background:#0f1a2b;color:white}
  .aj-start-actions button+button{background:white;color:#0f1a2b}
  .aj-utility{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;font-size:14px}
  .aj-utility[hidden]{display:none}
  .aj-utility button,.aj-utility a{background:transparent;border:0;color:#0f1a2b;text-decoration:underline;cursor:pointer;font:inherit;padding:8px}
  .aj-helper{border:1px solid #d4c5ac;padding:0;border-radius:8px;width:min(1040px,94vw);max-height:88vh;color:#0f1a2b}
  .aj-helper::backdrop{background:rgba(15,26,43,.45)}
  .aj-helper-head{position:sticky;top:0;background:white;z-index:2;padding:16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #dfd5c4}
  .aj-helper-head button{width:40px;height:40px;background:white;border:1px solid #dfd5c4;font-size:26px;cursor:pointer;border-radius:6px}
  .aj-helper-body{padding:22px}.aj-helper-body>section{padding:0}.aj-helper-body .shell{width:100%;max-width:100%}
  .aj-help{margin-top:18px;font-size:14px;color:#55606c;line-height:1.9}.aj-help summary{cursor:pointer;color:#0f1a2b}
  .aj-work{max-width:1100px;margin:auto}.aj-work h2{font-size:30px}.aj-work .student-result-card{margin-top:24px}
  .aj-work a{display:inline-block;margin:12px 0;color:#0f1a2b;text-decoration:underline}
  .article-journey .stats .stat:last-child{display:none}
  @media(max-width:600px){body.aj-focused .hero-wrap nav{display:block}body.aj-focused .nav-links{margin-top:12px}.aj-utility{gap:0}.aj-start-actions{flex-direction:column}.aj-helper-body{padding:14px}.aj-helper .lexicon-grid{display:block}}
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
    if (definitions[i]) {
      const help = document.createElement('details'); help.className='aj-help';
      const summary = document.createElement('summary'); summary.textContent='أحتاج مساعدة';
      const text = document.createElement('p'); text.textContent=definitions[i].map(d=>d[2]).join(' ');
      help.append(summary,text);panel.append(help);
      panel.querySelectorAll('input,textarea').forEach(input=>input.placeholder='');
    }
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
  const editorSection = document.getElementById('editor');
  const start = document.createElement('div'); start.className='aj-start';
  start.innerHTML='<img src="logo-simt.png" alt="سِمْط"><h3>ماذا تودّين أن تكتبي اليوم؟</h3><div class="aj-start-actions"><button type="button" id="aj-new">ابدئي مقالًا جديدًا</button><button type="button" id="aj-resume">كمّلي مقالك</button></div><p class="aj-status" role="status"></p>';
  journey.before(start);
  const utility = document.createElement('div'); utility.className='aj-utility';
  utility.innerHTML='<button type="button" id="aj-home">بداية الرحلة</button><div><button type="button" id="aj-dictionary">المعجم</button><button type="button" id="aj-ideas">أحتاج فكرة</button><a href="#training">أتدرّب</a><a href="#my-work">أعمالي</a><a href="#">حسابي</a></div>';
  start.before(utility);
  function enter(n){start.hidden=true;journey.hidden=false;utility.hidden=false;show(n);}
  function welcome(){start.hidden=false;journey.hidden=true;utility.hidden=true;}
  utility.querySelector('#aj-home').onclick=welcome;
  start.querySelector('#aj-new').onclick=()=>{
    const hasPlan=Object.values(fields).some(f=>f.type!=='checkbox'&&f.value.trim());
    if(hasPlan&&!confirm('بدء تخطيط جديد؟ سيُستبدل التخطيط الحالي، ولن تُحذف مسودة المقال الكامل.'))return;
    Object.values(fields).forEach(f=>{if(f.type==='checkbox')f.checked=false;else f.value='';});
    save();enter(0);
    if(box.value.trim())status.textContent='مسودتك السابقة محفوظة في خطوة المقال. لن تُستبدل إلا بعد تأكيدك عند جمع الأجزاء.';
  };
  start.querySelector('#aj-resume').onclick=()=>{
    const hasPlan=Object.values(fields).some(f=>f.type!=='checkbox'&&f.value.trim());
    if(!hasPlan&&!box.value.trim()){start.querySelector('[role=status]').textContent='لا توجد مسودة محمّلة الآن. سجّلي الدخول من «حسابي» أو ابدئي مقالًا جديدًا.';return;}
    enter(box.value.trim()?5:current);
  };
  // Move the existing result view, retaining its Firebase listeners and element IDs.
  const work=document.createElement('section');work.id='my-work';
  work.innerHTML='<div class="shell aj-work"><h2>أعمالي</h2><p>مقالك الحالي وتقييم المعلمة</p><a href="#editor" id="aj-edit-work">متابعة كتابة المقال</a><div class="aj-status" id="aj-work-status"></div></div>';
  editorSection.after(work);
  const result=document.getElementById('studentResultCard');
  if(result)work.firstElementChild.append(result);
  work.querySelector('#aj-edit-work').onclick=()=>enter(5);
  const dialog=document.createElement('dialog');dialog.className='aj-helper';dialog.setAttribute('aria-labelledby','aj-dialog-title');
  dialog.innerHTML='<div class="aj-helper-head"><h3 id="aj-dialog-title"></h3><button type="button" aria-label="إغلاق">×</button></div><div class="aj-helper-body"></div>';
  document.body.append(dialog);
  let restore=null,opener=null;
  function closeHelper(){if(restore){restore();restore=null;}if(dialog.open)dialog.close();}
  dialog.querySelector('button').onclick=closeHelper;
  dialog.addEventListener('close',()=>{if(restore)restore();restore=null;opener?.focus();});
  function openHelper(node,title,button){
    if(!node)return;
    const marker=document.createComment('article helper position');node.before(marker);
    const routeHidden=node.classList.contains('aj-route-hidden');node.classList.remove('aj-route-hidden');
    restore=()=>{marker.replaceWith(node);node.classList.toggle('aj-route-hidden',routeHidden);};
    opener=button;dialog.querySelector('h3').textContent=title;dialog.querySelector('.aj-helper-body').append(node);dialog.showModal();
  }
  utility.querySelector('#aj-dictionary').onclick=e=>openHelper(document.getElementById('lexicon'),'معجم سِمْط',e.currentTarget);
  utility.querySelector('#aj-ideas').onclick=e=>openHelper(document.querySelector('.idea-lab'),'فكرة للمقال',e.currentTarget);
  // Existing insertion controls continue writing to the same editor.
  ['sendPrompt','sendTrainingToEditor','insertWordExample','insertTopicOpening','insertSmartSentence'].forEach(id=>{
    document.getElementById(id)?.addEventListener('click',()=>{closeHelper();enter(5);location.hash='editor';route();});
  });
  const focusRoutes=new Set(['editor','training','my-work','lexicon']);
  function route(){
    closeHelper();
    const target=location.hash.slice(1),focused=focusRoutes.has(target);
    document.body.classList.toggle('aj-focused',focused);
    document.querySelectorAll('.nav-links a').forEach(link=>{
      if(link.hash===location.hash)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('main>section').forEach(section=>{
      section.classList.toggle('aj-route-hidden',focused?section.id!==target:section.id==='my-work');
    });
    if(focused)window.scrollTo({top:0,behavior:'instant'});
  }
  window.addEventListener('hashchange',route);
  // A teacher selecting a student must still reach the original editor and rubric.
  window.addEventListener('simtTeacherSelectedStudent',()=>{enter(5);location.hash='editor';route();});
  window.addEventListener('simtStudentWorkLoaded',()=>{
    work.querySelector('#aj-work-status').textContent=box.value.trim()?'مسودتك جاهزة للمتابعة.':'';
  });
  const toast=document.getElementById('editorToast');
  if(toast)journey.append(toast);
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
    status.textContent='';start.querySelector('[role=status]').textContent='';show(0,false);welcome();
    work.querySelector('#aj-work-status').textContent=uid?'':'سجّلي الدخول من حسابك لعرض نتيجتك.';
  });
  show(0,false);
  welcome();route();
})();
