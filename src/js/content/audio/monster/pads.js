content.audio.monster.pads = (() => {
  let leftSynth,
    rightSynth

  return {
    create: function () {
      leftSynth = this.sound.instantiate({
        destination: content.audio.monster.bus(),
        isLeft: true,
      })

      rightSynth = this.sound.instantiate({
        destination: content.audio.monster.bus(),
        isLeft: false,
      })

      return this
    },
    destroy: function () {
      leftSynth.destroy()
      leftSynth = undefined

      rightSynth.destroy()
      rightSynth = undefined

      return this
    },
    update: function () {
      leftSynth.update()
      rightSynth.update()

      return this
    },
  }
})()
