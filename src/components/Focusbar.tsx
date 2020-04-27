import React, { ReactElement } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { connect } from 'react-redux'
import { Items, ProjectType } from '../interfaces'
import { Uuid } from '@typed/uuid'
import EditableText from './EditableText'
import { Header1, Paragraph, Header3 } from './Typography'
import {
    removeItemTypeFromString,
    rruleToText,
    formatRelativeDate,
    getProjectNameById,
} from '../utils'
import DateRenderer from './DateRenderer'
import RRule from 'rrule'
import { parseISO } from 'date-fns'
import { Button } from './Button'
import Item, { ItemProperties } from './Item'
import { hideFocusbar, setActiveItem } from '../actions/ui'
import { updateItemDescription } from '../actions'
import { useHistory } from 'react-router-dom'

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin: 5px 5px;
    padding: 5px;
    height: 100vh;
    width: 100%;
`
const SubtaskContainer = styled.div`
    display: flex;
    flex-direction: row;
    margin: 15px 0px;
    margin-top: 30px;
`
const AttributeContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 2px;
    min-height: 30px;
`
const TitleContainer = styled.div`
    display: flex;
    flex-direction: row;
    margin: 5px 0px;
    margin-bottom: 20px;
    align-items: center;
`
interface HeaderContainerProps {
    visible: boolean
}
const HeaderContainer = styled.div<HeaderContainerProps>`
    display: ${(props) => (props.visible ? 'grid' : 'none')};
    grid-template-areas: 'BACK . . . CLOSE';
    grid-template-columns: repeat(5, 1fr);
    flex-direction: row;
    width: 100%;
    margin-bottom: 10px;
`

export const Project = styled.div`
    display: flex;
    justify-content: center;
    text-align: center;
    margin: 2px;
    padding: 4px 8px;
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    color: ${(props) => props.theme.colours.altTextColour};
    background-color: ${(props) => props.theme.colours.primaryColour};
    border-radius: 5px;
`

interface OwnProps {}
interface DispatchProps {
    closeFocusbar: () => void
    setActiveItem: (id: Uuid) => void
    updateItemDescription: (id: Uuid, text: string) => void
}
interface StateProps {
    items: Items
    projects: ProjectType[]
    activeItem: Uuid
    focusbarVisible: boolean
}
type FocusbarProps = OwnProps & DispatchProps & StateProps
const Focusbar = (props: FocusbarProps): ReactElement => {
    const ref = React.createRef<HTMLInputElement>()
    const i = props.items.items[props.activeItem]
    if (!i) return
    const repeatText = i.repeat ? rruleToText(RRule.fromString(i.repeat)) : ''
    const dueDate = i.dueDate ? formatRelativeDate(parseISO(i.dueDate)) : null
    const scheduledDate = i.scheduledDate
        ? formatRelativeDate(parseISO(i.scheduledDate))
        : null

    const history = useHistory()
    function goToProject(id: Uuid): void {
        if (!id) return
        history.push(`/projects/${id}`)
    }

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <HeaderContainer visible={props.focusbarVisible}>
                    {i.parentId != null && (
                        <div style={{ gridArea: 'BACK' }}>
                            <Button
                                type="default"
                                spacing="compact"
                                onClick={() => props.setActiveItem(i.parentId)}
                                icon={'up_level'}
                            />
                        </div>
                    )}
                    <div
                        style={{
                            gridArea: 'CLOSE',
                            display: 'flex',
                            justifyContent: 'end',
                        }}
                    >
                        <Button
                            type="default"
                            spacing="compact"
                            onClick={props.closeFocusbar}
                            icon={'close'}
                        />
                    </div>
                </HeaderContainer>
                <TitleContainer>
                    <Button
                        type="default"
                        spacing="compact"
                        height="24px"
                        width="24px"
                        icon={
                            i.type == 'NOTE'
                                ? 'note'
                                : i.completed
                                ? 'todo_checked'
                                : 'todo_unchecked'
                        }
                    />
                    <EditableText
                        key={i.id}
                        innerRef={ref}
                        style={Header1}
                        input={removeItemTypeFromString(i.text)}
                        onUpdate={(text) => {
                            props.updateItemDescription(
                                i.id,
                                i.type.concat(' ', text),
                            )
                        }}
                    ></EditableText>
                </TitleContainer>

                <AttributeContainer>
                    <Paragraph>Project: </Paragraph>
                    <Button
                        type="primary"
                        spacing="compact"
                        text={getProjectNameById(i.projectId, props.projects)}
                        onClick={() => goToProject(i.projectId)}
                    />
                </AttributeContainer>
                {i.type == 'TODO' && (
                    <>
                        <AttributeContainer>
                            <Paragraph>Scheduled: </Paragraph>
                            <DateRenderer
                                completed={i.completed}
                                type="scheduled"
                                position="flex-start"
                                text={scheduledDate}
                            />
                        </AttributeContainer>
                        <AttributeContainer>
                            <Paragraph>Due: </Paragraph>
                            <DateRenderer
                                completed={i.completed}
                                type="due"
                                position="flex-start"
                                text={dueDate}
                            />
                        </AttributeContainer>
                        <AttributeContainer>
                            <Paragraph>Repeating: </Paragraph>
                            <DateRenderer
                                completed={i.completed}
                                type="repeat"
                                position="flex-start"
                                text={repeatText}
                            />
                        </AttributeContainer>
                    </>
                )}
                {i.parentId != null && (
                    <AttributeContainer>
                        <Paragraph>Parent:</Paragraph>
                        <Paragraph>
                            <Button
                                type="default"
                                spacing="compact"
                                onClick={() => {
                                    props.setActiveItem(i.parentId)
                                }}
                                text={removeItemTypeFromString(
                                    props.items.items[i.parentId].text,
                                )}
                            />
                        </Paragraph>
                    </AttributeContainer>
                )}
                {i.children.length > 0 && (
                    <SubtaskContainer>
                        <Header3>Subtasks: </Header3>
                    </SubtaskContainer>
                )}
                {i.children?.map((c) => {
                    const childItem = props.items.items[c]
                    if (!childItem) return
                    return (
                        <Item
                            {...childItem}
                            key={c}
                            noIndentOnSubtasks={true}
                            hideIcons={[
                                ItemProperties.Due,
                                ItemProperties.Scheduled,
                                ItemProperties.Repeat,
                            ]}
                        />
                    )
                })}
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    items: state.items,
    activeItem: state.ui.activeItem,
    projects: state.projects,
    focusbarVisible: state.ui.focusbarVisible,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    updateItemDescription: (id: Uuid, text: string) => {
        dispatch(updateItemDescription(id, text))
    },
    closeFocusbar: () => {
        dispatch(hideFocusbar())
    },
    setActiveItem: (id: Uuid) => {
        dispatch(setActiveItem(id))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(Focusbar)
