import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes, selectStyles } from '../theme'
import Button from './Button'
import Tooltip from './Tooltip'
import { lighten } from 'polished'
import Select, { GroupType } from 'react-select'
import { removeItemTypeFromString, markdownLinkRegex, markdownBasicRegex } from '../utils'
import { useHistory } from 'react-router'
import {
  ShortcutIcon,
  IconContainer,
  SelectContainer,
  FeedbackIcon,
  Container,
} from './styled/Headerbar'
import { Icons } from '../assets/icons'
import { gql, useQuery } from '@apollo/client'
import { activeItemVar, focusbarVisibleVar } from '..'
import { Item, Project } from '../../main/generated/typescript-helpers'
import { ThemeType } from '../interfaces'
import { sortBy } from 'lodash'

type OptionType = { label: string; value: () => void }

const GET_DATA = gql`
  query {
    projects(input: { deleted: false }) {
      key
      name
    }
    areas {
      key
      name
    }
    items {
      key
      text
      deleted
      lastUpdatedAt
    }
    theme @client
  }
`

type HeaderbarProps = {
  searchRef: React.RefObject<HTMLSelectElement>
}

const Headerbar = (props: HeaderbarProps): ReactElement => {
  const history = useHistory()
  const [showTRex, setShowTRex] = useState(false)
  const { loading, error, data } = useQuery(GET_DATA)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }

  const generateOptions = (projects: Project[], items: Item[]): GroupType<OptionType>[] => {
    const sortedItems = sortBy(items, ['lastUpdatedAt'], ['desc'])
    const itemOptions = sortedItems
      .filter((i) => i.deleted == false)
      .map((i) => {
        return {
          label: removeItemTypeFromString(i.text)
            .replace(markdownLinkRegex, '$1')
            .replace(markdownBasicRegex, '$1'),
          value: () => {
            focusbarVisibleVar(true)
            activeItemVar(i.key)
          },
        }
      })

    const projectOptions = projects.map((p) => {
      return {
        label: p.name,
        value: () => history.push(`/projects/${p.key}`),
      }
    })

    return [
      { label: 'Items', options: itemOptions },
      { label: 'Projects', options: projectOptions },
    ]
  }

  const theme: ThemeType = themes[data.theme]
  return (
    <Container>
      <ThemeProvider theme={theme}>
        <IconContainer onClick={() => setShowTRex(!showTRex)}>
          {showTRex ? <span style={{ fontSize: '36px' }}>🦖</span> : Icons['finish_em'](36, 36)}
        </IconContainer>
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
            options={generateOptions(data.projects, data.items)}
            styles={selectStyles({
              fontSize: 'xsmall',
              theme: theme,
              width: '400px',
              backgroundColour: lighten(0.2, theme.colours.headerBackgroundColour),
            })}
          />
        </SelectContainer>
        <FeedbackIcon>
          <Button
            dataFor="feedback-button"
            type="subtle"
            icon="feedback"
            iconSize="20px"
            iconColour={theme.colours.altTextColour}
            onClick={() => window.open('https://github.com/ryankscott/finish-em/issues/new/')}
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
            iconColour={theme.colours.altTextColour}
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

export default Headerbar
