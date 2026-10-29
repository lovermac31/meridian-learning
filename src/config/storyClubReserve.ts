/** Schedule configuration for the reserve page; change this value when the next cohort is confirmed. */
export const STORY_CLUB_NEXT_GROUP = 'Sat 9:00';

export const STORY_CLUB_GROUPS = [
  { id: 'sat-0900', label: STORY_CLUB_NEXT_GROUP },
  { id: 'flexible', label: 'Another time / please ask me' },
] as const;

export const STORY_CLUB_PRICE_VND = 590_000;
export const STORY_CLUB_QR_PATH = '/assets/pay/vietqr-story-club.png';
export const STORY_CLUB_SAMPLE_URL = 'https://books.jurassicenglish.com/book.html?utm_source=reserve&utm_content=mina-and-the-midnight-drum#mina-and-the-midnight-drum';
