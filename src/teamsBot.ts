import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { TeamsActivityHandler, TurnContext } from "botbuilder";
import { QueryDateCommandHandler } from "./queryDateCommandHandler";
import { QueryHolidaysCommandHandler } from "./queryHolidaysCommandHandler";
import config from "./internal/config";
import requestsJson from "./data/requests.json";
import * as fs from "fs-extra";

// An empty teams activity handler.
// You can add your customization code here to extend your bot logic if needed.
export class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();
    
    const client = new OpenAIClient(config.openAiEndpoint, new AzureKeyCredential(config.openAiKey));

    this.onMessage(async (context, next) => {
      let txt = context.activity.text;
      if (QueryHolidaysCommandHandler.regex.exec(txt) == null && QueryDateCommandHandler.regex.exec(txt) == null) {
        const now = new Date();
        const dateTime = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
        
        let requests: Record<string, Record<string, number>> = requestsJson;
        if (!requests[dateTime]) {
          requests[dateTime] = {};
        }
        if (!requests[dateTime][context.activity.from.id]) {
          requests[dateTime][context.activity.from.id] = 0;
        }
        if (requests[dateTime][context.activity.from.id] < 8){
          const removedMentionText = TurnContext.removeRecipientMention(context.activity);
          if (removedMentionText) {
            // Remove the line break
            txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
          }

          const messages = [{ "role": "system", "content": "You are an AI assistant that helps people find information about diversity and inclusive." },
          { "role": "user", "content": txt }];
          const response = await client.getChatCompletions(config.openAiDeploymentName, messages);
          for (const choice of response.choices) {
            await context.sendActivity(choice.message.content);
          }


          requests[dateTime][context.activity.from.id] = requests[dateTime][context.activity.from.id] + 1;
          await fs.writeJson("./src/data/requests.json", requests);
        } else {
          await context.sendActivity("The number of questions you've asked has reached limit, please come tomorrow~")
        }
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}
