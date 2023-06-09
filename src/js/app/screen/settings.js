app.screen.settings = app.screenManager.invent({
  // Attributes
  id: 'settings',
  parentSelector: '.a-app--settings',
  rootSelector: '.a-settings',
  transitions: {
    back: function () {
      this.change('mainMenu')
    },
    resetProgress: function () {
      this.change('resetProgress')
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    const root = this.rootElement

    // Buttons
    Object.entries({
      back: root.querySelector('.a-settings--back'),
      resetProgress: root.querySelector('.a-settings--resetProgress'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => {
        if (element.getAttribute('aria-disabled') != 'true') {
          app.screenManager.dispatch(event)
        }
      })
    })

    // Sliders
    this.sliders = [
      ['.a-settings--gamepadVibration', app.settings.raw.gamepadVibration, app.settings.setGamepadVibration],
      ['.a-settings--mainVolume', app.settings.raw.mainVolume, app.settings.setMainVolume],
      ['.a-settings--turningSpeed', app.settings.raw.turningSpeed, app.settings.setTurningSpeed],
    ].map(([selector, initialValue, setter]) => {
      const component = app.component.slider.hydrate(root.querySelector(selector), initialValue)
      component.on('change', () => setter(component.getValueAsFloat()))
      return component
    })

    // Toggles
    this.toggles = [
      ['.a-settings--graphicsOn', app.settings.raw.graphicsOn, app.settings.setGraphicsOn],
      ['.a-settings--peacefulMode', app.settings.raw.peacefulMode, app.settings.setPeacefulMode],
      ['.a-settings--simpleMode', app.settings.raw.simpleMode, app.settings.setSimpleMode],
    ].map(([selector, initialValue, setter]) => {
      const component = app.component.toggle.hydrate(root.querySelector(selector), initialValue)
      component.on('change', () => setter(component.getValue()))
      return component
    })
  },
  onEnter: function () {
    const hasHighscore = app.storage.highscore.has(),
      resetProgress = this.rootElement.querySelector('.a-settings--resetProgress')

    if (hasHighscore) {
      resetProgress.removeAttribute('aria-disabled')
    } else {
      resetProgress.setAttribute('aria-disabled', 'true')
    }
  },
  onExit: function () {
    app.settings.save()
  },
  onFrame: function () {
    const root = this.rootElement,
      ui = app.controls.ui()

    if (ui.back) {
      app.screenManager.dispatch('back')
    }

    if (ui.confirm) {
      const focused = app.utility.focus.get(root)

      if (focused) {
        return focused.click()
      }
    }

    if ('focus' in ui) {
      const toFocus = app.utility.focus.selectFocusable(root)[ui.focus]

      if (toFocus) {
        if (app.utility.focus.is(toFocus)) {
          return toFocus.click()
        }

        return app.utility.focus.set(toFocus)
      }
    }

    if (ui.up) {
      return app.utility.focus.setPreviousFocusable(root)
    }

    if (ui.down) {
      return app.utility.focus.setNextFocusable(root)
    }

    if (ui.left) {
      for (const slider of this.sliders) {
        if (app.utility.focus.isWithin(slider.rootElement)) {
          return slider.decrement()
        }
      }
    }

    if (ui.right) {
      for (const slider of this.sliders) {
        if (app.utility.focus.isWithin(slider.rootElement)) {
          return slider.increment()
        }
      }
    }
  },
})
