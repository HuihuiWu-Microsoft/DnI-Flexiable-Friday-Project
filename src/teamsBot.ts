import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { TeamsActivityHandler, TurnContext } from "botbuilder";
import { QueryDateCommandHandler } from "./queryDateCommandHandler";
import { QueryHolidaysCommandHandler } from "./queryHolidaysCommandHandler";

// An empty teams activity handler.
// You can add your customization code here to extend your bot logic if needed.
export class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();
    
    const endpoint = "https://openaiserviceyu.openai.azure.com/" ;
    const azureApiKey = "40194e7d8bfe4ed9b6c6dc75c61bc791" ;
    const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
    const deploymentName = "text-davinci-003";

    this.onMessage(async (context, next) => {
      let txt = context.activity.text;
      if(QueryHolidaysCommandHandler.regex.exec(txt) == null && QueryDateCommandHandler.regex.exec(txt)  == null){
      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      if (removedMentionText) {
        // Remove the line break
        txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
      }

      const response = await client.getCompletions(deploymentName, [txt]);
      for (const choice of response.choices) {
          await context.sendActivity(choice.text);
        }
      }
      
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}
