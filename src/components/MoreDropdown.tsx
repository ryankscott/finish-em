import React, { ReactElement, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { Button } from './Button'
import { flagIcon } from '../assets/icons'
import { Uuid } from '@typed/uuid'
import { toggleFlag } from '../actions'
import { connect } from 'react-redux'

const DialogContainer = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    padding: 0px;
    margin: 0px;
    background-color: ${(props) => props.theme.colours.backgroundColour};
    border: 1px solid;
    border-color: ${(props) => props.theme.colours.borderColour};
    border-radius: 5px;
    min-width: 80px;
    padding: 5px 0px;
    z-index: 2;
`
const Icon = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px 2px;
    padding-right: 5px;
`

const Option = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    background-color: ${(props) => props.theme.colours.backgroundColour};
    padding: 2px 5px;
    padding-left: 10px;
    border-radius: 2px;
    :hover {
        background-color: ${(props) =>
            props.theme.colours.lightDialogBackgroundColour};
    }
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
    font-family: ${(props) => props.theme.font.sansSerif};
    color: ${(props) => props.theme.colours.defaultTextColour};
    z-index: 3;
`

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
                            {'Flag'}
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
