import { Panel } from '@hua-labs/ui'

interface UsageExampleProps {
  title?: string
  description?: string
  examples: Array<{
    title: string
    description: string
    code: string
    color: 'blue' | 'green' | 'purple'
  }>
  usageNote?: string
}

export default function UsageExample({
  title = "💡 실제 사용 예시",
  description = "위의 샘플은 실제 웹사이트에서 HUA Motion SDK를 사용하는 방법을 보여줍니다.",
  examples,
  usageNote = "사용법: 각 탭을 클릭하여 3단계 추상화의 차이점을 체험해보세요. 재실행 버튼으로 애니메이션을 다시 볼 수 있습니다."
}: UsageExampleProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      code: 'text-blue-500'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      code: 'text-green-500'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      code: 'text-purple-500'
    }
  }

  return (
    <div className="mt-8 text-center">
      <Panel 
        style="glass" 
        padding="lg" 
        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 dark:border-slate-700/20"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {examples.map((example, index) => (
            <div key={index} className={`${colorClasses[example.color].bg} rounded-lg p-4`}>
              <div className={`font-semibold ${colorClasses[example.color].text}`}>
                {example.title}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {example.description}
              </div>
              <code className={`text-xs ${colorClasses[example.color].code} mt-2 block`}>
                {example.code}
              </code>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>사용법:</strong> {usageNote}
          </p>
        </div>
      </Panel>
    </div>
  )
} 