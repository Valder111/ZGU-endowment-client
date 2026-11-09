import content from '@/constants/legal-content.json';

export const foundationDetails = {
  fullName:
    'Специализированный фонд управления целевым капиталом для развития и поддержки Заполярного государственного университета им. Н.М. Федоровского',
  shortName: 'Эндаумент-фонд ЗГУ',
  director: 'Кистнер Елена Владимировна',
  address:
    '663305, Красноярский край, г. Норильск, Ленинский проспект, д. 1, помещение 670',
  inn: '2457093311',
  kpp: '245701001',
  ogrn: '1262400010531',
  bank: 'Красноярское отделение № 8646 ПАО Сбербанк',
  account: '40703810531710000670',
  correspondentAccount: '30101810800000000627',
  bik: '040407627',
  paymentPurpose:
    'Пожертвование на пополнение целевого капитала Эндаумент-фонда ЗГУ при публичном сборе денежных средств',
} as const;

export type LegalDocumentId = keyof typeof content;
export const legalDocuments = [
  {
    id: 'offer',
    path: '/documents/offer/',
    title: 'Договор пожертвования и оферта',
    shortTitle: 'Оферта',
    description:
      'Условия пожертвования, права жертвователя и обязанности фонда. Полный текст включает оба приложения и заявление о присоединении для юридических лиц.',
    fileStem: 'donation-offer',
    approvalPending: true,
  },
  {
    id: 'privacy',
    path: '/documents/privacy/',
    title: 'Политика обработки персональных данных',
    shortTitle: 'Персональные данные',
    description:
      'Цели и основания обработки данных, меры защиты и права субъектов персональных данных.',
    fileStem: 'privacy-policy',
    approvalPending: true,
  },
  {
    id: 'consent',
    path: '/documents/consent/',
    title: 'Согласие на обработку персональных данных',
    shortTitle: 'Согласие на обработку данных',
    description:
      'Форма согласия, перечень обрабатываемых данных, срок действия и порядок отзыва.',
    fileStem: 'personal-data-consent',
    approvalPending: false,
  },
  {
    id: 'payment-security',
    path: '/documents/payment-security/',
    title: 'Политика безопасности платежей',
    shortTitle: 'Безопасность платежей',
    description:
      'Защита платежей через Best2Pay, платёжные системы, возврат средств и информация о платёжном агрегаторе.',
    fileStem: 'payment-security',
    approvalPending: false,
  },
] as const satisfies readonly {
  id: LegalDocumentId;
  path: string;
  title: string;
  shortTitle: string;
  description: string;
  fileStem: string;
  approvalPending: boolean;
}[];

export function legalDocument(id: LegalDocumentId) {
  return legalDocuments.find((document) => document.id === id)!;
}

export function documentFile(stem: string, format: 'pdf' | 'docx') {
  return `/documents/${stem}.${format}`;
}

export const legalContent = content;
