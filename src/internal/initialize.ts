import { BotBuilderCloudAdapter } from "@microsoft/teamsfx";
import ConversationBot = BotBuilderCloudAdapter.ConversationBot;
import config from "./config";
import { BlobsStorage } from "../storage/blobsStorage";
import { QueryDateCommandHandler } from "../queryDateCommandHandler";

// Create bot.
export const notificationApp = new ConversationBot({
  // The bot id and password to create CloudAdapter.
  // See https://aka.ms/about-bot-adapter to learn more about adapters.
  adapterConfig: {
    MicrosoftAppId: config.botId,
    MicrosoftAppPassword: config.botPassword,
    MicrosoftAppType: "MultiTenant",
  },
  // Enable notification
  notification: {
    enabled: true,
    storage: new BlobsStorage(
      process.env.STORAGE_CONNECTION_STRING,
      "blobstorage"
    ),
  },
  command: {
    enabled: true,
    commands: [
      new QueryDateCommandHandler(),
    ]
  }
});
