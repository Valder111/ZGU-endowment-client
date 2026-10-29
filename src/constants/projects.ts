import type { Project } from '@/types/content';
export const projects = [
  {
    id: 'students',
    category: 'ОБРАЗОВАНИЕ',
    number: '01',
    title: 'Стипендии для студентов Арктики',
    description:
      'Поддержка студентов, которые готовы учиться, исследовать и создавать будущее Севера.',
    color: 'aqua',
    symbol: '↗',
  },
  {
    id: 'science',
    category: 'НАУКА',
    number: '02',
    title: 'Наука и инженерия для Арктики',
    description:
      'Исследования вечной мерзлоты, инженерные разработки и экологические задачи Норильска и северных территорий.',
    color: 'blue',
    symbol: '✳',
  },
  {
    id: 'campus',
    category: 'УНИВЕРСИТЕТСКАЯ СРЕДА',
    number: '03',
    title: 'Кампус и студенческая среда',
    description:
      'Современные пространства для совместной работы, общения и развития университетского сообщества.',
    color: 'navy',
    symbol: '⌘',
  },
  {
    id: 'alumni',
    category: 'СООБЩЕСТВО',
    number: '04',
    title: 'Связь выпускников',
    description:
      'Выпускники, студенты и партнёры ЗГУ — вместе ради новых возможностей.',
    color: 'orange',
    symbol: '∞',
  },
] as const satisfies readonly Project[];
