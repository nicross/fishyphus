app.audio.stab = (() => {
  const bus = engine.mixer.createBus()

  const delay = engine.effect.dubDelay({
    dry: 1,
    feedback: 0.5,
    filterFrequency: engine.fn.fromMidi(69 + 12),
    gain: 1,
    wet: 1,
  })

  const frequencies = [
    0,2,3,7,8,12
  ].map(
    (note) => engine.fn.fromMidi(note + 69)
  )

  let previousFrequency

  delay.output.connect(bus)

  return () => {
    const frequency = engine.fn.choose(
      frequencies.filter((f) => f != previousFrequency),
      Math.random()
    )

    previousFrequency = frequency

    const synth = engine.synth.pwm({
      frequency,
      type: 'triangle',
      width: 0.5,
    }).filtered({
      frequency: frequency / 2,
    }).connect(delay.input)

    synth.assign(
      'pwmLfo',
      engine.synth.lfo({
        depth: 0.5,
        frequency: frequency / 2,
      }).connect(synth.param.width)
    ).chainStop(synth.pwmLfo)

    // Automation
    const duration = engine.fn.randomFloat(1.75, 2.25),
      color = engine.fn.randomFloat(1.5, 2.5),
      gain = engine.fn.fromDb(engine.fn.randomFloat(-25, -23)),
      now = engine.time()

    const attack = duration / engine.fn.randomFloat(8, 16)

    synth.filter.frequency.linearRampToValueAtTime(frequency * color, now + attack)
    synth.filter.frequency.linearRampToValueAtTime(frequency / 2, now + duration)

    synth.param.gain.linearRampToValueAtTime(gain, now + attack)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)
  }
})()

app.screenManager.on('enter', ({
  currentState,
  previousState,
}) => {
  const excludeCurrent = new Set([
    'game',
  ])

  const excludePrevious = new Set([
    'game',
    'none',
  ])

  if (excludeCurrent.has(currentState) || excludePrevious.has(previousState)) {
    return
  }

  app.audio.stab()
})
