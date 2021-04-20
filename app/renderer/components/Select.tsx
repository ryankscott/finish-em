import { useTheme } from '@chakra-ui/system'
import React from 'react'
import RSelect, { components, OptionsType, OptionTypeBase, StylesConfig } from 'react-select'
import { v4 as uuidv4 } from 'uuid'
import * as CSS from 'csstype'

import { Icons } from '../assets/icons'
import { darken, readableColor } from 'polished'

const generateOptionBackgroundColour = (
  data: { color: string },
  isFocused: boolean,
  altBackgroundColour: CSS.Property.BackgroundColor,
  backgroundColour: CSS.Property.BackgroundColor,
  invert: boolean,
  isDisabled: boolean,
): string => {
  if (data?.color) {
    return data.color
  }
  if (isDisabled) {
    return invert ? altBackgroundColour : backgroundColour
  }
  if (isFocused) {
    return invert ? darken(0.05, altBackgroundColour) : darken(0.05, backgroundColour)
  }
  return invert ? altBackgroundColour : backgroundColour
}

interface SelectStylesProps {
  fontSize: CSS.Property.FontSize
  textColour: CSS.Property.Color
  altTextColour: CSS.Property.Color
  altBackgroundColour: CSS.Property.BackgroundColor
  backgroundColour: CSS.Property.BackgroundColor
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

