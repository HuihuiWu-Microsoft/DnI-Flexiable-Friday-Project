import { Activity, CardFactory, MessageFactory, TurnContext } from "botbuilder";
import {
  CommandMessage,
  TeamsFxBotCommandHandler,
  TriggerPatterns,
} from "@microsoft/teamsfx";
import doSomethingCard from "./adaptiveCards/welcome.json";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { CommonCardData } from "./cardModels";

export class WelcomeCommandHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: TriggerPatterns = "welcome";

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity>> {
    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);

    const cardData: CommonCardData = {
      title: "Welcome",
      body: "Congratulations! Your D&I bot is running. Click the documentation below to learn more about D&I.",
    };
    const cardJson = AdaptiveCards.declare(doSomethingCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}