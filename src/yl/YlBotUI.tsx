/**
 * YlBotUI — parent-admissions guide for /young-learners-speaking/.
 *
 * Behaviour:
 *  - Floating bubble bottom-right. Click to open a chat-style panel.
 *  - Chip-based flow only (no free-text input) to make PII collection
 *    structurally impossible. The bot does not ask for the child's
 *    name, age, school, phone, or email.
 *  - Each chip routes to a real on-page anchor (#method, #journey,
 *    #pricing, #book) via smooth scroll, OR opens a mailto: link.
 *  - The free-evaluation form is reached via #book (which contains the
 *    Google Apps Script form CTA, Zalo QR, and email CTA already on the page).
 *  - Emits Vercel Analytics custom events for opens, closes, and chip clicks.
 *    No PII in event payloads.
 *
 * Trilingual (P1): all copy comes from src/yl/i18n.ts and follows the same
 * resolved language as the page (URL ?lang= → localStorage → en). Switching
 * language re-renders the bot and resets the short conversation to a localized
 * greeting. Analytics event payloads stay in English keys (chip.key etc.).
 *
 * Styling: all inline styles + a single scoped <style> tag for keyframes.
 * No Tailwind, no CSS modules. Keeps the YL bundle's CSS surface zero so it
 * cannot interfere with the page's hand-written dark theme.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { getLang, subscribeLang, t, type Lang } from './i18n';

type ChipKey = 'programme' | 'journey' | 'pricing' | 'book' | 'email';
type Anchor = 'method' | 'journey' | 'pricing' | 'book';

interface ChipDef {
  key: ChipKey;
  /** Optional on-page anchor to scroll to. */
  anchor?: Anchor;
  /** Optional mailto: URL. */
  mailto?: string;
  /** Optional second-CTA chip rendered alongside the primary CTA. */
  secondaryCta?: { mailto?: string; anchor?: 'book' };
}

/**
 * Structural chip definitions only — display labels and replies are resolved
 * from the i18n dictionary at render time so they follow the active language.
 */
const CHIP_DEFS: ChipDef[] = [
  { key: 'programme', anchor: 'method' },
  { key: 'journey', anchor: 'journey' },
  { key: 'pricing', anchor: 'pricing' },
  {
    key: 'book',
    anchor: 'book',
    secondaryCta: {
      mailto:
        'mailto:info@jurassicenglish.com?subject=Free%20Young%20Learner%20Speaking%20Evaluation',
    },
  },
  {
    key: 'email',
    mailto:
      'mailto:info@jurassicenglish.com?subject=Question%20about%20IELTS%20Speaking%20for%20my%20child',
  },
];

const PALETTE = {
  panelBg: '#1a1d22',
  panelBorder: '#3a3f47',
  botBubble: '#23272e',
  parentTextOnDark: '#f2efe8',
  accent: '#ff8a3c', // orange CTA
  accentText: '#15181d',
  gold: '#f1c247',
  muted: '#9aa1a9',
  link: '#ffd089',
};

interface BotEvent {
  who: 'bot' | 'user';
  text: string;
  /** Optional CTA buttons rendered under a bot message. */
  ctas?: Array<{
    label: string;
    onClick: () => void;
    kind?: 'primary' | 'secondary';
  }>;
}

/** Subscribe a component to the shared YL language state. */
function useLang(): Lang {
  const [lang, setLangState] = useState<Lang>(() => getLang());
  useEffect(() => subscribeLang(setLangState), []);
  return lang;
}

/** Fire-and-forget Vercel Analytics custom event. Never throws if `va` is absent. */
function track(name: string, data?: Record<string, string>) {
  try {
    const w = window as unknown as {
      va?: (cmd: string, payload: { name: string; data?: Record<string, string> }) => void;
    };
    w.va?.('event', { name, data });
  } catch {
    /* analytics is non-essential — never crash the UI */
  }
}

function scrollToAnchor(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (history.replaceState) {
    history.replaceState(null, '', `#${id}`);
  }
}

