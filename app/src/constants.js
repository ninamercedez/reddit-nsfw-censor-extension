export const CENSOR_LEVEL_KEYS = {
  // VERY_LOW: 'very-low',
  LOW: 'low',
  MEDIUM: 'medium',
  // HIGH: 'high',
  // VERY_HIGH: 'very-high',
}

export const CENSOR_LEVELS = {
  // [CENSOR_LEVEL_KEYS.VERY_LOW]: {
  //   label: 'Very low',
  // },
  [CENSOR_LEVEL_KEYS.LOW]: {
    label: 'Low',
  },
  [CENSOR_LEVEL_KEYS.MEDIUM]: {
    label: 'Medium',
  },
  // [CENSOR_LEVEL_KEYS.HIGH]: {
  //   label: 'High',
  // },
  // [CENSOR_LEVEL_KEYS.VERY_HIGH]: {
  //   label: 'Very high',
  // },
}

export const CENSOR_AREA_KEYS = {
  FACE: 'face',
  BREASTS_EXPOSED: 'breasts-exposed',
  BREASTS_COVERED: 'breasts-covered',
  GENITALS_EXPOSED: 'genitals-exposed',
  GENITALS_COVERED: 'genitals-covered',
  BUTTOCKS_EXPOSED: 'buttocks-exposed',
  BUTTOCKS_COVERED: 'buttocks-covered',
  ANUS: 'anus',
  ARMPITS: 'armpits',
  STOMACH: 'stomach',
  FEET: 'feet',
}

export const CENSOR_AREAS = {
  [CENSOR_AREA_KEYS.FACE]: {
    toggleable: true,
    label: 'Face',
  },
  [CENSOR_AREA_KEYS.BREASTS_EXPOSED]: {
    toggleable: false,
    label: 'Breasts (exposed)',
  },
  [CENSOR_AREA_KEYS.BREASTS_COVERED]: {
    toggleable: true,
    label: 'Breasts (covered)',
  },
  [CENSOR_AREA_KEYS.GENITALS_EXPOSED]: {
    toggleable: false,
    label: 'Genitals (exposed)',
  },
  [CENSOR_AREA_KEYS.GENITALS_COVERED]: {
    toggleable: true,
    label: 'Genitals (covered)',
  },
  [CENSOR_AREA_KEYS.BUTTOCKS_EXPOSED]: {
    toggleable: false,
    label: 'Buttocks (exposed)',
  },
  [CENSOR_AREA_KEYS.BUTTOCKS_COVERED]: {
    toggleable: false,
    label: 'Buttocks (covered)',
  },
  [CENSOR_AREA_KEYS.ANUS]: {
    toggleable: false,
    label: 'Anus',
  },
  [CENSOR_AREA_KEYS.ARMPITS]: {
    toggleable: true,
    label: 'Armpits',
  },
  [CENSOR_AREA_KEYS.STOMACH]: {
    toggleable: true,
    label: 'Stomach',
  },
  [CENSOR_AREA_KEYS.FEET]: {
    toggleable: true,
    label: 'Feet',
  },
}

export const CENSOR_TYPE_KEYS = {
  PIXELS: 'pixels',
  // BLUR: 'blur',
  // BAR: 'bar'
}

export const CENSOR_TYPES = {
  [CENSOR_TYPE_KEYS.PIXELS]: {
    label: 'Pixels'
  }
}