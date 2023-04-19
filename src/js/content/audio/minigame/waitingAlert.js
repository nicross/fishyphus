content.audio.minigame.waitingAlert = (() => {
  const bus = content.audio.minigame.bus()

  let detune,
    synth

  function createSynth() {
    detune = engine.fn.randomFloat(-10, 10)

    synth = engine.synth.am({
      carrierDetune: detune,
      carrierGain: 1,
      carrierFrequency: engine.fn.fromMidi(48),
      carrierType: 'triangle',
      gain: engine.fn.fromDb(-3),
      modDepth: 0,
      modFrequency: 8,
      modType: 'sine',
    }).connect(bus)

    const decay = 1/4,
      now = engine.time()

    synth.param.carrierGain.exponentialRampToValueAtTime(2/3, now + decay)
    synth.param.mod.depth.exponentialRampToValueAtTime(1/3, now + decay)

    synth.param.gain.exponentialRampToValueAtTime(engine.fn.fromDb(-15), now + decay)
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

    engine.fn.rampLinear(synth.param.carrierGain, 1, attack)
    engine.fn.rampLinear(synth.param.mod.depth, 0, attack)

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

content.minigame.on('waiting-alert', () => content.audio.minigame.waitingAlert.call())
content.minigame.on('waiting-bad', () => content.audio.minigame.waitingAlert.responseBad())
content.minigame.on('waiting-good', () => content.audio.minigame.waitingAlert.responseGood())
