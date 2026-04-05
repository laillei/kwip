export type EditorialTag = '지금 뜨는' | '숨겨진 명품' | '성분 주목' | '편집장 픽';

export interface Article {
  id: string;
  slug: string;
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  body: { ko: string; en: string };  // markdown
  coverImage: string;
  tag: EditorialTag;
  publishedAt: string;  // ISO date
  readTimeMinutes: number;
  productSlugs: string[];  // linked product slugs
  relatedArticleSlugs: string[];
}
