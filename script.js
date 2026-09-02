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
  questionText.animate(
    [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 280, easing: 'ease-out' }
  );
  questionText.textContent = questions[questionIndex];
});

const processCards = document.querySelectorAll('.process-card');
processCards.forEach((card) => {
  card.addEventListener('mouseenter', () => {
    processCards.forEach((item) => item.classList.remove('active-card'));
    card.classList.add('active-card');
  });
});
