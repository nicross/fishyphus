content.audio.minigame.success = () => {
  const bus = content.audio.minigame.bus()

  // TODO: synth up
  // TODO: synth good
  // TODO: synth monster damage
}

content.minigame.on('success', () => content.audio.minigame.success())
