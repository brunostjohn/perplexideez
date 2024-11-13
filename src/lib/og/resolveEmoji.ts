import { ucs2 } from "punycode";
import { readFile } from "fs/promises";

export const resolveEmoji = async (emoji: string) => {
  const filename =
    ucs2
      .decode(emoji.replaceAll("\n", ""))
      .map((num) => num.toString(16))
      .join("-") + ".png";
  const filepath = `node_modules/emojiimages/imgs/${filename}`;
  const file = await readFile(filepath);
  const base64 = file.toString("base64");
  return `data:image/png;base64,${base64}`;
};
