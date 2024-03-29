import { BotBuilderCloudAdapter } from "@microsoft/teamsfx";
import ConversationBot = BotBuilderCloudAdapter.ConversationBot;
import config from "./config";
import { BlobsStorage } from "../storage/blobsStorage";
import { QueryDateCommandHandler } from "../queryDateCommandHandler";
import { QueryHolidaysCommandHandler } from "../queryHolidaysCommandHandler";

const BlobStorageName = config.storageConnectionString;
const BlobContainerName =
  `dni-${config.envName}-${config.teamsAppId}`.toLocaleLowerCase();

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
    // The storage to store the notification data.
    // Local storage is used if not specified.
    storage: config.storageConnectionString
      ? new BlobsStorage(
          BlobStorageName, // Azure Blob Storage connection string
          BlobContainerName // Azure Blob Storage container name
        )
      : undefined,
  },
  command: {
    enabled: true,
    commands: [
      new QueryDateCommandHandler(),
      new QueryHolidaysCommandHandler()
    ]
  }
});
