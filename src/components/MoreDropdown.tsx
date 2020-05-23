import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { Button } from './Button'
import { flagIcon, trashPermanentIcon } from '../assets/icons'
import { Uuid } from '@typed/uuid'
import { toggleFlag, deletePermanently } from '../actions'
import { connect } from 'react-redux'
import { DialogContainer, Icon, Option } from './styled/MoreDropdown'
import { Tooltip } from './Tooltip'

interface DispatchProps {
    toggleFlag: (id: Uuid) => void
    deletePermanently: (id: Uuid) => void
}

interface OwnProps {
    itemId: Uuid
    deleted: boolean
    showDialog?: boolean
    disableClick?: boolean
}

type MoreDropdownProps = DispatchProps & OwnProps

function MoreDropdown(props: MoreDropdownProps): ReactElement {
    const [showDialog, setShowDialog] = useState(false)

    return (
        <ThemeProvider theme={theme}>
            <div>
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
                    <DialogContainer>
                        <Option
                            key={0}
                            onClick={(e) => {
                                props.toggleFlag(props.itemId)
                                e.stopPropagation()
                                e.preventDefault()
                                setShowDialog(false)
                            }}
                        >
                            <Icon>{flagIcon(12, 12)}</Icon>
                            {'Toggle Flag'}
                        </Option>
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
                                <Icon>{trashPermanentIcon(14, 14)}</Icon>
                                {'Delete Permanently'}
                            </Option>
                        )}
                    </DialogContainer>
                )}
            </div>
            <Tooltip id="more" text={'More actions'} />
        </ThemeProvider>
    )
}

const mapStateToProps = (state): {} => ({})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    toggleFlag: (id: Uuid) => {
        dispatch(toggleFlag(id))
    },
    deletePermanently: (id: Uuid) => {
        dispatch(deletePermanently(id))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(MoreDropdown)
