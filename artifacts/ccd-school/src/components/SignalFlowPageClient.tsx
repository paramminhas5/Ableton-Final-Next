"use client";
import { SignalFlowDiagram, SIMPLE_DEVICE_FLOW } from "@/components/V2_SignalFlowDiagram";
import { RefPage } from "@/components/m1/parts";

export function SignalFlowPageClient() {
  return (
    <RefPage title="signal flow" meta="ableton live 12" intro="how audio travels from a source to the speakers, one stop at a time.">
      <div className="ls-panel" style={{ marginTop: 14, overflowX: "auto", display: "block", padding: 16 }}>
        <SignalFlowDiagram diagram={SIMPLE_DEVICE_FLOW} />
      </div>
    </RefPage>
  );
}
