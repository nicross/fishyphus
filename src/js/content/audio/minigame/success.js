content.audio.minigame.success = (() => {
  const bus = content.audio.minigame.bus()

  function bling(delay = 0) {
    const when = engine.time(delay)

    const detune = engine.fn.randomFloat(-10, 10),
      frequency = engine.fn.fromMidi(67),
      gain = engine.fn.fromDb(-18)

    const synth = engine.synth.simple({
      detune,
      frequency,
      gain,
      type: 'square',
      when,
    }).filtered({
      detune: 1600 + detune,
      frequency: frequency * 2,
    }).connect(bus)

    const duration = 1

    synth.param.gain.exponentialRampToValueAtTime(gain/16, when + duration/2)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, when + duration)

    synth.param.detune.setValueAtTime(detune, when + duration/9)
    synth.param.detune.linearRampToValueAtTime(detune + 1500, when + duration/6)

    synth.filter.frequency.exponentialRampToValueAtTime(frequency * 8, when + duration/2)

    synth.stop(when + duration)
  }

  function drop(delay = 0) {
    const when = engine.time(delay)

    const frequency = engine.fn.fromMidi(60)

    const synth = engine.synth.simple({
      gain: engine.fn.fromDb(-15),
      frequency,
      type: 'triangle',
      when,
    }).filtered({
      frequency,
    }).connect(bus)

    const duration = 2

    synth.filter.detune.linearRampToValueAtTime(3600, when + duration)
    synth.param.detune.linearRampToValueAtTime(-3600, when + duration/8)
    synth.param.gain.linearRampToValueAtTime(engine.fn.fromDb(-9), when + duration/8)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, when + duration)

    synth.stop(when + duration)
  }

  function splash(delay = 0) {
    const when = engine.time(delay)

    const synth = engine.synth.amBuffer({
      buffer: content.audio.buffer.pinkNoise.get(0),
      carrierGain: 3/4,
      gain: engine.fn.fromDb(-6),
      modDepth: 1/4,
      modFrequency: engine.fn.randomFloat(2, 6),
      modType: 'triangle',
      when,
    }).filtered({
      detune: -2400 + engine.fn.randomFloat(-100, 100),
      frequency: engine.fn.fromMidi(60),
      Q: 10,
      type: 'bandpass',
    }).connect(bus)

    const duration = 1

    synth.filter.detune.linearRampToValueAtTime(0, when + duration/2)
    synth.filter.Q.linearRampToValueAtTime(1, when + duration/4)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, when + duration)
    synth.param.mod.frequency.linearRampToValueAtTime(16, when + duration)

    synth.stop(when + duration)
  }

  return () => {
    drop()
    splash()
    bling()
  }
})()

content.minigame.on('success', () => content.audio.minigame.success())
