import {
  Checkbox,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Textarea,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { ValueEditorProps, ValueSelector } from 'react-querybuilder';
import DatePicker from 'react-datepicker';
import CustomFieldSelector from './CustomFieldSelector';

const CustomValueEditor = ({
  fieldData,
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values,
  disabled,
  ...props
}: ValueEditorProps) => {
  useEffect(() => {
    if (
      inputType === 'number' &&
      !['between', 'notBetween', 'in', 'notIn'].includes(operator) &&
      typeof value === 'string' &&
      value.includes(',')
    ) {
      handleOnChange('');
    }
  }, [inputType, operator, value, handleOnChange]);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  const inputTypeCoerced = ['between', 'notBetween', 'in', 'notIn'].includes(
    operator
  )
    ? 'text'
    : inputType || 'text';

  if (fieldData.datatype === 'date') {
    if (operator === 'between') {
      return (
        <Select
          p={1}
          borderRadius="md"
          title={title}
          placeholder="..."
          size="sm"
          w="fit-content"
          display="inline-block"
          disabled={disabled}
          defaultValue={value}
          onChange={(e) => handleOnChange(e.target.value)}
        >
          <option key="past" value="past">
            past
          </option>
          <option key="today" value="today">
            today
          </option>
          <option key="tomorrow" value="tomorrow">
            tomorrow
          </option>
          <option key="week" value="week">
            this week
          </option>
        </Select>
      );
    }
    return (
      <DatePicker
        value={value}
        utcOffset={new Date().getTimezoneOffset()}
        tabIndex={0}
        onChange={(d: Date) => {
          handleOnChange(format(d, 'yyyy-MM-dd'));
        }}
      />
    );
  }

  // eslint-disable-next-line default-case
  switch (type) {
    case 'select':
      return (
        <CustomFieldSelector
          {...props}
          className={className}
          title={title}
          value={value}
          disabled={disabled}
          handleOnChange={handleOnChange}
          options={values}
        />
      );

    case 'multiselect':
      return (
        <ValueSelector
          {...props}
          className={className}
          title={title}
          value={value}
          disabled={disabled}
          handleOnChange={handleOnChange}
          options={values}
          multiple
        />
      );

    case 'textarea':
      return (
        <Textarea
          value={value}
          title={title}
          size="xs"
          variant="filled"
          isDisabled={disabled}
          className={className}
          placeholder={placeHolderText}
          onChange={(e) => handleOnChange(e.target.value)}
        />
      );

    case 'switch':
      return (
        <Switch
          className={className}
          isChecked={!!value}
          defaultChecked={false}
          title={title}
          size="sm"
          isDisabled={disabled}
          onChange={(e) => {
            return handleOnChange(e.target.checked);
          }}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          className={className}
          title={title}
          size="sm"
          isDisabled={disabled}
          onChange={(e) => handleOnChange(e.target.checked)}
          isChecked={!!value}
        />
      );

    case 'radio':
      return (
        <RadioGroup
          className={className}
          title={title}
          value={value}
          onChange={handleOnChange}
          isDisabled={disabled}
        >
          <Stack direction="row">
            {values &&
              values?.map((v) => (
                <Radio key={v.name} value={v.name} size="sm">
                  {v.label}
                </Radio>
              ))}
          </Stack>
        </RadioGroup>
      );
  }

  return (
    <Input
      mx={1}
      width="auto"
      display="inline-block"
      type={inputTypeCoerced}
      value={value}
      title={title}
      size="sm"
      borderRadius="md"
      isDisabled={disabled}
      className={className}
      placeholder={placeHolderText}
      onChange={(e) => handleOnChange(e.target.value)}
    />
  );
};

export default CustomValueEditor;
