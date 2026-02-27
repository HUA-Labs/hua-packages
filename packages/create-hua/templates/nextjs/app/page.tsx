'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@hua-labs/hua/i18n';
import {
  useFadeIn,
  useSlideUp,
  useScaleIn,
  useBounceIn,
  useScrollReveal,
  useScrollProgress,
  useHoverMotion,
  useMouse,
} from '@hua-labs/hua/motion';
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Button, Progress, Switch, CodeBlock,
} from '@hua-labs/hua/ui';
import { LanguageToggle } from '@/components/LanguageToggle';
import Image from 'next/image';

/* ── External link icon ── */
function ExternalIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/* ── Animated counter ── */
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

/* ── Typed CLI ── */
function TypedCLI() {
  const [text, setText] = useState('');
  const [typed, setTyped] = useState(false);
  const [copied, setCopied] = useState(false);
  const full = 'npx create-hua@latest my-app';
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let i = 0;
          const interval = setInterval(() => {
            setText(full.slice(0, ++i));
            if (i >= full.length) { clearInterval(interval); setTyped(true); }
          }, 50);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div ref={ref} className="inline-flex items-center gap-3 glass rounded-xl px-6 py-4 font-mono text-sm">
      <span className="text-primary select-none">$</span>
      <span className="flex-1 text-left">{text}{!typed && <span className="animate-pulse text-primary">|</span>}</span>
      <button
        onClick={handleCopy}
        className={`transition-all duration-300 p-1.5 rounded-md hover:bg-white/10 ${typed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="Copy command"
      >
        {copied ? (
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-4 h-4 text-muted-foreground hover:text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
        )}
      </button>
    </div>
  );
}

/* ── Stat counter ── */
function StatCard({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const motion = useScaleIn({ duration: 500, delay });
  const counter = useCounter(value, 1800);

  return (
    <div ref={(el) => {
      if (el) {
        (motion.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        (counter.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
    }} style={motion.style} className="text-center group">
      <div className="text-4xl sm:text-5xl font-bold gradient-text tabular-nums">
        {counter.count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-2 group-hover:text-foreground transition-colors">{label}</div>
    </div>
  );
}

/* ── Interactive Switch row ── */
function SwitchDemo() {
  const [states, setStates] = useState([true, false, true]);
  const labels = ['Dark mode', 'Analytics', 'Notifications'];
  return (
    <div className="space-y-3">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Switch
            checked={states[i]}
            onChange={(e) => {
              const next = [...states];
              next[i] = e.target.checked;
              setStates(next);
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Interactive Progress demo — Build Pipeline ── */
const PIPELINE = [
  { label: 'Compile',  variant: 'default' as const },
  { label: 'Lint',     variant: 'info'    as const },
  { label: 'Test',     variant: 'warning' as const },
  { label: 'Deploy',   variant: 'success' as const },
];

function ProgressDemo() {
  const [values, setValues] = useState<number[]>([0, 0, 0, 0]);
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let rafId: number;
    let start: number | null = null;
    const perStage = 1200;
    const total = perStage * PIPELINE.length;

    function tick(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;

      if (elapsed >= total) {
        setValues([100, 100, 100, 100]);
        setActive(PIPELINE.length);
        setDone(true);
        // pause, then restart
        const timer = setTimeout(() => {
          setValues([0, 0, 0, 0]);
          setActive(0);
          setDone(false);
          start = null;
          rafId = requestAnimationFrame(tick);
        }, 2500);
        return () => clearTimeout(timer);
      }

      const stage = Math.min(Math.floor(elapsed / perStage), PIPELINE.length - 1);
      const p = (elapsed - stage * perStage) / perStage;
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic

      setActive(stage);
      setValues(prev => {
        const next = [...prev];
        for (let i = 0; i < stage; i++) next[i] = 100;
        next[stage] = Math.round(eased * 100);
        return next;
      });

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="space-y-3">
      {PIPELINE.map((s, i) => (
        <div key={s.label} className={`transition-opacity duration-300 ${i > active && !done ? 'opacity-70' : 'opacity-100'}`}>
          <div className="flex justify-between text-xs mb-1">
            <span className={i === active && !done ? 'text-primary font-medium' : 'text-muted-foreground'}>
              {s.label}
              {values[i] === 100 && <span className="ml-1 text-emerald-400">done</span>}
              {i === active && !done && <span className="ml-1 animate-pulse">...</span>}
            </span>
            <span className="font-mono text-primary tabular-nums">{values[i]}%</span>
          </div>
          <Progress value={values[i]} variant={values[i] === 100 ? 'success' : s.variant} size="sm" />
        </div>
      ))}
      <div className={`text-center text-xs text-emerald-400 font-medium pt-1 transition-opacity duration-500 ${done ? 'opacity-100' : 'opacity-0'}`}>
        Pipeline complete
      </div>
    </div>
  );
}

/* ── Custom Tabs ── */
function CustomTabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0].id);

  return (
    <div>
      <div className="flex border-b border-border/40 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              active === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find(t => t.id === active)?.content}
    </div>
  );
}

/* ── Sample code for CodeBlock ── */
const SAMPLE_CODE = `import { useTranslation } from '@hua-labs/hua/i18n'
import { useFadeIn } from '@hua-labs/hua/motion'
import { Card, Button, CodeBlock } from '@hua-labs/hua/ui'

export default function Page() {
  const { t } = useTranslation()
  const fade = useFadeIn()

  return (
    <Card ref={fade.ref} style={fade.style}>
      <h1>{t('common:title')}</h1>
      <Button>Get Started</Button>
    </Card>
  )
}`;

export default function HomePage() {
  const { t } = useTranslation();
  const scrollProgress = useScrollProgress();
  const mouse = useMouse();

  const heroFade = useFadeIn({ duration: 800 });
  const heroSlide = useSlideUp({ duration: 600, delay: 200 });
  const ctaMotion = useBounceIn({ duration: 700, delay: 400 });
  const bentoReveal = useScrollReveal({ threshold: 0.1 });
  const featuresReveal = useScrollReveal({ threshold: 0.1 });
  const cliReveal = useScrollReveal({ threshold: 0.2 });
  const linksReveal = useScrollReveal({ threshold: 0.1 });

  const features = [
    { key: 'design', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> },
    { key: 'i18n', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
    { key: 'motion', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
    { key: 'workflow', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg> },
  ];

  // Parallax offsets
  const pSlow = scrollProgress.progress * -30;
  const pFast = scrollProgress.progress * -80;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" ref={mouse.ref as React.RefObject<HTMLDivElement>}>
      {/* ── Global background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb orb-1 parallax-slow" style={{ transform: `translateY(${pSlow}px)` }} />
        <div className="orb orb-2 parallax-fast" style={{ transform: `translateY(${pFast * 0.5}px)` }} />
        <div className="orb orb-3 parallax-slow" style={{ transform: `translateY(${pSlow * 0.8}px)` }} />
        <div className="orb orb-4 parallax-fast" style={{ transform: `translateY(${pFast * 0.3}px)` }} />
        <div className="orb orb-5 parallax-slow" style={{ transform: `translateY(${pSlow * 1.2}px)` }} />
      </div>

      {/* ── Scroll progress bar ── */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-border/20">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/50 transition-[width] duration-100"
          style={{ width: `${scrollProgress.progress * 100}%` }}
        />
      </div>

      {/* ── Nav (glass) ── */}
      <nav className="fixed top-0.5 left-0 right-0 z-50 glass border-b-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="HUA" width={22} height={22} />
            <span className="font-bold text-sm tracking-tight">HUA</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://docs.hua-labs.com" target="_blank" rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:flex items-center gap-1">
              Docs <ExternalIcon />
            </a>
            <LanguageToggle />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute inset-0 mesh-gradient" />

        <div className="relative max-w-3xl mx-auto text-center z-10">
          <div ref={heroFade.ref} style={heroFade.style}>
            <Badge variant="outline" className="mb-8 px-4 py-1.5 text-sm border-primary/40 text-primary shimmer">
              {t('common:welcome.hero.eyebrow')}
            </Badge>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="gradient-text">HUA</span>
              {t('common:welcome.hero.title', { projectName: '' })}
            </h1>
          </div>

          <div ref={heroSlide.ref} style={heroSlide.style}>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              {t('common:welcome.hero.description')}
            </p>
          </div>

          <div ref={ctaMotion.ref} style={ctaMotion.style} className="flex items-center justify-center gap-4 flex-wrap mb-12">
            <a href="https://docs.hua-labs.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="px-8 gap-2 shadow-lg shadow-primary/20">
                {t('common:welcome.hero.primaryCta')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Button>
            </a>
            <a href="https://github.com/HUA-Labs/HUA-Labs-public" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="px-8 gap-2 glass">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </a>
          </div>

          <TypedCLI />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-10">
          <StatCard value={120} suffix="+" label={t('common:welcome.stats.components.label')} delay={0} />
          <StatCard value={70} suffix="+" label={t('common:welcome.stats.locales.label')} delay={80} />
          <StatCard value={40} suffix="+" label={t('common:welcome.stats.motion.label')} delay={160} />
          <StatCard value={3} suffix="" label={t('common:welcome.stats.ai.label')} delay={240} />
        </div>
      </section>

      {/* ── Bento Grid — Component Showcase ── */}
      <section className="py-24 px-6 relative z-10">
        <div className="absolute inset-0 mesh-gradient" />
        <div ref={bentoReveal.ref} style={bentoReveal.style} className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              {t('common:welcome.features.title')}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('common:welcome.features.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Cell 1: Button variants */}
            <div className="bento-cell rounded-xl p-6">
              <div className="text-xs font-mono text-muted-foreground mb-4">{'<Button />'}</div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">Outline</Button>
                  <Button variant="destructive" size="sm">Destructive</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm">Ghost</Button>
                  <Button variant="link" size="sm">Link</Button>
                </div>
              </div>
            </div>

            {/* Cell 2: CodeBlock — spans 2 cols */}
            <div className="bento-cell rounded-xl p-6 lg:col-span-2">
              <div className="text-xs font-mono text-muted-foreground mb-4">{'<CodeBlock />'}</div>
              <CodeBlock
                code={SAMPLE_CODE}
                language="tsx"
                filename="app/page.tsx"
                showLineNumbers
              />
            </div>

            {/* Cell 3: Switch interactive */}
            <div className="bento-cell rounded-xl p-6">
              <div className="text-xs font-mono text-muted-foreground mb-4">{'<Switch />'}</div>
              <SwitchDemo />
            </div>

            {/* Cell 4: Progress animated */}
            <div className="bento-cell rounded-xl p-6">
              <div className="text-xs font-mono text-muted-foreground mb-4">{'<Progress />'}</div>
              <ProgressDemo />
            </div>

            {/* Cell 5: Motion hooks grid */}
            <div className="bento-cell rounded-xl p-6">
              <div className="text-xs font-mono text-muted-foreground mb-4">Motion hooks</div>
              <div className="grid grid-cols-2 gap-2">
                {['useFadeIn', 'useSlideUp', 'useScaleIn', 'useBounceIn', 'useScrollReveal', 'useHoverMotion'].map((name) => (
                  <div key={name} className="rounded-md bg-muted/20 border border-border/30 px-2 py-1.5 text-center hover:border-primary/40 hover:bg-primary/5 transition-all">
                    <span className="text-[11px] font-mono text-muted-foreground">{name}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 text-center">
                40+ ref-based hooks, SSR safe
              </p>
            </div>

            {/* Cell 6: Card + i18n demo — spans 2 cols */}
            <div className="bento-cell rounded-xl p-6 sm:col-span-2 lg:col-span-2">
              <div className="text-xs font-mono text-muted-foreground mb-4">{'<Card /> + i18n'}</div>
              <CustomTabs tabs={[
                {
                  id: 'preview',
                  label: 'Preview',
                  content: (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card className="glass">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{t('common:welcome.features.design.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{t('common:welcome.features.design.description')}</p>
                          <Button size="sm" variant="outline" className="mt-3">
                            {t('common:welcome.hero.secondaryCta')}
                          </Button>
                        </CardContent>
                      </Card>
                      <Card className="glass">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{t('common:welcome.features.i18n.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{t('common:welcome.features.i18n.description')}</p>
                          <div className="flex gap-2 mt-3">
                            <Badge variant="outline">KO</Badge>
                            <Badge variant="outline">EN</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ),
                },
                {
                  id: 'code',
                  label: 'Code',
                  content: (
                    <CodeBlock
                      code={`const { t } = useTranslation()

<Card>
  <CardTitle>{t('common:title')}</CardTitle>
  <Badge variant="outline">KO</Badge>
</Card>`}
                      language="tsx"
                    />
                  ),
                },
              ]} />
            </div>

            {/* Cell 7: Glow card hover demo */}
            <div className="glow-card rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[160px]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div className="text-sm font-medium mb-1">Glow on hover</div>
              <div className="text-xs text-muted-foreground">Glassmorphism + border glow</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 relative z-10 overflow-hidden">
        <div ref={featuresReveal.ref} style={featuresReveal.style} className="max-w-5xl mx-auto relative">
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.key} className="glow-card rounded-xl p-6">
                <div className="mb-4 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{t(`common:welcome.features.${f.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`common:welcome.features.${f.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Get Started CLI ── */}
      <section className="py-24 px-6 relative z-10 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div ref={cliReveal.ref} style={cliReveal.style} className="max-w-2xl mx-auto text-center relative">
          <h3 className="text-3xl font-bold mb-3">{t('common:welcome.getStarted')}</h3>
          <p className="text-muted-foreground mb-10">{t('common:welcome.features.description')}</p>
          <TypedCLI />
        </div>
      </section>

      {/* ── Links ── */}
      <section className="py-24 px-6 relative z-10">
        <div ref={linksReveal.ref} style={linksReveal.style} className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t('common:welcome.links.title')}</h2>
            <p className="text-muted-foreground">{t('common:welcome.links.description')}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { key: 'docs', href: 'https://docs.hua-labs.com', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg> },
              { key: 'templates', href: 'https://docs.hua-labs.com/templates', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> },
              { key: 'github', href: 'https://github.com/HUA-Labs/HUA-Labs-public', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
            ].map(({ key, href, icon }) => (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                className="glow-card rounded-xl p-6 block group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {icon}
                </div>
                <h3 className="font-semibold mb-2 flex items-center gap-1.5">
                  {t(`common:welcome.links.${key}.title`)}
                  <ExternalIcon className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`common:welcome.links.${key}.description`)}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scroll to top ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 glass rounded-full w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-300 ${
          scrollProgress.progress > 0.1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </button>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t border-border/30 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="HUA" width={16} height={16} />
            <span>Built with HUA</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="https://docs.hua-labs.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">Docs <ExternalIcon /></a>
            <a href="https://github.com/HUA-Labs/HUA-Labs-public" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">GitHub <ExternalIcon /></a>
            <a href="https://www.npmjs.com/org/hua-labs" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">npm <ExternalIcon /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
