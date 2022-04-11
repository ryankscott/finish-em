import { ReactElement } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import { Flex } from '@chakra-ui/layout';
import { useTheme } from '@chakra-ui/system';

type SpinnerProps = {
  loading: boolean;
};

const Spinner = ({ loading }: SpinnerProps): ReactElement => {
  const theme = useTheme();

  return (
    <Flex
      direction="row"
      justifyContent="center"
      alignContent="center"
      py={8}
      px={0}
    >
      <BeatLoader size={10} color={theme.colors.blue[500]} loading={loading} />
    </Flex>
  );
};
export default Spinner;
