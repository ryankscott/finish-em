import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import Button from './Button'
import { Uuid } from '@typed/uuid'
import { connect } from 'react-redux'
import { DialogContainer, Icon, Option } from './styled/MoreDropdown'
import Tooltip from './Tooltip'
import LabelDialog from './LabelDialog'
import { deletePermanently } from '../actions/item'
import { Icons } from '../assets/icons'

interface DispatchProps {
    deletePermanently: (id: Uuid) => void
}

interface OwnProps {
    itemId: Uuid
    deleted: boolean
    showDialog?: boolean
    disableClick?: boolean
}

interface StateProps {
    theme: string
}

type MoreDropdownProps = DispatchProps & OwnProps & StateProps

function MoreDropdown(props: MoreDropdownProps): ReactElement {
    const [showDialog, setShowDialog] = useState(false)
    const [showLabelDialog, setShowLabelDialog] = useState(false)
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
            <div ref={node}>
                <Button
                    dataFor={'more'}
                    type={'subtleInvert'}
                    spacing={'default'}
                    icon={'more'}
                    width={'18px'}
                    onClick={(e) => {
                        setShowDialog(!showDialog)
                        e.stopPropagation()
                    }}
                />

                {(showDialog || props.showDialog) && (
                    <>
                        <DialogContainer>
                            {!props.deleted && (
                                <Option
                                    key={0}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        setShowLabelDialog(!showLabelDialog)
                                    }}
                                >
                                    <Icon>{Icons['flag'](12, 12)}</Icon>
                                    {'Add Label'}
                                </Option>
                            )}
                            {props.deleted && (
                                <Option
                                    key={1}
                                    onClick={(e) => {
                                        props.deletePermanently(props.itemId)
                                        e.stopPropagation()
                                        e.preventDefault()
                                        setShowDialog(false)
                                    }}
                                >
                                    <Icon>{Icons['trashPermanent'](14, 14)}</Icon>
                                    {'Delete Permanently'}
                                </Option>
                            )}
                            {showLabelDialog && (
                                <LabelDialog
                                    itemId={props.itemId}
                                    onClose={() => {
                                        setShowDialog(false)
                                        setShowLabelDialog(false)
                                    }}
                                />
                            )}
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
const mapDispatchToProps = (dispatch): DispatchProps => ({
    deletePermanently: (id: Uuid) => {
        dispatch(deletePermanently(id))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(MoreDropdown)
