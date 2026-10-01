/* =========================================================
   Avenue & Co. — interactions
   ========================================================= */
document.documentElement.classList.add('js');

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Loader ---------- */
const hideLoader = () => $('.loader')?.classList.add('is-done');
window.addEventListener('load', () => setTimeout(hideLoader, reduceMotion ? 0 : 900));
setTimeout(hideLoader, 3500); // safety net if an image is slow

/* ---------- Header state ---------- */
const header = $('.header');
const onScrollHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 40);

/* ---------- Drawer menu ---------- */
const menuBtn = $('.menu-btn');
const drawer = $('#drawer');
const setDrawer = (open) => {
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('is-locked', open);
};
menuBtn.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
$$('a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });

/* ---------- Reveal on scroll ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

const observeReveals = (root = document) => {
  $$('.reveal, .img-reveal', root).forEach((el) => {
    // stagger siblings slightly
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    const i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = `${Math.min(i, 6) * 80}ms`;
    revealObserver.observe(el);
  });
};
observeReveals();

/* ---------- Count-up numbers ---------- */
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const to = Number(el.dataset.to);
    const duration = reduceMotion ? 0 : 1600;
    const start = performance.now();
    const tick = (now) => {
      const t = duration ? Math.min((now - start) / duration, 1) : 1;
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(to * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.6 });
$$('.count').forEach(el => countObserver.observe(el));

/* ---------- Scroll-linked effects (hero + recruit parallax) ---------- */
const heroFrame = $('.hero__frame');
const heroVisual = $('.hero__visual');
const recruit = $('.recruit');
const recruitImg = $('.recruit__bg img');
let ticking = false;

const onScrollEffects = () => {
  const vh = window.innerHeight;
  if (heroFrame) {
    const r = heroVisual.getBoundingClientRect();
    const p = Math.min(Math.max((vh - r.top) / (vh * 0.9), 0), 1);
    heroFrame.style.setProperty('--p', p.toFixed(3));
    heroVisual.style.setProperty('--shift', ((1 - p) * 60).toFixed(1));
  }
  if (recruit && recruitImg) {
    const r = recruit.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) {
      const progress = (vh - r.top) / (vh + r.height); // 0 → 1
      recruitImg.style.setProperty('--parallax', (-progress * r.height * 0.15).toFixed(1));
    }
  }
  ticking = false;
};

window.addEventListener('scroll', () => {
  onScrollHeader();
  if (!ticking && !reduceMotion) { requestAnimationFrame(onScrollEffects); ticking = true; }
}, { passive: true });
onScrollHeader();
if (reduceMotion) heroFrame?.style.setProperty('--p', 1); else onScrollEffects();

/* ---------- Service tags (tap to show tooltip) ---------- */
$$('.tag').forEach(tag => {
  tag.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = tag.getAttribute('aria-expanded') === 'true';
    $$('.tag[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded', 'false'));
    tag.setAttribute('aria-expanded', String(!open));
  });
});
document.addEventListener('click', () => $$('.tag[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded', 'false')));

/* ---------- Strengths: highlight current anchor ---------- */
const anchors = $$('.anchor-list a');
const anchorObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    anchors.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['f1', 'f2', 'f3', 'f4'].forEach(id => { const el = document.getElementById(id); if (el) anchorObserver.observe(el); });

/* =========================================================
   WORKS — property data, filters, modal
   ========================================================= */
const baseSpecs = [
  'New water supply & drainage pipes',
  'New unit bath (with reheating & bathroom dryer)',
  'New vanity unit',
  'New system kitchen (with dishwasher)',
  'New toilet',
  'New flooring throughout',
  'New wallpaper throughout',
  'New interior doors',
  'New water heater',
  'New washing-machine tray',
  'New lighting fixtures',
  'Professional house cleaning, and more',
];

const works = [
  {
    title: 'Sakuragaoka, Setagaya',
    layout: '2LDK + Walk-in closet',
    img: 'Graphics/work-1.jpg',
    area: ['West City', 'Setagaya'],
    type: ['New seismic standard'],
    issue: [],
    specs: [...baseSpecs, 'Water-saving faucets', 'All-LED lighting (motion sensor at entrance)'],
  },
  {
    title: 'Yotsuya, Shinjuku',
    layout: '1LDK + Walk-in closet',
    img: 'Graphics/work-2.jpg',
    area: ['West City', 'Shinjuku'],
    type: ['New seismic standard', 'Large residence', 'Tower apartment', 'Branded apartment'],
    issue: [],
    specs: [...baseSpecs, 'Water-saving faucets', 'All-LED lighting (motion sensor at entrance)'],
  },
  {
    title: 'Oyama-nishimachi, Itabashi',
    layout: '4LDK + Shoe-in closet',
    img: 'Graphics/work-3.jpg',
    area: ['Itabashi'],
    type: ['New seismic standard', 'Branded apartment'],
    issue: ['Mortgage tax-deduction eligible'],
    specs: [...baseSpecs, 'Water-saving faucets', 'All-LED lighting (motion sensor at entrance)'],
  },
  {
    title: 'Omori-kita, Ota',
    layout: '2DK',
    img: 'Graphics/work-4.jpg',
    area: ['South City', 'Ota'],
    type: ['New seismic standard'],
    issue: ['Insulation & energy-saving renovation', 'Inner windows only'],
    specs: [...baseSpecs, 'Inner windows (Low-E double glazing, high heat-shielding)'],
  },
  {
    title: 'Omori-nishi, Ota',
    layout: '3LDK',
    img: 'Graphics/work-5.jpg',
    area: ['South City', 'Ota'],
    type: ['New seismic standard', 'Large residence', 'Low-rise apartment'],
    issue: ['Insulation & energy-saving renovation', 'Meets energy-efficiency standard', 'Mortgage tax-deduction eligible'],
    specs: [...baseSpecs, 'Inner windows (Low-E double glazing, high heat-shielding)', 'Exterior-wall insulation work'],
  },
  {
    title: 'Hikawa-cho, Soka',
    layout: '3LDK + Shoe-in closet',
    img: 'Graphics/work-6.jpg',
    area: ['Soka', 'Suburbs'],
    type: ['New seismic standard', 'Branded apartment'],
    issue: ['Mortgage tax-deduction eligible'],
    specs: [...baseSpecs, 'Water-saving faucets', 'All-LED lighting'],
  },
];

