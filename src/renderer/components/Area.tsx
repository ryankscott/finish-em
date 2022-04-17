import { useMutation, useQuery } from '@apollo/client';
import {
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Grid,
  GridItem,
  Text,
  useColorMode,
  useTheme,
} from '@chakra-ui/react';
import { parseISO } from 'date-fns';
import { Emoji, Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AreaType } from 'renderer/interfaces';
import {
  CHANGE_DESCRIPTION_AREA,
  DELETE_AREA,
  GET_AREA_BY_KEY,
  RENAME_AREA,
  SET_EMOJI,
} from 'renderer/queries';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '../../main/generated/typescript-helpers';
import { formatRelativeDate } from '../utils';
import DeleteAreaDialog from './DeleteAreaDialog';
import { Donut } from './Donut';
import EditableText from './EditableText';
import FilteredItemList from './FilteredItemList';
import Page from './Page';

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
  const [deleteArea] = useMutation(DELETE_AREA);
  const [changeDescriptionArea] = useMutation(CHANGE_DESCRIPTION_AREA);
  const [renameArea] = useMutation(RENAME_AREA);

  const { loading, error, data } = useQuery(GET_AREA_BY_KEY, {
    variables: { key: areaKey },
  });

  if (loading) return <></>;

  if (error) {
    console.log(error);
    return <></>;
  }
  const { area } = data;
  const { areas } = data;

  const determineProgress = (
    totalItemsCount: number,
    completedItemsCount: number
  ): number => {
    if (totalItemsCount === 0) {
      return 0;
    }
    if (completedItemsCount === 0) {
      return 0;
    }
    return totalItemsCount / completedItemsCount;
  };

  return (
    <Page>
      <Grid
        alignItems="center"
        gridTemplateRows="60px 40px"
        gridTemplateColumns="110px 1fr"
        gridTemplateAreas={`
        "emoji name"
        "emoji _"`}
        py={2}
        px={0}
      >
        <GridItem gridArea="emoji">
          <Flex
            w="100px"
            h="100px"
            borderRadius="50%"
            justifyContent="center"
            fontSize="xl"
            boxShadow={colorMode === 'light' ? 'none' : '0 0 3px 0 #222'}
            bg={colorMode === 'light' ? 'gray.100' : 'gray.800'}
            my={0}
            _hover={{
              bg: colorMode === 'light' ? 'gray.200' : 'gray.900',
            }}
            transition="all 0.1s ease-in-out"
            cursor="pointer"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
            }}
          >
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
        <GridItem gridArea="name">
          <Flex w="100%" justifyContent="flex-start">
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
                  .maa((a: AreaType) => a.name === input)
                  .includes(true);
                if (exists) {
                  toast.error(
                    'Cannot rename area, an area with that name already exists'
                  );
                } else {
                  renameArea({
                    variables: { key: area.key, name: input },
                  });
                }
              }}
            >
              <EditablePreview px={2} />
              <EditableInput px={2} />
            </Editable>
            <DeleteAreaDialog
              onDelete={() => {
                deleteArea({ variables: { key: area.key } });
                navigate('/inbox');
              }}
            />
          </Flex>
        </GridItem>
      </Grid>
      <EditableText
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
          combinator: 'and',
          rules: [
            {
              combinator: 'and',
              rules: [
                {
                  field: 'areaKey',
                  operator: '=',
                  valueSource: 'value',
                  value: area.key,
                },
                {
                  field: 'deleted',
                  operator: '=',
                  valueSource: 'value',
                  value: false,
                },
              ],
              not: false,
            },
          ],
          not: false,
        })}
        flattenSubtasks
        readOnly
      />
      <Text my={3} mt={6} fontSize="xl" color="blue.500">
        Projects
      </Text>
      <Flex direction="column" pb={10}>
        {area.projects.map((p: Project) => {
          if (p.key === '0') return <></>;
          if (!p.items) return <></>;
          const totalItemsCount = p.items.length;
          const completedItemsCount = p.items.filter(
            (i) => i?.completed === true && i?.deleted === false
          ).length;
          const progress = determineProgress(
            totalItemsCount,
            completedItemsCount
          );
          return (
            <Grid
              position="relative"
              transition="all 0.1s ease-in-out"
              maxH="200px"
              maxW="650px"
              my={1}
              mx={0}
              padding={1}
              alignItems="center"
              cursor="pointer"
              borderRadius="md"
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
              templateColumns="35px repeat(4, auto)"
              templateRows="auto"
              gridTemplateAreas={`
                  "progress project project startAt endAt"
                 `}
            >
              <GridItem gridTemplate="progress">
                <Donut size={18} progress={progress} />
              </GridItem>
              <GridItem gridTemplate="project">
                <Flex direction="row">
                  <Text fontSize="md" fontWeight="medium" pr={4}>
                    {p.name}
                  </Text>
                </Flex>
              </GridItem>
              <GridItem gridTemplate="startAt">
                <Text>
                  {p.startAt &&
                    `Starting: ${formatRelativeDate(parseISO(p.startAt))}`}
                </Text>
              </GridItem>
              <GridItem gridTemplate="endAt">
                <Text>
                  {p.endAt &&
                    `Ending: ${formatRelativeDate(parseISO(p.endAt))}`}
                </Text>
              </GridItem>
            </Grid>
          );
        })}
      </Flex>
    </Page>
  );
};

export default Area;
