import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Flex } from '@chakra-ui/react';
import { isSameMinute, parseISO } from 'date-fns';
import { ReactElement, useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { Slide, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { activeItemVar, focusbarVisibleVar, sidebarVisibleVar } from '../index';
import ActionBar from './ActionBar';
import Area from './Area';
import DailyAgenda from './DailyAgenda';
import Focusbar from './Focusbar';
import Headerbar from './Headerbar';
import Help from './Help';
import Inbox from './Inbox';
import Settings from './Settings';
import ShortcutDialog from './ShortcutDialog';
import Sidebar from './Sidebar';
import View from './View';
import WeeklyAgenda from './WeeklyAgenda';
import '../filterBoxStyles.css';
import { CREATE_ITEM, GET_APP_DATA } from 'renderer/queries/';
import { Reminder } from 'main/generated/typescript-helpers';
import { MIN_WIDTH_FOR_FOCUSBAR, MIN_WIDTH_FOR_SIDEBAR } from 'consts';

const ViewWrapper = (): ReactElement => {
  const { id } = useParams();
  return <> {id ? <View viewKey={id} /> : null}</>;
};
const AreaWrapper = (): ReactElement => {
  const { id } = useParams();
  return <> {id ? <Area areaKey={id} /> : null}</>;
};

const App = (): ReactElement => {
  const activeItems = useReactiveVar(activeItemVar);
  const focusbarVisible = useReactiveVar(focusbarVisibleVar);
  const sidebarVisible = useReactiveVar(sidebarVisibleVar);

  useEffect(() => {
    // Handle Electron events
    //@ts-ignore
    window.electron.ipcRenderer.onReceiveMessage(
      'create-item',
      async (event, arg) => {
        try {
          const item = await createItem({
            variables: {
              key: arg.key,
              type: arg.type,
              text: arg.text,
              projectKey: arg?.projectKey,
            },
          });
        } catch (err) {
          // TODO: Have a think about the best way to handle a failed insert
          return;
        }
        toast.dark(`New item added from Bear - ${arg.text}`);
      }
    );

    //@ts-ignore
    window.electron.ipcRenderer.onReceiveMessage(
      'send-notification',
      (event, arg) => {
        // TODO: Implement multiple notification types
        toast.dark(`${arg.text}`);
      }
    );

    //@ts-ignore
    window.electron.ipcRenderer.onReceiveMessage(
      'new-version',
      (event, arg) => {
        toast(
          <div>
            <p>
              <strong>New version available 🎉</strong>
              <br />
              Download the new version <a href={arg.downloadUrl}>here </a>
              <br />
              Or checkout the release <a href={arg.releaseURL}> notes</a> `for
              what's` changed
            </p>
          </div>,
          { autoClose: false }
        );
      }
    );
  }, []);

  const [createItem] = useMutation(CREATE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });
  const { loading, error, data } = useQuery(GET_APP_DATA);
  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }

  // TODO: Work out the best way to expand the width here
  const handleResize = () => {
    if (window.innerWidth < MIN_WIDTH_FOR_SIDEBAR && sidebarVisible) {
      sidebarVisibleVar(false);
    }
    if (focusbarVisible) {
      if (window.innerWidth < MIN_WIDTH_FOR_FOCUSBAR && focusbarVisible) {
        focusbarVisibleVar(false);
      }
    }
  };
  window.addEventListener('resize', () => {
    setTimeout(handleResize, 250);
  });

  if (data?.reminders) {
    setInterval(() => {
      data.reminders
        .filter((r: Reminder) => r.deleted != true)
        .map((r: Reminder) => {
          if (r.deleted) return;
          if (isSameMinute(parseISO(r.remindAt), new Date())) {
            new Notification('Reminder', {
              body: r?.text ?? 'Reminder for task',
            });
          }
        });
    }, 60 * 1000);
  }

  return (
    <Flex direction={'column'} h={'100vh'} w={'100%'}>
      <Flex
        sx={{
          WebkitAppRegion: 'drag',
        }}
        zIndex={999}
        position={'fixed'}
        h={'50px'}
        w={'100%'}
        shadow="md"
        overflow="hidden"
      >
        <Headerbar />
      </Flex>
      <Flex pt={'50px'} direction={'row'} overflow="hidden" h={'100vh'}>
        <Sidebar />
        <Flex
          overflowY={'scroll'}
          w={'100%'}
          h={'100%'}
          justifyContent={'center'}
        >
          <ShortcutDialog />
          <Routes>
            <Route path="/help" element={<Help />} />
            <Route path="/dailyAgenda" element={<DailyAgenda />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/views/:id" element={<ViewWrapper />} />
            <Route path="/areas/:id" element={<AreaWrapper />} />
            <Route path="/Settings" element={<Settings />} />
            <Route path="/weeklyAgenda" element={<WeeklyAgenda />} />
            <Route path="/" element={<Inbox />} />
          </Routes>
        </Flex>
        <Focusbar />
      </Flex>
      {activeItems.length > 1 && <ActionBar />}
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
  );
};

export default App;