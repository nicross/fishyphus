content.audio.acceleration = (() => {
  const bus = content.audio.createBus(),
    rootFrequency = engine.fn.fromMidi(48)

  let synth,
    value = 0

  function calculateParameters() {
    const midValue = Math.sin(value * Math.PI)

    const amodDepth = engine.fn.lerp(1/3, 1/2, 1 - midValue)

    return {
      amodDepth,
      amodFrequency: engine.fn.lerp(8, 16, value),
      color: engine.fn.lerp(12, 6, value),
      detune: engine.fn.lerp(0, 600, value),
      carrierGain: 1 - amodDepth,
      gain: engine.fn.fromDb(engine.fn.lerp(-18, -18, value)),
    }
  }

  function createSynth() {
    const attack = 1/4,
      context = engine.context(),
      now = engine.time()

    const {
      amodDepth,
      amodFrequency,
      carrierGain,
      color,
      detune,
      gain,
    } = calculateParameters()

    synth = engine.synth.mod({
      amodDepth,
      amodFrequency,
      amodType: 'triangle',
      carrierFrequency: rootFrequency,
      carrierGain,
      carrierType: 'triangle',
      detune,
      fmodDepth: rootFrequency / 2,
      fmodFrequency: rootFrequency,
      fmodType: 'triangle',
      gain,
    }).chainAssign(
      'fader', context.createGain()
    ).filtered({
      frequency: rootFrequency * color,
    }).connect(bus)

    synth.fader.gain.setValueAtTime(0, now)
    synth.fader.gain.linearRampToValueAtTime(1, now + attack)
  }

  function destroySynth() {
    const now = engine.time(),
      release = 1/4

    engine.fn.rampLinear(synth.fader.gain, engine.const.zeroGain, release)
    synth.stop(now + release)
    synth = undefined
  }

  function updateSynth() {
    const {
      amodDepth,
      amodFrequency,
      carrierGain,
      color,
      detune,
      gain,
    } = calculateParameters()

    engine.fn.setParam(synth.filter.frequency, rootFrequency * color)
    engine.fn.setParam(synth.param.amod.depth, amodDepth)
    engine.fn.setParam(synth.param.amod.frequency, amodFrequency)
    engine.fn.setParam(synth.param.carrierGain, carrierGain)
    engine.fn.setParam(synth.param.detune, detune)
    engine.fn.setParam(synth.param.gain, gain)
    engine.fn.setParam(synth.param.fmod.detune, -detune)
  }

  function updateValue() {
    const {x} = content.movement.rawInput()

    const targetVelocity = engine.tool.vector2d.create({
      x: x * content.movement.velocityMax(),
    }).rotate(
      engine.position.getEuler().yaw
    )

    const velocity = content.movement.velocity(),
      velocityAngle = Math.atan2(velocity.y, velocity.x),
      velocityMagnitude = velocity.distance(),
      velocityValue = content.movement.velocityValue()

    let targetValue = 0

    if (x > 0) {
      let stress = velocity.normalize().dotProduct(targetVelocity.normalize())
      stress = engine.fn.scale(stress, -1, 1, 1, 0)

      targetValue = x * engine.fn.lerp(1 - velocityValue, 1, stress)
    } else if (x < 0) {
      targetValue = Math.abs(x) * velocityValue
    }

    targetValue = engine.fn.round(targetValue, 8)
    value = targetValue
  }

  return {
    reset: function () {
      if (synth) {
        destroySynth()
      }

      return this
    },
    update: function () {
      updateValue()

      if (value) {
        if (!synth) {
          createSynth()
        } else {
          updateSynth()
        }
      } else if (synth) {
        destroySynth()
      }

      return this
    },
    value: () => value,
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.acceleration.update()
})

engine.state.on('reset', () => content.audio.acceleration.reset())
