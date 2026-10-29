export type ProjectId = 'students' | 'science' | 'campus' | 'alumni';
export interface Project {
  id: ProjectId;
  category: string;
  number: string;
  title: string;
  description: string;
  color: 'aqua' | 'blue' | 'navy' | 'orange';
  symbol: string;
}
export interface NewsItem {
  title: string;
  description: string;
  href: string;
  image: string;
}
export interface FaqItem {
  category: string;
  question: string;
  answer: string;
  href?: string;
  link?: string;
}
export type PageKind =
  | 'home'
  | 'about'
  | 'projects'
  | 'project'
  | 'partners'
  | 'news'
  | 'faq'
  | 'contacts'
  | 'events'
  | 'support'
  | 'documents'
  | 'reporting'
  | 'governance'
  | 'management'
  | 'results'
  | 'pending';
export interface PageDefinition {
  path: string;
  kind: PageKind;
  title: string;
  eyebrow: string;
  projectId?: ProjectId;
  showNote?: boolean;
}

export type PageGroup = Omit<PageDefinition, 'path'> & {
  paths: readonly string[];
};
