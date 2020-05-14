import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { Button } from './Button'
import { flagIcon } from '../assets/icons'
import { Uuid } from '@typed/uuid'
import { toggleFlag } from '../actions'
import { connect } from 'react-redux'
import { DialogContainer, Icon, Option } from './styled/MoreDropdown'

interface DispatchProps {
    toggleFlag: (id: Uuid) => void
}

interface StateProps {}
interface OwnProps {
    itemId: Uuid
    showDialog?: boolean
    disableClick?: boolean
}

type MoreDropdownProps = DispatchProps & StateProps & OwnProps

function MoreDropdown(props: MoreDropdownProps): ReactElement {
    const [showDialog, setShowDialog] = useState(false)

    return (
        <ThemeProvider theme={theme}>
            <div>
                <Button
                    type={'subtleInvert'}
                    spacing={'default'}
                    icon={'more'}
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
                            {'Add Flag'}
                        </Option>
                    </DialogContainer>
                )}
            </div>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    toggleFlag: (id: Uuid) => {
        dispatch(toggleFlag(id))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(MoreDropdown)
