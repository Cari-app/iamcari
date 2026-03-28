// ============================================================
// Motor de Classificação — Avaliação Inteligente de Jejum Metabólico
// ============================================================

export interface QuizAnswers {
  primary_goal: string;
  goal_range: string;
  fasting_experience: string;
  routine_type: string;
  hardest_period: string;
  easiest_fasting_period: string;
  hunger_tolerance: string;
  snacking_frequency: string;
  routine_break_response: string;
  main_food_barrier: string;
  preferred_plan_style: string;
  fasting_response: string;
}

export interface QuizResult {
  profile_type: string;
  profile_label: string;
  plan_focus: string;
  recommended_protocol_hours: number;
  protocol_label: string;
  schedule_start: string;
  schedule_end: string;
  schedule_label: string;
  weekly_goal_days: number;
  progression_next_step: string;
  behavior_alerts: string[];
  reason_summary: string;
  support_style: string;
  plan_style: string;
  dynamic_tags: string[];
}

// ---- Scoring ----

interface Scores {
  fasting_tolerance: number;
  behavior_risk: number;
  routine_need: number;
  readiness: number;
}

interface Flags {
  window_morning_difficulty: boolean;
  window_afternoon_difficulty: boolean;
  window_night_difficulty: boolean;
  prefers_skipping_morning: boolean;
  prefers_skipping_afternoon: boolean;
  prefers_skipping_night: boolean;
  prefers_simple: boolean;
  prefers_gradual: boolean;
  prefers_structured: boolean;
  prefers_flexible: boolean;
}

