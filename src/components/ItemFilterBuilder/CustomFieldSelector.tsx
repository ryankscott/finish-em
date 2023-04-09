import {
  Field,
  NameLabelPair,
  OptionGroup,
  ValueSelectorProps,
} from "react-querybuilder";
import { Select } from "@chakra-ui/react";

const isOptionGroupArray = (arr: Field["values"]): arr is OptionGroup[] =>
  Array.isArray(arr) && arr.length > 0 && "options" in arr[0];

const toOptions = (arr?: NameLabelPair[] | OptionGroup[]) => {
  if (isOptionGroupArray(arr)) {
    return arr.map((og) => (
      <optgroup key={og.label} label={og.label}>
        {og.options.map((opt) => (
          <option key={opt.name} value={opt.name}>
            {opt.label}
          </option>
        ))}
      </optgroup>
    ));
  }

  if (Array.isArray(arr)) {
    return arr.map((opt) => (
      <option key={opt.name} value={opt.name}>
        {opt.label}
      </option>
    ));
  }
  return null;
};
const CustomFieldSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
}: ValueSelectorProps) => (
  <Select
    p={1}
    borderRadius="md"
    title={title}
    value={value}
    size="sm"
    w="fit-content"
    display="inline-block"
    disabled={disabled}
    onChange={(e) => handleOnChange(e.target.value)}
  >
    {toOptions(options)}
  </Select>
);

export default CustomFieldSelector;
