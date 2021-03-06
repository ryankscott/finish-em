import { useTheme } from '@chakra-ui/system'
import React from 'react'
import RSelect, { components, OptionsType, OptionTypeBase, StylesConfig } from 'react-select'
import { v4 as uuidv4 } from 'uuid'
import * as CSS from 'csstype'

import { Icons } from '../assets/icons'
import { borderColor, darken } from 'polished'
import { useColorMode } from '@chakra-ui/react'

interface SelectStylesProps {
  fontSize: CSS.Property.FontSize
  hideDropdownIndicator?: boolean
  invert?: boolean
  fullWidth?: boolean
}

interface Props {
  size: 'xs' | 'sm' | 'md' | 'lg'
  onChange: (val: any) => void
  isDisabled?: boolean
  autoFocus?: boolean
  escapeClearsValue?: boolean
  options: OptionsType<OptionTypeBase>
  placeholder: string
  defaultValue?: OptionTypeBase
  isMulti?: boolean
  invertColours?: boolean
  fullWidth?: boolean
  renderLabelAsElement?: boolean
}

const DropdownIndicator = (props: ElementConfig<typeof components.DropdownIndicator>) => {
  return (
    <components.DropdownIndicator {...props}>
      {Icons['collapse'](12, 12)}
    </components.DropdownIndicator>
  )
}

