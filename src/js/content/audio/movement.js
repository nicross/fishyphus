content.audio.movement = (() => {
  const bus = content.audio.createBus()

  const filterModel = engine.ear.filterModel.musical.instantiate()

  let binaural,
    synth

  bus.gain.value = engine.fn.fromDb(-12)

  function calculateParameters() {
    const strength = content.movement.velocityValue()

    return {
      frequency: engine.fn.lerp(20, 200, strength),
      gain: engine.fn.fromDb(engine.fn.lerp(0, -3, strength)),
      vector: calculateVector(),
    }
  }

  function calculateVector() {
    let vector = content.movement.velocity().rotate(
      -engine.position.getEuler().yaw
    )

    const magnitude = vector.distance()

    if (magnitude > 1) {
      vector = vector.scale(1 / magnitude)
    }

    return vector
  }

  function createSynth() {
    const parameters = calculateParameters()

    synth = engine.synth.buffer({
      buffer: content.audio.buffer.brownNoise.get(0),
    }).filtered({
      frequency: engine.const.minFrequency,
    })

    filterModel.options.frequency = parameters.frequency
    synth.filter.frequency.value = parameters.frequency
    synth.param.gain.value = parameters.gain

    binaural = engine.ear.binaural.create({
      filterModel,
    })

    binaural.from(synth).to(bus)
  }

  function destroySynth() {
    binaural.destroy()
    binaural = undefined

    synth.stop()
    synth = undefined
  }

  function updateSynth() {
    const parameters = calculateParameters()

    engine.fn.rampLinear(synth.filter.frequency, parameters.frequency)
    engine.fn.rampLinear(synth.param.gain, parameters.gain)

    filterModel.options.frequency = parameters.frequency
    binaural.update(parameters.vector)
  }

  return {
    update: function () {
      const value = content.movement.velocityValue()

      if (value) {
        if (synth) {
          updateSynth()
        } else {
          createSynth()
        }
      } else if (synth) {
        destroySynth()
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.movement.update()
})
