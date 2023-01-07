import { useMutation } from '@apollo/client';
import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CREATE_USER } from '../queries';
import { emailRegex } from '../utils';
import CloudIcon from './CloudIcon';

interface CloudSyncSignUpProps {
  setMode: (mode: 'signin') => void;
  onClose: () => void;
}

const CloudSyncSignUp = ({ onClose, setMode }: CloudSyncSignUpProps) => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [password, setPassword] = useState('');
  const [createUser, { data, loading, error }] = useMutation(CREATE_USER);
  const toast = useToast();

  const handleNameChange = (event) => setName(event.target.value);
  const handlePasswordChange = (event) => setPassword(event.target.value);
  const handleEmailChange = (event) => {
    setIsEmailValid(emailRegex.test(event.target.value));
    setEmail(event.target.value);
  };
  const handleClick = () => setShow(!show);
  if (data) {
    toast({
      title: 'Account created.',
      variant: 'subtle',
      description:
        'Successfully created your account. Please sign-in to continue',
      status: 'success',
      duration: 9000,
      isClosable: true,
    });
    return (
      <ModalContent>
        <ModalCloseButton />
        <ModalBody mx={4}>
          <Flex direction="column" my={2} mt={8}>
            <CloudIcon />
            <Flex w="100%" alignItems="center" direction="column" py={4}>
              <Text fontSize="lg" mb={4}>
                To complete your account process please sign in
              </Text>

              <Button
                colorScheme="blue"
                w="140px"
                size="md"
                onClick={() => {
                  setMode('signin');
                }}
              >
                Sign in
              </Button>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    );
  }
  if (error) {
    console.log(error);
    toast({
      title: 'Failed to create account.',
      variant: 'subtle',
      description: `Something went wrong when creating your account - ${error.message}.`,
      status: 'error',
      duration: 9000,
      isClosable: true,
    });
  }

  return (
    <ModalContent>
      <ModalCloseButton />
      <ModalBody mx={4}>
        <Flex direction="column" my={2} mt={8}>
          <CloudIcon />
          <Text fontSize="lg" mb={4}>
            Sign up to Finish Em cloud sync to enable cross-device sync
          </Text>
          <Input
            value={name}
            borderRadius="md"
            size="md"
            placeholder="Name"
            onChange={handleNameChange}
          />

          <Input
            type="email"
            value={email}
            borderRadius="md"
            size="md"
            my={2}
            placeholder="Email address"
            isInvalid={!isEmailValid && email != ''}
            onChange={handleEmailChange}
          />
          <InputGroup size="md">
            <Input
              value={password}
              onChange={handlePasswordChange}
              size="md"
              type={show ? 'text' : 'password'}
              placeholder="Password"
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </Flex>
        <Flex w="100%" justifyContent="start" alignItems="baseline">
          <Text fontSize="md" my={2}>
            Already have an account?
          </Text>
          <Button variant="ghost" size="sm" onClick={() => setMode('signin')}>
            Sign in
          </Button>
        </Flex>
      </ModalBody>

      <ModalFooter>
        <Button
          isLoading={loading}
          isDisabled={!isEmailValid || !password}
          colorScheme="blue"
          mr={3}
          onClick={async () => {
            try {
              const key = uuidv4();
              await createUser({
                variables: {
                  key: key,
                  email: email,
                  name: name,
                  password: password,
                },
              });
            } catch (e) {
              toast({
                title: 'Failed to create account.',
                variant: 'subtle',
                description: e.message,
                status: 'error',
                duration: 9000,
                isClosable: true,
              });
              console.log(e.message);
            }
          }}
        >
          Sign up
        </Button>
        <Button variant="ghost">Cancel</Button>
      </ModalFooter>
    </ModalContent>
  );
};

export default CloudSyncSignUp;
