content.audio.monster.rumble = (() => {
  const buffer = engine.buffer.brownNoise({
    channels: 2,
    duration: 10,
  })

  let synth

  function calculateParameters() {
    const {
      danger,
      stun,
    } = content.audio.monster.parameters.all()

    const amodDepth = engine.fn.lerpExp(0, 1/2, danger, 3),
      color = engine.fn.lerp(1, 6, danger * (1 - stun)),
      frequency = engine.fn.fromMidi(21)

    return {
      amodDepth,
      amodFrequency: engine.fn.lerpExp(1, 64, danger, 16),
      carrierGain: 1 - amodDepth,
      filterFrequency: frequency * color,
      gain: engine.fn.fromDb(engine.fn.lerp(engine.const.zeroDb, -6, danger)),
      playbackRate: engine.fn.lerpExp(engine.const.zero, 1, danger, 4),
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
