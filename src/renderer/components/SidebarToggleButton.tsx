import React from 'react'
import { IconButton } from '@chakra-ui/react'
import { BsWindowSidebar } from 'react-icons/bs'
import { v4 as uuidv4 } from 'uuid'
import { AppState, useBoundStore } from '../state'

const SidebarToggleButton = () => {
  const [sidebarVisible, setSidebarVisible] = useBoundStore((state: AppState) => [
    state.sidebarVisible,
    state.setSidebarVisible
  ])
  return (
    <IconButton
      aria-label="Toggle sidebar"
      key={uuidv4()}
      icon={<BsWindowSidebar color="black" />}
      size="16px"
      transition="all 0.2s ease-in-out"
      onClick={() => {
        setSidebarVisible(!sidebarVisible)
      }}
    />
  )
}
export default SidebarToggleButton
