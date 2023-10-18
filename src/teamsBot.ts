import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { TeamsActivityHandler, TurnContext } from "botbuilder";
import { QueryDateCommandHandler } from "./queryDateCommandHandler";
import { QueryHolidaysCommandHandler } from "./queryHolidaysCommandHandler";
import config from "./internal/config";
import path from "path";
import { readFileSync } from "fs";
import { holidaysData } from "./cardData/holidayData";

// An empty teams activity handler.
// You can add your customization code here to extend your bot logic if needed.
export class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    const client = new OpenAIClient(
      config.openAiEndpoint,
      new AzureKeyCredential(config.openAiKey)
    );

    this.onMessage(async (context, next) => {
      let txt = context.activity.text;
      if (
        QueryHolidaysCommandHandler.regex.exec(txt) == null &&
        QueryDateCommandHandler.regex.exec(txt) == null
      ) {
        const removedMentionText = TurnContext.removeRecipientMention(
          context.activity
        );
        if (removedMentionText) {
          // Remove the line break
          txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
        }

        const promptFilePath = path.join(
          __dirname,
          "prompts",
          "QA-Chat",
          "skprompt.txt"
        );
        const prompt = readFileSync(promptFilePath, "utf8");
        const holiday = holidaysData
          .map(
            (item) =>
              `|${item.holidayName}|${item.holidayCountry}|${item.holidayDate}|${item.holidayDescription}|`
          )
          .join("\r\n");

        const messages = [
          {
            role: "system",
            content: prompt.replace("{{Holidays}}", holiday),
          },
          { role: "user", content: txt },
        ];
        const response = await client.getChatCompletions(
          config.openAiDeploymentName,
          messages
        );
        for (const choice of response.choices) {
          await context.sendActivity(choice.message.content);
        }
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}
