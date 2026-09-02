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
  card.addEventListener('mouseenter', () => {
    processCards.forEach((item) => item.classList.remove('active-card'));
    card.classList.add('active-card');
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
