import { Icon, useColorMode } from '@chakra-ui/react';
import { useTheme } from '@chakra-ui/system';
import { CSSObject } from '@emotion/react';
import * as CSS from 'csstype';
import { darken } from 'polished';
import { DropdownIndicatorProps, MultiValue, SingleValue } from 'react-select';
import RSelect, {
  ActionMeta,
  ClearIndicatorProps,
  components,
  ControlProps,
} from 'react-select';
import { v4 as uuidv4 } from 'uuid';
import { Icons } from '../assets/icons';

type OptionType = { [key: string]: any };
type OptionsType = Array<OptionType>;

interface Props {
  options: OptionsType;
  placeholder: string;
  onChange: (val: any) => void;
  isDisabled?: boolean;
  autoFocus?: boolean;
  escapeClearsValue?: boolean;
  defaultValue?: OptionType;
  isMulti?: boolean;
  invertColours?: boolean;
  fullWidth?: boolean;
  renderLabelAsElement?: boolean;
}

const DropdownIndicator = (props: DropdownIndicatorProps) => {
  return (
    <components.DropdownIndicator {...props}>
      <Icon as={Icons.collapse} w={3} h={3} />
    </components.DropdownIndicator>
  );
};

const ClearIndicator = (props: ClearIndicatorProps<any>) => {
  return (
    <components.ClearIndicator {...props}>
      <Icon as={Icons.close} w={3} h={3} mx={0.5} />
    </components.ClearIndicator>
  );
};

