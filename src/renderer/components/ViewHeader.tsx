import { ReactElement } from 'react';

import { IconType } from '../interfaces';
import { Icons } from '../assets/icons';
import EditViewHeader from './EditViewHeader';
import { Text, Grid, GridItem } from '@chakra-ui/layout';
import { useTheme } from '@chakra-ui/system';

export type ViewHeaderProps = {
  name: string;
  icon?: IconType;
  readOnly?: boolean;
  editing?: boolean;
  setEditing?: (editing: boolean) => void;
  componentKey: string;
};

const ViewHeader = (props: ViewHeaderProps): ReactElement => {
  const theme = useTheme();
  return (
    <>
      {props.editing ? (
        <EditViewHeader
          key={`dlg-${props.componentKey}`}
          componentKey={props.componentKey}
          onClose={() => {
            if (props?.setEditing) {
              props.setEditing(false);
            }
          }}
        />
      ) : (
        <Grid
          justifyContent={'flex-start'}
          py={4}
          px={1}
          alignItems={'center'}
          w={'100%'}
          templateColumns={'40px 1fr 60px'}
        >
          <GridItem colSpan={1} p={0}>
            {props?.icon && Icons[props?.icon](36, 36, theme.colors.blue[500])}
          </GridItem>
          <GridItem colSpan={1}>
            <Text
              fontSize="2xl"
              fontWeight="normal"
              color={'blue.500'}
              p={2}
              m={0}
            >
              {props.name}
            </Text>
          </GridItem>
        </Grid>
      )}
    </>
  );
};
export default ViewHeader;
