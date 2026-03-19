import { SVGProps } from 'react';

export const TriceratopsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M50 5L90 25V75L50 95L10 75V25L50 5Z" stroke="currentColor" strokeWidth="2" />
    <path d="M30 40C30 40 35 30 50 30C65 30 70 40 70 40" stroke="currentColor" strokeWidth="2" />
    <path d="M25 50L40 65M75 50L60 65" stroke="currentColor" strokeWidth="2" />
    <circle cx="50" cy="55" r="15" stroke="currentColor" strokeWidth="2" />
    <path d="M45 55L50 50L55 55" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const KeyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="50" cy="30" r="20" stroke="currentColor" strokeWidth="2" />
    <circle cx="50" cy="30" r="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <path d="M50 50V85M50 60H60M50 70H60" stroke="currentColor" strokeWidth="2" />
    <path d="M45 85L50 90L55 85" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const EcologyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M50 20V80M20 50H80" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
    <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" />
    <path d="M50 35L55 50L50 65L45 50L50 35Z" fill="currentColor" />
    <path d="M30 70C35 65 45 65 50 70C55 75 65 75 70 70" stroke="currentColor" strokeWidth="2" />
    <path d="M20 30L30 40M80 30L70 40" stroke="currentColor" strokeWidth="2" />
  </svg>
);
