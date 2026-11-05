import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';

export function CategoryField({
  value,
  categories,
  required,
  disabled,
  onChange,
  onAdd,
}: {
  value: string;
  categories: string[];
  required?: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onAdd: (value: string) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [active, setActive] = useState(-1);
  const visible = open && !disabled;
  const trimmed = text.trim();
  const normalized = trimmed.toLocaleLowerCase('ru');
  const matches = categories.filter((category) =>
    category.toLocaleLowerCase('ru').includes(filter),
  );
  const canAdd =
    Boolean(trimmed) &&
    [...trimmed].length <= 100 &&
    !categories.some(
      (category) => category.toLocaleLowerCase('ru') === normalized,
    );
  const options = matches.map((name) => ({ name, create: false }));
  if (canAdd) options.push({ name: trimmed, create: true });

  function show() {
    setFilter('');
    setActive(-1);
    setOpen(true);
  }

  function pick(option: { name: string; create: boolean }) {
    if (option.create) onAdd(option.name);
    setText(option.name);
    if (text !== option.name) onChange(option.name);
    input.current?.focus();
    setOpen(false);
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' && visible) {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      if (!visible) show();
      const count = visible
        ? options.length
        : categories.length + Number(canAdd);
      if (count) {
        const next =
          active < 0 || !visible
            ? direction === 1
              ? 0
              : count - 1
            : (active + direction + count) % count;
        setActive(next);
        window.requestAnimationFrame(() =>
          document
            .getElementById(`${id}-option-${next}`)
            ?.scrollIntoView({ block: 'nearest' }),
        );
      }
    } else if (event.key === 'Enter' && visible) {
      const option = options[active] ?? (canAdd ? options.at(-1) : undefined);
      if (option) {
        event.preventDefault();
        pick(option);
      }
    }
  }

  return (
    <div
      className="staff-field staff-category"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label htmlFor={id}>Категория</label>
      <div className="staff-category-control">
        <input
          id={id}
          ref={input}
          name="category"
          value={text}
          required={required}
          maxLength={100}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={visible}
          aria-controls={`${id}-options`}
          aria-describedby={`${id}-help`}
          aria-activedescendant={
            visible && options[active] ? `${id}-option-${active}` : undefined
          }
          onFocus={show}
          onClick={() => {
            if (!visible) show();
          }}
          onKeyDown={handleKey}
          onChange={(event) => {
            const next = event.target.value;
            setText(next);
            setFilter(next.trim().toLocaleLowerCase('ru'));
            setActive(-1);
            setOpen(true);
            onChange(next);
          }}
        />
        <button
          type="button"
          aria-label={visible ? 'Скрыть категории' : 'Показать категории'}
          aria-expanded={visible}
          aria-controls={`${id}-options`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            input.current?.focus();
            if (visible) setOpen(false);
            else show();
          }}
        >
          <ChevronDown size={17} aria-hidden="true" />
        </button>
        <ul
          id={`${id}-options`}
          className="staff-category-options"
          role="listbox"
          aria-label="Категории"
          hidden={!visible}
        >
          {options.map((option, index) => (
            <li
              id={`${id}-option-${index}`}
              role="option"
              key={option.name}
              aria-selected={
                !option.create &&
                option.name.toLocaleLowerCase('ru') === normalized
              }
              data-active={active === index}
              data-create={option.create}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(option)}
            >
              {option.create ? (
                <>
                  <Plus size={16} aria-hidden="true" /> Добавить «{option.name}»
                </>
              ) : (
                option.name
              )}
              {!option.create &&
                option.name.toLocaleLowerCase('ru') === normalized && (
                  <Check size={16} aria-hidden="true" />
                )}
            </li>
          ))}
          {!options.length && (
            <li
              role="option"
              aria-disabled="true"
              aria-selected="false"
              className="staff-category-empty"
            >
              Введите название новой категории.
            </li>
          )}
        </ul>
      </div>
      <small id={`${id}-help`} className="staff-hint">
        Выберите из списка или введите новую категорию.
      </small>
    </div>
  );
}
