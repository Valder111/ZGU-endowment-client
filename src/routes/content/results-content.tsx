import { UniversityStories } from '@/components/elements/university-stories';
import { SiteLink } from '@/components/elements/site-link';
import { IncomeCycle } from '@/components/elements/income-cycle';
export function ResultsContent() {
  return (
    <div className="wrap article-content">
      <div className="intro-grid">
        <h2>Идеи университета становятся общим делом</h2>
        <div>
          <p className="lead">
            Здесь появятся программы, получатели поддержки и&nbsp;результаты
            использования дохода фонда.
          </p>
          <p>
            Подтверждённые результаты финансирования пока не&nbsp;предоставлены.
            Ниже — реальные истории университета, которые помогают понять
            возможные направления поддержки.
          </p>
          <SiteLink className="button primary" href="/project/all-project/">
            Выбрать целевой капитал ↗
          </SiteLink>
        </div>
      </div>
      <UniversityStories />
      <section className="application-guide editorial-section">
        <span className="eyebrow">СТУДЕНТАМ И&nbsp;ИССЛЕДОВАТЕЛЯМ</span>
        <h2>Как предложить проект</h2>
        <ol>
          <li>
            <strong>Опишите задачу</strong>
            <span>
              Кому поможет проект и&nbsp;почему он&nbsp;важен для университета
              и&nbsp;Арктики
            </span>
          </li>
          <li>
            <strong>Подготовьте план</strong>
            <span>Команда, этапы, бюджет и&nbsp;измеримый результат</span>
          </li>
          <li>
            <strong>Уточните условия отбора</strong>
            <span>
              Действующие конкурсы, сроки и&nbsp;критерии будут опубликованы
              после утверждения
            </span>
          </li>
          <li>
            <strong>Предусмотрите отчётность</strong>
            <span>
              Как вы&nbsp;подтвердите расходы и&nbsp;покажете результат
            </span>
          </li>
        </ol>
        <p>
          Приём заявок на&nbsp;финансирование пока не&nbsp;объявлен. Для
          обсуждения инициативы используйте общие контакты ЗГУ.
        </p>
        <SiteLink className="text-link" href="/contacts-and-requisites/">
          Обсудить инициативу ↗
        </SiteLink>
      </section>
      <IncomeCycle />
    </div>
  );
}
