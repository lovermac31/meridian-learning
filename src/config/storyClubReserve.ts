import { STORY_CLUB_LIST_PRICE_VND } from './storyClubOffer';

/** The internal group id 'sat-0900' is a database key (supabase check constraint); only its label changed to 13:00. */
/** Schedule configuration for the reserve page; change this value when the next cohort is confirmed. */
export const STORY_CLUB_NEXT_GROUP = {
  en: 'Sat 13:00',
  vi: 'Thứ Bảy 13:00',
} as const;

export const STORY_CLUB_GROUPS = [
  { id: 'sat-0900', label: STORY_CLUB_NEXT_GROUP },
  { id: 'flexible', label: { en: 'Another time / please ask me', vi: 'Thời gian khác / vui lòng liên hệ' } },
] as const;

// The list price. What a parent pays on a given day is storyClubPriceAt() in storyClubOffer.ts.
export const STORY_CLUB_PRICE_VND = STORY_CLUB_LIST_PRICE_VND;
export const STORY_CLUB_QR_PATH = '/assets/pay/vietqr-story-club.png';
export const STORY_CLUB_SAMPLE_URL = 'https://books.jurassicenglish.com/book.html?utm_source=reserve&utm_content=mina-and-the-midnight-drum#mina-and-the-midnight-drum';
