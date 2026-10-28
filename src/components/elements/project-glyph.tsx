import { StudentsSymbol } from '@/assets/svg/students-symbol';
import { ScienceSymbol } from '@/assets/svg/science-symbol';
import { CampusSymbol } from '@/assets/svg/campus-symbol';
import { AlumniSymbol } from '@/assets/svg/alumni-symbol';
import type { ProjectId } from '@/types/content';

const symbols = {
  students: StudentsSymbol,
  science: ScienceSymbol,
  campus: CampusSymbol,
  alumni: AlumniSymbol,
};
export function ProjectGlyph({ id }: { id: ProjectId }) {
  const Symbol = symbols[id];
  return <Symbol />;
}
