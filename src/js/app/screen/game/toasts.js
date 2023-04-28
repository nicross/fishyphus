app.screen.game.toasts = (() => {
  const duration = 2,
    queue = []

  let root,
    timeout = 0

  function onEngineStateReset() {
    queue.length = 0
    root.innerHTML = ''
  }

  return {
    enqueue: function (value) {
      queue.push(value)
      return this
    },
    enter: function () {
      root.setAttribute('aria-live', 'assertive')

      return this
    },
    exit: function () {
      root.removeAttribute('aria-live')

      return this
    },
    ready: function () {
      root = document.querySelector('.a-game--toasts')

      return this
    },
    reset: function () {
      queue.length = 0
      root.innerHTML = ''

      return this
    },
    update: function () {
      if (timeout > 0) {
        timeout -= engine.loop.delta()
        return
      }

      for (const child of root.children) {
        if (!child.hasAttribute('aria-hidden')) {
          child.setAttribute('aria-hidden', 'true')
          child.setAttribute('role', 'presentation')
          child.onanimationend = () => child.remove()
        }
      }

      if (!queue.length) {
        return
      }

      const message = queue.shift()

      root.appendChild(
        app.utility.dom.toElement(
          `<div class="a-game--toast" id="${engine.fn.uuid()}">${message}</div>`
        )
      )

      timeout = duration

      return this
    },
  }
})()

engine.ready(() => {
  content.minigame.on('success', () => {
    app.screen.game.toasts.enqueue(`<strong>${content.score.value()}</strong> fish`)
  })
})