export function YlBotUI() {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<BotEvent[]>(() => [
    { who: 'bot', text: t('botui.greeting', getLang()) },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelTitleId = useId();
  const didInit = useRef(false);

  // Auto-scroll the conversation to the latest message.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [events, open]);

  // Esc closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        track('yl_botui_close', { via: 'escape' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // When the language changes, reset the short conversation to a localized greeting.
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      return;
    }
    setEvents([{ who: 'bot', text: t('botui.greeting', lang) }]);
  }, [lang]);

  function appendBotReply(chip: ChipDef) {
    const ctas: NonNullable<BotEvent['ctas']> = [];
    if (chip.anchor) {
      const anchorName = t(`botui.anchor.${chip.anchor}`, lang);
      ctas.push({
        label: t('botui.cta.jumpTo', lang).replace('{x}', anchorName),
        kind: 'primary',
        onClick: () => {
          track('yl_botui_anchor_jump', { anchor: chip.anchor! });
          scrollToAnchor(chip.anchor!);
          setOpen(false);
        },
      });
    }
    if (chip.mailto) {
      ctas.push({
        label: chip.key === 'email' ? t('botui.cta.openEmail', lang) : t('botui.cta.emailToBook', lang),
        kind: chip.anchor ? 'secondary' : 'primary',
        onClick: () => {
          track('yl_botui_mailto', { from: chip.key });
          window.location.href = chip.mailto!;
        },
      });
    }
    if (chip.secondaryCta) {
      ctas.push({
        label: t('botui.cta.emailToBook', lang),
        kind: 'secondary',
        onClick: () => {
          if (chip.secondaryCta!.mailto) {
            track('yl_botui_mailto', { from: chip.key });
            window.location.href = chip.secondaryCta!.mailto;
          } else if (chip.secondaryCta!.anchor) {
            track('yl_botui_anchor_jump', { anchor: chip.secondaryCta!.anchor });
            scrollToAnchor(chip.secondaryCta!.anchor);
            setOpen(false);
          }
        },
      });
    }
    setEvents((prev) => [
      ...prev,
      { who: 'user', text: t(`botui.chip.${chip.key}.label`, lang) },
      { who: 'bot', text: t(`botui.chip.${chip.key}.reply`, lang), ctas },
    ]);
  }

  function handleChip(chip: ChipDef) {
    track('yl_botui_chip_click', { chip: chip.key });
    appendBotReply(chip);
  }

  function handleReset() {
    track('yl_botui_reset');
    setEvents([{ who: 'bot', text: t('botui.resetMsg', lang) }]);
  }

  return (
    <>
      <style>{`
        @keyframes yl-bot-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes yl-bot-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,138,60,0.5); }
          50%     { box-shadow: 0 0 0 10px rgba(255,138,60,0); }
        }
        .yl-bot-bubble:hover { transform: translateY(-2px); }
        .yl-bot-bubble:focus-visible,
        .yl-bot-chip:focus-visible,
        .yl-bot-cta:focus-visible {
          outline: 2px solid ${PALETTE.gold};
          outline-offset: 2px;
        }
      `}</style>

      {/* Floating bubble (always rendered; panel toggles open) */}
      {!open && (
        <button
          type="button"
          aria-label={t('botui.bubbleAria', lang)}
          className="yl-bot-bubble"
          onClick={() => {
            setOpen(true);
            track('yl_botui_open');
          }}
          style={{
            position: 'fixed',
            right: 'max(16px, env(safe-area-inset-right))',
            bottom: 'max(16px, env(safe-area-inset-bottom))',
            zIndex: 2147483000,
            width: 60,
            height: 60,
            borderRadius: 999,
            border: 'none',
            background: PALETTE.accent,
            color: PALETTE.accentText,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2)',
            transition: 'transform 160ms ease',
            animation: 'yl-bot-pulse 2.6s ease-out infinite',
            font: '600 28px/1 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <span aria-hidden="true">💬</span>
          <span
            style={{
              position: 'absolute',
              bottom: 64,
              right: 0,
              background: '#15181d',
              color: PALETTE.parentTextOnDark,
              fontSize: 12,
              padding: '6px 10px',
              borderRadius: 8,
              whiteSpace: 'nowrap',
              boxShadow: '0 6px 14px rgba(0,0,0,0.3)',
              border: `1px solid ${PALETTE.panelBorder}`,
              fontWeight: 500,
            }}
          >
            {t('botui.bubbleTooltip', lang)}
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby={panelTitleId}
          lang={lang === 'zh-CN' ? 'zh-Hans' : lang}
          style={{
            position: 'fixed',
            right: 'max(16px, env(safe-area-inset-right))',
            bottom: 'max(16px, env(safe-area-inset-bottom))',
            zIndex: 2147483000,
            width: 'min(380px, calc(100vw - 24px))',
            height: 'min(560px, calc(100vh - 80px))',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            background: PALETTE.panelBg,
            color: PALETTE.parentTextOnDark,
            border: `1px solid ${PALETTE.panelBorder}`,
            borderRadius: 16,
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            animation: 'yl-bot-fade-in 180ms ease-out',
            font: '14px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderBottom: `1px solid ${PALETTE.panelBorder}`,
              background: '#15181d',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: PALETTE.accent,
                color: PALETTE.accentText,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              JE
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                id={panelTitleId}
                style={{ fontWeight: 600, fontSize: 14, color: PALETTE.parentTextOnDark }}
              >
                {t('botui.headerTitle', lang)}
              </div>
              <div style={{ fontSize: 11, color: PALETTE.muted, marginTop: 2 }}>
                {t('botui.headerSubtitle', lang)}
              </div>
            </div>
            <button
              type="button"
              aria-label={t('botui.closeAria', lang)}
              onClick={() => {
                setOpen(false);
                track('yl_botui_close', { via: 'button' });
              }}
              style={{
                background: 'transparent',
                color: PALETTE.muted,
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                fontSize: 20,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Conversation */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px 14px 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {events.map((ev, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: ev.who === 'bot' ? 'flex-start' : 'flex-end',
                }}
              >
                <div
                  style={{
                    background: ev.who === 'bot' ? PALETTE.botBubble : PALETTE.accent,
                    color: ev.who === 'bot' ? PALETTE.parentTextOnDark : PALETTE.accentText,
                    padding: '9px 12px',
                    borderRadius: 14,
                    borderTopLeftRadius: ev.who === 'bot' ? 4 : 14,
                    borderTopRightRadius: ev.who === 'user' ? 4 : 14,
                    maxWidth: '88%',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    fontWeight: ev.who === 'user' ? 600 : 400,
                  }}
                >
                  {ev.text}
                </div>
                {ev.ctas && ev.ctas.length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      maxWidth: '88%',
                    }}
                  >
                    {ev.ctas.map((cta, j) => (
                      <button
                        key={j}
                        type="button"
                        className="yl-bot-cta"
                        onClick={cta.onClick}
                        style={{
                          background: cta.kind === 'primary' ? PALETTE.accent : 'transparent',
                          color: cta.kind === 'primary' ? PALETTE.accentText : PALETTE.link,
                          border:
                            cta.kind === 'primary' ? 'none' : `1px solid ${PALETTE.panelBorder}`,
                          padding: '7px 11px',
                          borderRadius: 999,
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {cta.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chips row + privacy footer */}
          <div
            style={{
              borderTop: `1px solid ${PALETTE.panelBorder}`,
              background: '#15181d',
              padding: '10px 12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 8,
              }}
            >
              {CHIP_DEFS.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="yl-bot-chip"
                  onClick={() => handleChip(chip)}
                  style={{
                    background: PALETTE.botBubble,
                    color: PALETTE.parentTextOnDark,
                    border: `1px solid ${PALETTE.panelBorder}`,
                    padding: '6px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    lineHeight: 1.3,
                  }}
                >
                  {t(`botui.chip.${chip.key}.label`, lang)}
                </button>
              ))}
              {events.length > 1 && (
                <button
                  type="button"
                  className="yl-bot-chip"
                  onClick={handleReset}
                  style={{
                    background: 'transparent',
                    color: PALETTE.muted,
                    border: `1px dashed ${PALETTE.panelBorder}`,
                    padding: '6px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {t('botui.startOver', lang)}
                </button>
              )}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: PALETTE.muted,
                lineHeight: 1.4,
              }}
            >
              {t('botui.privacyNote', lang)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
