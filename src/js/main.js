;(async () => {
  // Wait for document ready
  await engine.ready()

  // Load and apply preferences
  await app.storage.ready()
  app.updates.apply()
  app.settings.load()
  app.screenManager.ready()

  // Initialize mix
  engine.mixer.reverb.setImpulse(
    engine.buffer.impulse({
      buffer: engine.buffer.whiteNoise({
        channels: 2,
        duration: 2,
      }),
      power: 2,
    })
  )

  // Prevent the Doppler effect
  engine.const.speedOfSound = engine.const.maxSafeFloat

  // Boosted dynamic range
  engine.mixer.param.limiter.attack.value = 0.003
  engine.mixer.param.limiter.gain.value = 1
  engine.mixer.param.limiter.knee.value = 15
  engine.mixer.param.limiter.ratio.value = 15
  engine.mixer.param.limiter.release.value = 0.125
  engine.mixer.param.limiter.threshold.value = -30
  engine.mixer.param.preGain.value = 1.75

  // Add gamepad deadzone
  engine.input.gamepad.setDeadzone(0.125)

  // Start the loop
  engine.loop.start().pause()

  // Activate application
  app.screenManager.dispatch('activate')
  app.activate()

  // Prevent closing HTML5 builds
  if (!app.isElectron()) {
    window.addEventListener('beforeunload', (e) => {
      if (!engine.loop.isPaused()) {
        e.preventDefault()
        e.returnValue = 'Quit?'
      }
    })
  }

  // Resume audio context on first gesture
  const gestures = [
    'click',
    'keyup',
    'touchend',
  ]

  for (const gesture of gestures) {
    window.addEventListener(gesture, onGesture)
  }

  function onGesture() {
    engine.context().resume()

    for (const gesture of gestures) {
      window.removeEventListener(gesture, onGesture)
    }
  }
})()
