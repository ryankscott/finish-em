import { useQuery } from "@apollo/client";
import { Box, ChakraProvider, ColorModeScript, Flex } from "@chakra-ui/react";
import { isSameMinute, parseISO } from "date-fns";
import { ReactElement } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useOnlineStatus } from "../hooks";
import { GET_APP_DATA } from "../queries/";
import { AppState, useBoundStore } from "../state";
import theme from "../theme";
import ActionBar from "./ActionBar";
import Area from "./Area";
import CloudSyncSignUpOrIn from "./CloudSyncSignUpOrIn";
import DailyAgenda from "./DailyAgenda";
import Focusbar from "./Focusbar";
import Headerbar from "./Headerbar";
import Inbox from "./Inbox";
import OfflineStatus from "./OfflineState";
import Settings from "./Settings";
import ShortcutDialog from "./ShortcutDialog";
import Sidebar from "./Sidebar";
import View from "./View";
import WeeklyAgenda from "./WeeklyAgenda";

const ViewWrapper = (): ReactElement => {
  const { id } = useParams();
  return <> {id ? <View viewKey={id} /> : null}</>;
};
const AreaWrapper = (): ReactElement => {
  const { id } = useParams();
  return <> {id ? <Area areaKey={id} /> : null}</>;
};

const App = (): ReactElement => {
  const [activeItemIds] = useBoundStore((state: AppState) => [
    state.activeItemIds,
  ]);

  const isOnline = useOnlineStatus();

  const { error, data } = useQuery(GET_APP_DATA);

  if (!isOnline) {
    return <OfflineStatus />;
  }
  if (error) {
    console.log(error);
  }
  const signedIn = localStorage.getItem("token");
  if (!signedIn) {
    return (
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Box m={4}>
          <CloudSyncSignUpOrIn onClose={() => {}} />
        </Box>
      </ChakraProvider>
    );
  }

  if (data?.reminders) {
    setInterval(() => {
      data.reminders
        .filter((r) => r.deleted !== true)
        .forEach((r) => {
          if (r.deleted) return;
          if (isSameMinute(parseISO(r.remindAt ?? ""), new Date())) {
            // eslint-disable-next-line no-new
            new Notification("Reminder", {
              body: r?.text ?? "Reminder for task",
            });
          }
        });
    }, 60 * 1000);
  }

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Flex direction="column" h="100vh" w="100%">
        <Headerbar />
        <Flex pt="50px" direction="row" overflow="hidden" h="100vh">
          <Sidebar />
          <Flex overflowY="scroll" w="100%" h="100%" justifyContent="center">
            <ShortcutDialog />
            <Routes>
              <Route path="/dailyAgenda" element={<DailyAgenda />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/views/:id" element={<ViewWrapper />} />
              <Route path="/areas/:id" element={<AreaWrapper />} />
              <Route path="/Settings" element={<Settings />} />
              <Route path="/weeklyAgenda" element={<WeeklyAgenda />} />
              <Route path="/" element={<Inbox />} />
              <Route path="*" element={<Inbox />} />
            </Routes>
          </Flex>
          <Focusbar />
        </Flex>
        {activeItemIds.length > 1 && <ActionBar />}
        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          transition={Slide}
        />
      </Flex>
    </ChakraProvider>
  );
};

export default App;