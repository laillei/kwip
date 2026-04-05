interface IngredientDiscoveryProps {
  dictionary: {
    products: {
      discovery: string;
      discoveryOverline: string;
    };
  };
}

const INGREDIENT_GROUPS = [
  {
    label: "ACTIVE",
    items: ["나이아신아마이드", "레티놀", "비타민 C", "AHA/BHA"],
  },
  {
    label: "MOISTURIZER",
    items: ["히알루론산", "세라마이드", "스쿠알란"],
  },
  {
    label: "SOOTHING",
    items: ["판테놀", "마데카소사이드", "알로에"],
  },
  {
    label: "BRIGHTENING",
    items: ["알부틴", "글루타치온", "트라넥사믹애시드"],
  },
];

export default function IngredientDiscovery({
  dictionary,
}: IngredientDiscoveryProps) {
  return (
    <section className="bg-surface-lowest px-4 py-6">
      <div className="flex flex-col gap-1 mb-6">
        <span
          className="text-[11px] font-bold uppercase tracking-[2px] text-on-surface-variant"
          style={{
            fontFamily:
              "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
          }}
        >
          {dictionary.products.discoveryOverline}
        </span>
        <h2
          className="text-[22px] font-bold text-on-surface"
          style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
        >
          {dictionary.products.discovery}
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {INGREDIENT_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <span
              className="text-[11px] font-bold uppercase tracking-[2px] text-on-surface-variant"
              style={{
                fontFamily:
                  "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif",
              }}
            >
              {group.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="bg-surface-variant text-on-surface-variant rounded-full px-2 py-0.5 text-[11px]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
