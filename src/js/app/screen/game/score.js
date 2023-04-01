app.screen.game.score = (() => {
  let root,
    value

  return {
    enter: function () {
      value = content.score.value()

      root.innerHTML = value
      root.setAttribute('aria-live', 'assertive')

      return this
    },
    exit: function () {
      root.removeAttribute('aria-live')

      return this
    },
    ready: function () {
      root = document.querySelector('.a-game--score')

      return this
    },
    update: function () {
      const score = content.score.value()

      if (score == value) {
        return
      }

      value = score
      root.innerHTML = value

      return this
    },
  }
})()
