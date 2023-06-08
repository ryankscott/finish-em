import { SearchIcon } from "@chakra-ui/icons";
import { Circle, Flex, Icon, useColorMode, useTheme } from "@chakra-ui/react";
import {
  ActionMeta,
  Select as CRSelect,
  ChakraStylesConfig,
  MultiValue,
  SingleValue,
  chakraComponents,
} from "chakra-react-select";
import { darken } from "polished";
import { v4 as uuidv4 } from "uuid";
import { Icons } from "../assets/icons";
import { IconType } from "../interfaces";

type OptionType = { [key: string]: any };
type OptionsType = Array<OptionType>;

interface Props {
  options: OptionsType;
  placeholder: string;
  onChange: (val: any) => void;
  isDisabled?: boolean;
  autoFocus?: boolean;
  escapeClearsValue?: boolean;
  defaultValue?: OptionType;
  isMulti?: boolean;
  invertColours?: boolean;
  fullWidth?: boolean;
  renderLabelAsElement?: boolean;
  isSearch?: boolean;
  showBorder?: boolean;
  icon?: IconType;
}

const Select = (props: Props) => {
  const { colorMode } = useColorMode();
  const theme = useTheme();

  if (!Object.keys(theme).length) return null;

  const {
    onChange,
    isDisabled,
    autoFocus,
    options,
    placeholder,
    defaultValue,
    isMulti,
    invertColours,
    renderLabelAsElement,
    isSearch,
    showBorder,
    fullWidth,
    icon,
  } = props;

  const generateColour = (invert: boolean) => {
    if (invert) {
      return colorMode == "light"
        ? theme.colors.gray[50]
        : theme.colors.gray[800];
    }

    return colorMode == "light"
      ? theme.colors.gray[800]
      : theme.colors.gray[50];
  };
  const generateBorderColour = (invert: boolean) => {
    if (invert) {
      return colorMode == "light"
        ? theme.colors.gray[200]
        : theme.colors.gray[900];
    }

    return colorMode == "light"
      ? theme.colors.gray[200]
      : theme.colors.gray[900];
  };

  const generateBackgroundColour = (
    data: { color: string } | null,
    isFocused: boolean,
    invert: boolean
  ): string => {
    if (data?.color) {
      return data.color;
    }

    const backgroundColor =
      colorMode === "light" ? theme.colors.gray[50] : theme.colors.gray[800];
    const invertBackgroundColor =
      colorMode === "light" ? theme.colors.gray[800] : theme.colors.gray[50];
    if (isFocused) {
      return invert
        ? darken(0.05, invertBackgroundColor)
        : darken(0.05, backgroundColor);
    }

    return invert ? invertBackgroundColor : backgroundColor;
  };

  const components = {
    DropdownIndicator: (props) => (
      <chakraComponents.DropdownIndicator {...props}>
        {<Icon h={3} w={3} m={0} as={isSearch ? SearchIcon : Icons.collapse} />}
      </chakraComponents.DropdownIndicator>
    ),
    Option: ({ children, ...props }) => {
      return (
        <chakraComponents.Option {...props}>
          {props.data.color && (
            <Circle
              border="1px solid"
              borderColor={darken(0.3, props.data.color)}
              backgroundColor={props.data.color}
              size={4}
              mr={2}
            />
          )}
          {children}
        </chakraComponents.Option>
      );
    },
    ValueContainer: ({ children, ...props }) => {
      console.log({ icon });
      return (
        <chakraComponents.ValueContainer {...props}>
          <Flex alignItems="center" px={1}>
            {icon && <Icon mr={2} as={icon} />}
            {children}
          </Flex>
        </chakraComponents.ValueContainer>
      );
    },
  };

  const chakraStyles: ChakraStylesConfig = {
    menuList: (provided, state) => ({
      ...provided,
      borderRadius: "md",
      border: "1px solid",
      borderColor: generateBorderColour(invertColours ?? false),
      backgroundColor: generateBackgroundColour(
        null,
        false,
        invertColours ?? false
      ),
    }),
    container: (provided, state) => ({
      ...provided,
      cursor: "pointer",
      borderRadius: "md",
      width: fullWidth ? "100%" : "auto",
      backgroundColor: generateBackgroundColour(
        null,
        state.isFocused,
        invertColours ?? false
      ),
      _active: {
        border: "none",
      },
      _focus: {
        border: "none",
      },
    }),
    control: (provided, state) => ({
      ...provided,
      fontSize: "md",
      borderRadius: "md",
      border: "none",
      shadow: "none",
      _hover: {
        backgroundColor: darken(
          0.05,
          generateBackgroundColour(
            null,
            state.isFocused,
            invertColours ?? false
          )
        ),
      },
    }),
    placeholder: (provided, state) => ({
      ...provided,
      fontSize: "md",
      color: generateColour(invertColours ?? false),
    }),
    input: (provided, state) => {
      return {
        ...provided,
        fontSize: "md",
        border: "none",
        color: generateColour(invertColours ?? false),
      };
    },
    option: (provided, state) => {
      return {
        ...provided,
        color: generateColour(invertColours ?? false),
        backgroundColor: generateBackgroundColour(
          null,
          state.isFocused,
          invertColours ?? false
        ),
        _hover: {
          backgroundColor: generateBackgroundColour(
            null,
            state.isFocused,
            invertColours ?? false
          ),
        },
      };
    },
    groupHeading: (provided, state) => ({
      ...provided,
      fontWeight: theme.fontWeights.md,
      fontSize: "md",
      color: generateColour(invertColours ?? false),
      backgroundColor: generateBackgroundColour(
        null,
        false,
        invertColours ?? false
      ),
    }),
    menu: (provided, state) => ({
      ...provided,
      borderRadius: "md",
      border: "none",
      shadow: "sm",
      backgroundColor: generateBackgroundColour(
        null,
        false,
        invertColours ?? false
      ),
    }),
  };

  return (
    <CRSelect
      size="sm"
      useBasicStyles
      key={uuidv4()}
      selectedOptionColorScheme={
        colorMode === "light" ? "gray.200" : "gray.900"
      }
      autoFocus={autoFocus}
      isDisabled={isDisabled}
      focusBorderColor={"gray.100"}
      chakraStyles={chakraStyles}
      onChange={(
        newValue: MultiValue<OptionType> | SingleValue<OptionType>,
        actionMeta: ActionMeta<OptionType>
      ) => {
        if (
          actionMeta.action === "select-option" ||
          actionMeta.action === "remove-value" ||
          actionMeta.action === "clear"
        ) {
          onChange(newValue);
          return;
        }
        // @ts-ignore
        onChange(newValue?.value);
      }}
      isMulti={isMulti}
      options={options}
      escapeClearsValue
      defaultMenuIsOpen={false}
      menuPlacement="auto"
      isSearchable
      components={components}
      defaultValue={defaultValue}
      placeholder={placeholder}
      formatOptionLabel={(data: OptionType) => {
        return renderLabelAsElement ? (
          <span>{data.label}</span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: data.label }} />
        );
      }}
    />
  );
};

export default Select;
