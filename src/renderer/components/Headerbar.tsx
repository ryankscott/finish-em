import { ReactElement } from 'react';
import Select from './Select';
import {
  removeItemTypeFromString,
  markdownLinkRegex,
  markdownBasicRegex,
} from '../utils';

import { GroupType } from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { activeItemVar, focusbarVisibleVar } from '..';
import { Item, Project } from '../../main/generated/typescript-helpers';
import { sortBy } from 'lodash';
import { CommandBar } from './CommandBar';
import {
  Flex,
  Grid,
  IconButton,
  Tooltip,
  useColorMode,
  useTheme,
  GridItem,
} from '@chakra-ui/react';
import { convertSVGElementToReact, Icons } from 'renderer/assets/icons';
import { IconType } from 'renderer/interfaces';
import { GET_HEADER_BAR_DATA } from 'renderer/queries/headerbar';

type OptionType = { label: string; value: () => void };

const HeaderItem = (props: any) => (
  <GridItem>
    <Flex
      direction="row"
      justifyContent={'center'}
      alignItems={'center'}
      p={3}
      _hover={{ cursor: 'pointer' }}
    >
      {props.children}
    </Flex>
  </GridItem>
);

const Headerbar = (): ReactElement => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { loading, error, data } = useQuery(GET_HEADER_BAR_DATA);
  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }

  const HeaderButton = (props: {
    label: string;
    icon: IconType;
    iconColour: string;
    onClickHandler: () => void;
  }) => (
    <Tooltip delay={500} label={props.label}>
      <IconButton
        aria-label={props.label}
        variant="invert"
        icon={convertSVGElementToReact(Icons[props.icon]('18px', '18px'))}
        iconColour={props.iconColour}
        onClick={props.onClickHandler}
      />
    </Tooltip>
  );

  const generateSearchOptions = (
    projects: Project[],
    items: Item[]
  ): GroupType<OptionType>[] => {
    const sortedItems = sortBy(items, ['lastUpdatedAt'], ['desc']);
    const itemOptions = sortedItems
      .filter((i) => i.deleted == false)
      .map((i) => {
        return {
          label: removeItemTypeFromString(i.text ?? '')
            .replace(markdownLinkRegex, '$1')
            .replace(markdownBasicRegex, '$1'),
          value: () => {
            focusbarVisibleVar(true);
            activeItemVar([i.key]);
          },
        };
      });

    const projectOptions = projects.map((p) => {
      return {
        label: p.name,
        value: () => navigate(`/projects/${p.key}`),
      };
    });

    return [
      { label: 'Items', options: itemOptions },
      { label: 'Projects', options: projectOptions },
    ];
  };

  return (
    <Grid
      w={'100%'}
      alignItems="center"
      gridTemplateColumns={'1fr repeat(4, 35px)'}
      gridTemplateRows={'50px'}
      zIndex={999}
      color={'gray.50'}
      borderBottom={colorMode == 'light' ? 'none' : '1px solid'}
      borderColor={colorMode == 'light' ? 'transparent' : 'gray.900'}
      bg={'gray.800'}
      px={2}
    >
      <HeaderItem as={Flex} justifyContent="flex-end" colSpan={1}>
        <Flex w={'350px'} py={0} px={2}>
          <Select
            size="md"
            isMulti={false}
            placeholder="Search for items..."
            onChange={(selected) => {
              selected.value();
            }}
            options={generateSearchOptions(data.projects, data.items)}
            invertColours={colorMode == 'light' ? true : false}
            fullWidth={true}
          />
        </Flex>
      </HeaderItem>
      <HeaderItem>
        <CommandBar />
      </HeaderItem>
      <HeaderItem>
        <HeaderButton
          label={'Give feedback'}
          icon={'feedback' as IconType}
          iconColour={theme.colors.gray[100]}
          onClickHandler={() => {
            window.open(
              'https://github.com/ryankscott/finish-em/issues/new/choose'
            );
          }}
        />
      </HeaderItem>
      <HeaderItem>
        <HeaderButton
          label="Show Help"
          icon={'help' as IconType}
          iconColour={theme.colors.gray[100]}
          onClickHandler={() => {
            navigate('/help/');
          }}
        />
      </HeaderItem>

      <HeaderItem>
        <HeaderButton
          label="Toggle dark mode"
          icon={colorMode == 'light' ? 'darkMode' : 'lightMode'}
          iconColour={theme.colors.gray[100]}
          onClickHandler={toggleColorMode}
        />
      </HeaderItem>
    </Grid>
  );
};

export default Headerbar;