function score(answers: QuizAnswers): { scores: Scores; flags: Flags } {
  const s: Scores = { fasting_tolerance: 0, behavior_risk: 0, routine_need: 0, readiness: 0 };
  const f: Flags = {
    window_morning_difficulty: false,
    window_afternoon_difficulty: false,
    window_night_difficulty: false,
    prefers_skipping_morning: false,
    prefers_skipping_afternoon: false,
    prefers_skipping_night: false,
    prefers_simple: false,
    prefers_gradual: false,
    prefers_structured: false,
    prefers_flexible: false,
  };

  // 1. primary_goal
  switch (answers.primary_goal) {
    case 'emagrecer': s.readiness += 2; break;
    case 'reduzir_inchaco': s.readiness += 1; break;
    case 'controlar_fome': s.behavior_risk += 2; break;
    case 'criar_rotina': s.routine_need += 2; break;
    case 'melhorar_energia': s.readiness += 1; break;
    case 'voltar_consistencia': s.behavior_risk += 2; s.routine_need += 1; break;
  }

  // 2. goal_range
  switch (answers.goal_range) {
    case 'ate_3kg': s.readiness += 1; break;
    case '4_a_7kg': s.readiness += 2; break;
    case '8_a_12kg': s.readiness += 2; break;
    case 'mais_12kg': s.readiness += 1; s.behavior_risk += 1; break;
    case 'habitos': s.behavior_risk += 1; s.routine_need += 1; break;
  }

  // 3. fasting_experience
  switch (answers.fasting_experience) {
    case 'nunca': s.fasting_tolerance -= 2; s.readiness -= 1; break;
    case 'tentei_nao_mantive': s.behavior_risk += 2; s.fasting_tolerance -= 1; break;
    case 'adaptei_bem': s.fasting_tolerance += 2; s.readiness += 2; break;
    case 'sem_consistencia': s.fasting_tolerance += 1; s.behavior_risk += 1; break;
  }

  // 4. routine_type
  switch (answers.routine_type) {
    case 'muito_corrida': s.routine_need += 3; break;
    case 'razoavel': s.routine_need += 1; break;
    case 'bem_organizada': s.readiness += 2; s.routine_need -= 1; break;
    case 'horarios_alternados': s.routine_need += 3; s.readiness -= 1; break;
  }

  // 5. hardest_period
  switch (answers.hardest_period) {
    case 'manha': f.window_morning_difficulty = true; break;
    case 'tarde': f.window_afternoon_difficulty = true; break;
    case 'noite': f.window_night_difficulty = true; s.behavior_risk += 2; break;
    case 'madrugada': f.window_night_difficulty = true; s.behavior_risk += 3; break;
    case 'varia_muito': s.routine_need += 2; s.behavior_risk += 1; break;
  }

  // 6. easiest_fasting_period
  switch (answers.easiest_fasting_period) {
    case 'manha': f.prefers_skipping_morning = true; break;
    case 'tarde': f.prefers_skipping_afternoon = true; break;
    case 'noite': f.prefers_skipping_night = true; break;
    // 'nao_sei' — no score
  }

  // 7. hunger_tolerance
  switch (answers.hunger_tolerance) {
    case 'lido_bem': s.fasting_tolerance += 2; break;
    case 'depende_dia': break;
    case 'irritada_ansiosa': s.fasting_tolerance -= 2; s.behavior_risk += 1; break;
    case 'perco_controle': s.fasting_tolerance -= 3; s.behavior_risk += 3; break;
  }

  // 8. snacking_frequency
  switch (answers.snacking_frequency) {
    case 'quase_nunca': s.behavior_risk -= 1; s.readiness += 1; break;
    case 'as_vezes': break;
    case 'com_frequencia': s.behavior_risk += 2; break;
    case 'varias_vezes': s.behavior_risk += 3; s.fasting_tolerance -= 1; break;
  }

  // 9. routine_break_response
  switch (answers.routine_break_response) {
    case 'volto_mesmo_dia': s.behavior_risk -= 1; s.readiness += 1; break;
    case 'exagero_pouco': s.behavior_risk += 1; break;
    case 'desando_dia': s.behavior_risk += 2; break;
    case 'demoro_retomar': s.behavior_risk += 3; s.readiness -= 1; break;
  }

  // 10. main_food_barrier
  switch (answers.main_food_barrier) {
    case 'ansiedade': s.behavior_risk += 3; break;
    case 'falta_rotina': s.routine_need += 3; break;
    case 'fome_emocional': s.behavior_risk += 3; break;
    case 'vontade_doce': s.behavior_risk += 2; break;
    case 'excesso_noite': s.behavior_risk += 3; f.window_night_difficulty = true; break;
    case 'fim_semana': s.behavior_risk += 2; s.routine_need += 1; break;
  }

  // 11. preferred_plan_style
  switch (answers.preferred_plan_style) {
    case 'simples': s.readiness -= 1; f.prefers_simple = true; break;
    case 'gradual': s.readiness += 1; f.prefers_gradual = true; break;
    case 'firme': s.readiness += 2; f.prefers_structured = true; break;
    case 'adaptavel': s.routine_need += 2; f.prefers_flexible = true; break;
  }

  // 12. fasting_response
  switch (answers.fasting_response) {
    case 'normal': s.fasting_tolerance += 2; break;
    case 'fome_lido': s.fasting_tolerance += 1; break;
    case 'sem_energia': s.fasting_tolerance -= 2; break;
    case 'irritada_dor': s.fasting_tolerance -= 3; s.behavior_risk += 2; break;
  }

  return { scores: s, flags: f };
}

// ---- Profile classification ----

type ProfileType = 'inicio_leve' | 'progressivo' | 'flexivel' | 'estruturado' | 'alta_vulnerabilidade';

function classifyProfile(s: Scores): ProfileType {
  // Priority order: alta_vulnerabilidade > flexivel > inicio_leve > estruturado > progressivo
  if (s.behavior_risk >= 5) return 'alta_vulnerabilidade';
  if (s.routine_need >= 3) return 'flexivel';
  if (s.fasting_tolerance <= -2 || (s.fasting_tolerance <= -1 && s.behavior_risk >= 2)) return 'inicio_leve';
  if (s.fasting_tolerance >= 3 && s.readiness >= 3 && s.behavior_risk <= 1) return 'estruturado';
  return 'progressivo';
}

