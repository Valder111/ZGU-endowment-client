/** Illustrative figures requested for the design preview; not actual fund results. */
export const fundActivitySummary = { isDemo: true, target: 5_000_000 };
export const fundActivity = [
  {
    id: 'capital',
    label: 'Объём капитала',
    value: 3_200_000,
    unit: '₽',
    description:
      'Средства, которые формируют основу долгосрочной поддержки университета.',
    detail:
      'В этом примере собрано 64% от условной цели. Поддержка каждого участника приближает следующий этап.',
  },
  {
    id: 'donors',
    label: 'Благотворители',
    value: 128,
    unit: '',
    description:
      'Люди и организации, которые участвуют в развитии университета.',
    detail:
      'За каждой цифрой — участие выпускников, друзей и партнёров университета. Количество приведено для примера.',
  },
  {
    id: 'projects',
    label: 'Поддержанные проекты',
    value: 7,
    unit: '',
    description:
      'Инициативы, получившие поддержку за счёт дохода целевого капитала.',
    detail:
      'Образование, исследования, университетская среда и сообщество — направления возможной поддержки. Число проектов условное.',
  },
  {
    id: 'support',
    label: 'Передано университету',
    value: 240_000,
    unit: '₽',
    description: 'Доход целевого капитала, направленный на цели университета.',
    detail:
      'Пример того, как доход капитала может поддерживать университет. Указанная сумма не является отчётным результатом.',
  },
] as const satisfies readonly {
  id: string;
  label: string;
  value: number | null;
  unit: string;
  description: string;
  detail: string;
}[];
