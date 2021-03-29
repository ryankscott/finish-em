import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes, selectStyles } from '../theme'
import Button from './Button'
import Select from './Select'
import {
  removeItemTypeFromString,
  markdownLinkRegex,
  markdownBasicRegex,
  HTMLToPlainText,
} from '../utils'
import { useHistory } from 'react-router'
import {
  ShortcutIcon,
  SelectContainer,
  FeedbackIcon,
  Container,
  CommandIcon,
} from './styled/Headerbar'
import { gql, useQuery } from '@apollo/client'
import { activeItemVar, focusbarVisibleVar } from '..'
import { Item, Project } from '../../main/generated/typescript-helpers'
import { ThemeType } from '../interfaces'
import { sortBy } from 'lodash'
import { CommandBar } from './CommandBar'

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
            activeItemVar([i.key])
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
        <SelectContainer>
          <Select
            size="md"
            isMulti={false}
            placeholder="Search for items..."
            onChange={(selected) => {
              selected.value()
            }}
            options={generateOptions(data.projects, data.items)}
            invertColours={true}
            fullWidth={true}
          />
        </SelectContainer>
        <CommandIcon>
          <CommandBar />
        </CommandIcon>
        <FeedbackIcon>
          <Button
            size="sm"
            variant="invert"
            icon="feedback"
            iconSize="20px"
            iconColour={theme.colours.altTextColour}
            tooltipText={'Give feedback'}
            onClick={() => window.open('https://github.com/ryankscott/finish-em/issues/new/')}
          />
        </FeedbackIcon>
        <ShortcutIcon id="shortcut-icon">
          <Button
            size="sm"
            id="shortcut-button"
            variant="invert"
            icon="help"
            iconSize="20px"
            iconColour={theme.colours.altTextColour}
            tooltipText="Show shortcuts"
            onClick={() => {
              history.push('/help/')
            }}
          />
        </ShortcutIcon>
      </ThemeProvider>
    </Container>
  )
}

export default Headerbar
