import React, { ReactElement } from "react";
import electron from "electron";

import { validateItemString } from "../utils";
import { themes } from "../theme";
import { Icons } from "../assets/icons";
import { ThemeProvider } from "../StyledComponents";
import { Container, Icon } from "./styled/EditableItem";
import EditableText from "./EditableText";
import { connect } from "react-redux";

interface StateProps {
  theme: string;
}

interface OwnProps {
  hideIcon?: boolean;
  text: string;
  readOnly: boolean;
  innerRef?: React.RefObject<HTMLInputElement>;
  onSubmit: (t: string) => void;
  onEscape?: () => void;
}

type EditableItemProps = StateProps & OwnProps;
function InternalEditableItem(props: EditableItemProps): ReactElement {
  const handleUpdate = (value): boolean => {
    props.onSubmit(value);
    electron.ipcRenderer.send("close-quickadd");
    return true;
  };

  return (
    <ThemeProvider theme={themes[props.theme]}>
      <Container
        onKeyUp={(e) => {
          if (e.key == "Escape") {
            props.onEscape ? props.onEscape() : null;
          }
        }}
        hideIcon={props.hideIcon}
      >
        {props.hideIcon ? null : <Icon>{Icons["add"]()}</Icon>}
        <EditableText
          innerRef={props.innerRef}
          onUpdate={handleUpdate}
          singleline={true}
          input={""}
          validation={{
            validate: true,
            rule: validateItemString,
          }}
          shouldSubmitOnBlur={false}
          shouldClearOnSubmit={true}
        />
      </Container>
    </ThemeProvider>
  );
}

const EditableItem = React.forwardRef(
  (props: EditableItemProps, ref: React.RefObject<HTMLInputElement>) => (
    <InternalEditableItem innerRef={ref} {...props} />
  )
);

EditableItem.displayName = "EditableItem";
const mapStateToProps = (state): StateProps => ({
  theme: state.ui.theme,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(EditableItem);
