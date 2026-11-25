import './styles.css';
import { icon, flag, logo } from './icons.js';
import { services, steps, products, deliveries, stories, faqs } from './content.js';
import posts from './posts.json';

const isBlog = location.pathname.endsWith('/blog.html');
const isPost = location.pathname.endsWith('/post.html');
const isHome = !isBlog && !isPost;
const home = isHome ? '' : '/index.html';
const links = [['Services', '#services'], ['How it works', '#journey'], ['What we import', '#products'], ['China trips', '#trips'], ['Blog', '/blog.html'], ['Contact', '#contact']];
const href = (link) => link.startsWith('#') ? home + link : link;
const escape = (text) => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const date = (value) => new Date(value + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const arrow = '<span aria-hidden="true">→</span>';
const button = (label, target, secondary = false) => `<a class="button ${secondary ? 'secondary' : 'primary'}" href="${target}">${label}</a>`;
const heading = (eyebrow, title, description = '') => `<div class="section-heading reveal"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${description ? `<p>${description}</p>` : ''}</div>`;

function header() {
  return `<header class="site-header ${!isHome ? 'is-scrolled' : ''}"><div class="reading-progress"></div><div class="container nav-row">
    <a class="brand" href="${home}#home" aria-label="ImportNow home">${logo}</a>
    <nav class="desktop-nav" aria-label="Main navigation">${links.map(([title, target]) => `<a href="${href(target)}" ${title === 'Blog' && !isHome ? 'aria-current="page"' : ''}>${title}</a>`).join('')}</nav>
    <a class="button primary nav-quote" href="${home}#contact">Get a free quote</a>
    <button type="button" class="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">
      <svg class="menu-open-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      <svg class="menu-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
    </button>
  </div><nav class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation" hidden>${links.map(([title, target]) => `<a href="${href(target)}">${title}</a>`).join('')}<a class="button primary" href="${home}#contact">Get a free quote</a></nav></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-grid">
    <div class="footer-brand"><a class="brand" href="${home}#home" aria-label="ImportNow home">${logo}</a><p>End-to-end imports from China to India: sourcing, factory inspection, shipping and customs. Save time. Reduce costs.</p><div class="socials"><a href="https://www.instagram.com/importnow.in/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${icon('instagram')}</a><a href="https://wa.me/919989724320" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">${icon('whatsapp')}</a><a href="tel:+919989724320" aria-label="Call ImportNow">${icon('call')}</a></div></div>
    <div><h3>Our services</h3><ul>${services.map(([, title]) => `<li><a href="${home}#services">${title}</a></li>`).join('')}</ul></div>
    <div><h3>What we import</h3><ul>${products.slice(0,5).map(([, ,title]) => `<li><a href="${home}#products">${title}</a></li>`).join('')}<li><a href="${home}#trips">Canton Fair trips</a></li></ul></div>
    <div><h3>Import guides</h3><ul>${posts.slice(0,5).map(p => `<li><a href="/post.html?p=${p.slug}">${p.title}</a></li>`).join('')}<li><a class="footer-all" href="/blog.html">All articles ${arrow}</a></li></ul></div>
    <div><h3>Get in touch</h3><ul class="footer-contact"><li><b>Call / WhatsApp</b><a href="tel:+919989724320">+91 99897 24320</a></li><li><b>India</b>Hyderabad, Telangana</li><li><b>China</b>Shanghai Shengqiao Chain Trading Co., Ltd., Shanghai</li><li><b>Instagram</b><a href="https://www.instagram.com/importnow.in/" target="_blank" rel="noopener noreferrer">@importnow.in</a></li></ul></div>
  </div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ImportNow.in · All rights reserved.</span><span class="concept-note">Concept design · preview prepared for ImportNow</span></div></div></footer>
  <a class="whatsapp-float" href="https://wa.me/919989724320" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">${icon('whatsapp')}</a>`;
}

function cover(p) {
  return `<div class="article-cover ${p.cv}"><span class="cover-category">${escape(p.cat)}</span><span class="cover-flags">${flag('cn')} ${arrow} ${flag('in')}</span>${icon(p.icon, 'cover-icon')}<span class="cover-title">${escape(p.title.split(':')[0])}</span></div>`;
}
function postCard(p) {
  return `<article class="post-card reveal"><a class="cover-link" href="/post.html?p=${p.slug}" aria-label="${escape(p.title)}" tabindex="-1">${cover(p)}</a><div class="post-body"><h3><a href="/post.html?p=${p.slug}">${escape(p.title)}</a></h3><div class="post-meta"><time datetime="${p.date}">${date(p.date)}</time><span>·</span><span>${p.mins} min read</span></div><p>${escape(p.excerpt)}</p>${button('Read more '+arrow, '/post.html?p='+p.slug)}</div></article>`;
}

function homepage() {
  return `<main id="main">
    <section class="hero" id="home"><div class="globe-stage" aria-hidden="true"><div class="globe-fallback"></div><canvas id="globe"></canvas><div id="globe-labels"></div></div><div class="container"><div class="hero-copy">
      <div class="trust-chip reveal">${flag('cn')}<span class="red">→</span>${flag('in')}<span>Trusted by 500+ Indian businesses</span></div>
      <h1 class="reveal">Import directly from China. <span class="red">Without the guesswork.</span></h1>
      <p class="hero-lead reveal">Sourcing, factory inspection, shipping and customs, handled end to end by a team with its own company in Shanghai. You choose the product. We bring it to your door.</p>
      <div class="hero-actions reveal">${button('Get a free sourcing quote '+arrow, '#contact')}${button('See how it works', '#journey', true)}</div>
      <div class="hero-stats reveal"><div><b><span data-count="500">500</span>+</b><span>Businesses<br>served</span></div><div><b><span data-count="83">83</span>K+</b><span>Community on<br>Instagram</span></div><div><b>1 pc</b><span>MOQ on many<br>products</span></div><div><b>Shanghai</b><span>Own registered<br>company</span></div></div>
    </div></div><a class="scroll-cue" href="#services" aria-label="Scroll to services">Scroll<span></span></a></section>
    <div class="marquee" aria-hidden="true"><div>${Array(2).fill(['Yiwu → Adilabad','Foshan → Hyderabad','Shenzhen → Siddipet','Guangzhou → Chennai','Shanghai → Nhava Sheva','Guzhen → Vizag','Ningbo → Mumbai'].map(r => `<span>${r.replace('→','<em>→</em>')}</span>`).join('')).join('')}</div></div>
    <section class="section" id="services"><div class="container">${heading('End-to-end imports', 'One team from the <span class="red">factory floor</span> to your front door.', 'Anyone can say they import from China. What you actually need is a smooth process, clear communication and a shipment that arrives safely.')}<div class="three-grid">${services.map(([symbol,title,copy],i) => `<article class="card service-card reveal tilt"><span class="card-number">${String(i+1).padStart(2,'0')}</span><div class="service-icon">${icon(symbol)}</div><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div></div></section>
    <section class="journey" id="journey" aria-label="Six steps from China to India"><div class="journey-sticky"><div class="sea-fallback" aria-hidden="true"></div><canvas id="voyage" aria-hidden="true"></canvas><div class="journey-shade"></div><span class="journey-badge"><i></i> Shipment journey</span><div class="journey-interface container"><div><span class="eyebrow">How it works</span><h2>Watch your order travel from China to India.</h2></div><ol class="journey-steps">${steps.map(([title,copy],i)=>`<li class="${i===0?'active':''}"><button type="button" data-step="${i}" ${i===0?'aria-current="step"':''}><span class="step-number">${i+1}</span><span><strong>${title}</strong><span class="step-description">${copy}</span></span></button></li>`).join('')}</ol><div class="journey-route"><div class="port">${flag('cn')}<span><b>Shanghai</b><small>Origin port</small></span></div><div class="route-track"><span class="route-fill"></span><span class="route-ship">${icon('ship')}</span></div><div class="port destination"><span><b>Chennai</b><small>Destination</small></span>${flag('in')}</div><strong class="journey-day">Day 0</strong></div></div></div></section>
    <section class="section" id="products"><div class="container">${heading('What we import', 'China has a market for every industry. <span class="red">We know each one.</span>', 'Each industry has its own manufacturing hub. We take you straight to the source.')}<div class="three-grid">${products.map(([symbol,hub,title,items,tag])=>`<article class="card product-card reveal tilt">${icon(symbol,'product-art')}<span class="hub">${flag('cn')} ${hub} hub</span><h3>${title}</h3><ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul><span class="product-tag">${tag}</span></article>`).join('')}</div></div></section>
    <section class="section shanghai" id="shanghai"><div class="container shanghai-grid"><div>${heading('Officially in China','Many claim an office in China. <span class="red">We have the licence.</span>','ImportNow operates through its own registered company in Shanghai, <b>Shanghai Shengqiao Chain Trading Co., Ltd.</b> That means we can sign contracts with factories, pay suppliers locally and stand behind every order.')}<ul class="check-list">${['<b>Registered business licence</b> issued in Shanghai, China','<b>Chinese company bank account</b>, so payments to factories are safe and traceable','<b>Team on the ground</b> for factory visits, quality checks and market trips','<b>Indian founder on both sides</b>: talk to us in Telugu, Hindi or English'].map(t=>`<li class="reveal"><span class="check">✓</span><span>${t}</span></li>`).join('')}</ul></div><div class="licence-stage reveal"><div class="licence" role="img" aria-label="Illustrative business licence for Shanghai Shengqiao Chain Trading"><div class="licence-title" lang="zh">营业执照</div><div class="licence-subtitle">Business licence</div><div class="licence-emblem">★</div><dl><dt>Company</dt><dd>Shanghai Shengqiao Chain Trading Co., Ltd.</dd><dt>Location</dt><dd>Shanghai, People’s Republic of China</dd><dt>Scope</dt><dd>Supply chain, sourcing & international trade</dd><dt>Serving</dt><dd>Importers across India</dd></dl><div class="licence-qr"></div><div class="licence-stamp">★<span>Shanghai<br>Shengqiao<br>Trading</span></div></div></div></div></section>
    <section class="section" id="trips"><div class="container">${heading('Business trips to China', 'Your business trip doesn’t have to <span class="red">feel like work.</span>', 'Guided trips to the Canton Fair, wholesale markets and factories you choose. Our clients often tell us it felt like a personal trip, not a business tour.')}<div class="trips-grid"><article class="card trip-feature reveal"><svg class="skyline" viewBox="0 0 600 180" preserveAspectRatio="none" aria-hidden="true"><path d="M0 180V100h35V60h25v70h35V50h20V20h10v30h15v80h30V75h35v55h20V35l15-30 15 30v95h25V90h30v40h20V55h35v75h25V95h30V25h12V0h8v25h12v105h30V80h40v50h25V100h35v80Z"/></svg><span class="eyebrow">Canton Fair · Guangzhou</span><h3>Meet factories face to face. We handle everything else.</h3><p>Walk the world’s biggest trade fair with a guide who speaks the language, then visit the factories you shortlist.</p><div class="pill-list">${['Guangzhou','Shenzhen','Yiwu','Foshan','Macau','Glass bridge'].map(t=>`<span>${t}</span>`).join('')}</div></article><article class="card reveal"><h3>What’s included</h3><div class="inclusions">${[['doc','Visa guidance & invitation letter'],['home','Hotels close to the fair'],['food','Indian food daily, veg & non-veg'],['language','Guides & translators'],['factory','Factory visits you choose'],['pin','Sightseeing between markets']].map(([s,t])=>`<div>${icon(s)}<span>${t}</span></div>`).join('')}</div></article><article class="card departures reveal"><h3>Next departures</h3><div class="departure-dates"><div><b>Spring</b><span>Canton Fair · April–May</span></div><div><b>Autumn</b><span>Canton Fair · October–November</span></div></div><a class="button primary" href="#contact" data-trip>Join the next trip ${arrow}</a></article></div></div></section>
    <section class="section compact-top" id="work"><div class="container">${heading('Recently delivered','Another container unloaded, <span class="red">another happy client.</span>')}<div class="work-grid">${deliveries.map(([symbol,route,title,copy,tags],i)=>`<article class="card work-card reveal tilt"><div class="work-art cv${i+1}">${icon(symbol)}<span class="route-chip">${flag('cn')}${route}</span></div><div class="work-body"><h3>${title}</h3><p>${copy}</p><div class="small-tags">${tags.map(t=>`<span>${t}</span>`).join('')}</div></div></article>`).join('')}</div></div></section>
    <section class="section compact-top" id="stories"><div class="container">${heading('Client stories','Heard from the people <span class="red">who made the trip.</span>')}<div class="three-grid">${stories.map(([initial,name,subtitle,quote])=>`<figure class="card story reveal"><blockquote>${quote}</blockquote><figcaption><span class="avatar">${initial}</span><span><b>${name}</b><small>${subtitle}</small></span></figcaption></figure>`).join('')}</div></div></section>
    <section class="section compact-top" id="guides"><div class="container"><div class="guides-heading">${heading('Import guides','Learn before you import.','Practical guides on sourcing, shipping, customs and business ideas from China.')}${button('View all articles '+arrow,'/blog.html',true)}</div><div class="post-grid latest-posts">${posts.slice(0,3).map(postCard).join('')}</div></div></section>
    <section class="section compact-top" id="faq"><div class="container">${heading('Questions','Before you import')}<div class="faq-list reveal">${faqs.map(([q,a],i)=>`<details ${i===0?'open':''}><summary>${q}<span aria-hidden="true"></span></summary><p>${a}</p></details>`).join('')}</div></div></section>
    <section class="section contact" id="contact"><div class="container contact-grid"><div>${heading('Start importing','Tell us what you want to import. <span class="red">We’ll take it from there.</span>','Share the product and quantity. You’ll get supplier options, landed cost and timelines, free of charge.')}<div class="contact-lines"><a href="tel:+919989724320">${icon('call')}<span><small>Call or WhatsApp</small><b>+91 99897 24320</b></span></a><a href="https://www.instagram.com/importnow.in/" target="_blank" rel="noopener noreferrer">${icon('instagram')}<span><small>Instagram</small><b>@importnow.in</b></span></a><div>${icon('pin')}<span><small>Offices</small><b>Hyderabad, India · Shanghai, China</b></span></div></div></div><form id="quote-form" class="quote-form reveal"><h3>Get a free sourcing quote</h3><div class="form-row"><label>Your name<input name="name" autocomplete="name" required maxlength="100" placeholder="Full name" /></label><label>City<input name="city" autocomplete="address-level2" maxlength="100" placeholder="e.g. Hyderabad" /></label></div><label>What do you want to import?<select name="category">${[...products.map(p=>p[2]),'China business trip / Canton Fair','Something else'].map(t=>`<option>${t}</option>`).join('')}</select></label><div class="form-row"><label>Approx. quantity<input name="quantity" maxlength="120" placeholder="e.g. 1 container" /></label><label>Budget<select name="budget"><option>Under ₹1 lakh</option><option>₹1–5 lakh</option><option>₹5–25 lakh</option><option>₹25 lakh+</option></select></label></div><label>Details<textarea name="details" maxlength="2000" placeholder="Product, specs, reference photos or links…"></textarea></label><button type="submit" class="button primary">Send on WhatsApp ${arrow}</button><p class="form-note">Opens WhatsApp with your details filled in. We usually reply within a few hours.</p><p class="form-status" role="status" hidden></p></form></div></section>
  </main>`;
}

function blogpage() {
  document.title = 'Import Guides & Blogs | ImportNow';
  return `<main id="main"><section class="page-hero"><div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/index.html">Home</a><span>/</span><span>Blog</span></nav><h1>Import Guides <span class="red">&</span> Blogs</h1><p>Everything we’ve learned from hundreds of shipments: sourcing in China, choosing markets, shipping, customs and business ideas for India.</p></div></section><section class="blog-section container"><div class="blog-tools"><div class="category-filters" role="group" aria-label="Filter articles by category">${['All',...new Set(posts.map(p=>p.cat))].map((cat,i)=>`<button class="category-button ${i===0?'selected':''}" aria-pressed="${i===0}" data-category="${cat}">${cat}</button>`).join('')}</div><label class="search-field">${icon('search')}<input type="search" id="article-search" placeholder="Search articles" aria-label="Search articles" /></label></div><div class="results-status sr-only" aria-live="polite"></div><div class="post-grid" id="post-results"></div><nav class="pagination" aria-label="Article pages"></nav></section></main>`;
}

function articlepage() {
  const p = posts.find(p => p.slug === new URLSearchParams(location.search).get('p'));
  if (!p) {
    document.title = 'Article not found | ImportNow';
    return `<main id="main" class="not-found container"><span class="eyebrow">Article not found</span><h1>This guide isn’t here.</h1><p>Explore the latest guides to find what you’re looking for.</p>${button('Browse all articles','/blog.html')}</main>`;
  }
  document.title = p.title + ' | ImportNow';
  document.querySelector('meta[name="description"]').content = p.excerpt;
  let headingIndex = 0;
  const headings = [];
  const body = p.body.replace(/<h2>(.*?)<\/h2>/g, (_, title) => { const id = 'section-'+ ++headingIndex; headings.push([id,title]); return `<h2 id="${id}">${title}</h2>`; });
  const others=posts.filter(item=>item!==p);
  const related=[...others.filter(item=>item.cat===p.cat),...others.filter(item=>item.cat!==p.cat)].slice(0,3);
  const encodedUrl=encodeURIComponent(location.href),encodedTitle=encodeURIComponent(p.title);
  return `<main id="main"><div class="container article-layout">
    <article class="article">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/index.html">Home</a><span>/</span><a href="/blog.html">Blog</a><span>/</span><span>${p.cat}</span></nav>
      <h1>${p.title}</h1>
      <div class="post-meta"><time datetime="${p.date}">${date(p.date)}</time><span>·</span><span>${p.mins} min read</span><span>·</span><span>By ImportNow Team</span></div>
      ${cover(p)}
      ${headings.length>3?`<nav class="table-of-contents" aria-label="In this article"><b>In this article</b><ol>${headings.map(([id,title])=>`<li><a href="#${id}">${title}</a></li>`).join('')}</ol></nav>`:''}
      <div class="prose">${body}</div>
      <div class="article-share"><span>Share:</span><a href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}" target="_blank" rel="noopener noreferrer">X</a></div>
    </article>
    <aside class="article-sidebar"><div class="sidebar-inner"><div class="popular-box"><h2>Popular Articles</h2>${others.slice(0,5).map(item=>`<a class="popular-article" href="/post.html?p=${item.slug}"><span class="popular-cover">${cover(item)}</span><span><b>${item.title}</b><small>${date(item.date)}</small></span></a>`).join('')}</div><div class="sidebar-cta"><h2>Planning an import?</h2><p>Tell us the product and quantity. We’ll send supplier options, landed cost and timelines, free of charge.</p>${button('Get a free quote '+arrow,'/index.html#contact')}</div></div></aside>
    </div><section class="section related"><div class="container">${heading('Keep reading','Related articles')}<div class="post-grid latest-posts">${related.map(postCard).join('')}</div></div></section></main>`;
}

document.getElementById('app').innerHTML = header() + (isHome ? homepage() : isBlog ? blogpage() : articlepage()) + footer();

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reducedMotion){
  document.querySelectorAll('.hero h1,.section-heading h2,.page-hero h1,.article h1,.journey-interface h2').forEach(heading=>{
    const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
    const textNodes=[];while(walker.nextNode())textNodes.push(walker.currentNode);
    let index=0;
    for(const node of textNodes){
      const fragment=document.createDocumentFragment();
      for(const word of node.textContent.split(/(\s+)/)){
        if(!word.trim()){fragment.append(document.createTextNode(word));continue;}
        const mask=document.createElement('span'),inner=document.createElement('span');
        mask.className='word-mask';inner.className='word-inner';inner.style.setProperty('--word',index++);inner.textContent=word;mask.append(inner);fragment.append(mask);
      }
      node.replaceWith(fragment);
    }
    heading.classList.add('reveal','word-reveal');
  });
}
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), { threshold: .08 });
function observeReveals() { document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el)); }
observeReveals();

