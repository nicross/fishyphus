content.audio.minigame.cast = () => {
  const bus = content.audio.minigame.bus(),
    now = engine.time()

  const synth = engine.synth.amBuffer({
    buffer: content.audio.buffer.pinkNoise.get(0),
    carrierGain: 3/4,
    gain: engine.fn.fromDb(-3),
    modDepth: 1/4,
    modFrequency: 16,
    modType: 'triangle',
  }).filtered({
    detune: engine.fn.randomFloat(-100, 100),
    frequency: engine.fn.fromMidi(60),
    Q: 1,
    type: 'bandpass',
  }).connect(bus)

  const duration = 2

  synth.filter.detune.linearRampToValueAtTime(-4800, now + duration)
  synth.filter.Q.linearRampToValueAtTime(10, now + duration/2)
  synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)
  synth.param.mod.frequency.linearRampToValueAtTime(engine.fn.randomFloat(2, 6), now + duration)

  synth.stop(now + duration)
}

content.minigame.on('after-inactive-cast', () => content.audio.minigame.cast())
