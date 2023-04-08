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

  function destroySynth() {
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
    response: function () {
      if (synth) {
        destroySynth()
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
content.minigame.on('before-casting-wait', () => content.audio.minigame.castingAlert.response())
