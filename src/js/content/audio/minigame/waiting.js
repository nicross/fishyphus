content.audio.minigame.waiting = (() => {
  const bus = content.audio.minigame.bus(),
    context = engine.context(),
    rootFrequency = engine.fn.fromMidi(36)

  let synth

  function calculateParameters() {
    const {timer} = content.minigame.data()

    const valuePre = engine.fn.clamp(
      engine.fn.scale(
        timer,
        0, 10,
        1, 0,
      )
    )

    const valuePost = engine.fn.clamp(
      engine.fn.scale(
        timer,
        -1, 0,
        1, 0,
      )
    )

    return {
      amDepth: engine.fn.lerp(0.5, 1, valuePre),
      amFrequency: engine.fn.lerp(1, 2, valuePost),
      fmDepth: engine.fn.lerp(0.5, 1, valuePre),
      fmFrequency: engine.fn.lerp(1, 2, valuePost),
      gain: engine.fn.fromDb(engine.fn.lerp(-9, -6, valuePost)),
    }
  }

  function createSynth() {
    const {
      amDepth,
      amFrequency,
      fmDepth,
      fmFrequency,
      gain,
    } = calculateParameters()

    synth = engine.synth.fm({
      carrierFrequency: rootFrequency,
      gain,
      modFrequency: 8,
    }).chainAssign(
      'faderLfo', context.createGain(),
    ).chainAssign(
      'faderMain', context.createGain(),
    ).connect(bus)

    synth.faderLfo.gain.value = 0

    synth.lfoAm = engine.synth.lfo({
      depth: amDepth,
      frequency: amFrequency,
    }).shaped(
      engine.shape.triplePulse()
    ).connect(synth.faderLfo.gain)

    synth.chainStop(synth.lfoAm)

    synth.lfoFm = engine.synth.lfo({
      depth: fmDepth,
      frequency: fmFrequency,
    }).shaped(
      engine.shape.triplePulse()
    ).connect(synth.param.mod.depth)

    synth.chainStop(synth.lfoFm)
  }

  function destroySynth() {
    const decay = 1/16,
      now = engine.time()

    engine.fn.rampLinear(synth.faderMain.gain, engine.const.zeroGain, decay)
    synth.stop(now + decay)

    synth = undefined
  }

  function updateSynth() {
    const {
      amDepth,
      amFrequency,
      fmDepth,
      fmFrequency,
      gain,
    } = calculateParameters()

    engine.fn.setParam(synth.lfoAm.param.depth, amDepth)
    engine.fn.setParam(synth.lfoAm.param.frequency, amFrequency)
    engine.fn.setParam(synth.lfoFm.param.depth, fmDepth)
    engine.fn.setParam(synth.lfoFm.param.frequency, fmFrequency)
    engine.fn.setParam(synth.param.gain, gain)
  }

  return {
    update: function () {
      if (content.minigame.state() == 'waiting') {
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

  content.audio.minigame.waiting.update()
})
