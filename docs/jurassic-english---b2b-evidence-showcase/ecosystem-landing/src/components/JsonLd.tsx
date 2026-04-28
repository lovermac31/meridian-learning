// Tiny server-renderable JSON-LD wrapper. Stringifies the supplied object
// and emits a single <script type="application/ld+json"> element.
//
// Sprint 3A — keep it conservative: any caller is responsible for only
// passing public-safe facts (no aggregateRating, review, offer, price, or
// guarantee fields per spec). The component performs no validation;
// review the call sites if you change the schema shape.

type JsonLdData = Record<string, unknown> | Array<Record<string, unknown>>;

export function JsonLd({ data, id }: { data: JsonLdData; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // Minified for size. The data is fully author-controlled — no user
      // input is ever passed through here, so dangerouslySetInnerHTML is
      // safe in this controlled context. Replacing < with <
      // protects against any accidental embedding of HTML tokens in a
      // future copy edit.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default JsonLd;
