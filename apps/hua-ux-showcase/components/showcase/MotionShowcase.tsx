'use client';

import { useTranslation } from '@hua-labs/i18n-core';
import { 
  useFadeIn, 
  useSlideUp, 
  useScaleIn,
  useHoverMotion,
  useScrollReveal,
  useScrollProgress
} from '@hua-labs/hua-ux';
import { Card, CardHeader, CardTitle, CardContent, Stack } from '@hua-labs/hua-ux';
import { useEffect, useRef } from 'react';

export function MotionShowcase() {
  const { t } = useTranslation();
  
  // Motion hooks
  const fadeInRef = useFadeIn({ duration: 800 });
  const slideUpRef = useSlideUp({ duration: 600 });
  const scaleInRef = useScaleIn({ duration: 500 });
  const hoverRef = useHoverMotion({
    scale: 1.05,
    transition: { duration: 200 }
  });
  const scrollRevealRef = useScrollReveal({ threshold: 0.3 });
  const progressRef = useRef<HTMLDivElement>(null);
  const { progress } = useScrollProgress();

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${progress}%`;
    }
  }, [progress]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('motion:title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('motion:description')}
        </p>
      </div>

      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50">
        <div 
          ref={progressRef}
          className="h-full bg-blue-500 transition-all duration-150"
        />
      </div>

      <div className="space-y-12">
        {/* Fade In */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Fade In</h2>
          <Card ref={fadeInRef.ref} style={fadeInRef.style}>
            <CardHeader>
              <CardTitle>Fade In Animation</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This card fades in when the component mounts</p>
            </CardContent>
          </Card>
        </section>

        {/* Slide Up */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Slide Up</h2>
          <Card ref={slideUpRef.ref} style={slideUpRef.style}>
            <CardHeader>
              <CardTitle>Slide Up Animation</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This card slides up from below when the component mounts</p>
            </CardContent>
          </Card>
        </section>

        {/* Scale In */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Scale In</h2>
          <Card ref={scaleInRef.ref} style={scaleInRef.style}>
            <CardHeader>
              <CardTitle>Scale In Animation</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This card scales in when the component mounts</p>
            </CardContent>
          </Card>
        </section>

        {/* Hover Motion */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('motion:hover')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card ref={hoverRef.ref} style={hoverRef.style} className="cursor-pointer">
              <CardHeader>
                <CardTitle>Hover Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Hover over this card to see the scale effect</p>
              </CardContent>
            </Card>
            <Card ref={hoverRef.ref} style={hoverRef.style} className="cursor-pointer">
              <CardHeader>
                <CardTitle>Hover Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Hover over this card to see the scale effect</p>
              </CardContent>
            </Card>
            <Card ref={hoverRef.ref} style={hoverRef.style} className="cursor-pointer">
              <CardHeader>
                <CardTitle>Hover Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Hover over this card to see the scale effect</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Scroll Reveal */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('motion:scroll')}</h2>
          <Stack spacing="lg">
            {[1, 2, 3, 4, 5].map((num) => (
              <Card key={num} ref={scrollRevealRef.ref} style={scrollRevealRef.style}>
                <CardHeader>
                  <CardTitle>Scroll Reveal Item {num}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Scroll down to see this item reveal as it enters the viewport</p>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </section>

        {/* Transition Motion */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('motion:transition')}</h2>
          <Card>
            <CardHeader>
              <CardTitle>Page Transitions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Navigate between pages to see smooth transitions</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
