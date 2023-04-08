content.audio.minigame.failure = () => {
  const bus = content.audio.minigame.bus()

  // TODO: synth up
  // TODO: synth bad
}

content.minigame.on('failure', () => content.audio.minigame.failure())
