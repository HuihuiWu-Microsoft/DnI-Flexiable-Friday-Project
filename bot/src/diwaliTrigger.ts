import { AzureFunction, Context } from "@azure/functions";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { NotificationTargetType} from "@microsoft/teamsfx";
import holidayTemplate from "./adaptiveCards/notification-holiday.json";
import { HolidayCardData } from "./cardModels";
import { bot } from "./internal/initialize";
import { diwaliData } from "./cardData/holidayData";

// An Azure Function timer trigger.
//
// This function fires periodically. You can adjust the schedule in `../timerNotifyTrigger/function.json`.
//
// When this function is triggered, it sends an Adaptive Card to Teams. You can update the logic in this function
// to suit your needs. You can poll an API or retrieve data from a database, and based on the data, you can
// send an Adaptive Card as required.
const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
  const card = AdaptiveCards.declare<HolidayCardData>(holidayTemplate).render(diwaliData);

  // By default this function will iterate all the installation points and send an Adaptive Card
  // to every installation.
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
};

export default timerTrigger;
