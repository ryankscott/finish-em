import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import Button from './Button'
import { connect } from 'react-redux'
import { DialogContainer, Icon, Option } from './styled/MoreDropdown'
import Tooltip from './Tooltip'
import { IconType } from '../interfaces'
import { Icons } from '../assets/icons'

const DropdownOption = (
  key: number,
  onClick: (e: React.MouseEvent) => void,
  icon: IconType,
  label: string,
): ReactElement => {
  return (
    <Option key={key} onClick={onClick}>
      <Icon>{Icons[icon](14, 14)}</Icon>
      {label}
    </Option>
  )
}

export type MoreDropdownOptions = {
  label: string
  icon: IconType
  onClick: (e: React.MouseEvent) => void
}[]

interface OwnProps {
  showDialog?: boolean
  disableClick?: boolean
  options: MoreDropdownOptions
}

interface StateProps {
  theme: string
}

type MoreDropdownProps = OwnProps & StateProps

function MoreDropdown(props: MoreDropdownProps): ReactElement {
  const [showDialog, setShowDialog] = useState(false)

  const node = useRef<HTMLDivElement>()

  const handleClick = (e): null => {
    if (node.current.contains(e.target)) {
      return
    }
    setShowDialog(false)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  return (
    <ThemeProvider theme={themes[props.theme]}>
      <div style={{ position: 'relative' }} ref={node}>
        <Button
          dataFor="more"
          type="subtle"
          icon="more"
          width="18px"
          onClick={(e) => {
            setShowDialog(!showDialog)
            e.stopPropagation()
          }}
        />

        {(showDialog || props.showDialog) && (
          <>
            <DialogContainer>
              {props.options.map((v, i) => DropdownOption(i, v.onClick, v.icon, v.label))}
            </DialogContainer>
          </>
        )}
      </div>
      <Tooltip id="more" text={'More actions'} />
    </ThemeProvider>
  )
}

const mapStateToProps = (state): StateProps => ({
  theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch) => ({})
export default connect(mapStateToProps, mapDispatchToProps)(MoreDropdown)