const headerEl = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.mobile-menu');
function closeMenu(returnFocus = false) {
  menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Open menu');
  headerEl.classList.remove('menu-is-open');document.documentElement.classList.remove('menu-is-open');
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', event => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  if(!open){closeMenu();return;}
  menu.hidden = !open; menuToggle.setAttribute('aria-expanded', String(open)); menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  headerEl.classList.add('menu-is-open');document.documentElement.classList.add('menu-is-open');
  if(event.detail===0)menu.querySelector('a').focus();
});
menu.addEventListener('click', event => { if(event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if(menu.hidden)return;
  if(event.key === 'Escape'){event.preventDefault();closeMenu(true);}
  if(event.key === 'Tab'){
    const last=menu.querySelector('a:last-child');
    if(event.shiftKey&&document.activeElement===menuToggle){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();menuToggle.focus();}
  }
});
document.addEventListener('click', event => { if(!headerEl.contains(event.target)) closeMenu(); });
matchMedia('(min-width: 861px)').addEventListener('change', event => { if(event.matches) closeMenu(); });
let scrollQueued = false;
function syncScroll() {
  headerEl.classList.toggle('is-scrolled', !isHome || scrollY > 30);
  const max = document.documentElement.scrollHeight - innerHeight;
  document.querySelector('.reading-progress').style.transform = `scaleX(${max ? scrollY/max : 0})`;
  scrollQueued = false;
}
addEventListener('scroll', () => { if(!scrollQueued) { scrollQueued = true; requestAnimationFrame(syncScroll); } }, { passive: true });
syncScroll();

if (!reducedMotion && matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('pointermove', event => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX-box.left)/box.width - .5, y = (event.clientY-box.top)/box.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-y*6}deg) rotateY(${x*8}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
  document.querySelectorAll('.button').forEach(button=>{
    button.addEventListener('pointermove',event=>{
      const box=button.getBoundingClientRect();
      button.style.transform=`translate(${((event.clientX-box.left)/box.width-.5)*12}px,${((event.clientY-box.top)/box.height-.5)*10}px)`;
    });
    button.addEventListener('pointerleave',()=>button.style.transform='');
  });
  const licence=document.querySelector('.licence');
  if(licence){
    licence.parentElement.addEventListener('pointermove',event=>{const rect=licence.parentElement.getBoundingClientRect();licence.style.transform=`rotateY(${((event.clientX-rect.left)/rect.width-.5)*24}deg) rotateX(${-(event.clientY-rect.top)/rect.height*16+8}deg)`;});
    licence.parentElement.addEventListener('pointerleave',()=>licence.style.transform='');
  }
}

