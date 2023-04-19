content.audio.minigame.castingAlert = (() => {
  const bus = content.audio.minigame.bus()

  let detune,
    synth

  function createSynth() {
    detune = engine.fn.randomFloat(-10, 10)

    synth = engine.synth.simple({
      detune,
      frequency: engine.fn.fromMidi(48),
      gain: engine.fn.fromDb(-3),
      type: 'triangle',
    }).connect(bus)

    const decay = 1/2,
      now = engine.time()

    synth.param.gain.exponentialRampToValueAtTime(engine.fn.fromDb(-48), now + decay)
  }

  function destroySynthBad() {
    const decay = 1/16,
      now = engine.time()

    engine.fn.rampExp(synth.param.gain, engine.const.zeroGain, decay)

    synth.stop(now + decay)
    synth = undefined
  }

  function destroySynthGood() {
    const attack = 1/32,
      decay = 1/2,
      now = engine.time()

    synth.param.detune.setValueAtTime(detune, now)
    synth.param.detune.linearRampToValueAtTime(detune + 1200, now + attack)

    engine.fn.rampExp(synth.param.gain, engine.fn.fromDb(-6), attack)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + attack + decay)

    synth.stop(now + attack + decay)
    synth = undefined
  }

  return {
    call: function () {
      if (!synth) {
        createSynth()
      }

      return this
    },
    responseBad: function () {
      if (synth) {
        destroySynthBad()
      }

      return this
    },
    responseGood: function () {
      if (synth) {
        destroySynthGood()
      }

      return this
    },
    reset: function () {
      if (synth) {
        synth.stop()
      }

      return this
    },
  }
})()

content.minigame.on('casting-alert', () => content.audio.minigame.castingAlert.call())
content.minigame.on('casting-bad', () => content.audio.minigame.castingAlert.responseBad())
content.minigame.on('casting-good', () => content.audio.minigame.castingAlert.responseGood())
