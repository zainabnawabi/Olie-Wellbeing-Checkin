// Distinct, calming procedural Web Audio soundscapes:
// 1. Calm Rain: Soft mid-band rainfall canopy + organic water droplet patters
// 2. Ocean Waves: Deep slow surf swells with wide dynamic rise/recede + surf foam crest
// 3. Forest Breeze: Airy shifting double-canopy leaf rustle + distant soft woodland chimes
// Zero external audio assets required; seamless buffer crossfades avoid loop clicks.

export type AmbientSoundType = 'none' | 'rain' | 'waves' | 'forest';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private timers: number[] = [];
  private currentSound: AmbientSoundType = 'none';
  private ambientVolume = 0.55; // 0.0 to 1.0
  private ambientMuted = false;

  private targetGain(): number {
    if (this.ambientMuted || this.ambientVolume <= 0) return 0.0001;
    // Comfortable master ceiling (0.30) with smooth taper
    return Math.max(0.0001, this.ambientVolume * 0.3);
  }

  public setAmbientVolume(volume01: number): void {
    this.ambientVolume = Math.max(0, Math.min(1, volume01));
    if (this.ambientVolume > 0 && this.ambientMuted) {
      this.ambientMuted = false;
    }
    if (this.ctx && this.masterGain && this.currentSound !== 'none') {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.targetGain(), now + 0.16);
    }
  }

  public setAmbientMuted(muted: boolean): void {
    this.ambientMuted = muted;
    if (this.ctx && this.masterGain && this.currentSound !== 'none') {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.targetGain(), now + 0.22);
    }
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public isAmbientMuted(): boolean {
    return this.ambientMuted;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** Crossfades loop boundaries to eliminate clicks or pops */
  private makeSeamlessLoop(data: Float32Array, fadeSamples = 6000): void {
    const len = data.length;
    const overlap = Math.min(fadeSamples, Math.floor(len / 4));
    for (let i = 0; i < overlap; i++) {
      const t = i / overlap;
      const tailIdx = len - overlap + i;
      const blended = data[i] * t + data[tailIdx] * (1 - t);
      data[i] = blended;
      data[tailIdx] = blended;
    }
  }

  private createPinkNoiseBuffer(ctx: AudioContext, seconds = 8): AudioBuffer {
    const length = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.036;
      b6 = white * 0.115926;
    }
    this.makeSeamlessLoop(data);
    return buffer;
  }

  private createBrownNoiseBuffer(ctx: AudioContext, seconds = 10): AudioBuffer {
    const length = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.016 * white) / 1.016;
      data[i] = lastOut * 2.5;
    }
    this.makeSeamlessLoop(data);
    return buffer;
  }

  /** Soft warm felt tap */
  public playClick(pitch = 300): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const clampedPitch = Math.min(340, Math.max(200, pitch * 0.58));

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(clampedPitch, now);
    osc.frequency.exponentialRampToValueAtTime(clampedPitch * 0.72, now + 0.09);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.025, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  /** Gentle warm marimba two-note chime on selection */
  public playSelect(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [261.63, 329.63].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const t = now + i * 0.075;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.022, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  /** Slow warm harp chord on completion */
  public playCelebrate(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [220.0, 277.18, 329.63, 440.0].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const t = now + i * 0.13;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(880, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.024, t + 0.055);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.2);
    });
  }

  public getCurrentSound(): AmbientSoundType {
    return this.currentSound;
  }

  public stopAmbient(): void {
    this.timers.forEach((id) => window.clearInterval(id));
    this.timers = [];

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.45);
    }

    const toStop = [...this.activeNodes];
    this.activeNodes = [];
    this.masterGain = null;
    this.currentSound = 'none';

    window.setTimeout(() => {
      toStop.forEach((n) => {
        try {
          if ('stop' in n && typeof (n as OscillatorNode).stop === 'function') {
            (n as OscillatorNode).stop();
          }
          n.disconnect();
        } catch {
          // Ignore already stopped nodes
        }
      });
    }, 500);
  }

  public setSound(sound: AmbientSoundType): void {
    if (sound === this.currentSound && sound !== 'none') return;
    this.stopAmbient();

    if (sound === 'none') {
      this.currentSound = 'none';
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) return;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.linearRampToValueAtTime(this.targetGain(), ctx.currentTime + 1.3);
    master.connect(ctx.destination);

    const nodes: AudioNode[] = [master];

    if (sound === 'rain') {
      // RAIN: Steady mid-band rainfall canopy (600–2200Hz soft roll-off) + rhythmic soft water droplets
      const pinkSrc = ctx.createBufferSource();
      pinkSrc.buffer = this.createPinkNoiseBuffer(ctx, 8);
      pinkSrc.loop = true;

      const rainHighpass = ctx.createBiquadFilter();
      rainHighpass.type = 'highpass';
      rainHighpass.frequency.setValueAtTime(520, ctx.currentTime);

      const rainLowpass = ctx.createBiquadFilter();
      rainLowpass.type = 'lowpass';
      rainLowpass.frequency.setValueAtTime(2100, ctx.currentTime);
      rainLowpass.Q.setValueAtTime(0.45, ctx.currentTime);

      const rainSheetGain = ctx.createGain();
      rainSheetGain.gain.setValueAtTime(0.36, ctx.currentTime);

      // Gentle rain intensity drift (~12s)
      const rainLfo = ctx.createOscillator();
      rainLfo.type = 'sine';
      rainLfo.frequency.setValueAtTime(0.08, ctx.currentTime);

      const rainLfoDepth = ctx.createGain();
      rainLfoDepth.gain.setValueAtTime(0.08, ctx.currentTime);

      rainLfo.connect(rainLfoDepth);
      rainLfoDepth.connect(rainSheetGain.gain);

      pinkSrc.connect(rainHighpass);
      rainHighpass.connect(rainLowpass);
      rainLowpass.connect(rainSheetGain);
      rainSheetGain.connect(master);

      pinkSrc.start();
      rainLfo.start();
      nodes.push(pinkSrc, rainHighpass, rainLowpass, rainSheetGain, rainLfo, rainLfoDepth);

      // Soft organic raindrop taps (unmistakable gentle patter texture)
      const dropBuffer = this.createPinkNoiseBuffer(ctx, 1);
      const dropInterval = window.setInterval(() => {
        if (this.currentSound !== 'rain' || !this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;

        // Soft pitched water droplet tap
        if (Math.random() < 0.72) {
          const osc = this.ctx.createOscillator();
          const dropGain = this.ctx.createGain();
          const f = 560 + Math.random() * 520;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          osc.frequency.exponentialRampToValueAtTime(f * 1.32, now + 0.055);

          dropGain.gain.setValueAtTime(0.0001, now);
          dropGain.gain.linearRampToValueAtTime(0.022 + Math.random() * 0.015, now + 0.009);
          dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

          osc.connect(dropGain);
          dropGain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.085);
        }

        // Micro rain leaf patter burst
        if (Math.random() < 0.65) {
          const burst = this.ctx.createBufferSource();
          burst.buffer = dropBuffer;
          const burstFilter = this.ctx.createBiquadFilter();
          burstFilter.type = 'bandpass';
          burstFilter.frequency.setValueAtTime(1200 + Math.random() * 900, now);
          burstFilter.Q.setValueAtTime(1.8, now);

          const burstGain = this.ctx.createGain();
          burstGain.gain.setValueAtTime(0.0001, now);
          burstGain.gain.linearRampToValueAtTime(0.04, now + 0.012);
          burstGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

          burst.connect(burstFilter);
          burstFilter.connect(burstGain);
          burstGain.connect(this.masterGain);
          burst.start(now, Math.random() * 0.7, 0.075);
        }
      }, 240);
      this.timers.push(dropInterval);
    }

    if (sound === 'waves') {
      // OCEAN WAVES: Unmistakable deep slow shoreline rise, crest, and quiet receding ebb (~11.5s cycle)
      const brownSrc = ctx.createBufferSource();
      brownSrc.buffer = this.createBrownNoiseBuffer(ctx, 10);
      brownSrc.loop = true;

      const pinkSrc = ctx.createBufferSource();
      pinkSrc.buffer = this.createPinkNoiseBuffer(ctx, 8);
      pinkSrc.loop = true;

      // Surf body filter sweeps wide from 110Hz (quiet ebb) -> 760Hz (rolling crest)
      const surfFilter = ctx.createBiquadFilter();
      surfFilter.type = 'lowpass';
      surfFilter.frequency.setValueAtTime(380, ctx.currentTime);
      surfFilter.Q.setValueAtTime(0.5, ctx.currentTime);

      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(0.42, ctx.currentTime);

      // Shoreline foam only rushes softly at the wave crest
      const foamFilter = ctx.createBiquadFilter();
      foamFilter.type = 'bandpass';
      foamFilter.frequency.setValueAtTime(980, ctx.currentTime);
      foamFilter.Q.setValueAtTime(0.65, ctx.currentTime);

      const foamGain = ctx.createGain();
      foamGain.gain.setValueAtTime(0.11, ctx.currentTime);

      // Slow ocean swell LFO (~11.8 seconds per wave)
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.085, ctx.currentTime);

      const lfoWaveGain = ctx.createGain();
      lfoWaveGain.gain.setValueAtTime(0.36, ctx.currentTime); // swells 0.06 <-> 0.78

      const lfoFoamGain = ctx.createGain();
      lfoFoamGain.gain.setValueAtTime(0.11, ctx.currentTime); // swells 0.0 <-> 0.22

      const lfoFilterDepth = ctx.createGain();
      lfoFilterDepth.gain.setValueAtTime(300, ctx.currentTime); // sweeps 80Hz <-> 680Hz

      lfo.connect(lfoWaveGain);
      lfoWaveGain.connect(waveGain.gain);

      lfo.connect(lfoFoamGain);
      lfoFoamGain.connect(foamGain.gain);

      lfo.connect(lfoFilterDepth);
      lfoFilterDepth.connect(surfFilter.frequency);

      brownSrc.connect(surfFilter);
      surfFilter.connect(waveGain);
      waveGain.connect(master);

      pinkSrc.connect(foamFilter);
      foamFilter.connect(foamGain);
      foamGain.connect(master);

      brownSrc.start();
      pinkSrc.start();
      lfo.start();
      nodes.push(
        brownSrc,
        pinkSrc,
        surfFilter,
        waveGain,
        foamFilter,
        foamGain,
        lfo,
        lfoWaveGain,
        lfoFoamGain,
        lfoFilterDepth
      );
    }

    if (sound === 'forest') {
      // FOREST BREEZE: Airy two-tone shifting treetop wind + soft distant woodland wind chimes
      const pinkSrc = ctx.createBufferSource();
      pinkSrc.buffer = this.createPinkNoiseBuffer(ctx, 8);
      pinkSrc.loop = true;

      // Two gentle resonant wind bands drifting out of phase (airy leaves sound)
      const leafFilterA = ctx.createBiquadFilter();
      leafFilterA.type = 'bandpass';
      leafFilterA.frequency.setValueAtTime(640, ctx.currentTime);
      leafFilterA.Q.setValueAtTime(1.5, ctx.currentTime);

      const leafGainA = ctx.createGain();
      leafGainA.gain.setValueAtTime(0.24, ctx.currentTime);

      const leafFilterB = ctx.createBiquadFilter();
      leafFilterB.type = 'bandpass';
      leafFilterB.frequency.setValueAtTime(1250, ctx.currentTime);
      leafFilterB.Q.setValueAtTime(1.8, ctx.currentTime);

      const leafGainB = ctx.createGain();
      leafGainB.gain.setValueAtTime(0.14, ctx.currentTime);

      const lfoA = ctx.createOscillator();
      lfoA.type = 'sine';
      lfoA.frequency.setValueAtTime(0.095, ctx.currentTime);
      const lfoADepth = ctx.createGain();
      lfoADepth.gain.setValueAtTime(210, ctx.currentTime);

      const lfoB = ctx.createOscillator();
      lfoB.type = 'sine';
      lfoB.frequency.setValueAtTime(0.065, ctx.currentTime);
      const lfoBDepth = ctx.createGain();
      lfoBDepth.gain.setValueAtTime(0.1, ctx.currentTime);

      lfoA.connect(lfoADepth);
      lfoADepth.connect(leafFilterA.frequency);

      lfoB.connect(lfoBDepth);
      lfoBDepth.connect(leafGainB.gain);

      pinkSrc.connect(leafFilterA);
      leafFilterA.connect(leafGainA);
      leafGainA.connect(master);

      pinkSrc.connect(leafFilterB);
      leafFilterB.connect(leafGainB);
      leafGainB.connect(master);

      pinkSrc.start();
      lfoA.start();
      lfoB.start();
      nodes.push(
        pinkSrc,
        leafFilterA,
        leafGainA,
        leafFilterB,
        leafGainB,
        lfoA,
        lfoADepth,
        lfoB,
        lfoBDepth
      );

      // Gentle distant pentatonic woodland chime / breeze bell every few seconds
      const chimeScale = [392.0, 440.0, 523.25, 587.33, 659.25];
      const chimeInterval = window.setInterval(() => {
        if (this.currentSound !== 'forest' || !this.ctx || !this.masterGain) return;
        if (Math.random() > 0.58) return;
        const now = this.ctx.currentTime;
        const freq = chimeScale[Math.floor(Math.random() * chimeScale.length)];

        const osc = this.ctx.createOscillator();
        const chimeFilter = this.ctx.createBiquadFilter();
        const chimeGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        chimeFilter.type = 'lowpass';
        chimeFilter.frequency.setValueAtTime(900, now);

        chimeGain.gain.setValueAtTime(0.0001, now);
        chimeGain.gain.linearRampToValueAtTime(0.032, now + 0.65);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

        osc.connect(chimeFilter);
        chimeFilter.connect(chimeGain);
        chimeGain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 3.5);
      }, 2800);
      this.timers.push(chimeInterval);
    }

    this.masterGain = master;
    this.activeNodes = nodes;
    this.currentSound = sound;
  }
}

export const soundEngine = new SoundEngine();
