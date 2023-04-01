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

  return {}
})()
