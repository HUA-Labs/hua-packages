'use client';

import { WelcomePage } from "@hua-labs/hua-ux/framework";

/**
 * Home Page
 * 
 * This is the default welcome page for your hua-ux project.
 * You can customize it by editing this file.
 * 
 * For more examples, see:
 * - app/page-with-geo.example.tsx (with GEO metadata)
 * - app/layout-with-geo.example.tsx (with GEO layout)
 */
export default function HomePage() {
  return (
    <WelcomePage 
      projectName="My App"
      showFeatures={true}
      showQuickLinks={true}
    />
  );
}
