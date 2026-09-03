const root = document.documentElement;
root.dataset.theme = 'light';

const tabLinks = document.querySelectorAll('[data-tab-target]');
const tabPanels = document.querySelectorAll('.tab-panel');

const showTab = (targetId) => {
  tabPanels.forEach((panel) => { panel.hidden = panel.id !== targetId; });
  tabLinks.forEach((link) => link.setAttribute('aria-selected', String(link.dataset.tabTarget === targetId)));
  document.querySelector(`#${targetId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

tabLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showTab(link.dataset.tabTarget);
    history.replaceState(null, '', link.hash);
  });
});

const initialTab = window.location.hash.slice(1);
if ([...tabPanels].some((panel) => panel.id === initialTab)) showTab(initialTab);

const processCards = document.querySelectorAll('.process-card');
processCards.forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = card.getBoundingClientRect();
    const rotateY = ((event.clientX - bounds.left) / bounds.width - .5) * 9;
    const rotateX = ((event.clientY - bounds.top) / bounds.height - .5) * -9;
    card.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
    card.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
  });
  card.addEventListener('mouseenter', () => {
    processCards.forEach((item) => item.classList.remove('active-card'));
    card.classList.add('active-card');
  });
  card.addEventListener('pointerleave', () => {
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
  });
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: .12 });

document.querySelectorAll('.statement, .process, .explore, .team').forEach((section) => {
  section.classList.add('reveal-on-scroll');
  revealObserver.observe(section);
});



