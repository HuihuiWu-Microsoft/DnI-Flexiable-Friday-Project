import { BotBuilderCloudAdapter } from "@microsoft/teamsfx";
import ConversationBot = BotBuilderCloudAdapter.ConversationBot;
import config from "./config";
import { BlobsStorage } from "../storage/blobsStorage";

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
      "DefaultEndpointsProtocol=https;AccountName=diversitypulse;AccountKey=/Z3kX3U1yh6GxyRQBGLQE8KqMJv3M9nm6Cm7qcp9hi/um5EHWDgh0oC0Jz1nPDC0YZOip87Xu4qI+ASttfasGg==;EndpointSuffix=core.windows.net",
      "blobstorage"
    ),
  },
  command: {
    enabled: true,
    commands: [ 
      new WelcomeCommandHandler()
    ],
  }
});
