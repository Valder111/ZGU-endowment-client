import type { NewsItem } from '@/types/content';
import { assets } from '@/constants/assets';
export const news: readonly NewsItem[] = [
  {
    title: 'Студенты ЗГУ — стипендиаты России ↗',
    description:
      'Семь студентов получают стипендии Президента и Правительства России.',
    href: 'https://polaruniversity.ru/news/studenty-zgu-stipendiaty-rossii/',
    image: assets.scholarshipNews,
  },
  {
    title: 'Знакомство с будущей профессией ↗',
    description:
      'Школьники Норильска познакомились с направлениями подготовки Политехнического колледжа ЗГУ.',
    href: 'https://polaruniversity.ru/news/professionalitet-edinyy-den-otkrytykh-dverey-/',
    image: assets.openDayNews,
  },
  {
    title: 'Евгений Голубев назначен и. о. ректора ТюмГУ ↗',
    description:
      'Сообщение о кадровом решении опубликовано на сайте университета.',
    href: 'https://polaruniversity.ru/news/evgeniy-golubev-naznachen-na-dolzhnost-i-o-rektora-tyumgu/',
    image: assets.rectorNews,
  },
];
