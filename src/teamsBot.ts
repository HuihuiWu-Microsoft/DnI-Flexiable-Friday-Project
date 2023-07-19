import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { CardFactory, TeamsActivityHandler, TurnContext } from "botbuilder";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import welcomeCard from "./adaptiveCards/welcome.json";

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
      console.log("Running with Message Activity.");

      let txt = context.activity.text;
      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      if (removedMentionText) {
        // Remove the line break
        txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
      }

      const response = await client.getCompletions(deploymentName, [txt]);
      for (const choice of response.choices) {
        await context.sendActivity(choice.text);
      }
      
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      console.log("Running with MembersAdded Activity.");

      const membersAdded = context.activity.membersAdded;
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          const cardJson = AdaptiveCards.declareWithoutData(welcomeCard).render();
          await context.sendActivity({ attachments: [CardFactory.adaptiveCard(cardJson)] });
        }
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}
