import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // 3D Perspective and Transform Classes
    'perspective-container',
    'transform-3d',

    // Halogen Glow Animations
    'animate-pulse-glow',
    'animate-pulse-glow-delayed',

    // 3D Rotation Animations
    'animate-rotate-3d',
    'animate-rotate-3d-slow',
    'animate-rotate-3d-reverse',
    'animate-tilt-3d',
    'animate-spin-3d',

    // Full-Screen Traverse Animations
    'animate-traverse-diagonal-1',
    'animate-traverse-diagonal-2',
    'animate-traverse-horizontal',
    'animate-traverse-vertical',
    'animate-traverse-orbit',
    'animate-traverse-zigzag',
    'animate-traverse-wave',
    'animate-traverse-spiral',

    // Particle Animations
    'animate-dash',
    'animate-dash-delayed',
    'animate-particle-1',
    'animate-particle-2',
    'animate-particle-3',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
