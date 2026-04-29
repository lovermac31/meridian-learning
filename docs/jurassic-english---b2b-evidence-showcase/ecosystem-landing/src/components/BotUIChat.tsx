"use client";

import "@botui/react/default-theme";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createBot, type BotuiInterface } from "botui";
import { BotUI, BotUIAction, BotUIMessageList } from "@botui/react";
import { MessageSquareMore, Sparkles, X } from "lucide-react";
import { track as vercelTrack } from "@vercel/analytics";
import {
  getSaBotIntentResponse,
  SA_BOT_BACK_TO_MENU_LABEL,
  SA_BOT_BACK_TO_MENU_VALUE,
  SA_BOT_INTENT_OPTIONS,
  SA_BOT_INTENT_PROMPT,
  SA_BOT_WELCOME_MESSAGE,
  type SaBotIntent,
} from "@/lib/saBotConversation";
import {
  isSaBotDestinationAllowed,
  type SaBotDestination,
} from "@/lib/saBotRoutes";

type BotUIChatProps = {
  currentPathname: string;
  onNavigate: (path: string) => void;
};

const CHAT_PANEL_ID = "sa-botui-panel";

function createSaBot() {
  return createBot();
}

// Sprint 3C — telemetry now delegates to @vercel/analytics. Wrapped in a
// try/catch so a failed beacon (offline, ad-block, etc.) never blocks
// the conversation. No PII flows through this function — only event
// names + non-identifying labels (intent, destination_label,
// destination_path, route).
function sendTelemetry(
  eventName: string,
  properties?: Record<string, string | number | boolean | null>,
) {
  try {
    vercelTrack(eventName, properties);
  } catch {
    // Telemetry must never block the conversation.
  }
}

