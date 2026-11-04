import type { Project } from '@/types/content';
export const generalCapital = 'Общее развитие университета';

export const projects = [
  {
    id: 'students',
    category: 'ОБРАЗОВАНИЕ',
    number: '01',
    title: 'Стипендии для талантов',
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
    category: 'ИНФРАСТРУКТУРА',
    number: '03',
    title: 'Инфраструктура для развития',
    description:
      'Лаборатории, оборудование и пространства для исследований, практики и совместной работы.',
    color: 'navy',
    symbol: '⌘',
  },
  {
    id: 'alumni',
    category: 'СООБЩЕСТВО',
    number: '04',
    title: 'Связь выпускников',
    description:
      'Выпускники, студенты и партнёры ЗГУ – вместе ради новых возможностей.',
    color: 'orange',
    symbol: '∞',
  },
] as const satisfies readonly Project[];
