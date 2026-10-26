import { config, calculate } from './config.js';
const $ = (selector) => document.querySelector(selector);
const works = [
  {id:'headphones',title:'FORM / свой ритм',category:'tech',tag:'Техника · контраст и форма',alt:'Демонстрационная карточка наушников на лавандовом фоне'},
  {id:'serum',title:'VERDE / ритуал ухода',category:'beauty',tag:'Красота · природная эстетика',alt:'Демонстрационная карточка сыворотки на зелёном фоне'},
  {id:'lamp',title:'ARC / тёплый свет',category:'home',tag:'Дом · предметный минимализм',alt:'Демонстрационная карточка настольной лампы в тёплой палитре'},
  {id:'bottle',title:'TRAIL / в движении',category:'life',tag:'Спорт · яркая инфографика',alt:'Демонстрационная карточка спортивной бутылки на лаймовом фоне'},
  {id:'coffee',title:'ORIGIN / время для себя',category:'life',tag:'Напитки · атмосфера бренда',alt:'Демонстрационная карточка кофе в коричневой и кремовой палитре'},
  {id:'bag',title:'ÉTAPE / каждый день',category:'life',tag:'Аксессуары · чистая композиция',alt:'Демонстрационная карточка сумки на голубом фоне'}
];
let filtered = [...works];
let current = 0;
let returnFocus;
const gallery = $('#gallery');
const dialog = $('#lightbox');
works.forEach((work,index) => {
  const article = document.createElement('article');
  article.className = 'work-card';
  article.dataset.id = work.id;
  const button = document.createElement('button');
  button.className = 'work-image';
  button.setAttribute('aria-label',`Открыть: ${work.title}`);
  const img = document.createElement('img');
  Object.assign(img,{src:`assets/${work.id}.svg`,alt:work.alt,width:720,height:900,loading:'lazy',decoding:'async'});
  button.append(img);
  button.addEventListener('click',() => openLightbox(work.id));
  const meta = document.createElement('div');meta.className='work-meta';
  const copy = document.createElement('div');
  const title = document.createElement('h3'); title.textContent=work.title;
  const tag = document.createElement('p');tag.textContent=work.tag;
  const number = document.createElement('span');number.textContent=`0${index+1} / 06`;
  copy.append(title,tag);meta.append(copy,number);article.append(button,meta);gallery.append(article);
});
function filterGallery(category){
  filtered=works.filter(work => category==='all'||work.category===category);
  gallery.querySelectorAll('.work-card').forEach(card=>{card.hidden=!filtered.some(work=>work.id===card.dataset.id);});
  gallery.scrollTo({left:0,behavior:'instant'});
  $('#gallery-status').textContent=`Показано работ: ${filtered.length}`;
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click',()=>{
  document.querySelectorAll('[data-filter]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
  filterGallery(button.dataset.filter);
}));
function setView(carousel){
  gallery.classList.toggle('carousel',carousel);
  $('.carousel-nav').hidden=!carousel;
  [$('#grid-view'),$('#carousel-view')].forEach((button,index)=>{const active=carousel===Boolean(index);button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
}
$('#grid-view').addEventListener('click',()=>setView(false));
$('#carousel-view').addEventListener('click',()=>setView(true));
$('#carousel-prev').addEventListener('click',()=>gallery.scrollBy({left:-gallery.clientWidth*.8,behavior:'smooth'}));
$('#carousel-next').addEventListener('click',()=>gallery.scrollBy({left:gallery.clientWidth*.8,behavior:'smooth'}));
function renderLightbox(){
  const work=filtered[current];
  $('#lightbox-image').src=`assets/${work.id}.svg`;
  $('#lightbox-image').alt=work.alt;
  $('#lightbox-title').textContent=work.title;
  $('#lightbox-count').textContent=`${current+1} / ${filtered.length} · демонстрационный концепт`;
  $('#lightbox-prev').disabled=filtered.length<2;$('#lightbox-next').disabled=filtered.length<2;
}
function openLightbox(id){
  returnFocus=document.activeElement;
  current=filtered.findIndex(work=>work.id===id);renderLightbox();
  dialog.showModal();document.body.classList.add('modal-open');$('#lightbox-close').focus();
}
function moveLightbox(direction){current=(current+direction+filtered.length)%filtered.length;renderLightbox();}
$('#lightbox-close').addEventListener('click',()=>dialog.close());
$('#lightbox-prev').addEventListener('click',()=>moveLightbox(-1));
$('#lightbox-next').addEventListener('click',()=>moveLightbox(1));
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');returnFocus?.focus();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();moveLightbox(-1);}if(event.key==='ArrowRight'){event.preventDefault();moveLightbox(1);}});
let swipeStart;
$('#lightbox-image').addEventListener('touchstart',event=>{if(event.touches.length===1)swipeStart={x:event.touches[0].clientX,y:event.touches[0].clientY};else swipeStart=null;},{passive:true});
$('#lightbox-image').addEventListener('touchend',event=>{if(!swipeStart)return;const dx=event.changedTouches[0].clientX-swipeStart.x,dy=event.changedTouches[0].clientY-swipeStart.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)moveLightbox(dx<0?1:-1);swipeStart=null;},{passive:true});
const form=$('#order-form');
const money = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
function selection(){const data=new FormData(form);return {slides:data.get('slides'),style:data.get('style'),extras:data.getAll('extras'),urgent:data.has('urgent'),platform:data.get('platform'),comment:String(data.get('comment')).trim()};}
function updateEstimate(){
  const selected=selection(),result=calculate(selected);
  const rows=[['Обложка',money(config.prices.cover)],[`Доп. слайды × ${result.count-1}`,money((result.count-1)*config.prices.slide)],['Стиль',money(result.styling)],['Дополнительные услуги',money(result.additions)]];
  if(selected.urgent)rows.push(['Срочность +50%',money(result.surcharge)]);
  $('#breakdown').replaceChildren(...rows.map(([label,value])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);return row;}));
  $('#total').textContent=money(result.total);
  $('#less').disabled=result.count<=1;$('#more').disabled=result.count>=20;
  $('#order-status').textContent='';
}
form.addEventListener('input',updateEstimate);
form.addEventListener('change',updateEstimate);
form.elements.slides.addEventListener('blur',()=>{form.elements.slides.value=calculate(selection()).count;updateEstimate();});
$('#less').addEventListener('click',()=>{form.elements.slides.value=Math.max(1,calculate(selection()).count-1);updateEstimate();});
$('#more').addEventListener('click',()=>{form.elements.slides.value=Math.min(20,calculate(selection()).count+1);updateEstimate();});
function orderText(){const selected=selection(),result=calculate(selected);return [`Здравствуйте! Хочу обсудить дизайн карточек.`,`Площадка: ${selected.platform}`,`Один товар, слайдов: ${result.count}`,`Стиль: ${config.styleNames[selected.style]}`,`Дополнительно: ${selected.extras.map(key=>config.extraNames[key]).join(', ')||'без допуслуг'}`,`Срочность: ${selected.urgent?'нужна, обсудим срок':'обычная'}`,`Предварительная стоимость: ${money(result.total)}`,selected.comment?`О товаре: ${selected.comment}`:'',`Понимаю, что окончательные цену и сроки нужно согласовать.`].filter(Boolean).join('\n');}
form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const url=`https://t.me/${config.telegram}?text=${encodeURIComponent(orderText())}`;window.open(url,'_blank','noopener,noreferrer');$('#order-status').textContent='Открываем Telegram. Заявка будет отправлена только после вашего подтверждения в чате. Если окно не открылось, скопируйте заявку и перейдите по контакту внизу.';});
$('#copy-order').addEventListener('click',async()=>{if(!form.reportValidity())return;try{await navigator.clipboard.writeText(orderText());$('#order-status').textContent='Заявка скопирована. Отправьте её @'+config.telegram+'.';}catch{ $('#order-status').textContent='Копирование недоступно. Выделите текст заявки ниже.';let fallback=$('#copy-fallback');if(!fallback){fallback=document.createElement('textarea');fallback.id='copy-fallback';fallback.readOnly=true;fallback.setAttribute('aria-label','Текст заявки для ручного копирования');$('#order-status').after(fallback);}fallback.value=orderText();fallback.focus();fallback.select();}});
$('#year').textContent=new Date().getFullYear();
updateEstimate();filterGallery('all');
