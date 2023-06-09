app.controls.mouse = (() => {
  let gameScreen,
    lookY = 0,
    rotate = 0

  let vector = engine.tool.vector2d.create()

  engine.ready(() => {
    gameScreen = document.querySelector('.a-game')
    gameScreen.addEventListener('click', onClick)

    app.screenManager.on('exit-game', onExitGame)
    app.screenManager.on('enter-game', onEnterGame)
  })

  // Prevent back/forward buttons
  // TODO: Move to engine?
  window.addEventListener('mouseup', (e) => {
    if (e.button == 3 || e.button == 4) {
      e.preventDefault()
    }
  })

  function exitPointerLock() {
    document.exitPointerLock()
  }

  // Decorate with fake wheelDown and wheelUp buttons
  // TODO: Move to engine?
  function getInput() {
    const raw = engine.input.mouse.get()

    return {
      ...raw,
      button: {
        ...raw.button,
        wheelDown: raw.wheelY < 0,
        wheelUp: raw.wheelY > 0,
      },
    }
  }

  function isPointerLock() {
    return document.pointerLockElement === gameScreen
  }

  function onClick() {
    if (!isPointerLock()) {
      requestPointerLock()
    }
  }

  function onEnterGame() {
    document.addEventListener('pointerlockchange', onPointerlockchange)

    if (app.isElectron()) {
      if (app.utility.escape.is()) {
        // Eventually Chrome seems to ignore pointerlock requests if player cancels it 2 times without clicking mouse
        app.utility.escape.once('up', requestPointerLock)
      } else {
        requestPointerLock()
      }
    }
  }

  function onExitGame() {
    document.removeEventListener('pointerlockchange', onPointerlockchange)

    if (isPointerLock()) {
      exitPointerLock()
    }

    lookY = 0
    rotate = 0
  }

  function onPointerlockchange() {
    if (!isPointerLock() && app.isElectron() && app.utility.escape.is()) {
      pause()
    }
  }

  function pause() {
    app.screenManager.dispatch('pause')
  }

  function requestPointerLock() {
    gameScreen.requestPointerLock()
  }

  return {
    game: function (mappings) {
      if (!isPointerLock()) {
        return {}
      }

      const mouse = getInput()

      // Axis-related things
      const sensitivity = 1,
        state = {},
        threshold = engine.const.zero

      let next = engine.tool.vector2d.create({
        x: -engine.fn.clamp(engine.fn.scale(mouse.moveX || 0, -sensitivity, sensitivity, -1, 1), -1, 1),
        y: engine.fn.clamp(engine.fn.scale(mouse.moveY || 0, -sensitivity, sensitivity, -1, 1), -1, 1),
      })

      vector = engine.fn.accelerateVector(vector, next, 100)

      if (Math.abs(vector.x) > threshold) {
        state.rotate = vector.x
      }

      // Buttons
      const checkMapping = (value, mapping) => {
        return value || (mapping.type == 'mouse' && mouse.button[mapping.key])
      }

      const moveBackward = mappings.moveBackward.reduce(checkMapping, false),
        moveForward = mappings.moveForward.reduce(checkMapping, false)

      if (moveBackward && !moveForward) {
        state.x = -1
      } else if (moveForward && !moveBackward) {
        state.x = 1
      }

      // Action
      const action = mappings.action.reduce(checkMapping, false)

      if (action) {
        state.action = true
      }

      return state
    },
    getInput,
    ui: function (mappings) {
      const state = {}

      const mouse = getInput()

      const checkMapping = (value, mapping) => {
        return value || (mapping.type == 'mouse' && mouse.button[mapping.key])
      }

      for (const [mapping, name] of Object.entries({
        action: 'action',
        back: 'back',
        pause: 'pause',
        uiDown: 'down',
        uiLeft: 'left',
        uiRight: 'right',
        uiUp: 'up',
      })) {
        if (mappings[mapping].reduce(checkMapping, false)) {
          state[name] = true
        }
      }

      // Prevent pointer lock request from triggering action
      if (!isPointerLock() && app.screenManager.is('game')) {
        delete state.action
      }

      return state
    },
  }
})()
