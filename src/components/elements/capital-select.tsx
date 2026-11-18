import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { donationDirections } from '@/constants/projects';

const capitalOptions = donationDirections.map(({ label }) => label);

export function CapitalSelect({
  id,
  value,
  onValueChange,
  withNamedCapital = false,
  additionalOptions = [],
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  withNamedCapital?: boolean;
  additionalOptions?: { value: string; label: string }[];
}) {
  const options = withNamedCapital
    ? [...capitalOptions, 'Именной или корпоративный капитал']
    : capitalOptions;
  const selectedLabel =
    additionalOptions.find((option) => option.value === value)?.label ??
    (value.startsWith('project:') ? 'Проект фонда' : value);

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger id={id} className="capital-select-trigger">
        <Select.Value>{selectedLabel}</Select.Value>
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
            {additionalOptions.length > 0 && (
              <Select.Group>
                <Select.Label className="capital-select-group-label">
                  Проекты фонда
                </Select.Label>
                {additionalOptions.map((option) => (
                  <Select.Item
                    className="capital-select-option"
                    key={option.value}
                    value={option.value}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator asChild>
                      <Check size={17} aria-hidden="true" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Group>
            )}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
