import { Button, Flex, Icon } from '@chakra-ui/react';

import { v4 as uuidv4 } from 'uuid';
import { Icons } from '../assets/icons';
import { CREATE_PROJECT, GET_SIDEBAR } from 'renderer/queries';
import { useMutation } from '@apollo/client';
import { getProductName } from 'renderer/utils';
import { useNavigate } from 'react-router-dom';

interface SidebarAddProjectButtonProps {
  sidebarVisible: boolean;
}

const SidebarAddProjectButton = ({
  sidebarVisible,
}: SidebarAddProjectButtonProps) => {
  const navigate = useNavigate();
  const [createProject] = useMutation(CREATE_PROJECT, {
    refetchQueries: [GET_SIDEBAR],
  });
  if (!sidebarVisible) return null;
  return (
    <Flex w="100%" justifyContent="center">
      <Button
        mb={2}
        size="sm"
        variant="dark"
        rightIcon={<Icon as={Icons.add} />}
        onClick={async () => {
          const projectKey = uuidv4();
          await createProject({
            variables: {
              key: projectKey,
              name: getProductName(),
              description: '',
              startAt: null,
              endAt: null,
              areaKey: a.key,
            },
          });
          navigate(`/views/${projectKey}`);
        }}
      >
        Add Project
      </Button>
    </Flex>
  );
};

export { SidebarAddProjectButton };
