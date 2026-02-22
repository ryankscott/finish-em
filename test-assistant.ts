import { sendAssistantChat } from "./src/server/services/assistant";

async function main() {
  try {
    const response = await sendAssistantChat({
      surfaceInput: "tui",
      message: "Hello",
    });
    console.log(response);
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
