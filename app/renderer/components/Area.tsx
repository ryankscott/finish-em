import { gql, useMutation, useQuery } from '@apollo/client'
import { parseISO } from 'date-fns'
import marked from 'marked'
import { darken } from 'polished'
import React, { ReactElement, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Project } from '../../main/generated/typescript-helpers'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { formatRelativeDate } from '../utils'
import DeleteAreaDialog from './DeleteAreaDialog'
import { Donut } from './Donut'
import EditableText from './EditableText'
import FilteredItemList from './FilteredItemList'
import {
  AreaContainer,
  DescriptionContainer,
  EmojiContainer,
  EmojiPickerWrapper,
  HeaderContainer,
  ProjectContainer,
  ProjectDescription,
  ProjectEndAt,
  ProjectName,
  ProjectStartAt,
} from './styled/Area'
import { Header, Title } from './Typography'
import { Area as AreaType } from '../../main/generated/typescript-helpers'
import { toast } from 'react-toastify'
import 'emoji-mart/css/emoji-mart.css'
import { Picker, Emoji } from 'emoji-mart'

const GET_AREA_BY_KEY = gql`
  query AreaByKey($key: String!) {
    area(key: $key) {
      key
      name
      deleted
      description
      lastUpdatedAt
      deletedAt
      createdAt
      emoji
      projects {
        key
        name
        description
        items {
          type
          key
          text
        }
      }
      items {
        key
        type
        text
        deleted
        completed
        dueAt
        scheduledAt
        repeat
      }
    }
    areas {
      key
      name
      emoji
    }
    theme @client
  }
`

const DELETE_AREA = gql`
  mutation DeleteArea($key: String!) {
    deleteArea(input: { key: $key }) {
      key
    }
  }
`

const CHANGE_DESCRIPTION_AREA = gql`
  mutation ChangeDescriptionArea($key: String!, $description: String!) {
    changeDescriptionArea(input: { key: $key, description: $description }) {
      key
      description
    }
  }
`

const RENAME_AREA = gql`
  mutation RenameArea($key: String!, $name: String!) {
    renameArea(input: { key: $key, name: $name }) {
      key
      name
    }
  }
`
const SET_EMOJI = gql`
  mutation SetEmojiOfArea($key: String!, $emoji: String!) {
    setEmojiOfArea(input: { key: $key, emoji: $emoji }) {
      key
      emoji
    }
  }
`

type AreaProps = {
  areaKey: string
}
const Area = (props: AreaProps): ReactElement => {
  const history = useHistory()

  const name = React.useRef<HTMLInputElement>()
  const description = React.useRef<HTMLInputElement>()
  const [setEmoji] = useMutation(SET_EMOJI)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [deleteArea] = useMutation(DELETE_AREA, {
    update(cache, { data: { deleteArea } }) {
      const cacheId = cache.identify({
        __typename: 'Area',
        key: props.areaKey,
      })

      cache.evict({ id: cacheId })
    },
  })
  const [changeDescriptionArea] = useMutation(CHANGE_DESCRIPTION_AREA)
  const [renameArea] = useMutation(RENAME_AREA)
  const { loading, error, data } = useQuery(GET_AREA_BY_KEY, {
    variables: { key: props.areaKey },
  })
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const area: AreaType = data.area
  const areas: AreaType[] = data.areas
  const theme: ThemeType = themes[data.theme]

  return (
    <ThemeProvider theme={theme}>
      <AreaContainer>
        <HeaderContainer>
          <DescriptionContainer>
            <EditableText
              shouldSubmitOnBlur={true}
              key={area.key + 'name'}
              input={area.name}
              style={Title}
              singleline={true}
              innerRef={name}
              onUpdate={(input) => {
                const exists = areas.map((a) => a.name == input).includes(true)
                if (exists) {
                  toast.error('Cannot rename area, an area with that name already exists')
                } else {
                  renameArea({ variables: { key: area.key, name: input } })
                }
              }}
              shouldClearOnSubmit={false}
            />
            <DeleteAreaDialog
              onDelete={() => {
                deleteArea({ variables: { key: area.key } })
                history.push('/inbox')
              }}
            />
          </DescriptionContainer>
          <EmojiContainer
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker)
            }}
          >
            <Emoji emoji={area.emoji ? area.emoji : ''} size={68} native={true} />
          </EmojiContainer>
          {showEmojiPicker && (
            <EmojiPickerWrapper>
              <Picker
                native={true}
                title=""
                emoji=""
                color={theme.colours.primaryColour}
                onSelect={(emoji) => {
                  setEmoji({ variables: { key: area.key, emoji: emoji.id } })
                  setShowEmojiPicker(false)
                }}
              />
            </EmojiPickerWrapper>
          )}
        </HeaderContainer>

        <EditableText
          placeholder="Add a description for your area..."
          shouldSubmitOnBlur={true}
          key={area.key + 'description'}
          onUpdate={(input) => {
            changeDescriptionArea({ variables: { key: area.key, description: input } })
          }}
          innerRef={description}
          input={area.description}
          height="150px"
          shouldClearOnSubmit={false}
        />
        <Header>Items</Header>
        <FilteredItemList
          componentKey={uuidv4()}
          isFilterable={false}
          filter={JSON.stringify({
            text: `area = "${area.name}" and type = "TODO" and deleted = "false"`,
            value: [
              { category: 'areaKey', operator: '=', value: area.key },
              { conditionType: 'AND', category: 'type', operator: '=', value: 'TODO' },
              { conditionType: 'AND', category: 'deleted', operator: '=', value: 'false' },
            ],
          })}
          flattenSubtasks={true}
          readOnly={true}
        />
        <Header>Projects</Header>
        {area.projects.map((p: Project) => {
          const totalItemsCount = p.items.length
          const completedItemsCount = p.items.filter(
            (i) => i.completed == true && i.deleted == false,
          ).length
          const progress =
            totalItemsCount == 0
              ? 0
              : completedItemsCount == 0
              ? 0
              : totalItemsCount / completedItemsCount
          return (
            <ProjectContainer
              key={p.key}
              onClick={() => {
                history.push(`/views/${p.key}`)
              }}
            >
              <div style={{ gridArea: 'donut' }}>
                <Donut
                  size={24}
                  progress={progress}
                  activeColour={theme.colours.primaryColour}
                  inactiveColour={darken(0.2, theme.colours.backgroundColour)}
                />
              </div>
              <ProjectName>{p.name}</ProjectName>
              <ProjectDescription
                dangerouslySetInnerHTML={{
                  __html: marked(p.description, { breaks: true }),
                }}
              />
              <ProjectStartAt>
                {p.startAt && `Starting: ${formatRelativeDate(parseISO(p.startAt))}`}
              </ProjectStartAt>
              <ProjectEndAt>
                {p.endAt && `Ending: ${formatRelativeDate(parseISO(p.endAt))}`}
              </ProjectEndAt>
            </ProjectContainer>
          )
        })}
      </AreaContainer>
    </ThemeProvider>
  )
}

export default Area
