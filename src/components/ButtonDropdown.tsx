import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { ThemeProvider } from '../StyledComponents'
import Creatable from 'react-select/creatable'
import { themes, selectStyles } from '../theme'
import CSS from 'csstype'
import { connect } from 'react-redux'
import Button from './Button'
import { Container, SelectContainer } from './styled/ButtonDropdown'

interface StateProps {
  theme: string
}
interface OwnProps {
  defaultButtonText: string
  defaultButtonIcon: string
  defaultButtonIconColour: string
  buttonText: string
  buttonIcon?: IconType
  buttonIconColour?: CSS.Color
  selectPlaceholder?: string
  createable?: boolean
  options: OptionType[]
  onSubmit: (value: string) => void
  onEscape?: () => void
  style?: 'primary' | 'subtle' | 'subtleInvert' | 'default'
  completed: boolean
  deleted?: boolean
  showSelect?: boolean
}

type ButtonDropdownProps = StateProps & OwnProps
function ButtonDropdown(props: ButtonDropdownProps): ReactElement {
  const [showSelect, setShowSelect] = useState(false)
  const handleChange = (newValue, actionMeta): void => {
    if (actionMeta.action == 'select-option') {
      props.onSubmit(newValue.value)
    }
    setShowSelect(false)
    return
  }
  const node = useRef<HTMLDivElement>()

  const handleClick = (e): null => {
    if (node.current.contains(e.target)) {
      return
    }
    setShowSelect(false)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  return (
    <ThemeProvider theme={themes[props.theme]}>
      <Container completed={props.completed} ref={node}>
        <Button
          spacing="compact"
          type={props.style || 'default'}
          onClick={(e) => {
            if (props.completed) return
            setShowSelect(!showSelect)
            e.stopPropagation()
          }}
          text={props.buttonText ? props.buttonText : props.defaultButtonText}
          iconColour={
            props.buttonIconColour ? props.buttonIconColour : props.defaultButtonIconColour
          }
          icon={props.buttonIcon ? props.buttonIcon : props.defaultButtonIcon}
          isDisabled={props.deleted}
        />
        {(showSelect || props.showSelect) && (
          <SelectContainer>
            <Creatable
              autoFocus={true}
              placeholder={props.selectPlaceholder}
              isSearchable
              onChange={handleChange}
              options={props.options}
              styles={selectStyles({
                fontSize: 'xxsmall',
                theme: themes[props.theme],
              })}
              escapeClearsValue={true}
              defaultMenuIsOpen={true}
              onKeyDown={(e) => {
                if (e.key == 'Escape') {
                  setShowSelect(false)
                  if (props.onEscape) {
                    props.onEscape()
                  }
                }
                e.stopPropagation()
              }}
            />
          </SelectContainer>
        )}
      </Container>
    </ThemeProvider>
  )
}

const mapStateToProps = (state): StateProps => ({
  theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch): {} => ({})
export default connect(mapStateToProps, mapDispatchToProps)(ButtonDropdown)