const Select = (props: Props) => {
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const {
    onChange,
    isDisabled,
    autoFocus,
    escapeClearsValue,
    options,
    placeholder,
    defaultValue,
    isMulti,
    invertColours,
    fullWidth,
    renderLabelAsElement,
  } = props;

  const generateColour = (invert: boolean) => {
    if (invert) {
      return colorMode == 'light'
        ? theme.colors.gray[50]
        : theme.colors.gray[800];
    }

    return colorMode == 'light'
      ? theme.colors.gray[800]
      : theme.colors.gray[50];
  };

  const generateBackgroundColour = (
    data: { color: string } | null,
    isFocused: boolean,
    invert: boolean
  ): string => {
    if (data?.color) {
      return data.color;
    }

    const backgroundColor =
      colorMode === 'light' ? theme.colors.gray[50] : theme.colors.gray[800];
    const invertBackgroundColor =
      colorMode === 'light' ? theme.colors.gray[800] : theme.colors.gray[50];
    if (isFocused) {
      return invert
        ? darken(0.05, invertBackgroundColor)
        : darken(0.05, backgroundColor);
    }

    return invert ? invertBackgroundColor : backgroundColor;
  };

  interface SelectStylesInput {
    fontSize: CSS.Property.FontSize;
    hideDropdownIndicator?: boolean;
    invert?: boolean;
    fullWidth?: boolean;
  }

  const selectStyles = (input: SelectStylesInput) => {
    const { fontSize, hideDropdownIndicator, invert, fullWidth } = input;

    return {
      container: (styles: CSSObject) => ({
        ...styles,
        width: fullWidth ? '100%' : 'auto',
        padding: '0px',
        borderRadius: '5px',
        '&:active': {
          border: 'none !important',
        },
        '&:focus': {
          border: 'none !important',
        },
      }),
      input: (styles: CSSObject) => ({
        ...styles,
        display: 'flex',
        alignItems: 'center',
        height: 'auto',
        lineHeight: 'auto',
        padding: '0px 2px',
        color: generateColour(invert ?? false),
        fontSize,
        border: `none !important`,
      }),
      valueContainer: (styles: CSSObject) => ({
        ...styles,
        paddingTop: theme.space[1],
        paddingBottom: theme.space[1],
        paddingLeft: theme.space[0.5],
        paddingRight: theme.space[0.5],
        height: 'auto',
        minHeight: '28px',
        fontWeight: 400,
        color: generateColour(invert ?? false),
      }),

      menu: (styles: CSSObject) => ({
        ...styles,
        margin: `${theme.space[1]} 0px`,
        padding: '5px 0px',
        backgroundColor: ((invertColour: boolean | undefined) => {
          if (invertColour) {
            return colorMode === 'light'
              ? theme.colors.gray[800]
              : theme.colors.gray[50];
          }
          return colorMode === 'light'
            ? theme.colors.gray[50]
            : theme.colors.gray[800];
        })(invert),
        border: '1px solid',
        borderColor: ((invertColour: boolean | undefined) => {
          if (invertColour) {
            return colorMode === 'light'
              ? theme.colors.gray[900]
              : theme.colors.gray[200];
          }
          return colorMode === 'light'
            ? theme.colors.gray[200]
            : theme.colors.gray[900];
        })(invert),
        borderRadius: '5px',
        tabIndex: 0,
        zIndex: 999,
        boxShadow:
          colorMode === 'light' ? theme.shadows.md : theme.shadows['dark-lg'],
      }),
      menuList: (styles: CSSObject) => ({
        ...styles,
        zIndex: 999,
        backgroundColor: generateBackgroundColour(null, false, invert ?? false),
      }),
      option: (styles: CSSObject, { data, isFocused }): Control => ({
        ...styles,
        tabIndex: 0,
        position: 'relative',
        color: generateColour(invert ?? false),
        backgroundColor: generateBackgroundColour(
          data,
          isFocused,
          invert ?? false
        ),
        padding: '5px 10px',
        margin: '0px',
        fontSize,
        fontWeight: 400,
        zIndex: 999,
        '&:active': {
          fontWeight: 500,
          backgroundColor: darken(
            0.05,
            generateBackgroundColour(data, isFocused, invert ?? false)
          ),
        },
        '&:hover': {
          fontWeight: 500,
        },
      }),
      placeholder: (styles, { isDisabled: boolean }) => ({
        ...styles,
        backgroundColor: 'transparent',
        color: ((invertColour: boolean | undefined) => {
          if (invertColour) {
            return colorMode === 'light'
              ? theme.colors.gray[100]
              : theme.colors.gray[400];
          }
          return colorMode === 'light'
            ? theme.colors.gray[700]
            : theme.colors.gray[100];
        })(invert),
        opacity: isDisabled ? 0.4 : 1,
        fontSize,
        fontWeight: 400,
      }),
      singleValue: (styles: CSSObject) => ({
        ...styles,
        color: generateColour(invert ?? false),
      }),
      control: (
        styles: CSSObject,
        { isFocused, isDisabled }: ControlProps
      ) => ({
        ...styles,
        display: 'flex',
        minHeight: 'none',
        flexDirection: 'row',
        alignContent: 'center',
        margin: 0,
        padding: '2px 12px',
        width: 'auto',
        opacity: isDisabled ? 0.4 : 1,
        fontSize,
        cursor: isDisabled ? 'not-allowed' : 'inherit',
        backgroundColor: generateBackgroundColour(
          null,
          isFocused,
          invert ?? false
        ),
        color: generateColour(invert ?? false),
        border: 'none',
        boxShadow: 'none !important',
        borderRadius: '5px',
        '&:hover': {
          backgroundColor: darken(
            0.05,
            generateBackgroundColour(null, false, invert ?? false)
          ),
        },
        '&:active': {
          backgroundColor: darken(
            0.05,
            generateBackgroundColour(null, false, invert ?? false)
          ),
          boxShadow: 'none !important',
        },
        '&:focus': {
          backgroundColor: darken(
            0.05,
            generateBackgroundColour(null, false, invert ?? false)
          ),
          boxShadow: 'none !important',
        },
      }),
      indicatorsContainer: (styles: CSSObject) => ({
        ...styles,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '0px 2px',
      }),
      multiValue: (styles: CSSObject) => ({
        ...styles,

        marginLeft: '0px',
        marginRight: '2px',
        borderRadius: '5px',
        backgroundColor: ((invertColour: boolean | undefined) => {
          if (invertColour) {
            return colorMode === 'light'
              ? theme.colors.blue[400]
              : theme.colors.blue[500];
          }
          return colorMode === 'light'
            ? theme.colors.blue[500]
            : theme.colors.blue[400];
        })(invert),
      }),
      multiValueLabel: (styles: CSSObject) => ({
        ...styles,
        borderRadius: '5px',
        color: theme.colors.gray[50],
      }),
      multiValueRemove: (styles: CSSObject) => ({
        ...styles,
        borderRadius: '5px',
        color: theme.colors.gray[50],
        border: 'none',
        '&:hover': {
          color: theme.colors.gray[50],
          border: 'none',
          backgroundColor: ((invertColour: boolean | undefined) => {
            if (invertColour) {
              return colorMode === 'light'
                ? theme.colors.blue[500]
                : theme.colors.blue[600];
            }
            return colorMode === 'light'
              ? theme.colors.blue[600]
              : theme.colors.blue[500];
          })(invert),
          cursor: 'pointer',
        },
        '> svg': {
          height: '12px',
          width: '12px',
        },
      }),
      clearIndicator: (styles: CSSObject) => ({
        ...styles,
        color: generateColour(invert ?? false),
        backgroundColor: 'inherit',
        cursor: 'pointer',
      }),
      group: (styles: CSSObject) => ({
        ...styles,
        color: 'pink',
        backgroundColor: ((invertColours: boolean | undefined) => {
          if (invertColours) {
            return colorMode === 'light'
              ? theme.colors.gray[800]
              : theme.colors.gray[50];
          }
          return colorMode === 'light'
            ? theme.colors.gray[50]
            : theme.colors.gray[800];
        })(invert),
      }),

      indicatorSeparator: () => ({
        display: 'none',
      }),
      dropdownIndicator: (styles: CSSObject, { isDisabled, hasValue }) => ({
        ...styles,

        cursor: 'pointer',
        padding: '2px',
        display: hideDropdownIndicator ? 'none' : 'auto',
        opacity: isDisabled ? 0.4 : 1,
        color: ((value) => {
          if (value) {
            return colorMode === 'light'
              ? theme.colors.gray[800]
              : theme.colors.gray[400];
          }
          return colorMode === 'light'
            ? theme.colors.gray[500]
            : theme.colors.gray[600];
        })(hasValue),
      }),
      noOptionsMessage: () => ({
        fontSize,
        fontWeight: 400,
        padding: '0px 5px',
      }),
    };
  };

  return (
    <RSelect
      key={uuidv4()}
      autoFocus={autoFocus}
      isDisabled={isDisabled}
      onChange={(
        newValue: MultiValue<OptionType> | SingleValue<OptionType>,
        actionMeta: ActionMeta<OptionType>
      ) => {
        if (
          actionMeta.action === 'select-option' ||
          actionMeta.action === 'remove-value' ||
          actionMeta.action === 'clear'
        ) {
          onChange(newValue);
          return;
        }
        onChange(newValue.value);
      }}
      isMulti={isMulti}
      options={options}
      escapeClearsValue
      defaultMenuIsOpen={false}
      menuPlacement="auto"
      styles={selectStyles({
        fontSize: theme.fontSizes.md,
        invert: invertColours,
        fullWidth,
      })}
      isSearchable
      defaultValue={defaultValue}
      placeholder={placeholder}
      formatOptionLabel={(data: OptionType) => {
        return renderLabelAsElement ? (
          <span>{data.label}</span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: data.label }} />
        );
      }}
      components={{ DropdownIndicator, ClearIndicator }}
    />
  );
};

export default Select;
