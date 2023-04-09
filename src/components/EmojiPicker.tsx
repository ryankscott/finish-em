import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

type Emoji = {
  emoticons: string[];
  id: string;
  keywords: string[];
  name: string;
  native: string;
  shortcodes: string;
  unified: string;
};

type EmojiPickerProps = {
  onEmojiSelected: (emoji: Emoji) => void;
  onClickOutside?: () => void;
};

const EmojiPicker = ({ onEmojiSelected, onClickOutside }: EmojiPickerProps) => {
  return (
    <Picker
      data={data}
      previewPosition="none"
      native
      title=""
      emoji=""
      onClickOutside={onClickOutside}
      skinTonePosition="none"
      onEmojiSelect={(emoji: Emoji) => {
        onEmojiSelected(emoji);
      }}
    />
  );
};
export default EmojiPicker;
