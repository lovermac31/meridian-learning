import "server-only";

// Paid file bodies for the preview. Server-only: imported by the
// entitlement-checked file route and nothing else, so this text is never in a
// page's HTML, the client bundle or /public.
//
// All of it is synthetic placeholder text written for the preview. The live
// store serves reviewed PDFs from a private Supabase Storage bucket instead
// (JE_MARKETPLACE_ARCHITECTURE.md §5); this table then holds only storage
// keys and checksums.

export const MAX_FILE_BYTES = 15 * 1024 * 1024;

const NOTICE =
  '<p class="synthetic">Preview placeholder: synthetic text written for this preview, not final product content.</p>';

type PaidFile = { title: string; fileName: string; html: string };

function activity(n: number, story: string, claim: string, frame: string): string {
  return `<h3>Activity ${n} of 6</h3>
<blockquote><p>${story}</p></blockquote>
<p><strong>Claim:</strong> ${claim}</p>
<p><strong>Evidence:</strong> Underline the words in the story that prove the claim.</p>
<p><strong>Say it:</strong> “${frame}”</p>
<span class="write-line"></span><span class="write-line"></span>`;
}

const ACTIVITIES = [
  activity(1, "Minh found a small wet puppy under the market stall. It was shaking. He gave it half of his bánh mì and wrapped it in his scarf.", "Minh is a caring boy.", "Minh is caring because he …"),
  activity(2, "Lan practised the drum every afternoon, even when her hands hurt. On the day of the school show she played without one mistake.", "Lan works hard.", "Lan works hard because the story says …"),
  activity(3, "The old ferryman always waited five more minutes for late passengers. One evening that wait saved a doctor who was running to the boat.", "The ferryman is patient.", "I know he is patient because …"),
  activity(4, "Bao saw that the new boy sat alone at lunch. He picked up his tray, walked over and asked about the boy's football shirt.", "Bao is friendly.", "Bao is friendly because he …"),
  activity(5, "Mai broke her mother's blue cup. She could hide the pieces, but she carried them to the kitchen and said, “I'm sorry. It was me.”", "Mai is honest.", "Mai is honest because the story says …"),
  activity(6, "When the river flooded, Grandpa Tuan opened his house on the hill to three families. He cooked rice for everyone for two days.", "Grandpa Tuan is generous.", "He is generous because …"),
].join("\n");

const PARENT_GUIDE = `<h2>Parent guide: example answers</h2>
<p>There is more than one good answer. A strong answer names an action from the story, not only a feeling.</p>
<ol>
<li>“He gave it half of his bánh mì” and “wrapped it in his scarf”.</li>
<li>“practised the drum every afternoon, even when her hands hurt”.</li>
<li>“always waited five more minutes”.</li>
<li>“walked over and asked about the boy's football shirt”.</li>
<li>“carried them to the kitchen and said, I'm sorry. It was me.”</li>
<li>“opened his house … to three families” and “cooked rice for everyone”.</li>
</ol>`;

const FILES: Record<string, PaidFile> = {
  "level-2-claim-evidence-pack": {
    title: "Claim and Evidence Activity Pack (Level 2)",
    fileName: "JE-L2-Claim-Evidence-Pack-PREVIEW.html",
    html: `${NOTICE}<h2>Claim and Evidence Activity Pack</h2><p>Level 2 · Early Reasoner · CEFR A1/A2 · Ages 7–9</p>${ACTIVITIES}<h2>Growth Portfolio page</h2><p>Copy your best “because” sentence here.</p><span class="write-line"></span><span class="write-line"></span>${PARENT_GUIDE}`,
  },
  "level-2-home-practice-bundle": {
    title: "Level 2 Early Reasoner Home Practice Bundle",
    fileName: "JE-L2-Home-Practice-Bundle-PREVIEW.html",
    html: `${NOTICE}<h2>Level 2 Home Practice Bundle</h2><p>Level 2 · Early Reasoner · CEFR A1/A2 · Ages 7–9</p>
<h3>Scope and sequence</h3>
<ol>${Array.from({ length: 9 }, (_, i) => `<li>Unit ${i + 1}: one original story, Word Fossil box, Claim and Evidence frame, 3–4 sentence response.</li>`).join("")}</ol>
<h3>Unit 1</h3>${ACTIVITIES}${PARENT_GUIDE}
<p>Units 2–9 follow the same structure in the final bundle.</p>`,
  },
};

export function paidFile(slug: string): PaidFile | undefined {
  return Object.prototype.hasOwnProperty.call(FILES, slug) ? FILES[slug] : undefined;
}
