import { useEffect, type RefObject } from 'react';
/** Animation setup is scoped to the React tree and fully reverted on cleanup. */
export function useMotion(
  scope: RefObject<HTMLDivElement | null>,
  accessible: boolean,
) {
  useEffect(() => {
    if (accessible) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    async function setup() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      await document.fonts.ready;
      if (cancelled || !scope.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const root = scope.current;
      const all = <T extends Element = HTMLElement>(
        selector: string,
        parent: ParentNode = root,
      ) => Array.from(parent.querySelectorAll<T>(selector));
      const listeners: (() => void)[] = [];
      const media = gsap.matchMedia();
      dispose = () => {
        media.revert();
        listeners.forEach((cleanup) => cleanup());
      };
      media.add(
        {
          desktop: '(min-width: 900px)',
          fine: '(hover: hover) and (pointer: fine)',
          noMotion: '(prefers-reduced-motion: reduce)',
          standard: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          if (context.conditions?.noMotion) return;
          const desktop = context.conditions?.desktop;
          const fine = context.conditions?.fine;
          const off: (() => void)[] = [];
          function listen(
            element: Element,
            event: string,
            callback: EventListener,
          ) {
            element.addEventListener(event, callback);
            off.push(() => element.removeEventListener(event, callback));
          }
          const intro = gsap.timeline({
            defaults: { duration: 0.85, ease: 'power3.out' },
          });
          const hero = root.querySelector<HTMLElement>('.hero');
          if (hero) {
            listen(hero, 'focusin', () => {
              intro.progress(1);
            });
            intro
              .from(
                '.hero .eyebrow',
                { y: 15, opacity: 0, clearProps: 'transform,opacity' },
                0,
              )
              .from(
                '.headline-line',
                {
                  y: 48,
                  opacity: 0,
                  stagger: 0.1,
                  clearProps: 'transform,opacity',
                },
                0.1,
              )
              .from(
                '.hero-copy > p',
                { y: 18, opacity: 0, clearProps: 'transform,opacity' },
                0.45,
              )
              .from(
                '.hero-actions',
                { y: 15, opacity: 0, clearProps: 'transform,opacity' },
                0.6,
              )
              .from(
                '.polar-compass',
                {
                  scale: 0.9,
                  opacity: 0,
                  duration: 1.2,
                  clearProps: 'transform,opacity',
                },
                0.2,
              )
              .from(
                '.hero-caption',
                { y: 20, opacity: 0, clearProps: 'transform,opacity' },
                0.85,
              );
            const emblem = hero.querySelector<HTMLElement>('.polar-emblem');
            if (desktop && fine && emblem) {
              const xTo = gsap.quickTo(emblem, 'x', {
                duration: 0.6,
                ease: 'power3.out',
              });
              const yTo = gsap.quickTo(emblem, 'y', {
                duration: 0.6,
                ease: 'power3.out',
              });
              let bounds: DOMRect | undefined;
              listen(hero, 'pointerenter', () => {
                bounds = hero.getBoundingClientRect();
              });
              listen(hero, 'pointermove', (event) => {
                if (!bounds || !(event instanceof PointerEvent)) return;
                xTo((event.clientX - bounds.left - bounds.width / 2) * 0.016);
                yTo((event.clientY - bounds.top - bounds.height / 2) * 0.016);
              });
              listen(hero, 'pointerleave', () => {
                xTo(0);
                yTo(0);
              });
            }
          } else {
            intro.from(
              '.page-title .eyebrow, .page-title h1',
              {
                y: 25,
                opacity: 0,
                stagger: 0.08,
                clearProps: 'transform,opacity',
              },
              0,
            );
          }
          function reveal(
            targets: HTMLElement[],
            trigger: Element,
            stagger = 0.08,
          ) {
            if (!targets.length) return;
            const tween = gsap.from(targets, {
              y: 30,
              opacity: 0,
              duration: 0.8,
              stagger,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: { trigger, start: 'top 90%', once: true },
            });
            targets.forEach((element) =>
              listen(element, 'focusin', () => {
                tween.progress(1);
              }),
            );
          }
          all('main > section')
            .filter((section) => !section.matches('.hero, .page-title'))
            .forEach((section) => {
              all(
                '.section-heading, .mission-grid, .intro-grid, .cta-inner',
                section,
              ).forEach((element) => reveal([element], element));
              all(
                '.project-grid, .news-grid, .steps, .contact-grid',
                section,
              ).forEach((group) =>
                reveal(
                  all(':scope > article', group),
                  group,
                  desktop ? 0.09 : 0.04,
                ),
              );
              if (section.matches('.community'))
                reveal(all('.community-inner > div', section), section, 0.12);
              all('.empty-state, .faq', section).forEach((element) =>
                reveal([element], element),
              );
            });
          all('.steps').forEach((steps) => {
            const bar = steps.querySelector('.steps-progress');
            if (desktop && bar)
              gsap.fromTo(
                bar,
                { scaleX: 0 },
                {
                  scaleX: 1,
                  transformOrigin: 'left center',
                  ease: 'none',
                  scrollTrigger: {
                    trigger: steps,
                    start: 'top 85%',
                    end: 'bottom 50%',
                    scrub: 0.5,
                  },
                },
              );
          });
          gsap.to('.reading-progress', {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { start: 0, end: 'max', scrub: 0.2 },
          });
          if (fine) {
            all('.project-card').forEach((card) => {
              const symbol = card.querySelector('.project-symbol');
              if (!symbol) return;
              listen(card, 'pointerenter', () => {
                gsap.to(symbol, {
                  y: -6,
                  rotation: -4,
                  duration: 0.4,
                  ease: 'power2.out',
                  overwrite: 'auto',
                });
              });
              listen(card, 'pointerleave', () => {
                gsap.to(symbol, {
                  y: 0,
                  rotation: 0,
                  duration: 0.4,
                  ease: 'power2.out',
                  overwrite: 'auto',
                });
              });
            });
            all('.button').forEach((button) => {
              const arrow = button.querySelector('span');
              if (!arrow) return;
              listen(button, 'pointerenter', () => {
                gsap.to(arrow, {
                  x: 3,
                  y: -3,
                  duration: 0.22,
                  overwrite: 'auto',
                });
              });
              listen(button, 'pointerleave', () => {
                gsap.to(arrow, {
                  x: 0,
                  y: 0,
                  duration: 0.22,
                  overwrite: 'auto',
                });
              });
            });
          }
          return () => off.forEach((cleanup) => cleanup());
        },
        root,
      );
      all<HTMLImageElement>('img')
        .filter((img) => !img.complete)
        .forEach((img) => {
          const refresh = () => ScrollTrigger.refresh();
          img.addEventListener('load', refresh, { once: true });
          listeners.push(() => img.removeEventListener('load', refresh));
        });
      ScrollTrigger.refresh();
    }
    void setup().catch((error) => {
      dispose?.();
      console.error('Animation setup failed:', error);
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [scope, accessible]);
}
