/* Homepage orbit parameters and personal photo collection. */
window.ORBIT_CONFIG = {
  layout: { arms: 6, turns: 1.05, radiusFraction: 0.7, birthFraction: 0.08,
    cardCount: 16, referenceMegapixels: 0.6, cardHeightFraction: 0.28,
    // Limit photo journeys separately from the full track extent.
    cardRadiusFraction: 0.72, evenPhases: true,
    armJitter: 0.76, ticksPerArm: 16, circleFraction: 0.56 },
  mobile: { belowMegapixels: 0.6, arms: 3, turns: 0.7, cardCount: 14,
    radiusFraction: 0.8, birthFraction: 0.08, cardHeightFraction: 0.3,
    cardRadiusFraction: 0.65, densityMultiplier: 1.05 },
  motion: { journeysPerMinute: 0.57, scrollJourneysPer1000px: 0.2,
    spinDegreesPerMinute: -50, wobblePixels: 6, wobbleHz: 0.25,
    cardsAt: 1, introSeconds: 4, rollChunk: 0.12, burstMultiplier: 3, burstSeconds: 2.5 },
  pointer: { fieldPixels: 320, tugPixels: 8, tiltDegrees: 0,
    holdSeconds: 0.15, restSeconds: 1, targetSeconds: 0.25,
    holdWobbleMultiplier: 1.2, boostScale: 3, boostSeconds: 0.18,
    ripplePixelsPerSecond: 900, rippleWidth: 140, rippleSeconds: 1.8 },
  look: { density: 1.02, innerCap: 0.52, squareUntil: 0.3, blurEnd: 0.18,
    birthFade: 0.12, exitFade: 0.06, cornerPixels: 10, lineAlpha: 0.15, tickAlpha: 0.3,
    linePixels: 2, pulseAlpha: 0.72, pulseSpeed: 0.19,
    pulseWidth: 0.05, pulseExtraPixels: 3.5, pulsesPerArm: 3 },
  uniqueImages: true,
  images: [
    'assets/images/sea_boston.jpg',
    'assets/images/darkStreet.jpg',
    'assets/images/Mount.jpg',
    'assets/images/sea.jpg',
    'assets/images/blueSky.jpg',
    'assets/images/BlueSEA.jpg',
    'assets/images/promo-tile-440x280.png',
    'assets/images/photo-campus-snow.webp', 'assets/images/photo-forest-cows.webp',
    'assets/images/photo-lantern-boat.webp', 'assets/images/photo-night-stars.webp',
    'assets/images/photo-tesla-windfarm.webp', 'assets/images/game_mc.webp',
    'assets/images/game_go.webp', 'assets/images/game_pubg.webp', 'assets/images/baowen-selfie.jpg'
  ]
};
