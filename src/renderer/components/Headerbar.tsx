import { useQuery } from '@apollo/client'
import { Box, Flex, Icon, IconButton, Tooltip, useColorMode, useTheme } from '@chakra-ui/react'
import { sortBy } from 'lodash'
import React, { ReactElement, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GroupBase } from 'react-select'
import { Item, Project } from '../../main/resolvers-types'
import { Icons } from '../assets/icons'
import { IconType } from '../interfaces'
import { GET_HEADER_BAR_DATA } from '../queries/headerbar'
import { useBoundStore } from '../state'
import { markdownBasicRegex, markdownLinkRegex, removeItemTypeFromString } from '../utils'
import AccountMenu from './AccountMenu'
import CommandBar from './CommandBar'
import Select from './Select'

type OptionType = { label: string; value: () => void }

const HeaderItem = (props: any) => (
  <Flex
    direction="row"
    justifyContent="center"
    h="100%"
    alignItems="center"
    _hover={{ cursor: 'pointer' }}
  >
    {props.children}
  </Flex>
)

const Headerbar = (): ReactElement => {
  const theme = useTheme()
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false)
  const navigate = useNavigate()
  const { colorMode, toggleColorMode } = useColorMode()
  const { loading, error, data } = useQuery(GET_HEADER_BAR_DATA)

  window.api.getSettings().then((settings) => {
    const { cloudSync } = settings
    setCloudSyncEnabled(cloudSync.enabled)
  })

  const setActiveItemIds = useBoundStore((state) => state.setActiveItemIds)
  const setFocusbarVisible = useBoundStore((state) => state.setFocusbarVisible)

  if (loading) return <></>
  if (error) {
    console.log(error)
    return <></>
  }

  type HeaderButtonProps = {
    label: string
    icon: IconType
    iconColour: string
    disabled?: boolean
    onClickHandler: () => void
  }
  const HeaderButton = ({
    label,
    icon,
    iconColour,
    onClickHandler,
    disabled
  }: HeaderButtonProps) => (
    <Tooltip label={label}>
      <IconButton
        disabled={disabled}
        aria-label={label}
        variant="subtle"
        icon={<Icon as={Icons[icon]} h={4} w={4} />}
        color={iconColour}
        onClick={onClickHandler}
      />
    </Tooltip>
  )

  const generateSearchOptions = (projects: Project[], items: Item[]): GroupBase<OptionType>[] => {
    const sortedItems = sortBy(items, ['lastUpdatedAt'], ['desc'])
    const itemOptions = sortedItems
      .filter((i) => i.deleted === false)
      .map((i) => {
        return {
          label: removeItemTypeFromString(i.text ?? '')
            .replace(markdownLinkRegex, '$1')
            .replace(markdownBasicRegex, '$1'),
          value: () => {
            setFocusbarVisible(true)
            setActiveItemIds([i.key])
          }
        }
      })

    const projectOptions = projects.map((p) => {
      return {
        label: p.name,
        value: () => {
          navigate(`/views/${p.key}`)
        }
      }
    })

    return [
      { label: 'Items', options: itemOptions },
      { label: 'Projects', options: projectOptions }
    ]
  }

  const searchOptions = generateSearchOptions(data.projects, data.items)

  return (
    <Flex
      w="100%"
      zIndex={999}
      color="gray.50"
      borderBottom={colorMode === 'light' ? 'none' : '1px solid'}
      borderColor={colorMode === 'light' ? 'transparent' : 'gray.200'}
      bg="gray.200"
      px={2}
      pl={'60px'}
      justifyContent="space-between"
      position="fixed"
      h="50px"
      shadow="md"
      onClick={() => console.log('click')}
    >
      <Box
        w="100%"
        sx={{
          WebkitAppRegion: 'drag'
        }}
      />
      <Flex w="100%" alignItems="center" justifyContent="center">
        <Flex px={2} minW="600px">
          <Select
            isMulti={false}
            placeholder="Search for items..."
            onChange={(selected) => {
              selected.value()
            }}
            options={searchOptions}
            fullWidth
          />
        </Flex>
      </Flex>
      <Flex justifyContent="flex-end">
        <HeaderItem>
          <CommandBar />
        </HeaderItem>

        <HeaderItem>
          <HeaderButton
            label="Give feedback"
            icon={'feedback' as IconType}
            iconColour={theme.colors.gray[900]}
            onClickHandler={() => {
              window.open('https://github.com/ryankscott/finish-em/issues/new/choose')
            }}
          />
        </HeaderItem>

        <HeaderItem>
          <HeaderButton
            label={`${colorMode === 'light' ? 'Dark' : 'Light'} mode`}
            icon={colorMode === 'light' ? 'darkMode' : 'lightMode'}
            iconColour={theme.colors.gray[900]}
            onClickHandler={toggleColorMode}
          />
        </HeaderItem>

        {cloudSyncEnabled && (
          <HeaderItem>
            <AccountMenu />
          </HeaderItem>
        )}
      </Flex>
    </Flex>
  )
}

export default Headerbar
