content.audio.monster.kill = (() => {
  const bus = engine.mixer.createBus()

  function drop() {
    const now = engine.time()

    const frequency = engine.fn.fromMidi(57)

    const synth = engine.synth.simple({
      gain: engine.fn.fromDb(-15),
      frequency,
      type: 'triangle',
      now,
    }).filtered({
      frequency,
    }).connect(bus)

    const duration = 4

    synth.filter.detune.linearRampToValueAtTime(3600, now + duration)
    synth.param.detune.linearRampToValueAtTime(-3600, now + duration/8)
    synth.param.gain.linearRampToValueAtTime(engine.fn.fromDb(-6), now + duration/8)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)
  }

  function tone() {
    const now = engine.time()

    const synth = engine.synth.simple({
      frequency: engine.fn.fromMidi(81),
      type: 'sine',
    }).connect(bus)

    const duration = 4

    synth.param.gain.linearRampToValueAtTime(engine.fn.fromDb(-24), now + duration - 1)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)
  }

  return () => {
    drop()
    tone()
  }
})()

content.monster.on('kill', () => content.audio.monster.kill())
