/* Interaction layer for the supplied Stitch HTML exports. No app/API connection. */
const screen=document.body.dataset.screen;
const params=new URLSearchParams(location.search);
const labels={home:'Home',discover:'Discover',detail:'Recipe detail',planner:'Meal plan',grocery:'Groceries',pantry:'Pantry'};
let toastTimer;
function toast(message){const el=document.querySelector('.preview-toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3200);}
function label(el){const clone=el.cloneNode(true);clone.querySelectorAll('.material-symbols-outlined').forEach(x=>x.remove());return (el.getAttribute('aria-label')||el.title||clone.textContent).replace(/\s+/g,' ').trim();}
function route(key){location.href=key+'.html?'+params.toString();}
function markHandled(el,callback){el.dataset.handled='true';el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();callback(e);});}
const routes={Home:'home',Discover:'discover','Meal Plan':'planner','Meal plan':'planner',Grocery:'grocery',Groceries:'grocery',Pantry:'pantry'};
document.querySelectorAll('nav a,nav button').forEach(el=>{const key=routes[label(el)]||Object.entries(routes).find(([name])=>label(el).includes(name))?.[1];if(key)markHandled(el,()=>route(key));});
document.querySelectorAll('input[type=checkbox]').forEach(cb=>{const item=cb.closest('label')||cb.parentElement;function update(){const text=item.querySelector('.item-text')||cb.nextElementSibling;if(text)text.classList.toggle('preview-item-checked',cb.checked);if(screen==='grocery'){const all=[...document.querySelectorAll('.checklist-box')],count=all.filter(x=>x.checked).length;const percent=Math.round(count/Math.max(all.length,1)*100);const bar=document.getElementById('progress-bar-fill'),status=document.getElementById('progress-text');if(bar)bar.style.width=percent+'%';if(status)status.textContent=`${count} of ${all.length} sample items checked (${percent}%)`;}}cb.addEventListener('change',update);});
document.querySelectorAll('button').forEach(b=>{const text=label(b);if(/^(Bookmark|Save (Hummus|Fattoush|Batata|Shish)|Add note or bookmark)/i.test(text)||text==='Save recipe'){markHandled(b,()=>{const icon=b.querySelector('.material-symbols-outlined');if(icon){const active=!icon.classList.contains('preview-bookmarked');icon.classList.toggle('preview-bookmarked',active);b.setAttribute('aria-pressed',String(active));toast(active?'Bookmarked in this design preview.':'Bookmark removed from this design preview.');}});}});
const calendar=document.querySelector('[aria-label="Weekly Calendar Strip"]');
const dayButtons=calendar?[...calendar.querySelectorAll('button')]:[...document.querySelectorAll('button')].filter(b=>/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Today)\b/i.test(label(b)));
dayButtons.forEach(b=>markHandled(b,()=>{dayButtons.forEach(x=>{x.classList.toggle('preview-day-selected',x===b);x.style.backgroundColor=x===b?'#2e7352':'#fff';x.style.color=x===b?'#fff':'#173d2d';x.querySelectorAll('span').forEach(s=>s.style.color='inherit');x.setAttribute('aria-pressed',String(x===b));});if(screen==='planner'){const title=[...document.querySelectorAll('h1,h2,h3,h4,span')].find(h=>/Schedule/.test(h.textContent));if(title)title.textContent=label(b).split(' ')[0]+' · Sample schedule';}toast('Selected day changed in the design sample.');}));
if(screen==='detail'){
 const tabs=['recipe','ingredients','steps'];
 function selectTab(key){tabs.forEach(t=>{document.getElementById('tab-content-'+t)?.classList.toggle('hidden',t!==key);const b=document.getElementById('tab-btn-'+t);b?.classList.toggle('preview-selected',t===key);if(b){b.style.backgroundColor=t===key?'#2e7352':'#e6e9e0';b.style.color=t===key?'#fff':'#173d2d';b.querySelectorAll('span').forEach(el=>el.style.color='inherit');}b?.setAttribute('aria-pressed',String(t===key));});}
 tabs.forEach(t=>{const b=document.getElementById('tab-btn-'+t);if(b)markHandled(b,()=>selectTab(t));});selectTab('steps');
 let servings=4;
 const display=document.getElementById('servings-display');
 display?.parentElement.querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-label',i===0?'Decrease sample servings':'Increase sample servings');markHandled(b,()=>{servings=Math.min(20,Math.max(1,servings+(i===0?-1:1)));display.textContent=servings;document.querySelectorAll('.ingredient-amt').forEach(el=>{const n=Number(el.dataset.base)*servings/4;el.textContent=Number(n.toFixed(2));});});});
 document.querySelectorAll('button').forEach(b=>{const l=label(b);if(/Add to Meal Plan/.test(l))markHandled(b,()=>route('planner'));else if(/Add Missing to Grocery/.test(l))markHandled(b,()=>route('grocery'));else if(/Show recipe steps/.test(l))markHandled(b,()=>{selectTab('steps');document.getElementById('tab-content-steps').scrollIntoView({block:'start',behavior:'smooth'});toast('Recipe steps shown. This is a design sample, not a cooking assistant.');});});
 const back=[...document.querySelectorAll('button')].find(b=>/arrow_back/.test(b.textContent));if(back)markHandled(back,()=>route('discover'));
}
if(screen==='home'){
 document.querySelectorAll('button,a').forEach(b=>{if(b.dataset.handled)return;const l=label(b);if(/Full Matrix/.test(l))markHandled(b,()=>route('planner'));else if(/Start Cooking/.test(l))markHandled(b,()=>toast('The supplied detail design is for Shish Tawook. Open Recipe detail in the screen selector to explore it.'));else if(/Open pantry matches/.test(l))markHandled(b,()=>route('pantry'));else if(/Ingredient Checklist/.test(l))markHandled(b,()=>route('grocery'));else if(/View All/.test(l))markHandled(b,()=>route('grocery'));else if(/See all/.test(l))markHandled(b,()=>route('discover'));});
 const pantry=[...document.querySelectorAll('h1,h2,h3,h4')].find(h=>/Pantry Ready/.test(h.textContent));const pantryCard=pantry?.closest('a,button');if(pantryCard&&!pantryCard.dataset.handled)markHandled(pantryCard,()=>route('pantry'));
}
if(screen==='discover'||screen==='pantry'){
 const articles=[...document.querySelectorAll('article')];
 const featured=screen==='discover'?document.querySelector('main img')?.closest('section'):null;
 if(featured&&!articles.includes(featured))articles.unshift(featured);
 const input=document.querySelector('input[type=text],input[type=search]');
 let category='All';
 const empty=document.createElement('p');empty.className='preview-empty';empty.textContent='No matching items in these supplied design samples.';empty.hidden=true;articles.at(-1)?.parentElement.append(empty);
 function applyFilter(){const term=(input?.value||'').toLowerCase().trim();articles.forEach(a=>{const t=a.textContent.toLowerCase();let show=true;
  if(screen==='discover'){
   if(/Fresh Salads/i.test(category))show=/tabbouleh|fattoush/.test(t);
   else if(/Mezze/i.test(category))show=/hummus|batata/.test(t);
   else if(/Grill|Main/i.test(category))show=/tawook/.test(t);
   else if(!/All/i.test(category))show=false;
  }else{
   if(/Grains/i.test(category))show=/burghul|lentils/.test(t);
   else if(/Oils/i.test(category))show=/olive oil|tahini/.test(t);
   else if(/Spices/i.test(category))show=/spices|pine nuts/.test(t);
   else if(/Produce/i.test(category))show=false;
  }
  a.classList.toggle('preview-filter-hidden',!show||!t.includes(term));
 });empty.hidden=articles.some(a=>!a.classList.contains('preview-filter-hidden'));}
 if(input)input.addEventListener('input',applyFilter);
 if(screen==='discover'){
  articles.forEach(a=>{a.classList.add('preview-card-link');a.tabIndex=0;a.setAttribute('role','group');a.addEventListener('click',e=>{if(!e.target.closest('button,a,input')){if(/Shish Tawook/i.test(a.textContent))route('detail');else toast('Only the Shish Tawook detail layout was supplied. Choose Recipe detail to explore it.');}});a.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target===a){if(/Shish Tawook/i.test(a.textContent))route('detail');else toast('Only the Shish Tawook detail layout was supplied.');}});});
  document.querySelectorAll('button').forEach(b=>{if(/View Recipe/.test(label(b)))markHandled(b,()=>{if(/Shish Tawook/i.test(b.closest('article')?.textContent||''))route('detail');else toast('Only the Shish Tawook detail layout was supplied. Choose Recipe detail to explore it.');});});
  const categories=[...document.querySelectorAll('[aria-label="Recipe Categories"] button')];categories.forEach(b=>markHandled(b,()=>{categories.forEach(x=>{x.classList.toggle('preview-selected',x===b);x.style.backgroundColor=x===b?'#2e7352':'#eef2e9';x.style.color=x===b?'#fff':'#173d2d';});category=label(b);applyFilter();}));
  document.querySelectorAll('button').forEach(b=>{if(/Community Recipes/.test(label(b)))markHandled(b,()=>toast('Community recipes are outside these supplied design samples.'));});
 }else{
  const categories=[...document.querySelectorAll('button')].filter(b=>/^(All\s+\d+|Grains|Oils|Spices|Produce)/i.test(label(b)));categories.forEach(b=>markHandled(b,()=>{category=label(b);categories.forEach(x=>x.classList.toggle('preview-selected',x===b));applyFilter();}));
  document.querySelectorAll('article').forEach(a=>{const minus=a.querySelector('[aria-label="Decrease quantity"]'),plus=a.querySelector('[aria-label="Increase quantity"]');if(minus&&plus){const value=minus.nextElementSibling;if(value){const m=value.textContent.match(/([\d.]+)\s*(.*)/);if(m){let amount=Number(m[1]);const unit=m[2];const step=amount>=100?50:.1;function change(delta){amount=Math.max(0,Math.round((amount+delta*step)*100)/100);value.textContent=amount+unit;}markHandled(minus,()=>change(-1));markHandled(plus,()=>change(1));}}}});
  document.querySelectorAll('button').forEach(b=>{if(/Add to Grocery/.test(label(b)))markHandled(b,()=>toast('Ingredient selected in the design preview. No grocery data was changed.'));if(/Explore All/.test(label(b)))markHandled(b,()=>route('discover'));});
 }
}
if(screen==='planner')document.querySelectorAll('button').forEach(b=>{const l=label(b);if(/Generate List|Generate Grocery/.test(l))markHandled(b,()=>route('grocery'));else if(/Change Recipe|Swap Recipe|Add Recipe Slot/.test(l))markHandled(b,()=>route('discover'));else if(/Start Cook Mode/.test(l))markHandled(b,()=>route('detail'));});
document.querySelectorAll('input').forEach(el=>{if(!el.getAttribute('aria-label'))el.setAttribute('aria-label',el.placeholder||'Sample checklist item');});
document.querySelectorAll('button,a').forEach(el=>{if(!el.getAttribute('aria-label')&&!label(el))el.setAttribute('aria-label','Design preview control');if(!el.dataset.handled&&el.tagName==='BUTTON')markHandled(el,()=>toast('This control is visual only in the supplied design. It is not connected to Akletna.'));});
try{parent.postMessage({type:'akletna-design-screen',screen,title:labels[screen]},'*');}catch{}

if(params.get('mode')==='full'){
 document.body.classList.add('stitch-full-document');
 const reportHeight=()=>parent.postMessage({type:'akletna-design-height',height:Math.max(100,Math.ceil(document.body.getBoundingClientRect().height),document.body.scrollHeight)},'*');
 addEventListener('load',reportHeight);new ResizeObserver(reportHeight).observe(document.body);document.fonts.ready.then(reportHeight);reportHeight();
}