const Select = (props: Props) => {
  const theme = useTheme()
  const { colorMode, toggleColorMode } = useColorMode()

  const generateColour = (invert: boolean) => {
    return invert
      ? colorMode == 'light'
        ? theme.colors.gray[50]
        : theme.colors.gray[800]
      : colorMode == 'light'
      ? theme.colors.gray[800]
      : theme.colors.gray[50]
  }

  const generateBackgroundColour = (
    data: { color: string },
    isFocused: boolean,
    invert: boolean,
  ): string => {
    const backgroundColor = colorMode == 'light' ? theme.colors.gray[50] : theme.colors.gray[800]
    const invertBackgroundColor =
      colorMode == 'light' ? theme.colors.gray[800] : theme.colors.gray[50]

    if (data?.color) {
      return data.color
    }
    if (isFocused) {
      return invert ? darken(0.05, invertBackgroundColor) : darken(0.05, backgroundColor)
    }
    return invert ? invertBackgroundColor : backgroundColor
  }

  const selectStyles = (props: SelectStylesProps) => {
    return {
      container: (styles, { isDisabled }) => ({
        ...styles,
        width: props.fullWidth ? '100%' : 'auto',
        padding: '0px',
        borderRadius: '5px',
        '&:active': {
          border: 'none !important',
        },
        '&:focus': {
          border: 'none !important',
        },
      }),
      input: (styles, { data, isFocused, isDisabled }) => ({
        ...styles,
        display: 'flex',
        alignItems: 'center',
        height: 'auto',
        lineHeight: 'auto',
        padding: '0px 2px',
        color: generateColour(props.invert),
        fontSize: props.fontSize,
        border: `none !important`,
      }),
      valueContainer: (styles, { data, isFocused }) => ({
        ...styles,
        margin: theme.space[0.5],
        padding: '0px',
        alignContent: 'center',
        height: 'auto',
        minHeight: '28px',
        fontWeight: 400,
        color: generateColour(props.invert),
      }),

      menu: (styles) => {
        return {
          ...styles,
          margin: '0px 0px',
          padding: '5px 0px',
          backgroundColor: props.invert
            ? colorMode == 'light'
              ? theme.colors.gray[800]
              : theme.colors.gray[50]
            : colorMode == 'light'
            ? theme.colors.gray[50]
            : theme.colors.gray[800],
          border: '1px solid',
          borderColor: colorMode == 'light' ? theme.colors.gray[200] : theme.colors.gray[800],
          borderRadius: '5px',
          tabIndex: 0,
          zIndex: 999,
          boxShadow: colorMode == 'light' ? theme.shadows.md : theme.shadows['dark-lg'],
        }
      },
      menuList: (styles, state) => {
        return {
          ...styles,
          zIndex: 999,
          backgroundColor: generateBackgroundColour(null, false, props.invert),
        }
      },
      option: (styles, { data, isFocused, isDisabled }) => {
        return {
          ...styles,
          tabIndex: 0,
          position: 'relative',
          color: generateColour(props.invert),
          backgroundColor: generateBackgroundColour(data, isFocused, props.invert),
          padding: '5px 10px',
          margin: '0px',
          fontSize: props.fontSize,
          fontWeight: 400,
          zIndex: 999,
          '&:active': {
            fontWeight: 500,
            backgroundColor: darken(0.05, generateBackgroundColour(data, isFocused, props.invert)),
          },
          '&:hover': {
            fontWeight: 500,
          },
        }
      },
      placeholder: (styles, { isDisabled }) => ({
        backgroundColor: 'transparent',
        color: props.invert
          ? colorMode == 'light'
            ? theme.colors.gray[100]
            : theme.colors.gray[400]
          : colorMode == 'light'
          ? theme.colors.gray[700]
          : theme.colors.gray[100],
        opacity: isDisabled ? 0.4 : 1,
        fontSize: props.fontSize,
        fontWeight: 400,
      }),
      singleValue: (styles) => ({
        ...styles,
        color: generateColour(props.invert),
      }),
      control: (styles, { data, isFocused, isDisabled }) => ({
        ...styles,
        display: 'flex',
        minHeight: 'none',
        flexDirection: 'row',
        alignContent: 'center',
        margin: 0,
        padding: '0px 12px',
        height: '30px',
        width: 'auto',
        opacity: isDisabled ? 0.4 : 1,
        fontSize: props.fontSize,
        cursor: isDisabled ? 'not-allowed' : 'inherit',
        backgroundColor: generateBackgroundColour(null, isFocused, props.invert),
        color: generateColour(props.invert),
        border: 'none',
        boxShadow: 'none !important',
        borderRadius: '5px',
        '&:hover': {
          backgroundColor: darken(0.05, generateBackgroundColour(null, false, props.invert)),
        },
        '&:active': {
          backgroundColor: darken(0.05, generateBackgroundColour(null, false, props.invert)),
          boxShadow: 'none !important',
        },
        '&:focus': {
          backgroundColor: darken(0.05, generateBackgroundColour(null, false, props.invert)),
          boxShadow: 'none !important',
        },
      }),
      indicatorsContainer: (styles) => ({
        ...styles,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '0px 2px',
      }),
      multiValue: (styles) => ({
        ...styles,
        margin: '2px',
        color: generateColour(props.invert),
        backgroundColor: props.invert
          ? colorMode == 'light'
            ? theme.colors.gray[700]
            : theme.colors.gray[100]
          : colorMode == 'light'
          ? theme.colors.gray[100]
          : theme.colors.gray[700],
        '&:hover': {
          backgroundColor: props.invert
            ? colorMode == 'light'
              ? theme.colors.gray[600]
              : theme.colors.gray[200]
            : colorMode == 'light'
            ? theme.colors.gray[200]
            : theme.colors.gray[600],
        },
      }),
      multiValueLabel: (styles) => ({
        ...styles,
        border: 'none',
        color: generateColour(props.invert),
      }),
      multiValueRemove: (styles) => ({
        ...styles,
        color: generateColour(props.invert),
        border: 'none',
        '&:hover': {
          color: generateColour(props.invert),
          border: 'none',
          backgroundColor: props.invert
            ? colorMode == 'light'
              ? theme.colors.gray[200]
              : theme.colors.gray[900]
            : colorMode == 'light'
            ? theme.colors.gray[900]
            : theme.colors.gray[700],
          cursor: 'pointer',
        },
        '> svg': {
          height: '12px',
          width: '12px',
        },
      }),
      clearIndicator: (styles) => ({
        ...styles,
        borderRadius: '5px',
        padding: '2px',
        color: generateColour(props.invert),
        backgroundColor: 'inherit',
        '&:hover': {
          color: props.invert
            ? colorMode == 'light'
              ? theme.colors.gray[100]
              : theme.colors.gray[900]
            : colorMode == 'light'
            ? theme.colors.gray[100]
            : theme.colors.gray[900],
          backgroundColor: props.invert
            ? colorMode == 'light'
              ? theme.colors.gray[200]
              : theme.colors.gray[900]
            : colorMode == 'light'
            ? theme.colors.gray[200]
            : theme.colors.gray[900],
          cursor: 'pointer',
        },
        '> svg': {
          height: '16px',
          width: '16px',
        },
      }),
      group: (styles) => ({
        ...styles,
        color: 'pink',
        backgroundColor: props.invert
          ? colorMode == 'light'
            ? theme.colors.gray[800]
            : theme.colors.gray[50]
          : colorMode == 'light'
          ? theme.colors.gray[50]
          : theme.colors.gray[800],
      }),

      indicatorSeparator: () => ({
        display: 'none',
      }),
      dropdownIndicator: (styles, state) => {
        return {
          display: props.hideDropdownIndicator ? 'none' : 'auto',
          opacity: state.isDisabled ? 0.4 : 1,
          color: state.hasValue
            ? colorMode == 'light'
              ? theme.colors.gray[800]
              : theme.colors.gray[400]
            : colorMode == 'light'
            ? theme.colors.gray[500]
            : theme.colors.gray[600],
        }
      },
      noOptionsMessage: () => ({
        fontSize: props.fontSize,
        fontWeight: 400,
        padding: '0px 5px',
      }),
    }
  }

  return (
    <RSelect
      key={uuidv4()}
      autoFocus={props.autoFocus}
      isDisabled={props.isDisabled}
      onChange={(newValue, actionMeta) => {
        if (
          actionMeta.action == 'select-option' ||
          actionMeta.action == 'remove-value' ||
          actionMeta.action == 'clear'
        ) {
          props.onChange(newValue)
          return
        }
        props.onChange(newValue.value)
        return
      }}
      isMulti={props.isMulti}
      options={props.options}
      escapeClearsValue={true}
      defaultMenuIsOpen={false}
      menuPlacement={'auto'}
      styles={selectStyles({
        fontSize: theme.fontSizes.md,
        invert: props.invertColours,
        fullWidth: props.fullWidth,
      })}
      isSearchable={true}
      defaultValue={props.defaultValue}
      placeholder={props.placeholder}
      formatOptionLabel={(data) => {
        return props.renderLabelAsElement ? (
          <span>{data.label}</span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: data.label }} />
        )
      }}
      components={{ DropdownIndicator }}
    />
  )
}

export default Select
