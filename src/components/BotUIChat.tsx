import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { createBot, type BotuiInterface } from 'botui';
import { BotUI, BotUIAction, BotUIMessageList } from '@botui/react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageSquareMore, Sparkles, X } from 'lucide-react';
import {
  getBotUIPublicDestination,
  type BotUIPublicDestinationKey,
} from '../lib/botUiRoutes';

type BotUIChatProps = {
  currentPathname: string;
  onNavigate: (path: string) => void;
};

type BotIntent =
  | 'school'
  | 'methodology'
  | 'parent'
  | 'training'
  | 'contact';

const CHAT_PANEL_ID = 'je-botui-panel';

const INTENT_OPTIONS: Array<{ label: string; value: BotIntent }> = [
  { label: 'I represent a school or training centre', value: 'school' },
  { label: 'I want to understand the curriculum methodology', value: 'methodology' },
  { label: 'I\'m exploring for my child', value: 'parent' },
  { label: 'I want to understand teacher training', value: 'training' },
  { label: 'I want to speak with someone', value: 'contact' },
];


function createPilotBot() {
  return createBot();
}

function sendTelemetry(eventName: string, properties?: Record<string, string | number | boolean | null>) {
  try {
    track(eventName, properties);
  } catch {
    // Keep telemetry non-blocking for the pilot.
  }
}

