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

const soundToggle = document.querySelector('#sound-toggle');
const soundLabel = soundToggle.querySelector('span');
let audioContext;
let soundEnabled = false;

const getAudioContext = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
};

const playTone = (frequency = 440, duration = .07, type = 'sine') => {
  if (!soundEnabled) return;
  const audio = getAudioContext();
  if (!audio) return;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.045, audio.currentTime + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration + .02);
};

soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute('aria-pressed', String(soundEnabled));
  soundToggle.setAttribute('aria-label', soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos');
  soundLabel.textContent = soundEnabled ? 'Sonido on' : 'Sonido off';
  soundToggle.querySelector('svg')?.remove();
  soundToggle.insertAdjacentHTML('afterbegin', `<i data-lucide="${soundEnabled ? 'volume-2' : 'volume-x'}"></i>`);
  lucide.createIcons();
  if (soundEnabled) playTone(660, .1, 'triangle');
});

document.addEventListener('click', (event) => {
  if (event.target.closest('button, .button, .header-cta, .text-link') && !event.target.closest('#sound-toggle')) playTone(520, .055);
}, { capture: true });

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

const canvas = document.querySelector('#orbit-canvas');
const stage = document.querySelector('#orbital-stage');
const context = canvas.getContext('2d');
const particles = Array.from({ length: 18 }, (_, index) => ({ angle: index * .35, radius: 70 + (index % 4) * 22, speed: .0015 + index * .0002 }));

const resizeCanvas = () => {
  const ratio = Math.min(devicePixelRatio, 2);
  canvas.width = stage.clientWidth * ratio;
  canvas.height = stage.clientHeight * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
};

const drawOrbit = (time = 0) => {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  context.clearRect(0, 0, width, height);
  context.strokeStyle = getComputedStyle(root).getPropertyValue('--coral');
  context.globalAlpha = .25;
  context.lineWidth = 1;
  context.beginPath();
  context.ellipse(width / 2, height / 2, Math.min(width, height) * .42, Math.min(width, height) * .28, -.25, 0, Math.PI * 2);
  context.stroke();
  particles.forEach((particle) => {
    const angle = particle.angle + time * particle.speed;
    const x = width / 2 + Math.cos(angle) * particle.radius;
    const y = height / 2 + Math.sin(angle) * particle.radius * .65;
    context.fillStyle = getComputedStyle(root).getPropertyValue('--lime');
    context.globalAlpha = .8;
    context.beginPath();
    context.arc(x, y, 2.2, 0, Math.PI * 2);
    context.fill();
  });
  requestAnimationFrame(drawOrbit);
};

new ResizeObserver(resizeCanvas).observe(stage);
resizeCanvas();
requestAnimationFrame(drawOrbit);