if (isHome) {
  if(!reducedMotion){
    const counters=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;counters.unobserve(entry.target);
      const el=entry.target,target=Number(el.dataset.count),start=performance.now();
      function count(now){const fraction=Math.min(1,(now-start)/1600);el.textContent=Math.round(target*(1-(1-fraction)**3));if(fraction<1)requestAnimationFrame(count);}
      requestAnimationFrame(count);
    }),{threshold:.6});
    document.querySelectorAll('[data-count]').forEach(el=>{el.textContent='0';counters.observe(el);});
  }
  const sectionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) if(entry.isIntersecting) document.querySelectorAll('.desktop-nav a').forEach(a => {
      if(a.hash === '#'+entry.target.id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -65% 0px' });
  document.querySelectorAll('main section[id]').forEach(section=>sectionObserver.observe(section));
  document.querySelector('[data-trip]').addEventListener('click', () => { document.querySelector('[name="category"]').value = 'China business trip / Canton Fair'; });
  const form = document.getElementById('quote-form');
  // Label selects explicitly; nested option text must not become part of their name.
  form.elements.category.setAttribute('aria-label', 'What do you want to import?');
  form.elements.budget.setAttribute('aria-label', 'Budget');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const nameInput = form.elements.name;
    if(!String(data.get('name')).trim()) { nameInput.setCustomValidity('Please enter your name.'); nameInput.reportValidity(); return; }
    const message = `Hi ImportNow! I’d like a sourcing quote.\n\nName: ${String(data.get('name')).trim()}\nCity: ${data.get('city') || 'Not specified'}\nProduct: ${data.get('category')}\nQuantity: ${data.get('quantity') || 'Not specified'}\nBudget: ${data.get('budget')}\nDetails: ${data.get('details') || 'Not specified'}`;
    const url = 'https://wa.me/919989724320?text='+encodeURIComponent(message);
    window.open(url, '_blank', 'noopener,noreferrer');
    const status = form.querySelector('.form-status');
    status.hidden = false;
    status.innerHTML = `Your quote is ready in WhatsApp. If it didn’t open, <a href="${url}" target="_blank" rel="noopener noreferrer">continue to WhatsApp</a>.`;
  });
  form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''));
  import('./globe.js').then(({mountGlobe})=>mountGlobe()).catch(()=>document.querySelector('.globe-stage').classList.add('fallback-only'));
  import('./journey.js').then(({mountJourney})=>mountJourney());
} else if(isBlog) {
  let category = 'All', page = 1;
  const input = document.getElementById('article-search');
  const grid = document.getElementById('post-results');
  function renderPosts() {
    const query = input.value.trim().toLowerCase();
    const filtered = posts.filter(p => (category==='All'||p.cat===category) && `${p.title} ${p.cat} ${p.excerpt}`.toLowerCase().includes(query));
    const totalPages = Math.ceil(filtered.length/6);
    page = Math.max(1,Math.min(page,totalPages));
    grid.innerHTML = filtered.length ? filtered.slice((page-1)*6,page*6).map(postCard).join('') : '<div class="empty-results"><h2>No articles found</h2><p>Try a different search or choose another category.</p><button class="button secondary" id="clear-search">Clear filters</button></div>';
    document.querySelector('.results-status').textContent = `${filtered.length} articles found`;
    document.querySelector('.pagination').innerHTML = totalPages > 1 ? Array.from({length:totalPages},(_,i)=>`<button data-page="${i+1}" ${page===i+1?'aria-current="page"':''} aria-label="Page ${i+1}">${i+1}</button>`).join('') : '';
    observeReveals();
  }
  function selectCategory(value) {
    category=value; page=1;
    document.querySelectorAll('[data-category]').forEach(b=>{const active=b.dataset.category===category;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  }
  document.querySelector('.category-filters').addEventListener('click', event => { const target=event.target.closest('[data-category]'); if(target) {selectCategory(target.dataset.category);renderPosts();} });
  input.addEventListener('input',()=>{page=1;renderPosts();});
  document.querySelector('.pagination').addEventListener('click', event=>{ const target=event.target.closest('[data-page]'); if(target){page=Number(target.dataset.page);renderPosts();document.querySelector('.blog-tools').scrollIntoView({behavior:reducedMotion?'instant':'smooth'});} });
  grid.addEventListener('click',event=>{if(event.target.closest('#clear-search')){input.value='';selectCategory('All');renderPosts();input.focus();}});
  renderPosts();
}

// The content is built synchronously; restore deep links after it is mounted.
if(location.hash) requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({behavior:'instant'}));
