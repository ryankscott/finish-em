import { useTheme } from '@chakra-ui/system'
import React from 'react'
import RSelect, { components, OptionsType, OptionTypeBase } from 'react-select'
import { v4 as uuidv4 } from 'uuid'

import { Icons } from '../assets/icons'
import { selectStyles } from '../theme'

interface Props {
  size: 'xs' | 'sm' | 'md' | 'lg'
  onChange: (val: any) => void
  isDisabled?: boolean
  autoFocus?: boolean
  escapeClearsValue?: boolean
  options: OptionsType<OptionTypeBase>
  placeholder: string
  defaultValue?: OptionTypeBase
  isMulti: boolean
  invertColours?: boolean
  fullWidth?: boolean
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
  return (
    <RSelect
      key={uuidv4()}
      autoFocus={props.autoFocus}
      isDisabled={props.isDisabled}
      onChange={(newValue, actionMeta) => {
        props.onChange(newValue.value)
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
      formatOptionLabel={function (data) {
        return <span dangerouslySetInnerHTML={{ __html: data.label }} />
      }}
      components={{ DropdownIndicator }}
    />
  )
}

export default Select