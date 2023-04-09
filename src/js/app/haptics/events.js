content.minigame.on('inactive-disallowed', () => {
  app.haptics.enqueue({
    duration: 50,
    startDelay: 0,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })

  app.haptics.enqueue({
    duration: 50,
    startDelay: 250,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })
})

content.minigame.on('casting-alert', () => {
  app.haptics.enqueue({
    duration: 250,
    startDelay: 0,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })
})

content.minigame.on('waiting-alert', () => {
  app.haptics.enqueue({
    duration: 250,
    startDelay: 0,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })
})

content.minigame.on('reeling-bonus', () => {
  const bonus = engine.fn.clamp(
    content.minigame.data().bonus / 4
  )

  app.haptics.enqueue({
    duration: 100,
    startDelay: 0,
    strongMagnitude: bonus,
    weakMagnitude: bonus,
  })
})

content.minigame.on('failure', () => {
  app.haptics.enqueue({
    duration: 100,
    startDelay: 100,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })
})

content.minigame.on('success', () => {
  app.haptics.enqueue({
    duration: 100,
    startDelay: 100,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })

  app.haptics.enqueue({
    duration: 100,
    startDelay: 300,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })

  app.haptics.enqueue({
    duration: 100,
    startDelay: 500,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })
})

content.monster.on('kill', () => {
  app.haptics.enqueue({
    duration: 100,
    startDelay: 200,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })

  app.haptics.enqueue({
    duration: 200,
    startDelay: 400,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })

  app.haptics.enqueue({
    duration: 50,
    startDelay: 750,
    strongMagnitude: 1,
    weakMagnitude: 1,
  })
})
