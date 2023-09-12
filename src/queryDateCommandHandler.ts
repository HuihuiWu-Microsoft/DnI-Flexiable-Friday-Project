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
  public static regex = /^Query holiday on (.*?)$/i;
  triggerPatterns: TriggerPatterns = QueryDateCommandHandler.regex;

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity>> {
    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);
    const queryDateString: string = message.matches[1];
    console.log(`queryDate: ${queryDateString}`);

    const queryDate = new Date(queryDateString);
    if (isNaN(queryDate.getTime())) {
      return MessageFactory.text("Invalid date format. Please enter date in the format of MM/DD, such as 01/01.");
    }
    
    for (const holiday of holidaysData) {
      const holidayDate = this._getDateFromHolidayData(holiday.holidayDate);
      if (queryDate.getMonth() + 1 === holidayDate.month && queryDate.getDate() === holidayDate.day) {
          const card = AdaptiveCards.declare<HolidayCardData>(holidayTemplate).render(holiday);
          return MessageFactory.attachment(CardFactory.adaptiveCard(card));
      }
    }
    return MessageFactory.text("No holiday on this date.");
  }

  private _getDateFromHolidayData(holidayDate: string): {
    month: number;
    day: number} {

    const datePattern = /^(\d{2})-(\d{2}) (.*)$/;
    const match = holidayDate.match(datePattern);
    if (match) {
      return {
        month: parseInt(match[1]),
        day: parseInt(match[2]),
      }
    }

    const date = new Date(holidayDate);
    return {
      month: date.getMonth(),
      day: date.getDate(), 
    }
  }
}