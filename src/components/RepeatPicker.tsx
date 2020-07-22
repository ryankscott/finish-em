import React, { ReactElement, useState, useRef, useEffect } from 'react'
import { ThemeProvider } from '../StyledComponents'
import Select from 'react-select'
import { themes, selectStyles } from '../theme'
import { format } from 'date-fns'
import { RRule } from 'rrule'
import { SelectContainer } from './styled/RepeatPicker'
import DateRenderer from './DateRenderer'
import RepeatDialog from './RepeatDialog'
import { rruleToText, capitaliseFirstLetter } from '../utils'
import { connect } from 'react-redux'

const options = [
    {
        value: new RRule({
            freq: RRule.DAILY,
            interval: 1,
        }),
        label: 'Daily',
    },
    {
        value: new RRule({
            freq: RRule.DAILY,
            interval: 1,
            byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
        }),
        label: 'Weekdays',
    },
    {
        value: new RRule({
            freq: RRule.WEEKLY,
            interval: 1,
            byweekday: new Date().getDay() - 1,
        }),
        label: 'Weekly on ' + format(new Date(), 'EEE'),
    },
    {
        value: new RRule({
            freq: RRule.MONTHLY,
            interval: 1,
            bymonthday: new Date().getDate(),
        }),
        label: 'Monthly on the ' + format(new Date(), 'do'),
    },
    { value: null, label: 'Custom repeat' },
    { value: null, label: 'None' },
]

interface StateProps {
    theme: string
}

interface OwnProps {
    repeat: RRule
    onSubmit: (value: RRule) => void
    onEscape?: () => void
    showSelect?: boolean
    placeholder: string
    completed: boolean
    deleted?: boolean
    style?: 'default' | 'subtle' | 'subtleInvert'
}

type RepeatPickerProps = OwnProps & StateProps

function RepeatPicker(props: RepeatPickerProps): ReactElement {
    const [showSelect, setShowSelect] = useState(false)
    const [repeatDialogVisible, setRepeatDialogVisible] = useState(false)
    const handleChange = (newValue, actionMeta): void => {
        if (actionMeta.action == 'select-option') {
            if (newValue.label == 'Custom repeat') {
                setRepeatDialogVisible(true)
                return
            }
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

    const repeatText = props.repeat ? capitaliseFirstLetter(rruleToText(props.repeat)) : 'Repeat'
    const repeatLongText = props.repeat ? capitaliseFirstLetter(props.repeat.toText()) : ''
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <div ref={node}>
                <DateRenderer
                    tooltipText={repeatLongText}
                    completed={props.completed}
                    icon="repeat"
                    position="center"
                    style={props.style}
                    text={repeatText}
                    deleted={props.deleted}
                    onClick={(e) => {
                        e.stopPropagation()
                        if (props.completed) return
                        setShowSelect(!showSelect)
                    }}
                />

                {(showSelect || props.showSelect) && (
                    <>
                        <SelectContainer>
                            <Select
                                autoFocus={true}
                                placeholder={props.placeholder}
                                onChange={handleChange}
                                options={options}
                                tabIndex="0"
                                defaultMenuIsOpen={true}
                                escapeClearsValue={true}
                                onKeyDown={(e) => {
                                    if (e.key == 'Escape') {
                                        setShowSelect(false)
                                        if (props.onEscape) {
                                            props.onEscape()
                                        }
                                    }
                                }}
                                styles={selectStyles({
                                    fontSize: 'xxsmall',
                                    minWidth: '140px',
                                    theme: themes[props.theme],
                                })}
                            />
                            {repeatDialogVisible && (
                                <RepeatDialog
                                    onSubmit={(r) => {
                                        props.onSubmit(r)
                                        setRepeatDialogVisible(false)
                                        setShowSelect(false)
                                    }}
                                ></RepeatDialog>
                            )}
                        </SelectContainer>
                    </>
                )}
            </div>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch) => ({})
export default connect(mapStateToProps, mapDispatchToProps)(RepeatPicker)
