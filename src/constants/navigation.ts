export const navigation = [
  { href: '/', label: 'Главная', group: 'home' },
  { href: '/about/general-information/', label: 'О фонде', group: 'about' },
  { href: '/how-to-support/', label: 'Как поддержать', group: 'support' },
  {
    href: '/project/all-project/',
    label: 'Целевые капиталы',
    group: 'projects',
  },
  {
    href: '/results/',
    label: 'Проекты и результаты',
    group: 'results',
  },
  { href: '/news/', label: 'Новости и истории', group: 'news' },
  {
    href: '/about/constituent-the-documents/',
    label: 'Документы и отчётность',
    group: 'documents',
  },
  {
    href: '/about/governing-bodies/',
    label: 'Команда',
    group: 'governance',
  },
  { href: '/answers-on-questions/', label: 'Вопросы и ответы', group: 'faq' },
  { href: '/contacts-and-requisites/', label: 'Контакты', group: 'contacts' },
] as const;
