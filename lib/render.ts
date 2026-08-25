// ponytail: regex heuristic, bot wins over mobile so crawlers always SSR
export const BOT_RE =
  /bot|crawler|spider|crawl|slurp|mediapartners|googlebot|bingbot|yandex|baidu|duckduckbot|semrushbot|ahrefsbot|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|outbrain|petalbot|applebot|whatsapp|telegram/i;

export const MOBILE_RE =
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;

export function isBot(ua: string) {
  return BOT_RE.test(ua);
}
export function isMobileUA(ua: string) {
  return MOBILE_RE.test(ua);
}
export function isMobileHint(ua: string) {
  if (!ua) return false;
  if (isBot(ua)) return false; // crawler -> SSR even if mobile token
  return isMobileUA(ua);
}
