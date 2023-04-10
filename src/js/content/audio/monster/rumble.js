content.audio.monster.rumble = (() => {
  const buffer = engine.buffer.brownNoise({
    channels: 2,
    duration: 10,
  })

  let synth

  function calculateParameters() {
    const strength = content.monster.dangerValue(),
      stun = content.monster.getStunAcceleratedValue()

    const amodDepth = engine.fn.lerpExp(0, 1/2, strength, 3),
      color = engine.fn.lerp(1, 6, strength * (1 - stun)),
      frequency = engine.fn.fromMidi(21)

    return {
      amodDepth,
      amodFrequency: engine.fn.lerpExp(1, 64, strength, 16),
      carrierGain: 1 - amodDepth,
      filterFrequency: frequency * color,
      gain: engine.fn.fromDb(engine.fn.lerp(engine.const.zeroDb, -6, strength)),
      playbackRate: engine.fn.lerpExp(engine.const.zero, 1, strength, 4),
    }
  }

  return {
    create: function () {
      const parameters = calculateParameters()

      synth = engine.synth.amBuffer({
        amodType: 'triangle',
        buffer,
        ...parameters,
      }).filtered({
        frequency: parameters.filterFrequency,
      }).connect(
        content.audio.monster.bus()
      )

      return this
    },
    destroy: function () {
      synth.stop()
      synth = undefined

      return this
    },
    update: function () {
      const parameters = calculateParameters()

      engine.fn.setParam(synth.filter.frequency, parameters.filterFrequency)
      engine.fn.setParam(synth.param.carrierGain, parameters.carrierGain)
      engine.fn.setParam(synth.param.gain, parameters.gain)
      engine.fn.setParam(synth.param.playbackRate, parameters.playbackRate)
      engine.fn.setParam(synth.param.mod.depth, parameters.amodDepth)
      engine.fn.setParam(synth.param.mod.frequency, parameters.amodFrequency)

      return this
    },
  }
})()
