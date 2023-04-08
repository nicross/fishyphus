content.audio.minigame.waiting = (() => {
  const bus = content.audio.minigame.bus()

  let synth

  function calculateParameters() {
    const data = content.minigame.data()

    return {}
  }

  function createSynth() {
    const parameters = calculateParameters()

    synth = engine.synth.simple().connect(bus)
  }

  function destroySynth() {
    synth.stop()
    synth = undefined
  }

  function updateSynth() {
    const parameters = calculateParameters()
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
