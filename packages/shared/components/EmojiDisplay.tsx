import data from "@emoji-mart/data";
import { init } from "emoji-mart";

export type Emoji = {
  emoticons: string[];
  id: string;
  keywords: string[];
  name: string;
  native: string;
  shortcodes: string;
  unified: string;
};

type EmojiDisplayProps = {
  emojiId: string;
  size?: number;
};

// Initialise emoji library
init({ data });

const EmojiDisplay = ({ emojiId, size }: EmojiDisplayProps) => {
  // @ts-ignore
  return <em-emoji id={emojiId} size={size || 68} native />;
};
export default EmojiDisplay;
