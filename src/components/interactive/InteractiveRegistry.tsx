import { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';
import type { InteractiveComponentName, InteractiveProps } from '@/types/lesson';

// Lazy load interactive components for code splitting
const FormulaCalculator = lazy(() =>
  import('./FormulaCalculator').then((m) => ({ default: m.FormulaCalculator }))
);
const WaveSimulator = lazy(() =>
  import('./WaveSimulator').then((m) => ({ default: m.WaveSimulator }))
);
const MotionSimulator = lazy(() =>
  import('./MotionSimulator').then((m) => ({ default: m.MotionSimulator }))
);
const ElectrolysisSimulator = lazy(() =>
  import('./ElectrolysisSimulator').then((m) => ({ default: m.ElectrolysisSimulator }))
);

const COMPONENT_REGISTRY: Record<InteractiveComponentName, React.LazyExoticComponent<ComponentType<InteractiveProps>>> = {
  formula_calculator: FormulaCalculator,
  wave_simulator: WaveSimulator,
  motion_simulator: MotionSimulator,
  electrolysis_simulator: ElectrolysisSimulator,
  // Phase 3 — uncomment as built:
  // circuit_simulator: CircuitSimulator,
  // charge_explorer: ChargeExplorer,
  // field_line_viewer: FieldLineViewer,
  // graph_explorer: GraphExplorer,
  // projectile_simulator: ProjectileSimulator,
  // pendulum_simulator: PendulumSimulator,
};

interface InteractiveRendererProps {
  component: InteractiveComponentName;
  config: Record<string, unknown>;
  instruction?: string;
  prediction_prompt?: string;
  onPrediction?: (prediction: string) => void;
  onInteraction?: (data: Record<string, unknown>) => void;
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">Loading interactive...</span>
    </div>
  );
}

function UnknownComponent({ component }: { component: string }) {
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
      Interactive component "{component}" is not yet available. Coming soon.
    </div>
  );
}

export function InteractiveRenderer({
  component,
  config,
  instruction,
  prediction_prompt,
  onPrediction,
  onInteraction,
}: InteractiveRendererProps) {
  const Component = COMPONENT_REGISTRY[component];

  if (!Component) {
    return <UnknownComponent component={component} />;
  }

  return (
    <div className="space-y-3">
      {prediction_prompt && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-purple-600 text-lg">🤔</span>
            <div>
              <div className="text-sm font-medium text-purple-800 mb-1">Predict first!</div>
              <div className="text-sm text-purple-700">{prediction_prompt}</div>
            </div>
          </div>
        </div>
      )}

      {instruction && (
        <div className="text-sm text-gray-600 italic">{instruction}</div>
      )}

      <Suspense fallback={<LoadingFallback />}>
        <Component
          config={config}
          onPrediction={onPrediction}
          onInteraction={onInteraction}
        />
      </Suspense>
    </div>
  );
}