// ---- Protocol hours ----

function protocolHours(profile: ProfileType, s: Scores): number {
  switch (profile) {
    case 'alta_vulnerabilidade':
    case 'flexivel':
      return 12;
    case 'inicio_leve':
      return 12;
    case 'progressivo':
      if (s.fasting_tolerance >= 2 && s.readiness >= 2) return 14;
      if (s.fasting_tolerance >= 1) return 13;
      return 12;
    case 'estruturado':
      if (s.fasting_tolerance >= 4 && s.behavior_risk <= 0) return 16;
      return 14;
  }
}

// ---- Schedule ----

function buildSchedule(hours: number, flags: Flags): { start: string; end: string; label: string } {
  if (flags.prefers_skipping_morning) {
    const endH = 12 + (24 - hours > 12 ? 0 : 24 - hours - 12 >= 0 ? 0 : 0);
    // eating window starts at 12, ends at 12 + (24-hours)
    const windowSize = 24 - hours;
    const eatEnd = 12 + windowSize;
    return { start: `${eatEnd}:00`, end: '12:00', label: `Das ${eatEnd}h às 12h` };
  }
  if (flags.prefers_skipping_night) {
    const windowSize = 24 - hours;
    const eatEnd = 8 + windowSize;
    return { start: `${eatEnd}:00`, end: '08:00', label: `Das ${eatEnd}h às 8h` };
  }
  // Default schedules
  if (hours <= 12) return { start: '20:00', end: '08:00', label: 'Das 20h às 8h' };
  if (hours <= 14) return { start: '20:00', end: '10:00', label: 'Das 20h às 10h' };
  return { start: '20:00', end: '12:00', label: 'Das 20h às 12h' };
}

// ---- Weekly goal ----

function weeklyGoal(profile: ProfileType, s: Scores): number {
  if (profile === 'alta_vulnerabilidade' || (s.behavior_risk >= 4 && s.fasting_tolerance <= -2)) return 4;
  if (profile === 'estruturado' || profile === 'progressivo') return 6;
  return 5;
}

// ---- Behavior alerts ----

function buildAlerts(answers: QuizAnswers, flags: Flags, s: Scores): string[] {
  const alerts: string[] = [];
  if (flags.window_night_difficulty) alerts.push('Maior dificuldade no período da noite');
  if (answers.snacking_frequency === 'com_frequencia' || answers.snacking_frequency === 'varias_vezes')
    alerts.push('Tendência a beliscar entre refeições');
  if (answers.main_food_barrier === 'fim_semana') alerts.push('Risco de desorganização aos fins de semana');
  if (s.fasting_tolerance <= -2) alerts.push('Baixa tolerância à fome');
  if (answers.routine_break_response === 'desando_dia' || answers.routine_break_response === 'demoro_retomar')
    alerts.push('Tendência a perder constância quando sai da rotina');
  if (s.routine_need >= 3) alerts.push('Necessidade de plano mais flexível');
  if (answers.main_food_barrier === 'fome_emocional' || answers.main_food_barrier === 'ansiedade')
    alerts.push('Adaptação emocional importante no início');
  return alerts;
}

// ---- Dynamic tags ----

function buildTags(s: Scores, flags: Flags): string[] {
  const tags: string[] = [];
  if (s.fasting_tolerance <= -1) tags.push('baixa_tolerancia');
  if (s.routine_need >= 3) tags.push('rotina_instavel');
  if (s.behavior_risk >= 3) tags.push('risco_comportamental');
  if (flags.prefers_simple) tags.push('prefere_simples');
  if (flags.prefers_gradual) tags.push('prefere_gradual');
  if (flags.prefers_structured) tags.push('prefere_estruturado');
  if (flags.prefers_flexible) tags.push('prefere_flexivel');
  if (s.readiness >= 3) tags.push('alta_prontidao');
  return tags;
}

