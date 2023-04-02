app.canvas = (() => {
  let root

  engine.ready(() => {
    root = document.querySelector('.a-app--canvas')
    content.gl.setCanvas(root)

    window.addEventListener('resize', onResize)
    onResize()
  })

  function onResize() {
    root.height = root.clientHeight
    root.width = root.clientWidth

    content.gl.recalculate()
  }

  return {
    activate: function () {
      root.classList.add('a-app--canvas-active')

      return this
    },
    deactivate: function () {
      root.classList.remove('a-app--canvas-active')

      return this
    },
  }
})()

engine.loop.on('pause', () => app.canvas.deactivate())
engine.loop.on('resume', () => app.canvas.activate())
