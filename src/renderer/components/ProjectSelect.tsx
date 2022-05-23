import { Box, Flex, Text } from '@chakra-ui/react';
import 'emoji-mart/css/emoji-mart.css';
import { GET_PROJECTS } from 'renderer/queries';
import { groupBy } from 'lodash';
import { Emoji } from 'emoji-mart';
import { Project } from 'main/resolvers-types';
import { useQuery } from '@apollo/client';
import Select from './Select';

type ProjectSelectProps = {
  currentProject: Project | null;
  completed: boolean;
  deleted: boolean;
  onSubmit: (key: string) => void;
  invertColours?: boolean;
};

export default function ProjectSelect({
  currentProject,
  completed,
  deleted,
  onSubmit,
  invertColours = false,
}: ProjectSelectProps) {
  const { loading, error, data } = useQuery<{ projects: Project[] }, null>(
    GET_PROJECTS
  );
  if (loading) return <></>;

  if (error) {
    console.log(error);
    return <></>;
  }

  const generateOptions = () => {
    const filteredProjects = data?.projects
      ?.filter((p: Project) => p.key !== '0')
      ?.filter((p: Project) => p.key != null);

    const groupedProjects = groupBy(filteredProjects, 'area.name');
    const aGroups = Object.keys(groupedProjects)?.map((i) => {
      return {
        label: i,
        options: groupedProjects[i].map((p: Project) => {
          return {
            value: p.key,
            label: (
              <Flex>
                {p.emoji && (
                  <Box pr={2}>
                    <Emoji emoji={p.emoji} size={12} native />
                  </Box>
                )}
                <Text>{p.name}</Text>
              </Flex>
            ),
          };
        }),
      };
    });

    // Sort to ensure that the current project is at the front
    // Only if it has a project
    if (currentProject != null) {
      aGroups.sort((a, b) => {
        if (a.label === currentProject.area?.name) return -1;
        if (b.label === currentProject.area?.name) return 1;
        return 0;
      });
    }

    return [
      ...aGroups,
      {
        label: 'Remove Project',
        options: [{ value: '0', label: 'None' }],
      },
    ];
  };

  const options = generateOptions();
  const allOptions = options
    ?.map((o) => {
      return o.options;
    })
    .flat();

  const defaultValue = allOptions?.filter(
    (o) => o.value === currentProject?.key
  );

  return (
    <Box w="100%" cursor={completed || deleted ? 'not-allowed' : 'inherit'}>
      <Select
        isMulti={false}
        isDisabled={completed || deleted}
        onChange={(p) => {
          onSubmit(p.value);
        }}
        options={options}
        escapeClearsValue
        placeholder="Add to project"
        defaultValue={defaultValue}
        invertColours={invertColours}
        renderLabelAsElement
      />
    </Box>
  );
}
