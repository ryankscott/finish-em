import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Props } from "react-select";
import { camelCaseToInitialCaps } from "../utils";
import CloudSync from "./CloudSync";
import SettingHeader from "./SettingHeader";

export default function AdvancedSettings({}: Props) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const loginToken = localStorage.getItem("token");

  useEffect(() => {
    const getSettings = async () => {
      // @ts-ignore
      const settings = await window.electronAPI.ipcRenderer.getSettings();
      setSettings(settings);
    };
    getSettings();
  }, []);
  return (
    <>
      <SettingHeader name="Advanced" />

      <Alert status="warning" size={"sm"} borderRadius={"md"} mb={2}>
        <AlertIcon />
        <AlertDescription fontSize={"md"}>
          🐉 Changing these properties can cause you to lose all your data!!
        </AlertDescription>
      </Alert>
      <Flex my={0.5} direction={"column"}>
        {Object.keys(settings).map((key, index) => {
          if (key === "__internal__") return;
          return (
            <Flex
              direction="row"
              justifyContent="flex-start"
              py={5}
              px={0}
              w="100%"
              h="30px"
              alignItems="center"
            >
              <Text fontSize="sm" w="180px" fontWeight="bold">
                {camelCaseToInitialCaps(key)}
              </Text>
              {key === "cloudSync" && (
                <CloudSync
                  enabled={!!loginToken}
                  token={loginToken ?? ""}
                  email=""
                />
              )}
              {key === "overrideDatabaseDirectory" && (
                <>
                  <Text ml={3} fontSize="sm">
                    {settings[key]}
                  </Text>
                  <Button
                    ml={3}
                    onClick={async () => {
                      const newDirectory =
                        // @ts-ignore
                        await window.electronAPI.ipcRenderer.openDialog({
                          title: "Open folder",
                          properties: ["openDirectory"],
                        });
                      // @ts-ignore
                      window.electronAPI.ipcRenderer.setSetting(
                        "overrideDatabaseDirectory",
                        newDirectory?.[0]
                      );

                      setSettings(
                        // @ts-ignore
                        await window.electronAPI.ipcRenderer.getSettings()
                      );
                    }}
                  >
                    Open
                  </Button>
                </>
              )}
            </Flex>
          );
        })}

        <Text fontSize="md" py={2}>
          NB: Finish em will restart after chosing a new database directory
        </Text>
      </Flex>
    </>
  );
}
