content.audio.minigame.failure = () => {
  const bus = content.audio.minigame.bus(),
    now = engine.time()

  const synth = engine.synth.amBuffer({
    buffer: content.audio.buffer.pinkNoise.get(0),
    carrierGain: 3/4,
    gain: engine.fn.fromDb(-6),
    modDepth: 1/4,
    modFrequency: engine.fn.randomFloat(2, 6),
    modType: 'triangle',
  }).filtered({
    detune: -2400 + engine.fn.randomFloat(-100, 100),
    frequency: engine.fn.fromMidi(60),
    Q: 10,
    type: 'bandpass',
  }).connect(bus)

  const duration = 0.5

  synth.filter.detune.linearRampToValueAtTime(0, now + duration)
  synth.filter.Q.linearRampToValueAtTime(1, now + duration/4)
  synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)
  synth.param.mod.frequency.linearRampToValueAtTime(16, now + duration)

  synth.stop(now + duration)
}

content.minigame.on('failure', () => content.audio.minigame.failure())
