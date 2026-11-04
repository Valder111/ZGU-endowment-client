import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { generalCapital, projects } from '@/constants/projects';

const capitalOptions = [generalCapital, ...projects.map(({ title }) => title)];

export function CapitalSelect({
  id,
  value,
  onValueChange,
  withNamedCapital = false,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  withNamedCapital?: boolean;
}) {
  const options = withNamedCapital
    ? [...capitalOptions, 'Именной или корпоративный капитал']
    : capitalOptions;

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger id={id} className="capital-select-trigger">
        <Select.Value>{value}</Select.Value>
        <Select.Icon asChild>
          <ChevronDown size={17} aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="capital-select-panel"
          aria-label="Направления поддержки"
          position="popper"
          sideOffset={7}
          collisionPadding={12}
        >
          <Select.Viewport className="capital-select-options">
            {options.map((option) => (
              <Select.Item
                className="capital-select-option"
                value={option}
                key={option}
              >
                <Select.ItemText>{option}</Select.ItemText>
                <Select.ItemIndicator asChild>
                  <Check size={17} aria-hidden="true" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
