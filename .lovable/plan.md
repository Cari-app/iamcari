

## Plano: Remover funcionalidades de Dieta e focar no Jejum

### Resumo
Transformar o Cari de um app de dieta + jejum para um app focado exclusivamente em **jejum intermitente**, removendo toda a parte de dieta/refeições/calorias/macros. Adicionar uma nova aba "Conteúdo" (placeholder para futuro).

### O que será removido

**Páginas inteiras a deletar:**
- `src/pages/NutritionQuiz.tsx` — quiz de nutrição
- `src/pages/DietResult.tsx` — resultado de dieta
- `src/pages/ExploreDiets.tsx` — explorar dietas
- `src/pages/DietDetail.tsx` — detalhe de dieta

**Componentes a deletar:**
- `src/components/dashboard/CalorieHeader.tsx` — header de calorias
- `src/components/dashboard/MacroCards.tsx` — cards de macros
- `src/components/dashboard/MealCard.tsx` — card de refeição
- `src/components/diary/MealInputDialog.tsx` — input de refeição
- `src/components/diary/MealEditDialog.tsx` — edição de refeição
- `src/components/FloatingActionButton.tsx` — FAB de adicionar refeição

**Edge Function a deletar:**
- `supabase/functions/analyze-meal/index.ts`

### O que será modificado

**1. `src/App.tsx`** — Remover rotas de dieta (`/nutrition-quiz`, `/diet-result`, `/diets`, `/diet-detail`). Redirecionar `/` para `/fasting`. Adicionar rota `/content` (nova aba).

**2. `src/components/BottomNav.tsx`** — Atualizar navegação:
- Remover "Dieta" (`/dashboard`)
- Manter "Jejum" (`/fasting`) como aba principal
- Manter "Progresso" (`/progress`)
- Adicionar "Conteúdo" (`/content`) com ícone BookOpen
- Manter "Perfil" (`/profile`)

**3. `src/pages/Dashboard.tsx`** — Remover completamente ou redirecionar para `/fasting` (a página de Fasting já existe e é completa)

**4. `src/pages/Fasting.tsx`** — Passa a ser a home principal do app. Sem mudanças estruturais necessárias.

**5. `src/pages/Progress.tsx`** — Remover toda a parte de diary/refeições (MealInputDialog, MealEditDialog, tabs de refeição). Manter apenas stats de jejum, heatmap, e histórico de conquistas.

**6. `src/pages/Profile.tsx`** — Remover seção de "Dieta Ativa", referências a `active_diet`, links para `/diets`. Manter dados biométricos e configurações de jejum.

**7. `src/pages/Onboarding.tsx`** — Remover steps relacionados a calorias/dieta (goal type, goal speed, calorie calculation). Simplificar para coletar apenas dados básicos (nome, biometria) e preferência de protocolo de jejum.

**8. `src/pages/Assessment.tsx`** — Simplificar ou remover. O cálculo de BMR/TDEE/calorias não é mais necessário. Pode ser convertido para um assessment de jejum simples.

**9. `src/components/ProtectedRoute.tsx`** — Remover check de `daily_calories_target` que redireciona para `/assessment`. Manter apenas check de `onboarding_completed`.

**10. `src/types/index.ts`** — Remover tipos relacionados a meal/diet (MealLog, AIAnalysis, TimelineEntry meal props). Manter tipos de jejum.

**11. Nova página `src/pages/Content.tsx`** — Página placeholder com mensagem "Em breve" para futuros conteúdos.

### Fluxo do app após mudança

```text
Login → Onboarding (dados básicos + protocolo jejum) → Fasting (home)
                                                          ↓
                                    BottomNav: [Jejum] [Progresso] [Conteúdo] [Perfil]
```

### Arquivos que NÃO mudam
- Componentes de jejum (CircularProgress, ProtocolSelector, useFastingTimer)
- Componentes de mood/water/weight logs (mantidos no Progress)
- Auth, Theme, Date contexts
- Supabase client/types

