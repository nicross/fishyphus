content.video = {
  draw: function () {
    content.gl.clear()

    this.color.update()
    this.sky.draw()
    this.particles.draw()

    return this
  },
  load: function () {
    this.color.load()
    this.particles.load()
    this.sky.load()

    return this
  },
  unload: function () {
    content.gl.clear()

    this.color.unload()
    this.particles.unload()
    this.sky.unload()

    return this
  },
}

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.video.draw()
})

engine.state.on('import', () => {
  if (content.gl.context()) {
    content.video.load()
  }
})

engine.state.on('reset', () => {
  if (content.gl.context()) {
    content.video.unload()
  }
})
