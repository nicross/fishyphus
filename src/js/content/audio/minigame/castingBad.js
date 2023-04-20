content.audio.minigame.castingBad = function () {
  const bus = content.audio.minigame.bus(),
    detune = engine.fn.randomFloat(-10, 10),
    frequency = engine.fn.fromMidi(36),
    gain = engine.fn.fromDb(-15)

  const synth = engine.synth.am({
    carrierDetune: 1200 + detune,
    carrierFrequency: frequency,
    carrierGain: 3/4,
    carrierType: 'square',
    gain,
    modDepth: 1/4,
    modDetune: 1200 + 600 + detune,
    modFrequency: frequency,
    modType: 'square',
  }).filtered({
    frequency: frequency * 8,
  }).connect(bus)

  const duration = 1/8,
    now = engine.time()

  synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

  synth.stop(now + duration)
}

content.minigame.on('casting-bad', () => content.audio.minigame.castingBad())
