content.audio.minigame.reeling = (() => {
  const bus = content.audio.minigame.bus(),
    rootFrequency = engine.fn.fromMidi(60)

  let synth

  function calculateParameters() {
    const {
      depthValue,
      bonus,
    } = content.minigame.data()

    return {
      detune: depthValue * -2400,
      fmDepth: 8 * bonus,
      fmFrequency: 4 * bonus,
      gain: engine.fn.fromDb(-15),
    }
  }

  function createSynth() {
    const {
      detune,
      fmDepth,
      fmFrequency,
      gain,
    } = calculateParameters()

    synth = engine.synth.fm({
      carrierDetune: detune,
      carrierFrequency: rootFrequency,
      gain,
      modDepth: fmDepth,
      modFrequency: fmFrequency,
      modType: 'square',
    }).connect(bus)
  }

  function destroySynth() {
    const decay = 1/16,
      now = engine.time()

    engine.fn.rampLinear(synth.param.gain, engine.const.zeroGain, decay)
    synth.stop(now + decay)

    synth = undefined
  }

  function updateSynth() {
    const {
      detune,
      fmDepth,
      fmFrequency,
      gain,
    } = calculateParameters()

    engine.fn.setParam(synth.param.detune, detune)
    engine.fn.setParam(synth.param.gain, gain)
    engine.fn.setParam(synth.param.mod.depth, fmDepth)
    engine.fn.setParam(synth.param.mod.frequency, fmFrequency)
  }

  return {
    reset: function () {
      if (synth) {
        destroySynth()
      }

      return this
    },
    update: function () {
      if (content.minigame.state() == 'reeling') {
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

  content.audio.minigame.reeling.update()
})
