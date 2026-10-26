import { faqItems } from '@/constants/faq';
export function FaqContent() {
  return (
    <div className="wrap article-content">
      <div className="faq">
        {faqItems.map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
