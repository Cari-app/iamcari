export interface QuizOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface QuizQuestion {
  id: string;
  title: string;
  subtitle?: string;
  options: QuizOption[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'primary_goal',
    title: 'Qual é seu principal objetivo neste momento?',
    subtitle: 'Escolha o que mais importa para você agora',
    options: [
      { value: 'emagrecer', label: 'Emagrecer', emoji: '🔥' },
      { value: 'reduzir_inchaco', label: 'Reduzir inchaço', emoji: '💧' },
      { value: 'controlar_fome', label: 'Controlar a fome', emoji: '🍽️' },
      { value: 'criar_rotina', label: 'Criar rotina alimentar', emoji: '📋' },
      { value: 'melhorar_energia', label: 'Melhorar energia e disposição', emoji: '⚡' },
      { value: 'voltar_consistencia', label: 'Voltar a ter consistência', emoji: '🔄' },
    ],
  },
  {
    id: 'goal_range',
    title: 'Quanto você deseja mudar neste momento?',
    subtitle: 'Isso nos ajuda a ajustar a intensidade do plano',
    options: [
      { value: 'ate_3kg', label: 'Até 3 kg', emoji: '🎯' },
      { value: '4_a_7kg', label: 'De 4 a 7 kg', emoji: '📊' },
      { value: '8_a_12kg', label: 'De 8 a 12 kg', emoji: '📈' },
      { value: 'mais_12kg', label: 'Mais de 12 kg', emoji: '🏔️' },
      { value: 'habitos', label: 'Prefiro focar em hábitos e consistência', emoji: '✨' },
    ],
  },
  {
    id: 'fasting_experience',
    title: 'Você já praticou jejum antes?',
    subtitle: 'Sua experiência ajuda a definir o ponto de partida',
    options: [
      { value: 'nunca', label: 'Nunca fiz', emoji: '🆕' },
      { value: 'tentei_nao_mantive', label: 'Já tentei, mas não consegui manter', emoji: '😔' },
      { value: 'adaptei_bem', label: 'Já fiz e me adaptei bem', emoji: '💪' },
      { value: 'sem_consistencia', label: 'Faço às vezes, mas sem consistência', emoji: '🔀' },
    ],
  },
  {
    id: 'routine_type',
    title: 'Como é sua rotina durante a semana?',
    subtitle: 'Isso define se o plano será mais fixo ou flexível',
    options: [
      { value: 'muito_corrida', label: 'Muito corrida e imprevisível', emoji: '🌪️' },
      { value: 'razoavel', label: 'Razoavelmente organizada', emoji: '📅' },
      { value: 'bem_organizada', label: 'Bem organizada', emoji: '✅' },
      { value: 'horarios_alternados', label: 'Trabalho em horários alternados', emoji: '🔄' },
    ],
  },
  {
    id: 'hardest_period',
    title: 'Em qual período você sente mais dificuldade para controlar a alimentação?',
    options: [
      { value: 'manha', label: 'Manhã', emoji: '🌅' },
      { value: 'tarde', label: 'Tarde', emoji: '☀️' },
      { value: 'noite', label: 'Noite', emoji: '🌙' },
      { value: 'madrugada', label: 'Madrugada', emoji: '🌃' },
      { value: 'varia_muito', label: 'Varia muito', emoji: '🔀' },
    ],
  },
  {
    id: 'easiest_fasting_period',
    title: 'Qual período costuma ser mais fácil para você ficar sem comer?',
    options: [
      { value: 'manha', label: 'Manhã', emoji: '🌅' },
      { value: 'tarde', label: 'Tarde', emoji: '☀️' },
      { value: 'noite', label: 'Noite', emoji: '🌙' },
      { value: 'nao_sei', label: 'Ainda não sei', emoji: '🤔' },
    ],
  },
  {
    id: 'hunger_tolerance',
    title: 'Como você lida com a fome no dia a dia?',
    subtitle: 'Seja sincero(a) — isso impacta a segurança do plano',
    options: [
      { value: 'lido_bem', label: 'Lido bem', emoji: '😊' },
      { value: 'depende_dia', label: 'Depende do dia', emoji: '🤷' },
      { value: 'irritada_ansiosa', label: 'Fico irritada ou ansiosa', emoji: '😤' },
      { value: 'perco_controle', label: 'Sinto que perco o controle', emoji: '😰' },
    ],
  },
  {
    id: 'snacking_frequency',
    title: 'Você costuma beliscar entre as refeições?',
    options: [
      { value: 'quase_nunca', label: 'Quase nunca', emoji: '🚫' },
      { value: 'as_vezes', label: 'Às vezes', emoji: '🤏' },
      { value: 'com_frequencia', label: 'Com frequência', emoji: '🍪' },
      { value: 'varias_vezes', label: 'Várias vezes por dia', emoji: '😬' },
    ],
  },
  {
    id: 'routine_break_response',
    title: 'Quando você sai da rotina, o que normalmente acontece?',
    subtitle: 'Isso mede sua estabilidade comportamental',
    options: [
      { value: 'volto_mesmo_dia', label: 'Volto no mesmo dia', emoji: '💪' },
      { value: 'exagero_pouco', label: 'Exagero um pouco', emoji: '😅' },
      { value: 'desando_dia', label: 'Acabo desandando o resto do dia', emoji: '😩' },
      { value: 'demoro_retomar', label: 'Demoro para retomar', emoji: '😔' },
    ],
  },
  {
    id: 'main_food_barrier',
    title: 'O que mais atrapalha sua alimentação hoje?',
    subtitle: 'Identifique o seu principal sabotador',
    options: [
      { value: 'ansiedade', label: 'Ansiedade', emoji: '😰' },
      { value: 'falta_rotina', label: 'Falta de rotina', emoji: '🔀' },
      { value: 'fome_emocional', label: 'Fome emocional', emoji: '💔' },
      { value: 'vontade_doce', label: 'Vontade de doce', emoji: '🍫' },
      { value: 'excesso_noite', label: 'Excesso à noite', emoji: '🌙' },
      { value: 'fim_semana', label: 'Fim de semana desregulado', emoji: '🎉' },
    ],
  },
  {
    id: 'preferred_plan_style',
    title: 'Que tipo de plano você sente que consegue seguir melhor agora?',
    options: [
      { value: 'simples', label: 'Algo bem simples para começar', emoji: '🌱' },
      { value: 'gradual', label: 'Um plano gradual com evolução', emoji: '📈' },
      { value: 'firme', label: 'Um plano mais firme e estratégico', emoji: '🎯' },
      { value: 'adaptavel', label: 'Algo que se adapte aos meus dias', emoji: '🔄' },
    ],
  },
  {
    id: 'fasting_response',
    title: 'Como você normalmente se sente ao passar algumas horas sem comer?',
    subtitle: 'Essa resposta confirma sua tolerância real ao jejum',
    options: [
      { value: 'normal', label: 'Normal', emoji: '😌' },
      { value: 'fome_lido', label: 'Sinto fome, mas consigo lidar', emoji: '🙂' },
      { value: 'sem_energia', label: 'Fico sem energia', emoji: '😴' },
      { value: 'irritada_dor', label: 'Fico irritada, ansiosa ou com dor de cabeça', emoji: '🤕' },
    ],
  },
];
