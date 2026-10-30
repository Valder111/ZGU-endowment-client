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
            Студенческие достижения, инженерная практика и&nbsp;исследования
            Арктики — узнайте, чем живёт Заполярный университет.
          </p>
          <p>
            Истории ЗГУ помогают увидеть задачи, вокруг которых объединяется
            сообщество, и&nbsp;выбрать близкое направление участия.
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
              и&nbsp;Арктики.
            </span>
          </li>
          <li>
            <strong>Подготовьте план</strong>
            <span>Команда, этапы, бюджет и&nbsp;измеримый результат.</span>
          </li>
          <li>
            <strong>Уточните условия отбора</strong>
            <span>
              Уточните у&nbsp;команды подходящий формат, сроки и&nbsp;критерии
              рассмотрения инициативы.
            </span>
          </li>
          <li>
            <strong>Предусмотрите отчётность</strong>
            <span>
              Как вы&nbsp;подтвердите расходы и&nbsp;покажете результат.
            </span>
          </li>
        </ol>
        <p>
          Направьте идею через общие контакты ЗГУ для обсуждения с&nbsp;командой
          фонда. Обращение помогает начать диалог; решение о&nbsp;финансировании
          принимается отдельно.
        </p>
        <SiteLink className="text-link" href="/contacts-and-requisites/">
          Обсудить инициативу ↗
        </SiteLink>
      </section>
      <IncomeCycle />
    </div>
  );
}
