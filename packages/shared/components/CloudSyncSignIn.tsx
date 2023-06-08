import { useMutation } from "@apollo/client";
import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN_USER } from "../queries";
import { emailRegex } from "../utils";
import CloudIcon from "./CloudIcon";

interface CloudSyncSignInProps {
  setMode: (mode: "signup") => void;
  onClose: () => void;
}

const CloudSyncSignIn = ({ onClose, setMode }: CloudSyncSignInProps) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [password, setPassword] = useState("");
  const [loginUser, { data, loading, error }] = useMutation(LOGIN_USER);

  const toast = useToast();

  if (data && !loading) {
    toast({
      title: "Signed in.",
      variant: "subtle",
      description: "Successfully signed in to your account.",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
    const { loginUser } = data;
    const { email, token, key } = loginUser;
    localStorage.setItem("token", token);
    window.location.reload();
  }

  if (error) {
    toast({
      title: "Failed to sign in to account.",
      variant: "subtle",
      description: `Something went wrong when signing into your account - ${error.message}.`,
      status: "error",
      duration: 9000,
      isClosable: true,
    });
  }

  const handlePasswordChange = (event) => setPassword(event.target.value);
  const handleEmailChange = (event) => {
    setIsEmailValid(emailRegex.test(event.target.value));
    setEmail(event.target.value);
  };
  const handleClick = () => setShow(!show);
  return (
    <Flex mx={4} direction="column" alignItems="center" h="100vh" mt={12}>
      <Flex direction="column" my={2} mt={8} w="400px">
        <CloudIcon />
        <Input
          type="email"
          id="email"
          value={email}
          borderRadius="md"
          size="md"
          my={2}
          placeholder="Email address"
          isInvalid={!isEmailValid && email != ""}
          onChange={handleEmailChange}
          required
        />
        <InputGroup size="md">
          <Input
            value={password}
            onChange={handlePasswordChange}
            size="md"
            type={show ? "text" : "password"}
            placeholder="Password"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <Flex justifyContent="start" alignItems="baseline" mb={4}>
          <Text fontSize="md" my={2}>
            Don't have an account?
          </Text>
          <Button variant="ghost" size="sm" onClick={() => setMode("signup")}>
            Sign up
          </Button>
        </Flex>

        <Flex justifyContent="flex-end">
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
                    password: password,
                  },
                });
              } catch (e) {
                toast({
                  title: "Failed sign in to account.",
                  variant: "subtle",
                  description: e.message,
                  status: "error",
                  duration: 9000,
                  isClosable: true,
                });
              }
            }}
          >
            Sign in
          </Button>
          <Button variant="ghost">Cancel</Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CloudSyncSignIn;