  const selectStyles = (props: SelectStylesProps): StylesConfig => {
    return {
      container: (styles, { isDisabled }) => ({
        ...styles,
        width: props.fullWidth ? '100%' : 'auto',
        padding: '0px 0px',
        border: props.invert ? '1px solid' : 'none !important',
        borderColor: theme.colors.gray[700],
        borderRadius: '5px',
        '&:active': {
          border: props.invert ? '1px solid' : 'none !important',
          borderColor: theme.colors.gray[600],
        },
        '&:focus': {
          border: props.invert ? '1px solid' : 'none !important',
          borderColor: theme.colors.gray[600],
        },
      }),
      input: (styles, { data, isFocused, isDisabled }) => ({
        ...styles,
        display: 'flex',
        alignItems: 'center',
        height: 'auto',
        lineHeight: 'auto',
        padding: '0px 2px',
        color: props.backgroundColour
          ? readableColor(props.backgroundColour, props.textColour, props.altTextColour, true)
          : props.invert
          ? props.altTextColour
          : props.textColour,
        fontSize: props.fontSize,
        border: `none !important`,
      }),
      valueContainer: (styles, { data, isFocused }) => ({
        ...styles,
        padding: '0px',
        alignContent: 'center',
        height: 'auto',
        minHeight: '28px',
        fontWeight: 400,
        color: props.backgroundColour
          ? readableColor(props.backgroundColour, props.textColour, props.altTextColour, true)
          : props.invert
          ? props.altTextColour
          : props.textColour,
      }),
      menu: (styles) => {
        return {
          ...styles,
          margin: '0px 0px',
          padding: '5px 0px',
          backgroundColor: props.invert ? props.altBackgroundColour : props.backgroundColour,
          border: 'none',
          borderRadius: '5px',
          tabIndex: 0,
          zIndex: 999,
        }
      },
      menuList: (styles) => {
        return {
          ...styles,
          zIndex: 999,
        }
      },
      option: (styles, { data, isFocused, isDisabled }) => {
        return {
          ...styles,
          tabIndex: 0,
          position: 'relative',
          color: props.invert ? props.altTextColour : props.textColour,
          backgroundColor: generateOptionBackgroundColour(
            data,
            isFocused,
            props.altBackgroundColour,
            props.backgroundColour,
            props.invert,
            isDisabled,
          ),
          padding: '5px 10px',
          margin: '0px',
          fontSize: props.fontSize,
          fontWeight: 400,
          zIndex: 999,
          '&:active': {
            fontWeight: 500,
            backgroundColor: darken(
              0.05,
              generateOptionBackgroundColour(
                data,
                isFocused,
                props.altBackgroundColour,
                props.backgroundColour,
                props.invert,
                isDisabled,
              ),
            ),
          },
          '&:hover': {
            fontWeight: 500,
          },
        }
      },
      placeholder: (styles, { isDisabled }) => ({
        backgroundColor: 'transparent',
        color: props.invert ? theme.colors.gray[100] : theme.colors.gray[800],
        opacity: isDisabled ? 0.4 : 1,
        fontSize: props.fontSize,
        fontWeight: 400,
      }),
      singleValue: (styles) => ({
        ...styles,
        color: props.backgroundColour
          ? readableColor(props.backgroundColour, props.textColour, props.altTextColour, true)
          : props.invert
          ? props.altTextColour
          : props.textColour,
      }),
      control: (styles, { isDisabled }) => ({
        ...styles,
        display: 'flex',
        minHeight: 'none',
        flexDirection: 'row',
        alignContent: 'center',
        margin: 0,
        padding: '0px 12px',
        height: '30px',
        width: 'auto',
        fontSize: props.fontSize,
        cursor: isDisabled ? 'not-allowed' : 'inherit',
        backgroundColor: generateOptionBackgroundColour(
          null,
          false,
          props.altBackgroundColour,
          props.backgroundColour,
          props.invert,
          isDisabled,
        ),
        color: props.invert ? props.altTextColour : props.textColour,
        border: 'none',
        boxShadow: 'none !important',
        borderRadius: '5px',
        '&:hover': {
          backgroundColor: darken(
            0.05,
            generateOptionBackgroundColour(
              null,
              false,
              props.altBackgroundColour,
              props.backgroundColour,
              props.invert,
              isDisabled,
            ),
          ),
        },
        '&:active': {
          backgroundColor: darken(
            0.05,
            generateOptionBackgroundColour(
              null,
              false,
              props.altBackgroundColour,
              props.backgroundColour,
              props.invert,
              isDisabled,
            ),
          ),
          boxShadow: 'none !important',
        },
        '&:focus': {
          backgroundColor: darken(
            0.05,
            generateOptionBackgroundColour(
              null,
              false,
              props.altBackgroundColour,
              props.backgroundColour,
              props.invert,
              isDisabled,
            ),
          ),
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
      }),
      multiValueLabel: (styles) => ({
        ...styles,
        border: 'none',
        backgroundColor: props.invert
          ? darken(0.05, props.altBackgroundColour)
          : darken(0.05, props.backgroundColour),
      }),
      multiValueRemove: (styles) => ({
        ...styles,
        color: props.textColour,
        backgroundColor: props.invert
          ? darken(0.05, props.altBackgroundColour)
          : darken(0.05, props.backgroundColour),
        border: 'none',
        '&:hover': {
          color: props.textColour,
          backgroundColor: props.invert
            ? darken(0.05, props.altBackgroundColour)
            : darken(0.05, props.backgroundColour),
          cursor: 'pointer',
        },
        '> svg': {
          height: '12px',
          width: '12px',
        },
      }),
      clearIndicator: (styles) => ({
        ...styles,
        color: props.backgroundColour
          ? readableColor(props.backgroundColour, props.textColour, props.altTextColour, true)
          : props.invert
          ? props.altTextColour
          : props.textColour,
        backgroundColor: 'inherit',
        '&:hover': {
          color: props.backgroundColour
            ? readableColor(props.backgroundColour, props.textColour, props.altTextColour, true)
            : props.invert
            ? props.altTextColour
            : props.textColour,
          backgroundColor: 'inherit',
          cursor: 'pointer',
        },
        '> svg': {
          height: '16px',
          width: '16px',
        },
      }),

      indicatorSeparator: () => ({
        display: 'none',
      }),
      dropdownIndicator: (styles, { isDisabled }) => {
        return props.hideDropdownIndicator
          ? { display: 'none', opacity: isDisabled ? 0.4 : 1 }
          : { display: 'auto', opacity: isDisabled ? 0.4 : 1 }
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
      styles={selectStyles({
        fontSize: theme.fontSizes.md,
        textColour: theme.colors.gray[800],
        altTextColour: theme.colors.white,
        backgroundColour: theme.colors.gray[50],
        altBackgroundColour: theme.colors.gray[800],
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
