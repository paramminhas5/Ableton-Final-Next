// Display deep device explanations as expandable blocks
import { useState } from 'react';
import type { ExplainerBlock } from '@/content/device-explainers';

export function DeviceExplainers({ blocks }: { blocks: ExplainerBlock[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="font-mono text-xs uppercase tracking-widest">DEEP DIVE</div>
      
      <div className="space-y-2">
        {blocks.map((block, idx) => (
          <div
            key={idx}
            className="brutal-border bg-card transition-all"
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              className="w-full px-4 py-3 text-left hover:bg-bone transition-colors brutal-press"
            >
              <div className="flex items-start gap-3 justify-between">
                <div className="flex-1">
                  <div className="font-mono text-xs uppercase text-acid mb-1">
                    {getBlockTypeBadge(block.type)}
                  </div>
                  <div className="font-display text-lg">{block.title}</div>
                </div>
                <div className="text-2xl">
                  {expandedIndex === idx ? '▼' : '▶'}
                </div>
              </div>
            </button>

            {expandedIndex === idx && (
              <div className="px-4 pb-4 pt-2 border-t-2 border-acid bg-bone">
                <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                  {block.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="brutal-border bg-volt text-bone p-3 mt-4">
        <div className="font-mono text-xs uppercase mb-2">💡 PRO TIP</div>
        <div className="font-mono text-sm">
          Open each section to learn deeply. Read during playback - hearing examples while learning = faster understanding.
        </div>
      </div>
    </div>
  );
}

function getBlockTypeBadge(type: string): string {
  const badges: Record<string, string> = {
    'lead': '⭐ CONCEPT',
    'concept': '🧠 HOW IT WORKS',
    'parameters': '🎚️ CONTROLS',
    'example': '📝 EXAMPLE',
    'listening': '👂 LISTEN FOR',
    'mistakes': '❌ AVOID',
    'tips': '✅ PRO TIPS',
    'formula': '📐 FORMULA',
    'diagram': '📊 VISUALIZATION',
  };
  return badges[type] || type.toUpperCase();
}

export function ExplainerTabs({
  deviceId,
  blocks,
}: {
  deviceId: string;
  blocks: ExplainerBlock[];
}) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const types = Array.from(new Set(blocks.map((b) => b.type)));
  const filtered = selectedType ? blocks.filter((b) => b.type === selectedType) : blocks;

  return (
    <div className="space-y-3">
      {/* Type Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType(null)}
          className={`brutal-border px-3 py-1 font-mono text-xs uppercase ${
            selectedType === null ? 'bg-acid text-ink' : 'bg-bone text-ink'
          }`}
        >
          ALL
        </button>
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`brutal-border px-3 py-1 font-mono text-xs uppercase ${
              selectedType === type ? 'bg-acid text-ink' : 'bg-bone text-ink'
            }`}
          >
            {getBlockTypeBadge(type)}
          </button>
        ))}
      </div>

      {/* Explainers */}
      <DeviceExplainers blocks={filtered} />
    </div>
  );
}
