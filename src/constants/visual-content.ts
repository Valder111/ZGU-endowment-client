import type { ArtworkScene } from '@/assets/svg/editorial-artwork';
import type { PageDefinition, PageKind, ProjectId } from '@/types/content';

const pageScenes: Record<PageKind, ArtworkScene> = {
  home: 'endowment',
  about: 'endowment',
  projects: 'science',
  project: 'students',
  partners: 'alumni',
  news: 'news',
  faq: 'questions',
  contacts: 'contacts',
  events: 'events',
  pending: 'documents',
};

export function artworkForPage(page?: PageDefinition): ArtworkScene {
  return page?.projectId ?? (page ? pageScenes[page.kind] : 'contacts');
}

export const projectFocus = {
  students: [
    {
      title: 'Дать уверенность',
      text: 'Чтобы у студентов было больше пространства для учёбы и профессионального роста.',
    },
    {
      title: 'Заметить талант',
      text: 'Чтобы смелая идея могла стать началом исследовательского пути.',
    },
    {
      title: 'Открыть горизонт',
      text: 'Чтобы первые шаги в профессии вели к новым возможностям на Севере.',
    },
  ],
  science: [
    {
      title: 'Задать вопрос',
      text: 'Поддержать интерес к задачам, которые важны для северных территорий.',
    },
    {
      title: 'Найти решение',
      text: 'Дать инженерным идеям и исследовательским замыслам пространство для развития.',
    },
    {
      title: 'Сделать шаг',
      text: 'Помочь молодым исследователям двигаться от гипотезы к проекту.',
    },
  ],
  campus: [
    {
      title: 'Встречаться',
      text: 'Создавать среду для диалога студентов, преподавателей и выпускников.',
    },
    {
      title: 'Работать вместе',
      text: 'Развивать пространства, в которых удобно обсуждать и проверять идеи.',
    },
    {
      title: 'Чувствовать связь',
      text: 'Делать университет местом, к которому хочется быть причастным.',
    },
  ],
  alumni: [
    {
      title: 'Делиться опытом',
      text: 'Сохранять связь между теми, кто уже нашёл свой путь, и теми, кто его начинает.',
    },
    {
      title: 'Находить своих',
      text: 'Объединять людей вокруг университета и общих ценностей.',
    },
    {
      title: 'Продолжать историю',
      text: 'Превращать память об университете в участие в его будущем.',
    },
  ],
} as const satisfies Record<
  ProjectId,
  readonly { title: string; text: string }[]
>;
