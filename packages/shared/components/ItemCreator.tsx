import { ReactElement } from "react";
import EditItemCreator from "./EditItemCreator";
import { ItemCreator2 } from "./ItemCreator2";

export type ItemCreatorProps = {
  initiallyExpanded: boolean;
  readOnly?: boolean;
  componentKey?: string;
  shouldCloseOnSubmit?: boolean;
  shouldCloseOnBlur?: boolean;
  parentKey?: string;
  projectKey?: string | "0";
  dueAt?: Date;
  scheduledAt?: Date;
  repeat?: string;
  labelKey?: string;
  buttonText?: string;
  width?: string;
  hideButton?: boolean;
  editing?: boolean;
  style?: "subtle" | "default";
  setEditing?: (editing: boolean) => void;
};

const ItemCreator = ({
  readOnly,
  componentKey,
  projectKey,
  dueAt,
  scheduledAt,
  labelKey,
  editing,
  setEditing,
  parentKey,
  buttonText,
  repeat,
}: ItemCreatorProps): ReactElement => {
  return (
    <>
      {editing ? (
        <EditItemCreator
          componentKey={componentKey}
          onClose={() => setEditing && setEditing(false)}
        />
      ) : (
        <ItemCreator2
          buttonText={buttonText}
          readOnly={readOnly}
          defaultProjectKey={projectKey}
          defaultLabelKey={labelKey}
          defaultDueAt={dueAt}
          defaultScheduledAt={scheduledAt}
          parentKey={parentKey}
          singleLine
        />
      )}
    </>
  );
};

export default ItemCreator;
