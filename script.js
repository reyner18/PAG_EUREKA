const root = document.documentElement;
const themeToggle = document.querySelector('#theme-toggle');
let savedTheme = null;
try {
  savedTheme = window.localStorage.getItem('eureka-theme');
} catch (error) {
  savedTheme = null;
}

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  const darkMode = theme === 'dark';
  themeToggle.setAttribute('aria-label', darkMode ? 'Activar tema claro' : 'Activar tema oscuro');
  themeToggle.innerHTML = `<i data-lucide="${darkMode ? 'sun' : 'moon'}"></i><span>Tema</span>`;
  lucide.createIcons();
};

const preferredTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
applyTheme(savedTheme || preferredTheme);

themeToggle.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  const update = () => {
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem('eureka-theme', nextTheme);
    } catch (error) {
    }
  };
  if (document.startViewTransition) {
    root.dataset.theme = nextTheme;
    document.startViewTransition(update);
  } else update();
});

const questions = [
  '¿Qué cambiarías de tu colegio si pudieras probar una idea durante un día?',
  '¿Qué problema de tu comunidad merece una solución creativa?',
  '¿Qué objeto cotidiano reinventarías para hacerlo más útil?',
  '¿Qué pregunta te gustaría responder antes de terminar este año?',
  '¿Qué aprenderías si no tuvieras miedo de equivocarte?'
];

const questionText = document.querySelector('#question-text');
const newQuestionButton = document.querySelector('#new-question');
let questionIndex = 0;

newQuestionButton.addEventListener('click', () => {
  questionIndex = (questionIndex + 1) % questions.length;
  questionText.textContent = '';
  [...questions[questionIndex]].forEach((character, index) => {
    setTimeout(() => { questionText.textContent += character; }, index * 22);
  });
});

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

const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.project-card');
const projectCount = document.querySelector('#project-count');
const emptyProjects = document.querySelector('#empty-projects');
const favoriteButtons = document.querySelectorAll('.favorite-button');
let favoriteProjects = [];

try {
  favoriteProjects = JSON.parse(window.localStorage.getItem('eureka-favorites') || '[]');
} catch (error) {
  favoriteProjects = [];
}

const updateFavoriteButton = (button, isFavorite) => {
  const card = button.closest('.project-card');
  const projectName = card.querySelector('h3').textContent;
  button.setAttribute('aria-pressed', String(isFavorite));
  button.setAttribute('aria-label', `${isFavorite ? 'Quitar' : 'Guardar'} ${projectName} ${isFavorite ? 'de' : 'en'} favoritos`);
};

favoriteButtons.forEach((button) => {
  const projectId = button.closest('.project-card').dataset.projectId;
  updateFavoriteButton(button, favoriteProjects.includes(projectId));
  button.addEventListener('click', () => {
    const isFavorite = !favoriteProjects.includes(projectId);
    favoriteProjects = isFavorite ? [...favoriteProjects, projectId] : favoriteProjects.filter((id) => id !== projectId);
    try {
      window.localStorage.setItem('eureka-favorites', JSON.stringify(favoriteProjects));
    } catch (error) {
    }
    updateFavoriteButton(button, isFavorite);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedFilter = button.dataset.filter;
    let visibleProjects = 0;
    filterButtons.forEach((filterButton) => filterButton.setAttribute('aria-pressed', String(filterButton === button)));
    projectCards.forEach((card) => {
      const matches = selectedFilter === 'all' || card.dataset.category === selectedFilter;
      card.hidden = !matches;
      if (matches) visibleProjects += 1;
    });
    projectCount.textContent = `${visibleProjects} ${visibleProjects === 1 ? 'proyecto' : 'proyectos'}`;
    emptyProjects.hidden = visibleProjects !== 0;
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

document.querySelector('#question-popover').addEventListener('toggle', (event) => {
  if (event.newState === 'open') playTone(740, .12, 'triangle');
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
