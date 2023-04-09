content.audio.monster.sub = (() => {
  const filterModel = engine.ear.filterModel.musical.instantiate()

  let binaural,
    synth

  function calculateParameters() {
    const strength = content.monster.dangerValue(),
      stun = content.monster.getStunAcceleratedValue()

    const amodDepth = engine.fn.lerpExp(1/12, 1/3, strength, 2),
      color = engine.fn.lerp(1, 4, strength * (1 - stun)),
      frequency = engine.fn.fromMidi(33)

    return {
      amodDepth,
      amodFrequency: engine.fn.lerpExp(1/30, 16, strength, 4),
      carrierDetune: engine.fn.lerp(0, -2400, stun),
      carrierFrequency: frequency,
      carrierGain: 1 - amodDepth,
      filterFrequency: frequency * color,
      fmodDepth: 0,
      fmodDetune: 0,
      fmodFrequency: 0,
      gain: engine.fn.fromDb(engine.fn.lerpExp(engine.const.zeroDb, -12, strength, 0.1)),
      vector: content.monster.normal(),
    }
  }

  return {
    create: function () {
      const parameters = calculateParameters()

      synth = engine.synth.mod({
        amodType: 'sine',
        carrierType: 'sawtooth',
        fmodType: 'sine',
        ...parameters,
      }).filtered({
        frequency: parameters.filterFrequency,
      })

      binaural = engine.ear.binaural.create({
        filterModel,
      })

      binaural.from(synth).to(
        content.audio.monster.bus()
      )

      return this
    },
    destroy: function () {
      binaural.destroy()
      binaural = undefined

      synth.stop()
      synth = undefined

      return this
    },
    update: function () {
      const parameters = calculateParameters()

      engine.fn.setParam(synth.param.amod.depth, parameters.amodDepth)
      engine.fn.setParam(synth.param.amod.frequency, parameters.amodFrequency)
      engine.fn.setParam(synth.param.detune, parameters.carrierDetune)
      engine.fn.setParam(synth.param.frequency, parameters.carrierFrequency)
      engine.fn.setParam(synth.param.carrierGain, parameters.carrierGain)
      engine.fn.setParam(synth.param.fmod.depth, parameters.fmodDepth)
      engine.fn.setParam(synth.param.fmod.detune, parameters.fmodDetune)
      engine.fn.setParam(synth.param.fmod.frequency, parameters.fmodFrequency)
      engine.fn.setParam(synth.param.gain, parameters.gain)
      engine.fn.setParam(synth.filter.frequency, parameters.filterFrequency)

      filterModel.options.frequency = parameters.carrierFrequency
      binaural.update(parameters.vector)

      return this
    },
  }
})()
