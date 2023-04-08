content.audio.minigame.waitingCancel = () => {
  const bus = content.audio.minigame.bus()

  // TODO: synth bad
}

content.minigame.on('waiting-cancel', () => content.audio.minigame.waitingCancel())
