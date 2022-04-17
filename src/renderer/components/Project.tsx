import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Grid,
  GridItem,
  Text,
  Tooltip,
  useColorMode,
  useTheme,
} from '@chakra-ui/react';
import { parseISO } from 'date-fns';
import { Emoji, Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  CHANGE_DESCRIPTION_OF_PROJECT,
  DELETE_PROJECT,
  DELETE_VIEW,
  GET_PROJECT_BY_KEY,
  RENAME_PROJECT,
  SET_EMOJI_OF_PROJECT,
  SET_END_DATE_OF_PROJECT,
  SET_START_DATE_OF_PROJECT,
} from 'renderer/queries';
import { v4 as uuidv4 } from 'uuid';
import DatePicker from './DatePicker';
import {
  Item as ItemType,
  Project as ProjectType,
} from '../../main/generated/typescript-helpers';
import { formatRelativeDate } from '../utils';
import DeleteProjectDialog from './DeleteProjectDialog';
import { Donut } from './Donut';
import EditableText from './EditableText';
import ItemCreator from './ItemCreator';
import './styled/ReactDatePicker.css';

type ProjectProps = {
  projectKey: string;
};

const Project = ({ projectKey }: ProjectProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const [deleteProject] = useMutation(DELETE_PROJECT, {
    refetchQueries: ['GetSidebarData'],
  });
  const [changeDescription] = useMutation(CHANGE_DESCRIPTION_OF_PROJECT, {
    refetchQueries: ['ViewByKey'],
  });
  const [renameProject] = useMutation(RENAME_PROJECT, {
    refetchQueries: ['getComponent'],
  });
  const [setEndDate] = useMutation(SET_END_DATE_OF_PROJECT);
  const [setStartDate] = useMutation(SET_START_DATE_OF_PROJECT);
  const [setEmoji] = useMutation(SET_EMOJI_OF_PROJECT);
  const [deleteView] = useMutation(DELETE_VIEW);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { loading, error, data } = useQuery(GET_PROJECT_BY_KEY, {
    variables: { key: projectKey },
  });

  if (loading) return null;
  if (error) {
    console.log(error);
    return null;
  }
  const { project } = data;
  const { projects } = data;
  const allItems: ItemType[] = project?.items;
  const completedItems = allItems.filter((i) => i.completed === true);
  return (
    <>
      <Grid
        alignItems="center"
        gridTemplateRows="60px 40px"
        gridTemplateColumns="110px 1fr"
        gridTemplateAreas={`
        "emoji name"
        "emoji completed"`}
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
            <Emoji
              emoji={project.emoji ? project.emoji : ''}
              size={68}
              native
            />
          </Flex>
        </GridItem>
        {showEmojiPicker && (
          <Picker
            native
            title=""
            emoji=""
            color={theme.colors.blue[500]}
            onSelect={(emoji) => {
              setEmoji({ variables: { key: project.key, emoji: emoji.id } });
              setShowEmojiPicker(false);
            }}
          />
        )}
        <GridItem gridArea="name">
          <Flex w="100%" justifyContent="flex-start">
            <Editable
              key={uuidv4()}
              defaultValue={project.name}
              fontSize="3xl"
              mx={2}
              w="100%"
              color="blue.500"
              fontWeight="light"
              onSubmit={(input) => {
                const exists = projects
                  .map((p: ProjectType) => p.name === input)
                  .includes(true);
                if (exists) {
                  toast.error(
                    'Cannot rename project, a project with that name already exists'
                  );
                } else {
                  renameProject({
                    variables: { key: project.key, name: input },
                  });
                }
              }}
            >
              <EditablePreview px={2} />
              <EditableInput px={2} />
            </Editable>
            <DeleteProjectDialog
              onDelete={() => {
                deleteProject({ variables: { key: project.key } });
                deleteView({ variables: { key: project.key } });
                navigate('/inbox');
              }}
            />
          </Flex>
        </GridItem>
        <GridItem gridArea="completed">
          <Tooltip
            label={`${completedItems.length}/${allItems.length} completed`}
          >
            <Flex justifyContent="flex-start" alignItems="center">
              <Donut
                size={30}
                progress={
                  allItems.length !== 0
                    ? (100 * completedItems.length) / allItems.length
                    : 0
                }
              />
              <Text fontSize="md">
                {completedItems.length} of {allItems.length} items completed
              </Text>
            </Flex>
          </Tooltip>
        </GridItem>
      </Grid>
      {data.projectDates.enabled && (
        <Flex direction="row" alignItems="center">
          <Text fontSize="md" px={2} fontWeight="medium">
            Starting:
          </Text>
          <Box minW="180px">
            <DatePicker
              completed={false}
              text={
                project.startAt
                  ? formatRelativeDate(parseISO(project.startAt))
                  : ''
              }
              onSubmit={(e) => {
                setStartDate({
                  variables: {
                    key: project.key,
                    startAt: e ? e.toISOString() : '',
                  },
                });
              }}
            />
          </Box>
          <Text fontSize="md" px={2} fontWeight="medium">
            Ending:
          </Text>
          <Box minW="180px">
            <DatePicker
              completed={false}
              text={
                project.endAt ? formatRelativeDate(parseISO(project.endAt)) : ''
              }
              onSubmit={(d) => {
                setEndDate({
                  variables: {
                    key: project.key,
                    endAt: d ? d.toISOString() : '',
                  },
                });
              }}
            />
          </Box>
        </Flex>
      )}
      <EditableText
        key={`desc-${project.key}`}
        input={project.description ?? ''}
        singleLine={false}
        placeholder="Add a description for your project..."
        shouldClearOnSubmit={false}
        hideToolbar={false}
        shouldSubmitOnBlur
        onUpdate={(input) => {
          changeDescription({
            variables: { key: project.key, description: input },
          });
        }}
      />

      <Flex direction="column" justifyContent="flex-end" py={2} px={0} w="100%">
        <ItemCreator
          key={`creator-${project.key}`}
          projectKey={project.key}
          buttonText="Add to project"
          width="100%"
          initiallyExpanded={false}
        />
      </Flex>
    </>
  );
};

export default Project;