const filterOptions = {
  issue: ['Insulation & energy-saving renovation', 'ZEH-level compliant', 'Meets energy-efficiency standard', 'Inner windows only', 'Mortgage tax-deduction eligible'],
  type: ['New seismic standard', 'Large residence', 'Tower apartment', 'Branded apartment', 'Low-rise apartment'],
  area: ['West City', 'South City', 'Setagaya', 'Shinjuku', 'Itabashi', 'Ota', 'Suburbs'],
};

let currentGroup = 'issue';
let currentFilter = 'All';

const grid = $('#worksGrid');
const chipsEl = $('#chips');
const emptyEl = $('#worksEmpty');

const renderChips = () => {
  chipsEl.innerHTML = '';
  ['All', ...filterOptions[currentGroup]].forEach(label => {
    const b = document.createElement('button');
    b.className = 'chip' + (label === currentFilter ? ' is-active' : '');
    b.textContent = label;
    b.addEventListener('click', () => { currentFilter = label; renderChips(); renderWorks(); });
    chipsEl.appendChild(b);
  });
};

const renderWorks = () => {
  const list = currentFilter === 'All' ? works : works.filter(w => w[currentGroup].includes(currentFilter));
  grid.innerHTML = '';
  list.forEach((w, i) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.style.animationDelay = `${i * 70}ms`;
    const tags = [...w.area, ...w.type, ...w.issue].slice(0, 4);
    card.innerHTML = `
      <div class="card__img"><img src="${w.img}" alt="${w.title} interior" loading="lazy"></div>
      <p class="card__layout">${w.layout}</p>
      <h3 class="card__title">${w.title}</h3>
      <ul class="card__tags">${tags.map(t => `<li>${t}</li>`).join('')}</ul>`;
    card.addEventListener('click', () => openWork(w));
    grid.appendChild(card);
  });
  emptyEl.hidden = list.length > 0;
};

$$('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.tab').forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    currentGroup = tab.dataset.group;
    currentFilter = 'All';
    renderChips();
    renderWorks();
  });
});

/* Modal */
const modal = $('#workModal');
const openWork = (w) => {
  $('.modal__media img', modal).src = w.img;
  $('.modal__media img', modal).alt = `${w.title} interior`;
  $('.modal__layout', modal).textContent = w.layout;
  $('.modal__title', modal).textContent = w.title;
  $('.modal__tags', modal).innerHTML = [...w.area, ...w.type, ...w.issue].map(t => `<li>${t}</li>`).join('');
  $('.modal__specs', modal).innerHTML = w.specs.map(s => `<li>${s}</li>`).join('');
  modal.showModal();
  document.body.classList.add('is-locked');
};
const closeModal = () => { modal.close(); };
$('.modal__close', modal).addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
modal.addEventListener('close', () => document.body.classList.remove('is-locked'));

renderChips();
renderWorks();

/* ---------- Contact form (front-end only) ---------- */
const form = $('#contactForm');
const note = $('#formNote');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;
  $$('[required]', form).forEach(field => {
    const ok = field.value.trim() !== '' && (field.type !== 'email' || /\S+@\S+\.\S+/.test(field.value));
    field.classList.toggle('is-invalid', !ok);
    if (!ok) valid = false;
  });
  if (!valid) { note.textContent = 'Please fill in your name, a valid email and a message.'; return; }

  // No server yet: open the visitor's email app with the message pre-filled.
  const data = new FormData(form);
  const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || '-'}\nTopic: ${data.get('topic')}\n\n${data.get('message')}`;
  window.location.href = `mailto:hello@yourdomain.com?subject=${encodeURIComponent('Website enquiry — ' + data.get('topic'))}&body=${encodeURIComponent(body)}`;
  note.textContent = 'Thank you — your email app should open to send the enquiry.';
  form.reset();
});
$$('[required]', form).forEach(f => f.addEventListener('input', () => f.classList.remove('is-invalid')));