export function BotUIChat({ currentPathname, onNavigate }: BotUIChatProps) {
  const [bot, setBot] = useState<BotuiInterface>(() => createPilotBot());
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
    () => 'Curriculum, methodology, institutional services, the series, and contact routes.',
    [],
  );

  const resetConversation = () => {
    introStartedRef.current = false;
    hasMeaningfulActionRef.current = false;
    firstIntentSelectedRef.current = false;
    setBot(createPilotBot());
  };

  const closePanel = (trackCloseWithoutAction = true) => {
    if (trackCloseWithoutAction && !hasMeaningfulActionRef.current) {
      sendTelemetry('BotUI Closed Without Action', {
        route: currentPathname,
      });
    }

    shouldResetOnCloseRef.current = true;
    setIsOpen(false);
  };

  const handleRouteSelection = (label: string, path: string) => {
    hasMeaningfulActionRef.current = true;
    sendTelemetry('BotUI Route Clicked', {
      route: currentPathname,
      target_label: label,
      target_path: path,
    });
    onNavigate(path);
    closePanel(false);
  };

  const presentRouteChoices = async (
    currentBot: BotuiInterface,
    prompt: string,
    options: Array<{ label: string; path: string }>,
  ) => {
    await currentBot.message.add({ text: prompt });
    const response = await currentBot.action.set(
      {
        options: [
          ...options.map((option) => ({ label: option.label, value: option.path })),
          { label: 'Back to the menu', value: '__menu' },
        ],
      },
      { actionType: 'selectButtons' },
    );

    const selectedValue = response?.selected?.value;

    if (selectedValue === '__menu') {
      await showIntentMenu(currentBot);
      return;
    }

    const selectedRoute = options.find((option) => option.path === selectedValue);

    if (!selectedRoute) {
      await currentBot.message.add({
        text: 'I can keep guiding you through the public site whenever you are ready.',
      });
      return;
    }

    handleRouteSelection(selectedRoute.label, selectedRoute.path);
  };

  const showIntentMenu = async (currentBot: BotuiInterface) => {
    const response = await currentBot.action.set(
      { options: INTENT_OPTIONS },
      { actionType: 'selectButtons' },
    );

    const selectedIntent = response?.selected?.value as BotIntent | undefined;

    if (!selectedIntent) {
      return;
    }

    hasMeaningfulActionRef.current = true;

    if (!firstIntentSelectedRef.current) {
      firstIntentSelectedRef.current = true;
      sendTelemetry('BotUI First Intent Selected', {
        route: currentPathname,
        intent: selectedIntent,
      });
    }

    if (selectedIntent === 'school') {
      await currentBot.message.add({
        text: 'WorldWise Learning and Jurassic English™ work with schools and training centres that need structured, standards-aligned curriculum with measurable outcomes.',
      });
      await presentRouteChoices(
        currentBot,
        'What best describes your current priority?',
        [
          getBotUIPublicDestination('auditSprint'),
          getBotUIPublicDestination('discovery'),
          getBotUIPublicDestination('curriculumOverview'),
        ],
      );
      return;
    }

    if (selectedIntent === 'methodology') {
      await currentBot.message.add({
        text: 'The Jurassic Thinking Cycle™ is the core instructional architecture — four stages moving students from text comprehension to moral evaluation to evidence-based argument.',
      });
      await presentRouteChoices(
        currentBot,
        'Choose where to go next.',
        [
          getBotUIPublicDestination('methodology'),
          getBotUIPublicDestination('cefrAlignment'),
          getBotUIPublicDestination('teacherStandards'),
          getBotUIPublicDestination('thinkingCycleCompare'),
        ],
      );
      return;
    }

    if (selectedIntent === 'parent') {
      await currentBot.message.add({
        text: 'Jurassic English™ uses authentic literature to develop genuine reasoning skills alongside English fluency — structured progression from pre-A1 through C1.',
      });
      await presentRouteChoices(
        currentBot,
        'Where would you like to start?',
        [
          getBotUIPublicDestination('seriesCompare'),
          getBotUIPublicDestination('thinkingCycleAnalyze'),
          getBotUIPublicDestination('getStarted'),
          getBotUIPublicDestination('curriculumOverview'),
        ],
      );
      return;
    }

    if (selectedIntent === 'training') {
      await currentBot.message.add({
        text: 'Teacher development is central to the framework. Jurassic English™ teachers are prepared in the Thinking Cycle, regulation-before-reasoning, and methodology fidelity — not just curriculum delivery.',
      });
      await presentRouteChoices(
        currentBot,
        'Choose the route that fits your next step.',
        [
          getBotUIPublicDestination('teacherStandards'),
          getBotUIPublicDestination('trainingGetStarted'),
          getBotUIPublicDestination('discovery'),
        ],
      );
      return;
    }

    await currentBot.message.add({
      text: 'We can route your enquiry to the right pathway. Choose the option that best matches where you are in your decision process.',
    });
    await presentRouteChoices(
      currentBot,
      'Choose how you would like to connect.',
      [
        getBotUIPublicDestination('discovery'),
        getBotUIPublicDestination('auditSprint'),
        getBotUIPublicDestination('curriculumOverview'),
      ],
    );
  };

  const startConversation = async (currentBot: BotuiInterface) => {
    await currentBot.wait({ waitTime: 220 });
    await currentBot.message.add({
      text: 'Hello. I can help you navigate Jurassic English™ and WorldWise Learning.',
    });
    await currentBot.message.add({
      text: 'Select the option that best describes what brings you here.',
    });
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
      return;
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
      if (event.key === 'Escape') {
        event.preventDefault();
        closePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPathname]);

  return (
    <div className="je-botui-shell pointer-events-none fixed inset-x-4 bottom-4 z-[70] sm:inset-x-auto sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {isOpen ? (
          <motion.section
            id={CHAT_PANEL_ID}
            ref={panelRef}
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-labelledby={headingId}
            aria-describedby={subtitleId}
            className="pointer-events-auto ml-auto mb-3 w-full max-w-[26rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-[#121b26] to-jurassic-dark shadow-[0_30px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <div className="border-b border-white/8 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#8e7448]/40 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-jurassic-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                    Public Assistant
                  </div>
                  <h2 id={headingId} className="text-lg font-semibold tracking-tight text-white">
                    Jurassic English Guide
                  </h2>
                  <p id={subtitleId} className="mt-1 text-sm leading-relaxed text-white/60">
                    {panelSummary}
                  </p>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => closePanel()}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
                  aria-label="Close the Jurassic English assistant"
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
          </motion.section>
        ) : null}
      </AnimatePresence>

      <button
        ref={launcherRef}
        type="button"
        onClick={() => {
          sendTelemetry('BotUI Launcher Open', { route: currentPathname });
          setIsOpen(true);
        }}
        aria-expanded={isOpen}
        aria-controls={CHAT_PANEL_ID}
        aria-haspopup="dialog"
        aria-label="Open the Jurassic English assistant"
        className="pointer-events-auto ml-auto inline-flex items-center gap-3 rounded-full border border-[#8e7448]/40 bg-jurassic-dark/95 px-4 py-3 text-left text-white shadow-[0_18px_45px_rgba(0,0,0,0.38)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-jurassic-accent/60 hover:bg-jurassic-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-jurassic-accent text-white shadow-[0_12px_24px_rgba(242,100,25,0.25)]">
          <MessageSquareMore className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-tight">How can I help you today?</span>
          <span className="block text-xs leading-relaxed text-white/60">Curriculum, methodology, schools, or contact</span>
        </span>
      </button>
    </div>
  );
}
