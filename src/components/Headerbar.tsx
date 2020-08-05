import React, { ReactElement } from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from '../StyledComponents'
import { themes, selectStyles } from '../theme'
import { setActiveItem, showFocusbar } from '../actions/index'
import Button from './Button'
import Tooltip from './Tooltip'
import ItemCreator from './ItemCreator'
import { lighten } from 'polished'
import Select, { GroupType } from 'react-select'
import { removeItemTypeFromString } from '../utils'
import { useHistory } from 'react-router'
import { Project, Projects } from '../interfaces/project'
import { Items, Item } from '../interfaces'
import {
    ShortcutIcon,
    ItemCreatorContainer,
    SelectContainer,
    FeedbackIcon,
    Container,
} from './styled/Headerbar'

type OptionType = { label: string; value: () => void }

interface OwnProps {
    searchRef: React.RefObject<HTMLSelectElement>
}
interface StateProps {
    theme: string
    projects: Projects
    items: Items
}

interface DispatchProps {
    setActiveItem: (id: string) => void
}

type HeaderbarProps = DispatchProps & StateProps & OwnProps

const Headerbar = (props: HeaderbarProps): ReactElement => {
    const history = useHistory()
    const generateOptions = (projects: Project, items: Item): GroupType<OptionType>[] => {
        const itemOptions = Object.values(items).map((i) => {
            return {
                label: removeItemTypeFromString(i.text),
                value: () => props.setActiveItem(i.id),
            }
        })
        const projectOptions = Object.values(projects).map((p) => {
            return {
                label: p.name,
                value: () => history.push(`/projects/${p.id}`),
            }
        })

        return [
            { label: 'Items', options: itemOptions },
            { label: 'Projects', options: projectOptions },
        ]
    }

    return (
        <Container>
            <ThemeProvider theme={themes[props.theme]}>
                <SelectContainer>
                    <Select
                        controlShouldRenderValue={false}
                        escapeClearsValue={true}
                        ref={props.searchRef}
                        width="400px"
                        height="25px"
                        placeholder="Search for items..."
                        onChange={(selected) => {
                            selected.value()
                        }}
                        options={generateOptions(props.projects.projects, props.items.items)}
                        styles={selectStyles({
                            fontSize: 'xsmall',
                            theme: themes[props.theme],
                            width: '400px',
                            backgroundColour: lighten(
                                0.2,
                                themes[props.theme].colours.headerBackgroundColour,
                            ),
                        })}
                    />
                </SelectContainer>
                <FeedbackIcon>
                    <Button
                        dataFor="feedback-button"
                        type="subtle"
                        icon="feedback"
                        iconSize="20px"
                        iconColour={themes[props.theme].colours.altTextColour}
                        onClick={() =>
                            window.open('https://github.com/ryankscott/finish-em/issues/new/')
                        }
                    ></Button>
                    <Tooltip id="feedback-button" text={'Give feedback'}></Tooltip>
                </FeedbackIcon>
                <ShortcutIcon id="shortcut-icon">
                    <Button
                        dataFor="shortcut-button"
                        id="shortcut-button"
                        type="subtle"
                        icon="help"
                        iconSize="20px"
                        iconColour={themes[props.theme].colours.altTextColour}
                        onClick={() => {
                            history.push('/help/')
                        }}
                    ></Button>
                    <Tooltip id="shortcut-button" text={'Show shortcuts'}></Tooltip>
                </ShortcutIcon>
            </ThemeProvider>
        </Container>
    )
}

const mapStateToProps = (state): StateProps => ({
    projects: state.projects,
    items: state.items,
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
    setActiveItem: (id: string) => {
        dispatch(showFocusbar())
        dispatch(setActiveItem(id))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(Headerbar)
