export const MOTION_DURATIONS = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.4,
} as const;

export const MOTION_EASINGS = {
  easeInOut: [0.4, 0, 0.2, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  spring: { type: "spring" as const, bounce: 0.15, duration: 0.3 },
  springBouncy: { type: "spring" as const, bounce: 0.25, duration: 0.4 },
  springSmooth: { type: "spring" as const, bounce: 0.1, duration: 0.25 },
} as const;

export const MOTION_SCALES = {
  subtle: 1.02,
  small: 1.05,
  medium: 1.1,
  large: 1.15,
  exit: 0.9,
  exitSmall: 0.8,
} as const;

export const MOTION_OPACITY = {
  visible: 1,
  hidden: 0,
  dimmed: 0.5,
} as const;

export const MOTION_TRANSLATIONS = {
  small: 10,
  medium: 20,
  large: 40,
} as const;

export const DEBOUNCE_DELAYS = {
  search: 150,
  input: 300,
  resize: 500,
} as const;

export const ANIMATION_THRESHOLDS = {
  maxAnimatedItems: 50,
  maxAnimatedRows: 20,
} as const;

export const MOTION_VARIANTS = {
  fadeIn: {
    initial: { opacity: MOTION_OPACITY.hidden },
    animate: { opacity: MOTION_OPACITY.visible },
    exit: { opacity: MOTION_OPACITY.hidden },
    transition: { duration: MOTION_DURATIONS.fast },
  },
  fadeInScale: {
    initial: { opacity: MOTION_OPACITY.hidden, scale: MOTION_SCALES.exit },
    animate: { opacity: MOTION_OPACITY.visible, scale: 1 },
    exit: { opacity: MOTION_OPACITY.hidden, scale: MOTION_SCALES.exit },
    transition: {
      opacity: { duration: MOTION_DURATIONS.fast },
      scale: { duration: MOTION_DURATIONS.fast },
    },
  },
  slideUp: {
    initial: { opacity: MOTION_OPACITY.hidden, y: MOTION_TRANSLATIONS.medium },
    animate: { opacity: MOTION_OPACITY.visible, y: 0 },
    exit: { opacity: MOTION_OPACITY.hidden, y: -MOTION_TRANSLATIONS.medium },
    transition: { duration: MOTION_DURATIONS.normal },
  },
  scaleHover: {
    whileHover: { scale: MOTION_SCALES.subtle },
    transition: { duration: MOTION_DURATIONS.fast },
  },
} as const;
