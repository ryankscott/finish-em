import React, { ReactElement } from 'react'
import Button from './Button'
import Select from './Select'
import { removeItemTypeFromString, markdownLinkRegex, markdownBasicRegex } from '../utils'
import { useHistory } from 'react-router'

import { gql, useQuery } from '@apollo/client'
import { activeItemVar, focusbarVisibleVar } from '..'
import { Item, Project } from '../../main/generated/typescript-helpers'
import { sortBy } from 'lodash'
import { CommandBar } from './CommandBar'
import { Flex, Grid, GridItem, useTheme } from '@chakra-ui/react'

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
  }
`

type HeaderbarProps = {
  searchRef: React.RefObject<HTMLSelectElement>
}

const Headerbar = (props: HeaderbarProps): ReactElement => {
  const theme = useTheme()
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

  return (
    <Grid
      w={'100%'}
      alignItems="center"
      gridTemplateColumns={'1fr repeat(3, 35px)'}
      gridTemplateRows={'50px'}
      zIndex={2}
      color={'gray.50'}
      bg={'gray.800'}
      px={2}
    >
      <GridItem as={Flex} justifyContent="flex-end" colSpan={1}>
        <Flex w={'350px'} py={0} px={2}>
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
        </Flex>
      </GridItem>
      <GridItem>
        <Flex
          direction="row"
          justifyContent={'center'}
          alignItems={'center'}
          p={3}
          _hover={{ cursor: 'pointer' }}
        >
          <CommandBar />
        </Flex>
      </GridItem>
      <GridItem>
        <Flex
          direction="row"
          justifyContent={'center'}
          alignItems={'center'}
          p={3}
          _hover={{ cursor: 'pointer' }}
        >
          <Button
            size="md"
            variant="invert"
            icon="feedback"
            iconSize="20px"
            iconColour={theme.colors.gray[100]}
            tooltipText={'Give feedback'}
            onClick={() => window.open('https://github.com/ryankscott/finish-em/issues/new/')}
          />
        </Flex>
      </GridItem>
      <GridItem>
        <Flex
          direction="row"
          justifyContent={'center'}
          alignItems={'center'}
          p={3}
          _hover={{ cursor: 'pointer' }}
        >
          <Button
            size="md"
            id="shortcut-button"
            variant="invert"
            icon="help"
            iconSize="20px"
            iconColour={theme.colors.gray[100]}
            tooltipText="Show shortcuts"
            onClick={() => {
              history.push('/help/')
            }}
          />
        </Flex>
      </GridItem>
    </Grid>
  )
}

export default Headerbar
