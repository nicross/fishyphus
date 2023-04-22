content.audio.minigame.waitingBad = function () {
  const bus = content.audio.minigame.bus(),
    detune = engine.fn.randomFloat(-10, 10),
    frequency = engine.fn.fromMidi(48),
    gain = engine.fn.fromDb(-15)

  const synth = engine.synth.am({
    carrierDetune: detune,
    carrierFrequency: frequency,
    carrierGain: 3/4,
    carrierType: 'square',
    gain,
    modDepth: 1/4,
    modDetune: 600 + detune,
    modFrequency: frequency,
    modType: 'square',
  }).filtered({
    frequency: frequency * 8,
  }).connect(bus)

  const duration = 1/8,
    now = engine.time()

  synth.param.carrierGain.linearRampToValueAtTime(3/4, now + duration)
  synth.param.detune.linearRampToValueAtTime(detune + 1200, now + duration)
  synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)
  synth.param.mod.depth.linearRampToValueAtTime(1/4, now + duration)

  synth.stop(now + duration)
}

content.minigame.on('waiting-bad', () => content.audio.minigame.waitingBad())
