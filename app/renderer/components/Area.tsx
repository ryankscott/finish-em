import { gql, useMutation, useQuery } from '@apollo/client'
import { Flex, Grid, GridItem, Text } from '@chakra-ui/react'
import { useTheme } from '@chakra-ui/system'
import { parseISO } from 'date-fns'
import { Emoji, Picker } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'
import marked from 'marked'
import React, { ReactElement, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { Area as AreaType, Project } from '../../main/generated/typescript-helpers'
import { formatRelativeDate } from '../utils'
import DeleteAreaDialog from './DeleteAreaDialog'
import { Donut } from './Donut'
import EditableText from './EditableText'
import EditableText2 from './EditableText2'
import FilteredItemList from './FilteredItemList'
import { Page } from './Page'
import { Title } from './Typography'

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
    newEditor: featureByName(name: "newEditor") {
      key
      enabled
    }
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
  const theme = useTheme()
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
  return (
    <Page>
      <Grid
        autoRows={'60px 40px'}
        templateColumns={'120px 1fr'}
        alignItems={'center'}
        paddingY={2}
        paddingX={0}
      >
        <GridItem colStart={2} colSpan={1}>
          <Flex alignItems={'flex-start'}>
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
          </Flex>
        </GridItem>
        <GridItem
          rowStart={1}
          rowSpan={2}
          colSpan={1}
          colStart={1}
          bg={'gray.100'}
          my={0}
          w={'100px'}
          h={'100px'}
          borderRadius={'50%'}
          cursor={'pointer'}
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker)
          }}
          _hover={{
            bg: 'gray.200',
          }}
        >
          <Flex justifyContent={'center'} alignItems={'center'}>
            <Emoji emoji={area.emoji ? area.emoji : ''} size={68} native={true} />
          </Flex>
        </GridItem>
        {showEmojiPicker && (
          <Picker
            native={true}
            title=""
            emoji=""
            color={theme.colors.blue[500]}
            onSelect={(emoji) => {
              setEmoji({ variables: { key: area.key, emoji: emoji.id } })
              setShowEmojiPicker(false)
            }}
          />
        )}
      </Grid>
      {data.newEditor.enabled ? (
        <EditableText2
          singleLine={false}
          placeholder="Add a description for your area..."
          shouldClearOnSubmit={false}
          hideToolbar={false}
          shouldSubmitOnBlur={true}
          onUpdate={(input) => {
            changeDescriptionArea({ variables: { key: area.key, description: input } })
          }}
        />
      ) : (
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
      )}
      <Text my={3} fontSize={'xl'} color="blue.500">
        Items
      </Text>
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
      <Text my={3} mt={6} fontSize={'xl'} color="blue.500">
        Projects
      </Text>
      {area.projects.map((p: Project) => {
        const totalItemsCount = p.items.length
        const completedItemsCount = p.items.filter((i) => i.completed == true && i.deleted == false)
          .length
        const progress =
          totalItemsCount == 0
            ? 0
            : completedItemsCount == 0
            ? 0
            : totalItemsCount / completedItemsCount
        return (
          <Grid
            position={'relative'}
            transition={'max-height 0.2s ease-in-out, opacity 0.05s ease-in-out'}
            maxH={'200px'}
            maxW={'650px'}
            my={1}
            mx={0}
            templateColumns={'35px minmax(180px, auto) auto'}
            templateRows={'minmax(20px, auto) minmax(20px, auto)'}
            padding={1}
            alignItems={'center'}
            cursor={'pointer'}
            borderRadius={3}
            _hover={{
              bg: 'gray.100',
            }}
            _after={{
              content: "''",
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              margin: '0px auto',
              height: 1,
              width: 'calc(100% - 10px)',
              borderBottom: '1px solid',
              borderColor: 'gray.100',
            }}
            key={p.key}
            onClick={() => {
              history.push(`/views/${p.key}`)
            }}
          >
            <GridItem colSpan={1} rowSpan={2} colStart={1} rowStart={1}>
              <Donut
                size={24}
                progress={progress}
                activeColour={theme.colors.blue[500]}
                inactiveColour={theme.colors.gray[100]}
              />
            </GridItem>
            <GridItem colSpan={1} colStart={2}>
              <Text fontSize="lg">{p.name}</Text>
            </GridItem>
            <GridItem colSpan={1} colStart={3}>
              <Text
                dangerouslySetInnerHTML={{
                  __html: marked(p.description, { breaks: true }),
                }}
              ></Text>
            </GridItem>
            <GridItem rowStart={2} colStart={2} colSpan={1}>
              <Text>{p.startAt && `Starting: ${formatRelativeDate(parseISO(p.startAt))}`}</Text>
            </GridItem>
            <GridItem rowStart={2} colStart={3} colSpan={1}>
              <Text>{p.endAt && `Ending: ${formatRelativeDate(parseISO(p.endAt))}`}</Text>
            </GridItem>
          </Grid>
        )
      })}
    </Page>
  )
}

export default Area
