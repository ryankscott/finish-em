import { Box, Icon, IconButton, Tooltip } from '@chakra-ui/react'

import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { CREATE_PROJECT, GET_SIDEBAR } from '../queries'
import { getProductName } from '../utils'
import { v4 as uuidv4 } from 'uuid'
import { Icons } from '../assets/icons'

interface SidebarAddProjectButtonProps {
  areaKey: string
}

const SidebarAddProjectButton = ({ areaKey }: SidebarAddProjectButtonProps) => {
  const navigate = useNavigate()
  const [createProject] = useMutation(CREATE_PROJECT, {
    refetchQueries: [GET_SIDEBAR]
  })
  return (
    <Tooltip label="Add Project">
      <Box>
        <IconButton
          m={0}
          w={9}
          h={9}
          aria-label="add-project"
          variant="dark"
          icon={<Icon as={Icons.add} />}
          onClick={async () => {
            const projectKey = uuidv4()
            await createProject({
              variables: {
                key: projectKey,
                name: getProductName(),
                description: '',
                startAt: null,
                endAt: null,
                areaKey: areaKey
              }
            })
            navigate(`/views/${projectKey}`)
          }}
        />
      </Box>
    </Tooltip>
  )
}

export { SidebarAddProjectButton }
