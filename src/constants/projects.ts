import type { Project } from '@/types/content';
export const projects = [
  {
    id: 'students',
    category: 'ОБРАЗОВАНИЕ',
    number: '01',
    title: 'Точка опоры для талантов',
    description:
      'Поддержка студентов, которые готовы учиться, исследовать и создавать будущее Севера.',
    color: 'aqua',
    symbol: '↗',
  },
  {
    id: 'science',
    category: 'НАУКА',
    number: '02',
    title: 'Решения для Арктики',
    description:
      'Идеи молодых исследователей, инженерные разработки и проекты для северных территорий.',
    color: 'blue',
    symbol: '✳',
  },
  {
    id: 'campus',
    category: 'УНИВЕРСИТЕТСКАЯ СРЕДА',
    number: '03',
    title: 'Место, где рождаются идеи',
    description:
      'Современные пространства для совместной работы, общения и развития университетского сообщества.',
    color: 'navy',
    symbol: '⌘',
  },
  {
    id: 'alumni',
    category: 'СООБЩЕСТВО',
    number: '04',
    title: 'Связь, которая остаётся',
    description:
      'Выпускники, студенты и партнёры ЗГУ — вместе ради новых возможностей.',
    color: 'orange',
    symbol: '∞',
  },
] as const satisfies readonly Project[];
