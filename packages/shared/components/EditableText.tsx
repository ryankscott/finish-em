import { Flex, useDisclosure } from "@chakra-ui/react";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ReactElement, useEffect } from "react";
import Menu from "./ItemCreator/Menu";
import Link from "@tiptap/extension-link";

type EditableTextProps = {
  singleLine: boolean;
  shouldSubmitOnBlur: boolean;
  shouldClearOnSubmit: boolean;
  onSubmit: (input: string) => void;
  onUpdate?: (input: string) => void;
  placeholder?: string;
  input?: string;
  readOnly?: boolean;
  onEscape?: () => void;
  shouldBlurOnSubmit?: boolean;
};

const EditableText = ({
  shouldSubmitOnBlur,
  shouldClearOnSubmit,
  onSubmit,
  onUpdate,
  singleLine,
  readOnly,
  onEscape,
  input,
  placeholder,
  shouldBlurOnSubmit,
}: EditableTextProps): ReactElement => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const CustomEnter = Extension.create({
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          onSubmit(this.editor?.getHTML() ?? "");
          return this.editor.chain().clearContent().blur().run();
        },
      };
    },
  });
  const editor = useEditor({
    extensions: singleLine
      ? [
          StarterKit,
          Link,
          Placeholder.configure({
            placeholder: "What do you need to do?",
          }),
          CustomEnter,
        ]
      : [
          StarterKit,
          Link,
          Placeholder.configure({
            placeholder: placeholder || "What do you need to do?",
          }),
        ],
    content: input,
    onUpdate: () => {
      if (onUpdate) {
        onUpdate(editor?.getHTML());
      }
    },
    onBlur: () => {
      if (shouldSubmitOnBlur) {
        onSubmit(editor?.getHTML() ?? "");
        if (shouldClearOnSubmit) {
          editor?.commands.clearContent();
        }
      }
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  return (
    <Flex w="100%">
      {editor && (
        <Menu
          editor={editor}
          onToggle={onToggle}
          onClose={onClose}
          isOpen={isOpen}
        />
      )}
      <EditorContent editor={editor} />
    </Flex>
  );
};

export default EditableText;
