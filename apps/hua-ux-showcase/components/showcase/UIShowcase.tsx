'use client';

import { useTranslation } from '@hua-labs/i18n-core';
import { Button, Card, Stack, Badge, Alert, Progress } from '@hua-labs/hua-ux';

export function UIShowcase() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('ui:title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('ui:description')}
        </p>
      </div>

      <div className="space-y-12">
        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
          <Stack direction="horizontal" spacing="md" wrap>
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </Stack>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description text</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card content goes here</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description text</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card content goes here</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description text</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card content goes here</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Badges</h2>
          <Stack direction="horizontal" spacing="md" wrap>
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="outline">Outline</Badge>
          </Stack>
        </section>

        {/* Alerts */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Alerts</h2>
          <Stack spacing="md">
            <Alert variant="success">Success alert message</Alert>
            <Alert variant="warning">Warning alert message</Alert>
            <Alert variant="error">Error alert message</Alert>
            <Alert variant="info">Info alert message</Alert>
          </Stack>
        </section>

        {/* Progress */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Progress</h2>
          <Stack spacing="md">
            <Progress value={25} />
            <Progress value={50} />
            <Progress value={75} />
            <Progress value={100} />
          </Stack>
        </section>

        {/* Spacing */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('ui:spacing')}</h2>
          <div className="space-y-4">
            <Stack spacing="none">
              <div className="bg-blue-100 dark:bg-blue-900 p-2">spacing="none"</div>
              <div className="bg-blue-100 dark:bg-blue-900 p-2">spacing="none"</div>
            </Stack>
            <Stack spacing="sm">
              <div className="bg-blue-100 dark:bg-blue-900 p-2">spacing="sm"</div>
              <div className="bg-blue-100 dark:bg-blue-900 p-2">spacing="sm"</div>
            </Stack>
            <Stack spacing="md">
              <div className="bg-blue-100 dark:bg-blue-900 p-2">spacing="md"</div>
              <div className="bg-blue-100 dark:bg-blue-900 p-2">spacing="md"</div>
            </Stack>
            <Stack spacing="lg">
              <div className="bg-blue-100 dark:bg-blue-900 p-2">spacing="lg"</div>
              <div className="bg-blue-100 dark:bg-blue-900 p-2">spacing="lg"</div>
            </Stack>
            <Stack spacing="xl">
              <div className="bg-blue-100 dark:bg-blue-900 p-2">spacing="xl"</div>
              <div className="bg-blue-100 dark:bg-blue-900 p-2">spacing="xl"</div>
            </Stack>
          </div>
        </section>
      </div>
    </div>
  );
}
