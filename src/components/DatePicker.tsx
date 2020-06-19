import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import { Container, SelectContainer } from './styled/DatePicker'
import DateRenderer from './DateRenderer'
import DateSelect from './DateSelect'
import { IconType } from '../interfaces'
import { connect } from 'react-redux'

interface StateProps {
    theme: string
}
interface OwnProps {
    onSubmit: (d: string) => void
    onEscape?: () => void
    style?: 'default' | 'subtle' | 'subtleInvert'
    showSelect?: boolean
    placeholder: string
    completed: boolean
    text: string
    textSize?: 'xxxsmall' | 'xxsmall' | 'xsmall' | 'small' | 'regular' | 'large'
    icon?: IconType
}

type DatePickerProps = StateProps & OwnProps

function DatePicker(props: DatePickerProps): ReactElement {
    const [showSelect, setShowSelect] = useState(false)
    const node = useRef()

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
            <Container ref={node}>
                <DateRenderer
                    style={props.style}
                    completed={props.completed}
                    textSize={props.textSize}
                    icon={props.icon}
                    position="center"
                    text={props.text}
                    onClick={(e) => {
                        e.stopPropagation()
                        if (props.completed) return
                        setShowSelect(!showSelect)
                    }}
                />
                {(props.showSelect || showSelect) && (
                    <SelectContainer>
                        <DateSelect
                            placeholder={props.placeholder}
                            onEscape={() => {
                                setShowSelect(false)
                                if (props.onEscape) {
                                    props.onEscape()
                                }
                            }}
                            onSubmit={(d) => {
                                setShowSelect(false)
                                props.onSubmit(d)
                            }}
                            textSize={props.textSize}
                        ></DateSelect>
                    </SelectContainer>
                )}
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(DatePicker)
