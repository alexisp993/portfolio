const routes=['home','projects','skills','about','contact'];
const loader=document.querySelector('[data-loader]');
let seen=false;try{seen=sessionStorage.getItem('portfolio-loader-seen')==='1';if(!seen)sessionStorage.setItem('portfolio-loader-seen','1')}catch{};if(seen||matchMedia('(prefers-reduced-motion: reduce)').matches)loader.remove();else{setTimeout(()=>loader.classList.add('is-done'),700);setTimeout(()=>loader.remove(),1400)}
const menu=document.querySelector('[data-menu]'); const collapse=document.querySelector('[data-collapse]');
function closeMenu(){document.body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}
function showRoute(){const route=routes.includes(location.hash.slice(1))?location.hash.slice(1):'home';document.querySelectorAll('[data-view]').forEach(v=>v.classList.toggle('is-active',v.dataset.view===route));document.querySelectorAll('[data-route]').forEach(a=>{if(a.dataset.route===route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});document.title=`${route[0].toUpperCase()+route.slice(1)} — Alex Pagtakhan`;closeMenu();scrollTo(0,0)}
addEventListener('hashchange',showRoute);showRoute();
menu?.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open))});
collapse?.addEventListener('click',()=>{const c=document.body.classList.toggle('sidebar-collapsed');collapse.setAttribute('aria-expanded',String(!c));collapse.lastElementChild.textContent=c?'Expand':'Collapse';try{localStorage.setItem('sidebar-collapsed',String(c))}catch{}});
try{if(localStorage.getItem('sidebar-collapsed')==='true')collapse?.click()}catch{}
const slides=[...document.querySelectorAll('.slide')],dots=[...document.querySelectorAll('[data-slide]')];let current=0,timer;
function slideTo(i,auto=false){current=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle('is-active',n===current));dots.forEach((d,n)=>{if(n===current)d.setAttribute('aria-current','true');else d.removeAttribute('aria-current')});if(!auto)restart()}
function restart(){clearInterval(timer);if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.hidden)timer=setInterval(()=>slideTo(current+1,true),6000)}
dots.forEach(d=>d.addEventListener('click',()=>slideTo(+d.dataset.slide)));document.querySelector('.hero-art')?.addEventListener('mouseenter',()=>clearInterval(timer));document.querySelector('.hero-art')?.addEventListener('mouseleave',restart);document.querySelector('.hero-art')?.addEventListener('focusin',()=>clearInterval(timer));document.querySelector('.hero-art')?.addEventListener('focusout',restart);document.addEventListener('visibilitychange',restart);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&document.querySelector('.hero-art:focus-within'))slideTo(current+(e.key==='ArrowRight'?1:-1))});restart();


