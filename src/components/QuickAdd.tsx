import React, { ReactElement } from 'react'
import { connect } from 'react-redux'
import { createItem } from '../actions'
import uuidv4 from 'uuid/v4'
import { Uuid } from '@typed/uuid'
import EditableText from './EditableText'
import { validateItemString } from '../utils'

interface QuickAddProps {
    projectId?: Uuid
    onSubmit: (text: string, projectId: Uuid) => void
}

const QuickAdd = (props: QuickAddProps): ReactElement => (
    <EditableText
        innerRef={React.createRef<HTMLInputElement>()}
        onUpdate={(text) => {
            props.onSubmit(text, props.projectId)
        }}
        readOnly={false}
        validation={{ validate: true, rule: validateItemString }}
        shouldSubmitOnBlur={false}
        input=""
        singleline={true}
        shouldClearOnSubmit={true}
    />
)

const mapStateToProps = () => ({})

const mapDispatchToProps = (dispatch) => ({
    onSubmit: (text: string, projectId: Uuid) => {
        dispatch(createItem(uuidv4(), text, projectId, null))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(QuickAdd)
