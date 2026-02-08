function parseUserAgent(params) {
  if (!params) {
    return { device: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  let agent = null;

  if (typeof params.agent === 'string' && params.agent.length > 0) {
    agent = params.agent;
  } else if (
    typeof params.user_agent === 'string' &&
    params.user_agent.length > 0
  ) {
    agent = params.user_agent;
  } else if (
    typeof params.userAgent === 'string' &&
    params.userAgent.length > 0
  ) {
    agent = params.userAgent;
  } else if (
    typeof params['User-Agent'] === 'string' &&
    params['User-Agent'].length > 0
  ) {
    agent = params['User-Agent'];
  } else if (typeof params === 'string' && params.length > 0) {
    agent = params;
  }

  if (!agent) {
    return { device: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  const normalizeAgent = (userAgent) => {
    return userAgent
      .replace(/[\(\)]/g, ' ')
      .replace(/[;,]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizedAgent = normalizeAgent(agent);

  const devicePatterns = [
    { pattern: /Xbox|PlayStation|Nintendo|PS\d|Wii|Switch/i, value: 'console' },
    {
      pattern:
        /Tablet|iPad|Nexus 7|Nexus 9|Kindle|Silk|PlayBook|Tab|Galaxy Tab|SM-T/i,
      exclude: [/Mobile/i],
      value: 'tablet',
    },
    {
      pattern:
        /Mobile|Android|iPhone|iPod|Windows Phone|BlackBerry|Opera Mini|Mobi|Phone|webOS|IEMobile|BB10/i,
      exclude: [/Tablet/i, /iPad/i],
      value: 'mobile',
    },
    {
      pattern: /Windows NT|Macintosh|Linux|Win32|Win64|Intel Mac|PPC Mac|X11/i,
      value: 'desktop',
    },
  ];

  const browserPatterns = [
    { pattern: /Edg|Edge/i, value: 'Edge' },
    { pattern: /OPR|Opera|Presto/i, value: 'Opera' },
    { pattern: /YaBrowser/i, value: 'Yandex' },
    {
      pattern: /SamsungBrowser/i,
      value: 'Samsung Browser',
    },
    { pattern: /Brave|brave/i, value: 'Brave' },
    { pattern: /Vivaldi/i, value: 'Vivaldi' },
    { pattern: /UCBrowser|UC/i, value: 'UC Browser' },
    {
      pattern: /Chrome|Chromium|CrMo|CriOS/i,
      exclude: [
        /Edg/i,
        /OPR/i,
        /Opera/i,
        /YaBrowser/i,
        /SamsungBrowser/i,
        /Brave/i,
        /Vivaldi/i,
      ],
      value: 'Chrome',
    },
    {
      pattern: /Firefox|FxiOS|Fennec/i,
      exclude: [/Seamonkey/i],
      value: 'Firefox',
    },
    { pattern: /MSIE|Trident|rv:11/i, value: 'Internet Explorer' },
    {
      pattern: /Safari/i,
      exclude: [
        /Chrome/i,
        /CriOS/i,
        /Chromium/i,
        /Edg/i,
        /OPR/i,
        /Opera/i,
        /Firefox/i,
        /YaBrowser/i,
        /SamsungBrowser/i,
      ],
      value: 'Safari',
    },
  ];

  const osPatterns = [
    { pattern: /iPhone|iPad|iPod|iOS/i, value: 'iOS' },
    { pattern: /Android/i, value: 'Android' },
    { pattern: /Windows NT|Windows|Win32|Win64|WinNT/i, value: 'Windows' },
    {
      pattern: /Mac OS X|Macintosh|MacIntel|MacPPC|Mac_PowerPC/i,
      exclude: [/iPhone|iPad|iPod|iOS/i],
      value: 'MacOS',
    },
    {
      pattern: /Linux|X11|Ubuntu|Debian|CentOS|RedHat/i,
      exclude: [/Android/i],
      value: 'Linux',
    },
    { pattern: /CrOS|Chrome OS/i, value: 'ChromeOS' },
    { pattern: /KaiOS/i, value: 'KaiOS' },
    {
      pattern: /Windows Phone|WPDesktop|Windows Mobile|WM\d/i,
      value: 'Windows Phone',
    },
    { pattern: /Xbox|X-Box/i, value: 'Xbox' },
    { pattern: /PlayStation|PS\d|PLAYSTATION/i, value: 'PlayStation' },
    { pattern: /Nintendo|Wii|Switch/i, value: 'Nintendo' },
    { pattern: /FreeBSD|OpenBSD|NetBSD/i, value: 'BSD' },
    { pattern: /Symbian|S60|UIQ/i, value: 'Symbian' },
  ];

  const originPatterns = [
    { pattern: /Instagram/i, value: 'Instagram' },
    { pattern: /musical_ly|TikTok|BytedanceWebview/i, value: 'TikTok' },
    { pattern: /FBAN|FBAV|Facebook/i, value: 'Facebook' },
    { pattern: /WhatsApp/i, value: 'WhatsApp' },
    { pattern: /YouTubeApp|com\.google\.ios\.youtube/i, value: 'YouTube' },
    {
      pattern: /Twitter|TwitterAndroid|TwitterIPhone/i,
      value: 'Twitter/X',
    },
    { pattern: /LinkedIn/i, value: 'LinkedIn' },
    { pattern: /Pinterest/i, value: 'Pinterest' },
    { pattern: /Snapchat/i, value: 'Snapchat' },
    { pattern: /Telegram/i, value: 'Telegram' },
    { pattern: /GSA.*Mobile|GoogleApp/i, value: 'Google' },
    { pattern: /Gmail/i, value: 'Gmail' },
    { pattern: /Outlook/i, value: 'Outlook' },
    { pattern: /YouTube/i, value: 'YouTube' },
    { pattern: /Kwai/i, value: 'Kwai' },

    { pattern: /gclid|utm_source=google|googleads/i, value: 'Google Ads' },
    {
      pattern: /fbclid|utm_source=facebook|facebook\.com/i,
      value: 'Facebook Ads',
    },
    { pattern: /utm_source=instagram/i, value: 'Instagram Ads' },
    { pattern: /utm_source=tiktok|tt_medium/i, value: 'TikTok Ads' },
    { pattern: /utm_source=youtube/i, value: 'YouTube Ads' },
    { pattern: /utm_source=twitter/i, value: 'Twitter Ads' },
    { pattern: /utm_source=linkedin/i, value: 'LinkedIn Ads' },
    { pattern: /utm_source=pinterest/i, value: 'Pinterest Ads' },
    { pattern: /utm_source=snapchat/i, value: 'Snapchat Ads' },

    { pattern: /Discord/i, value: 'Discord' },
    { pattern: /Reddit/i, value: 'Reddit' },
    { pattern: /Spotify/i, value: 'Spotify' },
    { pattern: /Netflix/i, value: 'Netflix' },
    { pattern: /Twitch/i, value: 'Twitch' },
    { pattern: /Shopee|ShopeeMobile/i, value: 'Shopee' },
    { pattern: /MercadoLibre|MELI/i, value: 'Mercado Livre' },
    { pattern: /Uber|UberEats/i, value: 'Uber' },
    { pattern: /iFood/i, value: 'iFood' },
  ];

  const findMatch = (patterns, userAgent, normalizedUA) => {
    for (const { pattern, exclude = [], value } of patterns) {
      const matchesOriginal = pattern.test(userAgent);
      const matchesNormalized = pattern.test(normalizedUA);

      if (matchesOriginal || matchesNormalized) {
        const excludedOriginal = exclude.some((ex) => ex.test(userAgent));
        const excludedNormalized = exclude.some((ex) => ex.test(normalizedUA));

        if (!excludedOriginal && !excludedNormalized) {
          return value;
        }
      }
    }
    return 'unknown';
  };

  const detectedOrigin = findMatch(originPatterns, agent, normalizedAgent);

  const detectedBrowser =
    detectedOrigin !== 'unknown'
      ? 'unknown'
      : findMatch(browserPatterns, agent, normalizedAgent);

  return {
    device: findMatch(devicePatterns, agent, normalizedAgent),
    browser: detectedBrowser,
    os: findMatch(osPatterns, agent, normalizedAgent),
    origin: detectedOrigin,
  };
}

module.exports = { parseUserAgent };
