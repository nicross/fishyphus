content.audio.minigame.casting = (() => {
  const bus = content.audio.minigame.bus(),
    rootFrequency = engine.fn.fromMidi(60)

  let synth

  function calculateParameters() {
    const {
      depthValue,
      value,
    } = content.minigame.data()

    return {
      detune: depthValue * -2400,
      fmDepth: rootFrequency * engine.fn.lerp(0, 0.5, value),
      gain: engine.fn.fromDb(-15),
    }
  }

  function createSynth() {
    const {
      detune,
      fmDepth,
      gain,
    } = calculateParameters()

    synth = engine.synth.fm({
      carrierDetune: detune,
      carrierFrequency: rootFrequency,
      gain,
      modDetune: detune,
      modDepth: fmDepth,
      modFrequency: rootFrequency / 2,
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
      gain,
    } = calculateParameters()

    engine.fn.setParam(synth.param.detune, detune)
    engine.fn.setParam(synth.param.gain, gain)
    engine.fn.setParam(synth.param.mod.depth, fmDepth)
    engine.fn.setParam(synth.param.mod.detune, detune)
  }

  return {
    reset: function () {
      if (synth) {
        destroySynth()
      }

      return this
    },
    update: function () {
      if (content.minigame.state() == 'casting') {
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

  content.audio.minigame.casting.update()
})
