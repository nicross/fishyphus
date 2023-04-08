content.audio.minigame.inactiveDisallowed = (() => {
  function sound(delay = 0) {
    const when = engine.time() + delay

    const bus = content.audio.minigame.bus(),
      detune = engine.fn.randomFloat(-10, 10),
      frequency = engine.fn.fromMidi(36),
      gain = engine.fn.fromDb(-18)

    const synth = engine.synth.am({
      carrierDetune: detune,
      carrierFrequency: frequency,
      carrierType: 'square',
      gain,
      modDepth: 1/2,
      modDetune: 600 + detune,
      modFrequency: frequency,
      modType: 'square',
      when,
    }).filtered({
      frequency: frequency * 8,
    }).connect(bus)

    const duration = 1/8

    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, when + duration)

    synth.stop(when + duration)
  }

  return () => {
    sound(0)
    sound(1/8)
  }
})()

content.minigame.on('inactive-disallowed', () => content.audio.minigame.inactiveDisallowed())
