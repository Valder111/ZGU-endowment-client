import type { NewsItem } from '@/types/content';
import { assets } from '@/constants/assets';
import { editorialNews } from '@/constants/editorial-news';
import councilPhoto from '@/assets/images/editorial/fund-first-council.webp';
import governmentPhoto from '@/assets/images/editorial/government-plan-university.webp';
export const news: readonly NewsItem[] = [
  {
    title: editorialNews.council.title,
    description: editorialNews.council.subtitle,
    href: '/news/first-council/',
    image: councilPhoto,
  },
  {
    title: editorialNews.horizon.title,
    description: editorialNews.horizon.subtitle,
    href: '/news/endowment-horizon/',
    image: governmentPhoto,
  },
  {
    title: 'Никита Поляков – стипендиат Президента России',
    description:
      'Студент направления «Информационные системы и технологии» отмечен за достижения в учёбе и исследованиях.',
    href: '/news/presidential-scholarship/',
    image: assets.scholarshipNews,
  },
];

export const fundNewsArticles = {
  scholarship: {
    title: 'Никита Поляков – стипендиат Президента России',
    image: assets.scholarshipNews,
    caption: 'Выступление на мероприятии ЗГУ',
    lead: 'Никита Поляков, студент четвёртого курса направления «Информационные системы и технологии», удостоен стипендии Президента Российской Федерации.',
    paragraphs: [
      'О достижении студента сообщил официальный сайт Заполярного университета. Государственная стипендия отмечает успехи в обучении и исследовательской работе.',
      'Такие истории показывают, почему поддержка талантов важна для университета. У молодых специалистов должно быть больше возможностей сосредоточиться на сложных задачах, исследовать и делать первые самостоятельные открытия.',
    ],
    source:
      'https://polaruniversity.ru/news/studentam/aktivisty_zgu_gordost_rossii/',
  },
  council: {
    ...editorialNews.council,
    image: councilPhoto,
    caption: 'Первое заседание Совета Эндаумент-фонда ЗГУ',
    width: 1500,
    height: 1125,
  },
  horizon: {
    ...editorialNews.horizon,
    image: governmentPhoto,
    caption: 'Работа в лаборатории Заполярного государственного университета',
    width: 1500,
    height: 1000,
  },
} as const;
