import { AzureFunction, Context } from "@azure/functions";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { NotificationTargetType} from "@microsoft/teamsfx";
import holidayTemplate from "./adaptiveCards/notification-holiday.json";
import { HolidayCardData } from "./cardModels";
import { bot } from "./internal/initialize";
import { holidaysData, thanksGivingData } from "./cardData/holidayData";

// An Azure Function timer trigger.
//
// This function fires periodically. You can adjust the schedule in `../timerNotifyTrigger/function.json`.
//
// When this function is triggered, it sends an Adaptive Card to Teams. You can update the logic in this function
// to suit your needs. You can poll an API or retrieve data from a database, and based on the data, you can
// send an Adaptive Card as required.
const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
  context.log("Function triggerred-2");
  // Send holiday card for holidays that trigger time can't be calculated
  if(context.bindings.thanksGivingTimer){
    context.log("ThanksGiving timer, send card and return.");
    await sendHolidayCard(thanksGivingData, context);
    return;
  } 

  context.log("Start iterate all holidays...");
  // Send holiday card for regular holidays that happen in next 24hrs
  for (const holiday of holidaysData) {
    //query the holidays that will happen in next 24hr
    const now = new Date();
    const within24hr = Date.parse(new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 24, now.getMinutes()).toString());
    const holidayDate = Date.parse("2023-" + holiday.holidayDate);
    context.log("Current holiday:" + holiday.holidayName);
    if (holidayDate >= now.getTime() && holidayDate < within24hr) {
      context.log("Send holiday card");
      await sendHolidayCard(holiday, context);
    }
  }
};

async function sendHolidayCard(data: any, context: Context){
  const card = AdaptiveCards.declare<HolidayCardData>(holidayTemplate).render(data);

  // By default this function will iterate all the installation points and send an Adaptive Card
  // to every installation.
  let i = 0;
  context.log("Installtion number " + (await (await bot.notification.installations()).length));
  for (const target of await bot.notification.installations()) {
      // List all members in the Group Chat and send the Adaptive Card to each Team member
    if (target.type === NotificationTargetType.Group) {
      const members = await target.members();
      for (const member of members) {
        await member.sendAdaptiveCard(card);
        i = i +1;
        context.log("Holiday card sent to " + member.account);
      }
    }
    context.log("Number of holiday card sent to Group: " + i);

    let j = 0;
      // List all members in the Team and send the Adaptive Card to each Team member
      if (target.type === NotificationTargetType.Channel) {
      const members = await target.members();
      for (const member of members) {
        await member.sendAdaptiveCard(card);
        j = j+1;
        context.log("Holiday card sent to " + member.account);
      }
    }
    context.log("Number of holiday card sent to Group: " + j);

      // Directly notify the individual person
      if (target.type === NotificationTargetType.Person) {
      await target.sendAdaptiveCard(card);
      context.log("Holiday card sent to individual");
    }
  }
}

export default timerTrigger;
