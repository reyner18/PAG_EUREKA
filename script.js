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

// Renderiza una tarjeta 1200 x 630 lista para descargar o copiar.
const renderQuestionCard = () => {
  const shareCanvas = document.createElement('canvas');
  shareCanvas.width = 1200;
  shareCanvas.height = 630;
  const shareContext = shareCanvas.getContext('2d');
  shareContext.fillStyle = '#142321';
  shareContext.fillRect(0, 0, 1200, 630);
  shareContext.fillStyle = '#d8f46c';
  shareContext.fillRect(0, 0, 18, 630);
  shareContext.fillStyle = '#f2765b';
  shareContext.font = '500 22px monospace';
  shareContext.fillText('EUREKA / PREGUNTA ALEATORIA / 2026', 70, 82);
  shareContext.fillStyle = '#f4f1e9';
  shareContext.font = '500 54px sans-serif';
  const words = questionText.textContent.trim().split(' ');
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const candidate = `${line} ${word}`.trim();
    if (shareContext.measureText(candidate).width > 1000 && line) {
      lines.push(line);
      line = word;
    } else line = candidate;
  });
  lines.push(line);
  lines.forEach((text, index) => shareContext.fillText(text, 70, 220 + index * 70));
  shareContext.fillStyle = '#b8e3dc';
  shareContext.font = '20px monospace';
  shareContext.fillText('Una pregunta a la vez.', 70, 560);
  shareContext.fillStyle = '#d8f46c';
  shareContext.font = '500 28px sans-serif';
  shareContext.fillText('↗', 1100, 560);
  return shareCanvas;
};

const flashButtonLabel = (button, label) => {
  const original = button.innerHTML;
  button.textContent = label;
  setTimeout(() => { button.innerHTML = original; lucide.createIcons(); }, 1500);
};

document.querySelector('#download-question').addEventListener('click', () => {
  renderQuestionCard().toBlob((blob) => {
    const link = document.createElement('a');
    link.download = 'eureka-pregunta-2026.png';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, 'image/png');
  flashButtonLabel(document.querySelector('#download-question'), 'PNG listo');
});

document.querySelector('#copy-question').addEventListener('click', async () => {
  const shareCanvas = renderQuestionCard();
  try {
    const blob = await new Promise((resolve) => shareCanvas.toBlob(resolve, 'image/png'));
    if (navigator.clipboard?.write && window.ClipboardItem) await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    else await navigator.clipboard.writeText(questionText.textContent);
    flashButtonLabel(document.querySelector('#copy-question'), 'Copiado');
  } catch (error) {
    flashButtonLabel(document.querySelector('#copy-question'), 'Selecciona y copia');
  }
});

const dialog = document.querySelector('#project-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogCategory = document.querySelector('#dialog-category');
const dialogNumber = document.querySelector('#dialog-number');
const dialogDescription = document.querySelector('#dialog-description');
const dialogSummary = document.querySelector('#dialog-summary');
const posterTitle = document.querySelector('#poster-title');
let currentProject = null;

// Cada tarjeta funciona como fuente de datos para mantener el contenido sincronizado.
document.querySelectorAll('.project-open').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.project-card');
    currentProject = {
      id: card.dataset.projectId,
      title: card.querySelector('h3').textContent,
      category: card.querySelector('.project-tag').textContent,
      number: card.querySelector('.project-number').textContent,
      description: card.querySelector('p').textContent
    };
    dialogTitle.textContent = currentProject.title;
    posterTitle.textContent = currentProject.title;
    dialogCategory.textContent = currentProject.category;
    dialogNumber.textContent = currentProject.number;
    dialogDescription.textContent = currentProject.description;
    dialogSummary.textContent = `${currentProject.description} Esta investigación propone observar el contexto, reunir evidencias y compartir un aprendizaje útil para la comunidad escolar.`;
    dialog.showModal();
  });
});

document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

document.querySelectorAll('.dialog-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const showModel = tab.dataset.tab === 'model';
    document.querySelectorAll('.dialog-tab').forEach((item) => item.classList.toggle('is-active', item === tab));
    document.querySelectorAll('.dialog-tab').forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
    document.querySelector('#documents-panel').hidden = showModel;
    document.querySelector('#model-panel').hidden = !showModel;
    if (showModel) drawProjectModel();
  });
});

const modelCanvas = document.querySelector('#project-model');
const modelContext = modelCanvas.getContext('2d');
let modelFrame;

const drawProjectModel = (time = 0) => {
  const ratio = Math.min(devicePixelRatio, 2);
  const width = modelCanvas.clientWidth;
  const height = modelCanvas.clientHeight;
  modelCanvas.width = width * ratio;
  modelCanvas.height = height * ratio;
  modelContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  modelContext.clearRect(0, 0, width, height);
  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) * .24;
  const offset = Math.sin(time * .001) * 10;
  modelContext.strokeStyle = '#d8f46c';
  modelContext.lineWidth = 2;
  modelContext.beginPath();
  modelContext.moveTo(centerX, centerY - size + offset);
  modelContext.lineTo(centerX + size, centerY - size / 2 + offset);
  modelContext.lineTo(centerX + size, centerY + size / 2 + offset);
  modelContext.lineTo(centerX, centerY + size + offset);
  modelContext.lineTo(centerX - size, centerY + size / 2 + offset);
  modelContext.lineTo(centerX - size, centerY - size / 2 + offset);
  modelContext.closePath();
  modelContext.stroke();
  modelContext.beginPath();
  modelContext.moveTo(centerX, centerY - size + offset);
  modelContext.lineTo(centerX, centerY + offset);
  modelContext.lineTo(centerX + size, centerY - size / 2 + offset);
  modelContext.moveTo(centerX, centerY + offset);
  modelContext.lineTo(centerX - size, centerY - size / 2 + offset);
  modelContext.stroke();
  if (!dialog.open || document.querySelector('#model-panel').hidden) return;
  modelFrame = requestAnimationFrame(drawProjectModel);
};

document.querySelector('#download-summary').addEventListener('click', () => {
  const content = `${currentProject.title}\n${currentProject.category}\n\n${dialogSummary.textContent}`;
  const link = document.createElement('a');
  link.download = `${currentProject.id}-resumen.txt`;
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  link.click();
  URL.revokeObjectURL(link.href);
});
