import holidayTemplate from './adaptiveCards/notification-holiday.json';
import {
  Activity,
  CardFactory,
  MessageFactory,
  TurnContext
  } from 'botbuilder';
import { AdaptiveCards } from '@microsoft/adaptivecards-tools';
import { AzureKeyCredential, OpenAIClient } from '@azure/openai';
import { HolidayCardData } from './cardModels';
import { holidaysData } from './cardData/holidayData';
import {
  CommandMessage,
  TeamsFxBotCommandHandler,
  TriggerPatterns,
} from "@microsoft/teamsfx";

export class QueryDateCommandHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: TriggerPatterns = /(.*?)/i;

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity>> {
    const queryDatePattern = /^Query holiday on (.*?)$/i;
    const match = message.text.match(queryDatePattern);
    if (match) {
      const queryDateString: string = match[1];
      return this._handleQueryDateCommand(queryDateString);
    }
    
    return this._handleCustomChatCommand(message.text);;
  }

  private _getDateFromHolidayData(holidayDate: string): {month: number; day: number} {
    const datePattern = /^(\d{2})-(\d{2}) (.*)$/;
    const match = holidayDate.match(datePattern);
    if (match) {
      return {
        month: parseInt(match[0]),
        day: parseInt(match[1]),
      }
    }

    const date = new Date(holidayDate);
    return {
      month: date.getMonth(),
      day: date.getDate(), 
    }
  }

  private _handleQueryDateCommand(queryDateString: string): string | Partial<Activity>  {
    const queryDate = new Date(queryDateString);
    if (isNaN(queryDate.getTime())) {
      return MessageFactory.text("Invalid date format. Please enter date in the format of MM/DD, such as 01/01.");
    }

    for (const holiday of holidaysData) {
      const holidayDate = this._getDateFromHolidayData(holiday.holidayDate);
      if (queryDate.getMonth() === holidayDate.month && queryDate.getDate() === holidayDate.day) {
          const card = AdaptiveCards.declare<HolidayCardData>(holidayTemplate).render(holiday);
          return MessageFactory.attachment(CardFactory.adaptiveCard(card));
      }
    }
    return MessageFactory.text("No holiday on this date.");
  }

  private _handleCustomChatCommand(txt): string {
    const endpoint = "https://openaiserviceyu.openai.azure.com/" ;
    const azureApiKey = "40194e7d8bfe4ed9b6c6dc75c61bc791" ;
    const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
    const deploymentName = "text-davinci-003";

    client.getCompletions(deploymentName, [txt]).then(response => {
      let responseString = "";
      for (const choice of response.choices) {
        responseString += choice.text;
        console.log(`Generated text: ${choice.text}`);
      }
      return MessageFactory.text(responseString);
    });
    return "";
  }

}