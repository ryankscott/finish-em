import { useMutation } from '@apollo/client'
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
  Switch,
  Text,
  useToast
} from '@chakra-ui/react'
import { useState } from 'react'
import { LOGIN_USER } from '../queries'
import { emailRegex } from '../utils'
import CloudIcon from './CloudIcon'

interface CloudSyncSignInProps {
  setMode: (mode: 'signup') => void
  onClose: () => void
}

const CloudSyncSignIn = ({ onClose, setMode }: CloudSyncSignInProps) => {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [isEmailValid, setIsEmailValid] = useState(false)
  const [password, setPassword] = useState('')
  const [shouldSync, setShouldSync] = useState(true)
  const [backedUp, setBackedUp] = useState(false)
  const [loginUser, { data, loading, error }] = useMutation(LOGIN_USER)

  const toast = useToast()

  if (data && !loading) {
    toast({
      title: 'Signed in.',
      variant: 'subtle',
      description: 'Successfully signed in to your account.',
      status: 'success',
      duration: 9000,
      isClosable: true
    })
    const { loginUser } = data
    const { email, token, key } = loginUser

    window.api.setSetting('cloudSync', {
      enabled: true,
      email: email,
      token: token
    })

    localStorage.setItem('token', token)

    if (shouldSync) {
      window.api.backupToCloud(key).then(() => {
        console.log('backed up')
        setBackedUp(true)
      })
    }
    return (
      <ModalContent>
        <ModalCloseButton />
        <ModalBody mx={4}>
          <Flex direction="column" my={2} mt={8}>
            <CloudIcon />
            <Flex w="100%" alignItems="center" direction="column" py={4}>
              <Text fontSize="lg" mb={4}>
                {shouldSync
                  ? 'Finish-em will now synchronise your data with the cloud. Once completed you can restart to start using Finish-em Cloud'
                  : 'Please restart Finish-em to start using cloud sync.'}
              </Text>

              <Button
                isLoading={shouldSync ? !backedUp : false}
                isDisabled={shouldSync ? !backedUp : false}
                colorScheme="blue"
                w="140px"
                size="md"
                onClick={() => {
                  window.api.restartApp()
                }}
              >
                Restart
              </Button>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    )
  }

  if (error) {
    toast({
      title: 'Failed to sign in to account.',
      variant: 'subtle',
      description: `Something went wrong when signing into your account - ${error.message}.`,
      status: 'error',
      duration: 9000,
      isClosable: true
    })
  }

  const handlePasswordChange = (event) => setPassword(event.target.value)
  const handleEmailChange = (event) => {
    setIsEmailValid(emailRegex.test(event.target.value))
    setEmail(event.target.value)
  }
  const handleClick = () => setShow(!show)
  return (
    <ModalContent>
      <ModalCloseButton />
      <ModalBody mx={4}>
        <Flex direction="column" my={2} mt={8}>
          <CloudIcon />
          <Text fontSize="lg" mb={4}>
            Sign in to Finish-em Cloud to enable cross-device sync.
          </Text>

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
          <Flex alignItems="center" py={2}>
            <Text pr={2} fontSize="sm">
              Synchronise your local database with the cloud?
            </Text>
            <Switch
              size="sm"
              isChecked={shouldSync}
              onChange={(e) => setShouldSync(e.target.checked)}
            />
          </Flex>
        </Flex>
        <Flex w="100%" justifyContent="start" alignItems="baseline">
          <Text fontSize="md" my={2}>
            Don't have an account?
          </Text>
          <Button variant="ghost" size="sm" onClick={() => setMode('signup')}>
            Sign up
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
              await loginUser({
                variables: {
                  email: email,
                  password: password
                }
              })
            } catch (e) {
              toast({
                title: 'Failed sign in to account.',
                variant: 'subtle',
                description: e.message,
                status: 'error',
                duration: 9000,
                isClosable: true
              })
            }
          }}
        >
          Sign in
        </Button>
        <Button variant="ghost">Cancel</Button>
      </ModalFooter>
    </ModalContent>
  )
}

export default CloudSyncSignIn
