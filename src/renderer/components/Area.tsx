import { gql, useMutation, useQuery } from '@apollo/client';
import {
  Flex,
  Grid,
  GridItem,
  Text,
  Editable,
  EditableInput,
  EditablePreview,
  useColorMode,
  useTheme,
} from '@chakra-ui/react';
import { parseISO } from 'date-fns';
import { Emoji, Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { marked } from 'marked';
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  SET_EMOJI,
  DELETE_AREA,
  CHANGE_DESCRIPTION_AREA,
  RENAME_AREA,
  GET_AREA_BY_KEY,
} from 'renderer/queries';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '../../main/generated/typescript-helpers';
import { formatRelativeDate } from '../utils';
import DeleteAreaDialog from './DeleteAreaDialog';
import { Donut } from './Donut';
import EditableText2 from './EditableText2';
import FilteredItemList from './FilteredItemList';
import { Page } from './Page';

type AreaProps = {
  areaKey: string;
};
const Area = (props: AreaProps): ReactElement => {
  const { areaKey } = props;
  const navigate = useNavigate();
  const theme = useTheme();
  const { colorMode } = useColorMode();
  const [setEmoji] = useMutation(SET_EMOJI);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [deleteArea] = useMutation(DELETE_AREA, {
    update(cache, { data: { deleteArea } }) {
      const cacheId = cache.identify({
        __typename: 'Area',
        key: areaKey,
      });

      cache.evict({ id: cacheId });
    },
  });
  const [changeDescriptionArea] = useMutation(CHANGE_DESCRIPTION_AREA);
  const [renameArea] = useMutation(RENAME_AREA);

  const { loading, error, data } = useQuery(GET_AREA_BY_KEY, {
    variables: { key: areaKey },
  });
  if (loading) return null;
  if (error) {
    console.log(error);
    return null;
  }
  const { area } = data;
  const { areas } = data;
  return (
    <Page>
      <Grid
        autoRows="60px 40px"
        templateColumns="110px 1fr"
        alignItems="center"
        py={2}
        px={0}
      >
        <GridItem colStart={2} colSpan={1}>
          <Flex w="100%" alignItems="flex-start">
            <Editable
              key={uuidv4()}
              defaultValue={area.name}
              fontSize="3xl"
              mx={2}
              w="100%"
              color="blue.500"
              fontWeight="light"
              onSubmit={(input) => {
                const exists = areas
                  .map((a) => a.name === input)
                  .includes(true);
                if (exists) {
                  toast.error(
                    'Cannot rename area, an area with that name already exists'
                  );
                } else {
                  renameArea({ variables: { key: area.key, name: input } });
                }
              }}
            >
              <EditablePreview />
              <EditableInput />
            </Editable>

            <DeleteAreaDialog
              onDelete={() => {
                deleteArea({ variables: { key: area.key } });
                navigate('/inbox');
              }}
            />
          </Flex>
        </GridItem>
        <GridItem
          rowStart={1}
          rowSpan={2}
          colSpan={1}
          colStart={1}
          boxShadow={colorMode === 'light' ? 'none' : '0 0 3px 0 #222'}
          bg={colorMode === 'light' ? 'gray.100' : 'gray.800'}
          my={0}
          w="100px"
          h="100px"
          borderRadius="50%"
          cursor="pointer"
          transition="all 0.1s ease-in-out"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
          }}
          _hover={{
            bg: colorMode === 'light' ? 'gray.200' : 'gray.900',
          }}
        >
          <Flex justifyContent="center" alignItems="center">
            <Emoji emoji={area.emoji ? area.emoji : ''} size={68} native />
          </Flex>
        </GridItem>
        {showEmojiPicker && (
          <Picker
            native
            title=""
            emoji=""
            color={theme.colors.blue[500]}
            onSelect={(emoji) => {
              setEmoji({ variables: { key: area.key, emoji: emoji.id } });
              setShowEmojiPicker(false);
            }}
          />
        )}
      </Grid>
      <EditableText2
        singleLine={false}
        placeholder="Add a description for your ..."
        shouldClearOnSubmit={false}
        hideToolbar={false}
        shouldSubmitOnBlur
        onUpdate={(input) => {
          changeDescriptionArea({
            variables: { key: area.key, description: input },
          });
        }}
      />
      <Text my={3} fontSize="xl" color="blue.500">
        Items
      </Text>
      <FilteredItemList
        componentKey={uuidv4()}
        isFilterable={false}
        filter={JSON.stringify({
          text: `area = "${area.name}" and type = "TODO" and deleted = "false"`,
          value: [
            { category: 'areaKey', operator: '=', value: area.key },
            {
              conditionType: 'AND',
              category: 'type',
              operator: '=',
              value: 'TODO',
            },
            {
              conditionType: 'AND',
              category: 'deleted',
              operator: '=',
              value: 'false',
            },
          ],
        })}
        flattenSubtasks
        readOnly
      />
      <Text my={3} mt={6} fontSize="xl" color="blue.500">
        Projects
      </Text>
      {area.projects.map((p: Project) => {
        const totalItemsCount = p.items.length;
        const completedItemsCount = p.items.filter(
          (i) => i.completed == true && i.deleted == false
        ).length;
        const progress =
          totalItemsCount == 0
            ? 0
            : completedItemsCount == 0
            ? 0
            : totalItemsCount / completedItemsCount;
        return (
          <Grid
            position="relative"
            transition="all 0.1s ease-in-out"
            maxH="200px"
            maxW="650px"
            my={1}
            mx={0}
            templateColumns="35px minmax(180px, auto) auto"
            templateRows="minmax(20px, auto) minmax(20px, auto)"
            padding={1}
            alignItems="center"
            cursor="pointer"
            borderRadius={3}
            _hover={{
              bg: colorMode === 'light' ? 'gray.100' : 'gray.900',
            }}
            _after={{
              content: "''",
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              margin: '0px auto',
              height: 1,
              width: 'calc(100% - 10px)',
              borderBottom: '1px solid',
              borderColor: colorMode === 'light' ? 'gray.100' : 'gray.700',
              opacity: 0.8,
            }}
            key={p.key}
            onClick={() => {
              navigate(`/views/${p.key}`);
            }}
          >
            <GridItem colSpan={1} rowSpan={2} colStart={1} rowStart={1}>
              <Donut size={24} progress={progress} />
            </GridItem>
            <GridItem colSpan={1} colStart={2}>
              <Text fontSize="lg">{p.name}</Text>
            </GridItem>
            <GridItem colSpan={1} colStart={3}>
              <Text
                fontSize="md"
                dangerouslySetInnerHTML={{
                  __html: marked(p.description ?? '', { breaks: true }),
                }}
              />
            </GridItem>
            <GridItem rowStart={2} colStart={2} colSpan={1}>
              <Text>
                {p.startAt &&
                  `Starting: ${formatRelativeDate(parseISO(p.startAt))}`}
              </Text>
            </GridItem>
            <GridItem rowStart={2} colStart={3} colSpan={1}>
              <Text>
                {p.endAt && `Ending: ${formatRelativeDate(parseISO(p.endAt))}`}
              </Text>
            </GridItem>
          </Grid>
        );
      })}
    </Page>
  );
};

export default Area;
