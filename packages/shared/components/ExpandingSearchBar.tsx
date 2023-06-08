import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  IconButton,
  useColorMode,
  useOutsideClick,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { GroupBase } from "react-select";
import { HEADERBAR_ICON_SIZE } from "./Headerbar";
import Select from "./Select";

type OptionType = { label: string; value: () => void };
interface ExpandingSearchBarProps {
  searchOptions: GroupBase<OptionType>[];
}
const ExpandingSearchBar = ({ searchOptions }: ExpandingSearchBarProps) => {
  const { colorMode } = useColorMode();
  const ref = useRef();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  useOutsideClick({
    ref: ref,
    handler: () => setIsExpanded(false),
  });
  return (
    <>
      {isExpanded ? (
        <Box ref={ref} w="100%">
          <Select
            showBorder
            isSearch
            isMulti={false}
            placeholder="Search for items..."
            onChange={(selected) => {
              selected.value();
              setIsExpanded(false);
            }}
            options={searchOptions}
            invertColours={colorMode === "light"}
            fullWidth
          />
        </Box>
      ) : (
        <IconButton
          variant="dark"
          onClick={() => setIsExpanded(true)}
          aria-label={"toggle expand"}
          icon={
            <SearchIcon
              h={HEADERBAR_ICON_SIZE}
              w={HEADERBAR_ICON_SIZE}
              px={0.5}
            />
          }
        />
      )}
    </>
  );
};

export default ExpandingSearchBar;
