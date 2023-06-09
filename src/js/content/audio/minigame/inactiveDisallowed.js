content.audio.minigame.inactiveDisallowed = (() => {
  function sound(delay = 0) {
    const when = engine.time() + delay

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
      when,
    }).filtered({
      frequency: frequency * 8,
    }).connect(bus)

    const duration = 1/8

    synth.param.carrierGain.linearRampToValueAtTime(1/2, when + duration)
    synth.param.detune.linearRampToValueAtTime(detune - 1200, when + duration)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, when + duration)
    synth.param.mod.depth.linearRampToValueAtTime(1/2, when + duration)

    synth.stop(when + duration)
  }

  return () => {
    sound(0)
    sound(1/8)
  }
})()

content.minigame.on('inactive-disallowed', () => content.audio.minigame.inactiveDisallowed())
