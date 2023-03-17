import { AzureFunction, Context } from "@azure/functions";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { NotificationTargetType } from "@microsoft/teamsfx";
import { holidaysData } from "./cardData/holidayData";
import { HolidayCardData } from "./cardModels";
import { bot } from "./internal/initialize";
import holidayTemplate from "./adaptiveCards/notification-holiday.json";

// An Azure Function timer trigger.
//
// This function fires periodically. You can adjust the schedule in `../timerNotifyTrigger/function.json`.
//
// When this function is triggered, it sends an Adaptive Card to Teams. You can update the logic in this function
// to suit your needs. You can poll an API or retrieve data from a database, and based on the data, you can
// send an Adaptive Card as required.
const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
  // Send holiday card for regular holidays that happen in next 24hrs
  for (const holiday of holidaysData) {
    //query the holidays that will happen in next 24hr
    const now = new Date();
    const within24hr = Date.parse(new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 24, now.getMinutes()).toString());
    const holidayDate = Date.parse("2023-" + holiday.holidayDate);

    if (holidayDate >= now.getTime() && holidayDate < within24hr) {
      const card = AdaptiveCards.declare<HolidayCardData>(holidayTemplate).render(holiday);

      for (const target of await bot.notification.installations()) {
        // List all members in the Group Chat and send the Adaptive Card to each Team member
        if (target.type === NotificationTargetType.Group) {
          const members = await target.members();
          for (const member of members) {
            await member.sendAdaptiveCard(card);
          }
        }

        // List all members in the Team and send the Adaptive Card to each Team member
        if (target.type === NotificationTargetType.Channel) {
          const members = await target.members();
          for (const member of members) {
            await member.sendAdaptiveCard(card);
          }
        }

        // Directly notify the individual person
        if (target.type === NotificationTargetType.Person) {
          await target.sendAdaptiveCard(card);
        }
      }
    }
  }
};

export default timerTrigger;
