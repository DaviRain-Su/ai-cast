export const PACKAGE_ID = "0x10c32bf076865c211bec10e170e2640d08e3515a957754cfdeac890b5a7f2214";
export const NETWORK = "testnet" as const;
export const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

export const PODCAST_TYPE = `${PACKAGE_ID}::podcast::Podcast`;
export const CREATOR_TYPE = `${PACKAGE_ID}::creator::CreatorProfile`;
export const SUBSCRIPTION_TYPE = `${PACKAGE_ID}::subscription::Subscription`;

export const STYLE_LABELS: Record<string, string> = {
  deep_dive: "深度解读",
  news: "新闻资讯",
  story: "故事叙事",
  interview: "对话访谈",
};
