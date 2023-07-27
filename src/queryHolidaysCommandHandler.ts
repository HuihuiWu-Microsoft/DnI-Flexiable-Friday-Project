import { Activity, CardFactory, MessageFactory, TurnContext } from "botbuilder";
import {
  CommandMessage,
  TeamsFxBotCommandHandler,
  TriggerPatterns,
} from "@microsoft/teamsfx";
import { holidaysData } from "./cardData/holidayData";

export class QueryHolidaysCommandHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: TriggerPatterns = /^Query holidays of (.*?)$/i;

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity>> {
    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);
    const queryCountryString: string = message.matches[1];
    console.log(`query country: ${queryCountryString}`);

    let holidayList = [];
    for (const holiday of holidaysData) {
      if(holiday.holidayCountry.toLowerCase() === queryCountryString.toLowerCase()){
        holidayList.push(holiday.holidayName);
      }
    }

    if(holidayList.length == 0){
      const countryList = [...new Set(holidaysData.map(item => item.holidayCountry))];
      return MessageFactory.text(`Invalid country name, supported countries are: ${countryList.join(", ")}`);
    }
    return MessageFactory.text(`There're totally ${holidayList.length} holiday(s) in ${queryCountryString}: ${holidayList.join(", ")}`);
  }
}