// ---- Profile metadata ----

const profileMeta: Record<ProfileType, {
  label: string;
  focus: string;
  summary: string;
  title: string;
  support_style: string;
  plan_style: string;
}> = {
  inicio_leve: {
    label: 'Início Leve',
    focus: 'consistencia',
    title: 'Seu plano ideal para começar é leve e progressivo',
    summary: 'Seu resultado mostra que o melhor caminho agora é começar com uma estratégia simples, sustentável e fácil de encaixar. Antes de intensificar, o mais importante é construir adaptação e constância.',
    support_style: 'acolhedor',
    plan_style: 'leve',
  },
  progressivo: {
    label: 'Progressivo',
    focus: 'emagrecimento_gradual',
    title: 'Seu perfil responde melhor a um plano gradual com evolução',
    summary: 'Você já mostra sinais de boa prontidão para avançar de forma estratégica. O ideal para você é começar com um protocolo que gere resultado, mas ainda preserve consistência.',
    support_style: 'encorajador',
    plan_style: 'gradual',
  },
  flexivel: {
    label: 'Flexível',
    focus: 'adaptacao',
    title: 'Seu plano ideal precisa se adaptar à sua rotina',
    summary: 'Seu resultado mostra que rigidez excessiva pode atrapalhar sua constância. Por isso, seu plano foi desenhado para funcionar com mais flexibilidade e menos pressão.',
    support_style: 'pratico',
    plan_style: 'flexivel',
  },
  estruturado: {
    label: 'Estruturado',
    focus: 'eficiencia',
    title: 'Seu perfil permite um plano mais estratégico desde o início',
    summary: 'Você mostra boa tolerância, mais preparo e uma rotina que favorece um protocolo mais estruturado. Seu plano pode começar com mais eficiência sem perder sustentabilidade.',
    support_style: 'direto',
    plan_style: 'estruturado',
  },
  alta_vulnerabilidade: {
    label: 'Alta Vulnerabilidade Comportamental',
    focus: 'estabilidade',
    title: 'Seu plano ideal precisa priorizar estabilidade antes de intensidade',
    summary: 'Seu resultado indica que o mais importante agora não é forçar um jejum mais longo, mas construir uma base segura para evitar exageros, frustração e abandono.',
    support_style: 'acolhedor',
    plan_style: 'protecao',
  },
};

// ---- Progression text ----

function progressionText(hours: number): string {
  if (hours <= 12) return 'Avançar para 13 horas após boa adaptação';
  if (hours <= 13) return 'Avançar para 14 horas após consistência';
  if (hours <= 14) return 'Manter 14h e avaliar evolução para 16h';
  return 'Manter 16h e monitorar resultados';
}

// ============================================================
// MAIN FUNCTION
// ============================================================

export function generateMetabolicFastingPlan(answers: QuizAnswers): QuizResult {
  const { scores, flags } = score(answers);
  const profile = classifyProfile(scores);
  const hours = protocolHours(profile, scores);
  const schedule = buildSchedule(hours, flags);
  const meta = profileMeta[profile];

  return {
    profile_type: profile,
    profile_label: meta.label,
    plan_focus: meta.focus,
    recommended_protocol_hours: hours,
    protocol_label: `${hours} horas de jejum`,
    schedule_start: schedule.start,
    schedule_end: schedule.end,
    schedule_label: schedule.label,
    weekly_goal_days: weeklyGoal(profile, scores),
    progression_next_step: progressionText(hours),
    behavior_alerts: buildAlerts(answers, flags, scores),
    reason_summary: meta.summary,
    support_style: meta.support_style,
    plan_style: meta.plan_style,
    dynamic_tags: buildTags(scores, flags),
  };
}

// Export profile titles for result page
export const profileTitles: Record<string, string> = Object.fromEntries(
  Object.entries(profileMeta).map(([k, v]) => [k, v.title])
);
