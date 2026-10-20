"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";

// Copies or shares the member's own referral code. The code is an attribution
// identifier, not a password; it is already shown on this private page.
export function CopyCodeButton({ code, shareText }: { code: string; shareText: string }) {
  const [status, setStatus] = useState("");
  const button = "inline-flex min-h-11 items-center gap-2 rounded-full border border-[#1E4D3B]/30 bg-white px-4 py-2 text-sm font-bold text-[#1E4D3B] hover:border-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={button} onClick={async () => {
        try { await navigator.clipboard.writeText(code); setStatus("Code copied."); } catch { setStatus("Copy failed; select the code instead."); }
      }}>
        <Copy aria-hidden="true" className="h-4 w-4" /> Copy code
      </button>
      <button type="button" className={button} onClick={async () => {
        try {
          if (navigator.share) { await navigator.share({ text: shareText }); setStatus(""); }
          else { await navigator.clipboard.writeText(shareText); setStatus("Message copied; paste it into Zalo or email."); }
        } catch { /* share sheet dismissed */ }
      }}>
        <Share2 aria-hidden="true" className="h-4 w-4" /> Share
      </button>
      <span role="status" aria-live="polite" className="text-sm text-[#4A5568]">{status}</span>
    </div>
  );
}
