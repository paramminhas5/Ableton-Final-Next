// V2: Signal Flow Visualizer - Interactive SVG routing diagrams
// Place in: src/components/SignalFlowDiagram.tsx

import { useState } from 'react';

export type SignalFlowDiagram = {
  title: string;
  description: string;
  nodes: SignalNode[];
  connections: Connection[];
};

export type SignalNode = {
  id: string;
  label: string;
  type: 'source' | 'track' | 'device' | 'mixer' | 'output';
  x: number;
  y: number;
  color: string;
  explanation?: string;
};

export type Connection = {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
};

export function SignalFlowDiagram({ diagram }: { diagram: SignalFlowDiagram }) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = diagram.nodes.find(n => n.id === selectedNodeId);
  const highlightedPath = selectedNodeId
    ? getPathFromNode(selectedNodeId, diagram.nodes, diagram.connections)
    : [];

  const width = 1000;
  const height = 400;

  return (
    <div className="space-y-4">
      {/* SVG Diagram */}
      <div className="brutal-border bg-bone p-4 overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
          {/* Draw connections first (so they appear behind nodes) */}
          {diagram.connections.map((conn, idx) => {
            const fromNode = diagram.nodes.find(n => n.id === conn.from);
            const toNode = diagram.nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const isHighlighted = highlightedPath.includes(conn.from) || highlightedPath.includes(conn.to);
            const isHovered = hoveredNodeId === conn.from || hoveredNodeId === conn.to;

            return (
              <g key={`conn-${idx}`}>
                {/* Line */}
                <line
                  x1={fromNode.x + 50}
                  y1={fromNode.y + 25}
                  x2={toNode.x}
                  y2={toNode.y + 25}
                  stroke={isHighlighted || isHovered ? '#ff6b35' : '#333'}
                  strokeWidth={isHighlighted || isHovered ? 3 : 2}
                  strokeDasharray={conn.style === 'dashed' ? '5,5' : '0'}
                  className="transition-all"
                />
                {/* Arrow */}
                <polygon
                  points={`${toNode.x},${toNode.y + 25} ${toNode.x - 8},${toNode.y + 20} ${toNode.x - 8},${toNode.y + 30}`}
                  fill={isHighlighted || isHovered ? '#ff6b35' : '#333'}
                  className="transition-all"
                />
                {/* Label */}
                {conn.label && (
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#666"
                    fontFamily="monospace"
                  >
                    {conn.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Draw nodes */}
          {diagram.nodes.map((node) => {
            const isHighlighted = highlightedPath.includes(node.id);
            const isHovered = hoveredNodeId === node.id;
            const isSelected = selectedNodeId === node.id;

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Node rectangle */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={100}
                  height={50}
                  fill={isSelected ? node.color : isHighlighted || isHovered ? '#ffeeaa' : '#f5f5f5'}
                  stroke={isHighlighted || isHovered || isSelected ? '#ff6b35' : '#333'}
                  strokeWidth={isHighlighted || isHovered || isSelected ? 3 : 2}
                  rx={4}
                  className="transition-all"
                />

                {/* Label */}
                <text
                  x={node.x + 50}
                  y={node.y + 32}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill={isSelected ? '#fff' : '#000'}
                  className="pointer-events-none"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="brutal-border bg-volt text-bone p-4">
          <h3 className="font-display text-lg mb-2">{selectedNode.label}</h3>
          <p className="font-mono text-sm leading-relaxed">
            {selectedNode.explanation ||
              `This is a ${selectedNode.type} node in the signal chain. Audio flows through it.`}
          </p>
          {/* Connections */}
          <div className="mt-3 space-y-1">
            <div className="font-mono text-xs uppercase opacity-75">Connections</div>
            {diagram.connections
              .filter(c => c.from === selectedNode.id)
              .map((conn, idx) => (
                <div key={idx} className="font-mono text-xs">
                  → {diagram.nodes.find(n => n.id === conn.to)?.label} {conn.label ? `(${conn.label})` : ''}
                </div>
              ))}
            {diagram.connections
              .filter(c => c.to === selectedNode.id)
              .map((conn, idx) => (
                <div key={idx} className="font-mono text-xs">
                  ← {diagram.nodes.find(n => n.id === conn.from)?.label} {conn.label ? `(${conn.label})` : ''}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="brutal-border bg-bone p-4">
        <div className="font-mono text-xs uppercase mb-3">LEGEND</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-mono">
          {[
            { color: '#00d9ff', label: 'Source' },
            { color: '#ff6b35', label: 'Track' },
            { color: '#00ff88', label: 'Device' },
            { color: '#ffff00', label: 'Mixer' },
            { color: '#aaaaaa', label: 'Output' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-4 h-4" style={{ backgroundColor: item.color, border: '1px solid #000' }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper to highlight signal path from a node
function getPathFromNode(nodeId: string, nodes: SignalNode[], connections: Connection[]): string[] {
  const path: string[] = [nodeId];
  let current = nodeId;

  // Follow downstream connections
  while (true) {
    const next = connections.find(c => c.from === current);
    if (!next) break;
    path.push(next.to);
    current = next.to;
  }

  return path;
}

// Pre-made signal flow diagrams for common routing scenarios

export const SIMPLE_DEVICE_FLOW: SignalFlowDiagram = {
  title: 'Simple Device Chain',
  description: 'Audio flows left-to-right through devices in series.',
  nodes: [
    { id: 'source', label: 'SOURCE', type: 'source', x: 50, y: 150, color: '#00d9ff', explanation: 'Drum loop, bass sample, or instrument' },
    { id: 'eq', label: 'EQ', type: 'device', x: 200, y: 150, color: '#00ff88', explanation: 'Shape tone by cutting/boosting frequencies' },
    { id: 'comp', label: 'COMP', type: 'device', x: 350, y: 150, color: '#00ff88', explanation: 'Control dynamics, add punch, glue' },
    { id: 'reverb', label: 'REVERB', type: 'device', x: 500, y: 150, color: '#00ff88', explanation: 'Add space and ambience' },
    { id: 'out', label: 'OUTPUT', type: 'output', x: 650, y: 150, color: '#aaaaaa', explanation: 'Signal goes to speakers' },
  ],
  connections: [
    { from: 'source', to: 'eq' },
    { from: 'eq', to: 'comp' },
    { from: 'comp', to: 'reverb' },
    { from: 'reverb', to: 'out' },
  ],
};

export const SENDS_RETURNS_FLOW: SignalFlowDiagram = {
  title: 'Sends & Returns (Shared Effects)',
  description: 'Multiple tracks send to a shared effect return track for efficiency.',
  nodes: [
    { id: 'drums', label: 'DRUMS', type: 'track', x: 50, y: 100, color: '#ff6b35' },
    { id: 'bass', label: 'BASS', type: 'track', x: 50, y: 200, color: '#ff6b35' },
    { id: 'chords', label: 'CHORDS', type: 'track', x: 50, y: 300, color: '#ff6b35' },
    { id: 'reverb', label: 'REVERB\nRETURN', type: 'device', x: 350, y: 200, color: '#ffff00' },
    { id: 'master', label: 'MASTER', type: 'mixer', x: 550, y: 200, color: '#ffff00' },
  ],
  connections: [
    { from: 'drums', to: 'reverb', label: 'send 30%', style: 'dashed' },
    { from: 'bass', to: 'reverb', label: 'send 20%', style: 'dashed' },
    { from: 'chords', to: 'reverb', label: 'send 60%', style: 'dashed' },
    { from: 'drums', to: 'master' },
    { from: 'bass', to: 'master' },
    { from: 'chords', to: 'master' },
    { from: 'reverb', to: 'master' },
  ],
};

export const SIDECHAIN_FLOW: SignalFlowDiagram = {
  title: 'Sidechain Compression',
  description: 'Kick drum controls compressor on bass track — bass ducks when kick plays.',
  nodes: [
    { id: 'kick', label: 'KICK', type: 'track', x: 50, y: 100, color: '#ff6b35' },
    { id: 'bass', label: 'BASS', type: 'track', x: 50, y: 300, color: '#ff6b35' },
    { id: 'comp', label: 'COMP', type: 'device', x: 350, y: 300, color: '#00ff88' },
    { id: 'master', label: 'MASTER', type: 'mixer', x: 550, y: 200, color: '#ffff00' },
  ],
  connections: [
    { from: 'kick', to: 'master' },
    { from: 'bass', to: 'comp' },
    { from: 'comp', to: 'master' },
    { from: 'kick', to: 'comp', label: 'sidechain', style: 'dashed' },
  ],
};
