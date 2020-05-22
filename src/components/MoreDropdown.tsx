import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { Button } from './Button'
import { flagIcon } from '../assets/icons'
import { Uuid } from '@typed/uuid'
import { toggleFlag } from '../actions'
import { connect } from 'react-redux'
import { DialogContainer, Icon, Option } from './styled/MoreDropdown'
import { Tooltip } from './Tooltip'

interface DispatchProps {
    toggleFlag: (id: Uuid) => void
}

interface OwnProps {
    itemId: Uuid
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
})
export default connect(mapStateToProps, mapDispatchToProps)(MoreDropdown)
