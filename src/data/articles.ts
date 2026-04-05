import type { Article } from "@/types/article";

export const mockArticles: Article[] = [
  {
    id: "article-1",
    slug: "olive-young-rising-brands-5",
    title: {
      ko: "올리브영 신생 브랜드 5가지",
      en: "5 Rising Brands at Olive Young",
    },
    description: {
      ko: "아직 대중에게 알려지지 않은, 올리브영에서 조용히 성장 중인 신생 브랜드 5곳을 소개합니다.",
      en: "Five quietly growing brands at Olive Young that haven't hit the mainstream yet.",
    },
    body: {
      ko: `올리브영 매장을 자주 방문하는 사람이라면, 최근 1층 매대에 낯선 브랜드가 하나둘 등장하고 있다는 걸 눈치챘을 것이다. 대기업 계열이 아닌, 소규모 독립 브랜드들이 빠르게 입점하고 있다.

이 브랜드들의 공통점은 명확하다. 성분 투명성, 미니멀한 패키지, 그리고 SNS 바이럴 없이도 재구매율이 높다는 점이다. Kwip이 주목한 5개 브랜드를 지금 확인해 보자.`,
      en: `If you visit Olive Young regularly, you may have noticed unfamiliar names appearing on the ground-floor shelves. Small independent brands are gaining shelf space at a surprising pace.

What they share: ingredient transparency, minimal packaging, and high repurchase rates — even without viral social media campaigns. Here are the five brands Kwip is watching now.`,
    },
    coverImage: "/images/products/round-lab-mugwort-calming-toner.webp",
    tag: "지금 뜨는",
    publishedAt: "2026-04-02",
    readTimeMinutes: 4,
    productSlugs: [
      "round-lab-mugwort-calming-toner",
      "cosrx-advanced-snail-96-mucin-power-essence",
    ],
    relatedArticleSlugs: ["hidden-gem-cleansers-3"],
  },
  {
    id: "article-2",
    slug: "hidden-gem-cleansers-3",
    title: {
      ko: "아무도 모르는 클렌저 명품 3가지",
      en: "3 Hidden Gem Cleansers Nobody Talks About",
    },
    description: {
      ko: "검색해도 잘 안 나오는, 하지만 써본 사람은 무한 재구매하는 클렌저 3종.",
      en: "Three cleansers that rarely show up in search — but users repurchase endlessly.",
    },
    body: {
      ko: `클렌징은 스킨케어의 첫 단계이자 가장 과소평가되는 단계다. 대부분의 소비자는 유명 브랜드의 클렌저를 선택하지만, 진짜 좋은 제품은 의외로 조용한 곳에 있다.

오늘 소개하는 3가지 클렌저는 성분 전문가들 사이에서만 돌던 제품이다. 공통적으로 약산성 포뮬러에 자극 없는 계면활성제를 사용하며, 세정 후에도 피부 장벽이 무너지지 않는다.`,
      en: `Cleansing is the first — and most underrated — step in skincare. Most consumers default to well-known brands, but the truly great products are often hiding in plain sight.

These three cleansers have been quietly circulating among ingredient experts. They all share a mildly acidic formula with non-irritating surfactants that leave the skin barrier intact.`,
    },
    coverImage: "/images/products/beauty-of-joseon-green-plum-refreshing-cleanser.webp",
    tag: "숨겨진 명품",
    publishedAt: "2026-03-28",
    readTimeMinutes: 3,
    productSlugs: [
      "beauty-of-joseon-green-plum-refreshing-cleanser",
    ],
    relatedArticleSlugs: ["olive-young-rising-brands-5", "key-ingredients-2026-h2"],
  },
  {
    id: "article-3",
    slug: "key-ingredients-2026-h2",
    title: {
      ko: "2026 하반기를 지배할 핵심 성분은?",
      en: "The Key Ingredients That Will Define H2 2026",
    },
    description: {
      ko: "트렌드 분석 결과, 올해 하반기 K-뷰티를 이끌 성분 3가지를 예측합니다.",
      en: "Our trend analysis predicts the three ingredients that will lead K-beauty in the second half of 2026.",
    },
    body: {
      ko: `매년 상반기가 끝나갈 무렵, 다음 시즌의 성분 트렌드가 윤곽을 드러낸다. 원료 공급사의 발주량, ODM 업체의 신규 포뮬러, 그리고 올리브영 입점 심사 리스트를 종합하면 방향이 보인다.

2026년 하반기, Kwip이 주목하는 핵심 성분은 세 가지다: 바쿠치올(레티놀 대체제), 판테놀 유도체(장벽 강화), 그리고 저분자 히알루론산 크로스폴리머(보습 지속). 각각의 근거와 추천 제품을 함께 살펴보자.`,
      en: `Every year, as the first half winds down, ingredient trends for the next season begin to take shape. Combining raw-material order volumes, ODM new formulas, and Olive Young listing reviews reveals a clear direction.

For H2 2026, Kwip is watching three key ingredients: bakuchiol (retinol alternative), panthenol derivatives (barrier reinforcement), and low-molecular crosspolymer hyaluronic acid (lasting hydration). Let's look at the evidence and recommended products.`,
    },
    coverImage: "/images/products/cosrx-advanced-snail-96-mucin-power-essence.webp",
    tag: "성분 주목",
    publishedAt: "2026-03-25",
    readTimeMinutes: 5,
    productSlugs: [
      "cosrx-advanced-snail-96-mucin-power-essence",
      "round-lab-mugwort-calming-toner",
    ],
    relatedArticleSlugs: ["olive-young-rising-brands-5"],
  },
];
