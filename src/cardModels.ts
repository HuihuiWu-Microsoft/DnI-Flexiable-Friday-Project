/**
 * Adaptive Card data model. Properties can be referenced in an adaptive card via the `${var}`
 * Adaptive Card syntax.
 */
export interface StoryData {
  storyTitle: string;
  storyImage: string;
  storyDescription: string;
  storyUrl: string;
}

export interface HolidayCardData {
  holidayName: string;
  holidayImageUrl: string;
  holidayDate: string;
  holidayCountry: string;
  holidayDescription: string;
}

export interface CommonCardData {
  title: string;
  body: string;
}
