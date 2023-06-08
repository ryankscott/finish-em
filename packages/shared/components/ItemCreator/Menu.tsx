import {
  Flex,
  Popover,
  PopoverTrigger,
  IconButton,
  Icon,
  PopoverContent,
  PopoverBody,
  Input,
  ButtonGroup,
  Button,
  Text,
} from "@chakra-ui/react";
import { BubbleMenu, Editor } from "@tiptap/react";
import { Icons } from "../../assets/icons";
import { useCallback, useState } from "react";

interface MenuProps {
  editor: Editor;
  onToggle: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function Menu({ editor, onClose, onToggle, isOpen }: MenuProps) {
  const [URL, setURL] = useState<string>();

  const setLink = useCallback(() => {
    if (URL === null) {
      return;
    }

    // empty
    if (!URL) {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: URL })
      .run();

    onClose();
  }, [editor, URL]);

  return (
    <>
      <Popover
        isOpen={isOpen}
        onClose={() => {
          setURL("");
          onClose();
        }}
        closeOnBlur={false}
        returnFocusOnClose={false}
      >
        <Flex id="menu">
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="bubble-menu"
          >
            <PopoverTrigger>
              <IconButton
                aria-label="link"
                onClick={() => {
                  setURL(editor.getAttributes("link").href ?? "");
                  onToggle();
                }}
                isActive={editor.isActive("link")}
                icon={<Icon as={Icons.link} />}
              />
            </PopoverTrigger>
            <IconButton
              aria-label="bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              icon={<Icon as={Icons.bold} />}
            />
            <IconButton
              aria-label="italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              icon={<Icon as={Icons.italic} />}
            />
            <IconButton
              aria-label="strike"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              icon={<Icon as={Icons.strike} />}
            />
          </BubbleMenu>
        </Flex>
        <PopoverContent>
          <PopoverBody p={4}>
            <Flex direction="column">
              <Text fontSize="lg" mb={2}>
                Enter a URL
              </Text>
              <Input
                onChange={(e) => {
                  setURL(e.target.value);
                }}
                value={URL}
                type="url"
                placeholder="https://www.google.com"
              />
            </Flex>
            <Flex pt={2} justifyContent="flex-end">
              <ButtonGroup size="sm">
                <Button onClick={onClose}>Cancel</Button>
                <Button colorScheme="blue" onClick={setLink}>
                  Apply
                </Button>
              </ButtonGroup>
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
}
