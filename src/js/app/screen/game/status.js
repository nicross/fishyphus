app.screen.game.status = (() => {
  let label,
    react,
    root,
    timeout = 0

  return {
    ready: function () {
      root = document.querySelector('.a-game--status')

      label = root.querySelector('.a-game--statusLabel')
      react = root.querySelector('.a-game--statusReact')

      return this
    },
    react: function () {
      root.classList.add('a-game--status-react')
      setTimeout(() => root.classList.remove('a-game--status-react'), 0)

      return this
    },
    reset: function () {
      label.innerHTML = 'Fish'
      root.classList.remove('a-game--status-active', 'a-game--status-react')

      return this
    },
    setActive: function (value) {
      if (value) {
        root.classList.add('a-game--status-active')
      } else {
        root.classList.remove('a-game--status-active')
      }

      return this
    },
    setLabel: function (value) {
      label.innerHTML = value

      return this
    },
    update: function () {
      this.setActive(
        content.minigame.isActive() || content.minigame.isAllowed()
      )

      return this
    },
  }
})()

engine.ready(() => {
  content.minigame.on('enter-inactive', () => {
    app.screen.game.status.setActive(false)
    app.screen.game.status.setLabel('Fish')
  })

  content.minigame.on('enter-casting', () => app.screen.game.status.setLabel('Cast'))
  content.minigame.on('enter-waiting', () => app.screen.game.status.setLabel('Wait'))
  content.minigame.on('enter-reeling', () => app.screen.game.status.setLabel('Reel'))

  content.minigame.on('inactive-alert', () => app.screen.game.status.react())
  content.minigame.on('casting-alert', () => app.screen.game.status.react())
  content.minigame.on('waiting-alert', () => app.screen.game.status.react())
})