export function BotUIChat({ currentPathname, onNavigate }: BotUIChatProps) {
  const [bot, setBot] = useState<BotuiInterface>(() => createSaBot());
  const [isOpen, setIsOpen] = useState(false);
  const introStartedRef = useRef(false);
  const hasMeaningfulActionRef = useRef(false);
  const firstIntentSelectedRef = useRef(false);
  const previousPathnameRef = useRef(currentPathname);
  const shouldResetOnCloseRef = useRef(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const subtitleId = useId();

  const panelSummary = useMemo(
    () =>
      "Pathway, diagnostic, portfolio evidence, and learner support routes inside the Academy.",
    [],
  );

  const resetConversation = () => {
    introStartedRef.current = false;
    hasMeaningfulActionRef.current = false;
    firstIntentSelectedRef.current = false;
    setBot(createSaBot());
  };

  const closePanel = (trackCloseWithoutAction = true) => {
    if (trackCloseWithoutAction && !hasMeaningfulActionRef.current) {
      sendTelemetry("SA BotUI Closed Without Action", {
        route: currentPathname,
      });
    }

    shouldResetOnCloseRef.current = true;
    setIsOpen(false);
  };

  const handleRouteSelection = (label: string, path: string) => {
    if (!isSaBotDestinationAllowed(path)) {
      // Defence-in-depth: refuse to navigate to anything outside the
      // approved Student Academy destination map, even if a future edit
      // accidentally introduces one.
      return;
    }

    hasMeaningfulActionRef.current = true;
    // Sprint 3C — spec-named event with public-safe properties.
    sendTelemetry("botui_destination_clicked", {
      destination_label: label,
      destination_path: path,
    });
    onNavigate(path);
    closePanel(false);
  };

  const presentRouteChoices = async (
    currentBot: BotuiInterface,
    prompt: string,
    options: SaBotDestination[],
  ) => {
    await currentBot.message.add({ text: prompt });
    const response = await currentBot.action.set(
      {
        options: [
          ...options.map((option) => ({
            label: option.label,
            value: option.path,
          })),
          {
            label: SA_BOT_BACK_TO_MENU_LABEL,
            value: SA_BOT_BACK_TO_MENU_VALUE,
          },
        ],
      },
      { actionType: "selectButtons" },
    );

    const selectedValue = response?.selected?.value;

    if (selectedValue === SA_BOT_BACK_TO_MENU_VALUE) {
      await showIntentMenu(currentBot);
      return;
    }

    const selectedRoute = options.find(
      (option) => option.path === selectedValue,
    );

    if (!selectedRoute) {
      await currentBot.message.add({
        text: "I can keep guiding you through the Academy whenever you are ready.",
      });
      return;
    }

    handleRouteSelection(selectedRoute.label, selectedRoute.path);
  };

  const showIntentMenu = async (currentBot: BotuiInterface) => {
    const response = await currentBot.action.set(
      { options: SA_BOT_INTENT_OPTIONS },
      { actionType: "selectButtons" },
    );

    const selectedIntent = response?.selected?.value as
      | SaBotIntent
      | undefined;

    if (!selectedIntent) {
      return;
    }

    hasMeaningfulActionRef.current = true;

    if (!firstIntentSelectedRef.current) {
      firstIntentSelectedRef.current = true;
      sendTelemetry("SA BotUI First Intent Selected", {
        route: currentPathname,
        intent: selectedIntent,
      });
    }

    const { message, subMenu } = getSaBotIntentResponse(selectedIntent);
    await currentBot.message.add({ text: message });
    await presentRouteChoices(currentBot, subMenu.prompt, subMenu.destinations);
  };

  const startConversation = async (currentBot: BotuiInterface) => {
    await currentBot.wait({ waitTime: 220 });
    await currentBot.message.add({ text: SA_BOT_WELCOME_MESSAGE });
    await currentBot.message.add({ text: SA_BOT_INTENT_PROMPT });
    await showIntentMenu(currentBot);
  };

  useEffect(() => {
    if (!isOpen || introStartedRef.current) {
      return;
    }

    introStartedRef.current = true;
    void startConversation(bot);
  }, [bot, isOpen]);

  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement as HTMLElement | null;
      window.requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
      // Lock body scroll while the panel is open so screen-reader users
      // and keyboard users do not lose their place behind the dialog.
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    if (shouldResetOnCloseRef.current) {
      resetConversation();
      shouldResetOnCloseRef.current = false;
    }

    openerRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      previousPathnameRef.current = currentPathname;
      return;
    }

    if (previousPathnameRef.current !== currentPathname) {
      shouldResetOnCloseRef.current = true;
      setIsOpen(false);
    }

    previousPathnameRef.current = currentPathname;
  }, [currentPathname, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (launcherRef.current?.contains(target)) return;
      closePanel();
    };

    // Defer the mousedown listener to the next macrotask so the same
    // click that opened the panel cannot accidentally close it. Without
    // this, any synthesized mousedown that arrives in the same tick as
    // the launcher click is treated as a "click outside" by the listener.
    // setTimeout(0) is used (instead of requestAnimationFrame) because
    // rAF callbacks can be throttled or skipped entirely when the tab is
    // not the active foreground tab — making the click-outside handler
    // silently inert in headless / background test environments.
    const timeoutId = window.setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, currentPathname]);

  return (
    <div className="je-botui-shell pointer-events-none fixed inset-x-4 bottom-28 z-[70] sm:inset-x-auto sm:right-6 lg:bottom-6">
      {isOpen ? (
        <section
          id={CHAT_PANEL_ID}
          ref={panelRef}
          role="dialog"
          aria-labelledby={headingId}
          aria-describedby={subtitleId}
          aria-modal="true"
          className="pointer-events-auto ml-auto mb-3 w-full max-w-[26rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-[#121b26] to-primary shadow-[0_30px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-jurassic-accent/40 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-jurassic-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  Academy Guide
                </div>
                <h2
                  id={headingId}
                  className="text-lg font-semibold tracking-tight text-white"
                >
                  Student Academy Assistant
                </h2>
                <p
                  id={subtitleId}
                  className="mt-1 text-sm leading-relaxed text-white/60"
                >
                  {panelSummary}
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => closePanel()}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                aria-label="Close the Student Academy assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="je-botui-frame h-[28rem] max-h-[70vh]">
            <BotUI bot={bot}>
              <BotUIMessageList />
              <BotUIAction />
            </BotUI>
          </div>
        </section>
      ) : null}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => {
          // Sprint 3C — spec-named open event.
          sendTelemetry("botui_opened");
          setIsOpen(true);
        }}
        aria-expanded={isOpen}
        aria-controls={CHAT_PANEL_ID}
        aria-haspopup="dialog"
        // Sprint 3C — aria-label removed. The visible text spans inside
        // the button now serve as the accessible name, satisfying
        // WCAG 2.5.3 "Label in Name" (Lighthouse
        // label-content-name-mismatch). aria-haspopup="dialog" + the
        // visible "How can I help you today?" copy provide enough
        // semantics for screen-reader users.
        className="pointer-events-auto ml-auto inline-flex items-center gap-3 rounded-full border border-jurassic-accent/40 bg-primary/95 px-4 py-3 text-left text-primary-foreground shadow-[0_18px_45px_rgba(0,0,0,0.38)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-jurassic-accent/60 hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-jurassic-accent text-white shadow-[0_12px_24px_rgba(242,100,25,0.25)]">
          <MessageSquareMore className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-tight">
            How can I help you today?
          </span>
          <span className="block text-xs leading-relaxed text-primary-foreground/60">
            Pathway, diagnostic, evidence, or learner support
          </span>
        </span>
      </button>
    </div>
  );
}

export default BotUIChat;
