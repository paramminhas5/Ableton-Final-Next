# V2 Upgrade: Audio-First Professional Learning Platform

## Status Check
✅ Audio engine (Web Audio API) — WORKING
✅ DSP nodes (EQ, Comp, Sat, Reverb, Delay, Filter, Chorus) — WORKING  
✅ Synthesized loops (drums, bass, chords, vocals) — WORKING
✅ DeviceLab component + device pages — WORKING
❌ Journey/progression system — MISSING
❌ Deep explainers with audio timestamps — MISSING
❌ Knowledge base (150+ terms) — MISSING
❌ Signal flow visualizer — MISSING
❌ Interactive challenges with validation — MISSING
❌ A/B comparison fully working — PARTIAL

## Priority Build Order

### Phase 1: Core Audio + Testing (FOUNDATION)
- [ ] Verify all device pages load with audio playing
- [ ] Test A/B compare button on all devices
- [ ] Add transport bar at bottom with play/stop/BPM
- [ ] Add visual feedback (waveform/spectrum) during playback
- [ ] Add device chain builder (drag to reorder devices)

### Phase 2: Journey System 
- [ ] Create JourneyMap component (brutalist subway map)
- [ ] Add mission breadcrumbs (World X · Mission Y of Z)
- [ ] Add prev/next navigation between missions
- [ ] Time estimates per mission and per world
- [ ] Progress tracking (XP/level system)

### Phase 3: Content Expansion
- [ ] Expand all explainers (4 blocks → 15 blocks per mission)
- [ ] Add audio playback buttons in explainers
- [ ] Add "What to listen for" callouts
- [ ] Add link cross-references between missions
- [ ] Add common mistakes warnings
- [ ] Add pro workflow tips

### Phase 4: Knowledge Base + Signal Flow
- [ ] Build Knowledge Base (150+ terms)
- [ ] Implement search + filter
- [ ] Add keyboard shortcut trainer
- [ ] Build Signal Flow Visualizer
- [ ] Create interactive routing diagrams

### Phase 5: Challenges + Polish
- [ ] Add mini-challenges per mission
- [ ] Build challenge validator
- [ ] Add achievements/XP system
- [ ] Theme toggle (dark/light brutalist)
- [ ] Keyboard navigation (J/K, space)
- [ ] Mobile audio unlock
- [ ] Accessibility pass

## Quick Wins (Do First)
1. Add master transport bar (global play/stop/BPM)
2. Test every device page loads + plays audio
3. Add spectrum meter to every device page
4. Fix A/B compare to actually bypass the device
5. Add "download audio" button to compare versions
