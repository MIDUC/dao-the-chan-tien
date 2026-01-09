/**
 * Format number to short format (1k, 1M, 1B, 1T, 1Qa, 1Qi, 1Sx, 1Sp, 1Oc, 1No, 1Dc)
 * 1k = 1,000
 * 1M = 1,000k = 1,000,000
 * 1B = 1,000M = 1,000,000,000
 * 1T = 1,000B = 1,000,000,000,000
 * 1Qa = 1,000T = 1,000,000,000,000,000 (Quadrillion)
 * 1Qi = 1,000Qa = 1,000,000,000,000,000,000 (Quintillion)
 * 1Sx = 1,000Qi = 1,000,000,000,000,000,000,000 (Sextillion)
 * 1Sp = 1,000Sx = 1,000,000,000,000,000,000,000,000 (Septillion)
 * 1Oc = 1,000Sp = 1,000,000,000,000,000,000,000,000,000 (Octillion)
 * 1No = 1,000Oc = 1,000,000,000,000,000,000,000,000,000,000 (Nonillion)
 * 1Dc = 1,000No = 1,000,000,000,000,000,000,000,000,000,000,000 (Decillion)
 *
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 2, max: 3)
 * @param minFormat - Minimum number to start formatting (default: 10000, meaning format from 10k+)
 */
export function formatNumber(
  num: number,
  decimals: number = 2,
  minFormat: number = 10000
): string {
  // Show full number if below minimum format threshold
  if (num < minFormat) {
    return num.toLocaleString("vi-VN");
  }

  // Clamp decimals between 0 and 3
  const dec = Math.max(0, Math.min(3, decimals));

  if (num < 1000000) {
    // Thousands (k)
    const k = num / 1000;
    if (k % 1 === 0) {
      return `${k}k`;
    }
    // Remove trailing zeros
    const formatted = k.toFixed(dec);
    return `${parseFloat(formatted)}k`;
  }

  if (num < 1000000000) {
    // Millions (M)
    const m = num / 1000000;
    if (m % 1 === 0) {
      return `${m}M`;
    }
    const formatted = m.toFixed(dec);
    return `${parseFloat(formatted)}M`;
  }

  if (num < 1000000000000) {
    // Billions (B)
    const b = num / 1000000000;
    if (b % 1 === 0) {
      return `${b}B`;
    }
    const formatted = b.toFixed(dec);
    return `${parseFloat(formatted)}B`;
  }

  if (num < 1000000000000000) {
    // Trillions (T)
    const t = num / 1000000000000;
    if (t % 1 === 0) {
      return `${t}T`;
    }
    const formatted = t.toFixed(dec);
    return `${parseFloat(formatted)}T`;
  }

  if (num < 1000000000000000000) {
    // Quadrillions (Qa)
    const qa = num / 1000000000000000;
    if (qa % 1 === 0) {
      return `${qa}Qa`;
    }
    const formatted = qa.toFixed(dec);
    return `${parseFloat(formatted)}Qa`;
  }

  if (num < 1000000000000000000000) {
    // Quintillions (Qi)
    const qi = num / 1000000000000000000;
    if (qi % 1 === 0) {
      return `${qi}Qi`;
    }
    const formatted = qi.toFixed(dec);
    return `${parseFloat(formatted)}Qi`;
  }

  if (num < 1000000000000000000000000) {
    // Sextillions (Sx)
    const sx = num / 1000000000000000000000;
    if (sx % 1 === 0) {
      return `${sx}Sx`;
    }
    const formatted = sx.toFixed(dec);
    return `${parseFloat(formatted)}Sx`;
  }

  if (num < 1000000000000000000000000000) {
    // Septillions (Sp)
    const sp = num / 1000000000000000000000000;
    if (sp % 1 === 0) {
      return `${sp}Sp`;
    }
    const formatted = sp.toFixed(dec);
    return `${parseFloat(formatted)}Sp`;
  }

  if (num < 1000000000000000000000000000000) {
    // Octillions (Oc)
    const oc = num / 1000000000000000000000000000;
    if (oc % 1 === 0) {
      return `${oc}Oc`;
    }
    const formatted = oc.toFixed(dec);
    return `${parseFloat(formatted)}Oc`;
  }

  if (num < 1000000000000000000000000000000000) {
    // Nonillions (No)
    const no = num / 1000000000000000000000000000000;
    if (no % 1 === 0) {
      return `${no}No`;
    }
    const formatted = no.toFixed(dec);
    return `${parseFloat(formatted)}No`;
  }

  // Decillions (Dc) and beyond
  const dc = num / 1000000000000000000000000000000000;
  if (dc % 1 === 0) {
    return `${dc}Dc`;
  }
  const formatted = dc.toFixed(dec);
  return `${parseFloat(formatted)}Dc`;
}

/**
 * Format number with full precision for display
 * Shows both short format and full number on hover
 */
export function formatNumberWithTooltip(num: number): {
  display: string;
  full: string;
} {
  const display = formatNumber(num);
  const full = num.toLocaleString("vi-VN");
  return { display, full };
}
