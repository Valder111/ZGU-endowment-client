import tarasevich from '@/assets/images/editorial/team-tarasevich.webp';
import zemzyulina from '@/assets/images/editorial/team-zemzyulina-portrait.jpg';
import belyaev from '@/assets/images/editorial/team-belyaev.webp';
import dolzhenko from '@/assets/images/editorial/team-dolzhenko.jpg';
import makukha from '@/assets/images/editorial/team-makukha.webp';
import mironov from '@/assets/images/editorial/team-mironov.webp';
import blinova from '@/assets/images/editorial/team-blinova.webp';
import sidelnikov from '@/assets/images/editorial/team-sidelnikov.webp';
import kiselev from '@/assets/images/editorial/team-kiselev.webp';
import polyakov from '@/assets/images/editorial/team-polyakov.webp';
import snytkin from '@/assets/images/editorial/team-snytkin.webp';

export type FoundationPerson = {
  name: string;
  role?: string;
  image?: string;
  position?: string;
  mirrored?: boolean;
  monogram?: string;
};

export const foundationTeam: readonly FoundationPerson[] = [
  {
    name: 'Наталья Земзюлина',
    role: 'Коммуникации фонда',
    image: zemzyulina,
    mirrored: true,
  },
  {
    name: 'Игорь Беляев',
    role: 'ИТ-сопровождение фонда',
    image: belyaev,
  },
  {
    name: 'Дарья Маслякова',
    role: 'Юридическое сопровождение фонда',
    monogram: 'ДМ',
  },
  {
    name: 'Елена Долженко',
    role: 'Участница команды фонда',
    image: dolzhenko,
  },
];

export const foundationDevelopers: readonly FoundationPerson[] = [
  { name: 'Максим Сидельников', image: sidelnikov },
  { name: 'Иван Киселёв', image: kiselev },
  { name: 'Никита Поляков', image: polyakov },
  { name: 'Илья Сныткин', image: snytkin },
];

export const foundationCouncil: readonly FoundationPerson[] = [
  {
    name: 'Анна Макуха',
    role: 'Директор фонда целевого капитала «Наш Норильск»',
    image: makukha,
    position: 'center',
  },
  {
    name: 'Максим Миронов',
    role: 'Директор Агентства развития Норильска',
    image: mironov,
    position: 'center 10%',
  },
  {
    name: 'Светлана Блинова',
    role: 'Директор Политехнического колледжа ЗГУ',
    image: blinova,
  },
  {
    name: 'Аркадий Тарасевич',
    role: 'Проректор по научной работе и международной деятельности ЗГУ',
    image: tarasevich,
  },
];

export type FoundationDocument = {
  id: string;
  title: string;
  category: string;
  description: string;
  href?: string;
  fileStem?: string;
};

export const foundationDocuments: readonly FoundationDocument[] = [
  {
    id: 'charter',
    title: 'Устав фонда',
    category: 'Учредительные',
    description: 'Цели фонда, полномочия органов управления и правила работы',
  },
  {
    id: 'registration',
    title: 'Карточка фонда',
    category: 'Учредительные',
    description: 'Полное наименование, ИНН, КПП, ОГРН и банковские реквизиты',
    href: '/contacts-and-requisites/#registration',
    fileStem: 'foundation-details',
  },
  {
    id: 'offer',
    href: '/documents/offer/',
    fileStem: 'donation-offer',
    title: 'Договор пожертвования и оферта',
    category: 'Пожертвования',
    description:
      'Назначение пожертвования, условия участия и предусмотренные основания возврата',
  },
  {
    id: 'privacy',
    href: '/documents/privacy/',
    fileStem: 'privacy-policy',
    title: 'Политика обработки персональных данных',
    category: 'Пожертвования',
    description: 'Условия обработки и защиты персональных данных',
  },
  {
    id: 'consent',
    title: 'Согласие на обработку персональных данных',
    category: 'Пожертвования',
    description: 'Форма согласия, перечень данных и порядок отзыва',
    href: '/documents/consent/',
    fileStem: 'personal-data-consent',
  },
  {
    id: 'payment-security',
    title: 'Политика безопасности платежей',
    category: 'Пожертвования',
    description: 'Защита платежей через Best2Pay и порядок возврата средств',
    href: '/documents/payment-security/',
    fileStem: 'payment-security',
  },
  {
    id: 'bank',
    href: '/contacts-and-requisites/#requisites',
    fileStem: 'foundation-details',
    title: 'Банковские реквизиты фонда',
    category: 'Пожертвования',
    description: 'Получатель, расчётный счёт, банк и назначение платежа',
  },
  {
    id: 'annual',
    title: 'Годовой отчёт',
    category: 'Отчётность',
    description: 'Капитал, доход, направления поддержки и результаты проектов',
  },
  {
    id: 'financial',
    title: 'Бухгалтерская отчётность',
    category: 'Отчётность',
    description: 'Финансовые сведения за отчётный период',
  },
  {
    id: 'audit',
    title: 'Аудиторское заключение',
    category: 'Отчётность',
    description:
      'Заключение независимого аудитора о финансовой отчётности фонда',
  },
  {
    id: 'manager',
    title: 'Информация об управляющей компании',
    category: 'Управление',
    description:
      'Наименование, лицензия, условия доверительного управления и отчётность',
  },
] as const;

export const documentCategories = [
  ...new Set(foundationDocuments.map(({ category }) => category)),
];

export const incomeCycle = [
  {
    title: 'Отчёт управляющей компании',
    who: 'Управляющая компания',
    text: 'Результат управления и сведения о стоимости капитала становятся основой для планирования. Доход может быть положительным, нулевым или отрицательным.',
    result: 'Данные о результате управления',
  },
  {
    title: 'План использования дохода',
    who: 'Команда фонда',
    text: 'Готовится предложение по направлениям поддержки, расходам и сохранению устойчивости капитала с учётом договоров пожертвования.',
    result: 'Проект финансового плана',
  },
  {
    title: 'Утверждение решения',
    who: 'Уполномоченный орган фонда',
    text: 'План рассматривается уполномоченным органом фонда и утверждается в соответствии с уставом.',
    result: 'Утверждённый план и решение',
  },
  {
    title: 'Передача средств университету',
    who: 'Фонд и университет',
    text: 'Оформляется договор с целями поддержки, условиями использования средств и требованиями к отчётности получателя.',
    result: 'Целевой договор',
  },
  {
    title: 'Реализация программ',
    who: 'Университет и команды проектов',
    text: 'Получатели реализуют согласованные программы: от стипендий и исследований до развития университетской среды.',
    result: 'Результаты программ и подтверждающие документы',
  },
  {
    title: 'Публичный отчёт',
    who: 'Фонд',
    text: 'Информация о полученном доходе, расходах и результатах размещается в отчётности. Так можно проследить весь путь поддержки.',
    result: 'Открытый отчёт о результатах',
  },
] as const;
