import React, { ReactElement } from 'react'
import { IconType } from '../interfaces'
import { Button as CButton, IconButton, Tooltip } from '@chakra-ui/react'
import { Icons } from '../assets/icons'
import * as CSS from 'csstype'

type ButtonProps = {
  id?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  variant: 'primary' | 'error' | 'default' | 'invert' | 'subtle' | 'subtleInvert'
  text?: string | JSX.Element
  size: 'xs' | 'sm' | 'md' | 'lg'
  icon?: IconType
  iconPosition?: 'left' | 'right'
  iconSize?: CSS.Property.Width
  iconColour?: CSS.Property.Color
  tooltipText?: string
  disabled?: boolean
  visible?: boolean
  fullWidth?: boolean
  isActive?: boolean
}
const Button = (props: ButtonProps): ReactElement => {
  return (
    <Tooltip arrowSize={5} hasArrow={true} openDelay={500} label={props.tooltipText}>
      {!props.text ? (
        <IconButton
          aria-label={props.icon}
          isActive={props.isActive}
          variant={props.variant}
          isDisabled={props.disabled}
          color={'gray.700'}
          icon={Icons[props.icon](props.iconSize, props.iconSize, props.iconColour)}
          size={props.size}
          onClick={(e) => props?.onClick(e)}
          visible={props.visible?.toString()}
          transition="all 0.2s"
        />
      ) : (
        <CButton
          isActive={props.isActive}
          transition="all 0.2s"
          variant={props.variant}
          visible={props.visible?.toString()}
          isDisabled={props.disabled}
          isFullWidth={props.fullWidth}
          onClick={(e) => props.onClick(e)}
          leftIcon={
            props.iconPosition == 'left'
              ? Icons[props.icon](props.iconSize, props.iconSize, props.iconColour)
              : null
          }
          rightIcon={
            props.iconPosition == 'right'
              ? Icons[props.icon](props.iconSize, props.iconSize, props.iconColour)
              : null
          }
          size={props.size}
        >
          {props.text}
        </CButton>
      )}
    </Tooltip>
  )
}

export default Button
