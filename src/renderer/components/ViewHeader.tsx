import { ReactElement } from "react";
import { Icon, Text, Grid, GridItem } from "@chakra-ui/react";
import { IconType } from "../interfaces";
import { Icons } from "../assets/icons";
import EditViewHeader from "./EditViewHeader";

export type ViewHeaderProps = {
  name: string;
  componentKey: string;
  editing?: boolean;
  setEditing?: (editing: boolean) => void;
  icon?: IconType;
};

const ViewHeader = ({
  name,
  icon,
  editing,
  setEditing,
  componentKey,
}: ViewHeaderProps): ReactElement => {
  return (
    <>
      {editing ? (
        <EditViewHeader
          key={`dlg-${componentKey}`}
          componentKey={componentKey}
          onClose={() => {
            if (setEditing) {
              setEditing(false);
            }
          }}
        />
      ) : (
        <Grid
          justifyContent="flex-start"
          py={4}
          px={1}
          alignItems="center"
          w="100%"
          templateColumns="40px 1fr 60px"
        >
          <GridItem colSpan={1} p={0} px={2}>
            {icon && <Icon as={Icons[icon]} color="blue.500" w={7} h={7} />}
          </GridItem>
          <GridItem colSpan={1}>
            <Text
              fontSize="2xl"
              fontWeight="normal"
              color="blue.500"
              p={2}
              m={0}
            >
              {name}
            </Text>
          </GridItem>
        </Grid>
      )}
    </>
  );
};
export default ViewHeader;
