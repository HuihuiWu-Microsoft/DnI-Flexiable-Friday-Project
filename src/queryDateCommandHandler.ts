import { Activity, CardFactory, MessageFactory, TurnContext } from "botbuilder";
import {
  CommandMessage,
  TeamsFxBotCommandHandler,
  TriggerPatterns,
} from "@microsoft/teamsfx";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { holidaysData } from "./cardData/holidayData";
import { HolidayCardData } from "./cardModels";
import holidayTemplate from "./adaptiveCards/notification-holiday.json";

export class QueryDateCommandHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: TriggerPatterns = /^Query date (.*?)$/i;

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity>> {
    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);
    const queryDateString: string = message.matches[1];
    console.log(`queryDate: ${queryDateString}`);

    const queryDate = new Date(queryDateString);
    for (const holiday of holidaysData) {
        const holidayDate = Date.parse(`${queryDate.getFullYear()}-${holiday.holidayDate}`);
        if (queryDate.getTime() === holidayDate) {
            const card = AdaptiveCards.declare<HolidayCardData>(holidayTemplate).render(holiday);
            return MessageFactory.attachment(CardFactory.adaptiveCard(card));
        }
    }
    return MessageFactory.text("No holiday on this date.");
  }
}