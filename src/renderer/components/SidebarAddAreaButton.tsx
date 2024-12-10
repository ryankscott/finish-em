import { Button, Box, Flex, Tooltip, Icon } from '@chakra-ui/react'

import { v4 as uuidv4 } from 'uuid'
import { Icons } from '../assets/icons'
import { CREATE_AREA, GET_SIDEBAR } from '../queries'
import { useMutation } from '@apollo/client'
import { getProductName } from '../utils'
import { useNavigate } from 'react-router-dom'

const SidebarAddAreaButton = () => {
  const navigate = useNavigate()
  const [createArea] = useMutation(CREATE_AREA, {
    refetchQueries: [GET_SIDEBAR]
  })
  return (
    <Flex mt={2} w="100%" justifyContent="center" bg="gray.100">
      <Tooltip label="Add Area" key={uuidv4()}>
        <Box>
          <Button
            mb={2}
            size="sm"
            variant="subtle"
            rightIcon={<Icon as={Icons.add} />}
            onClick={async () => {
              const areaKey = uuidv4()
              await createArea({
                variables: {
                  key: areaKey,
                  name: getProductName(),
                  description: ''
                }
              })
              navigate(`/views/${areaKey}`)
            }}
          >
            Add Area
          </Button>
        </Box>
      </Tooltip>
    </Flex>
  )
}

export { SidebarAddAreaButton }
