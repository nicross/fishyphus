app.component.toggle = {}

app.component.toggle.hydrate = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.toggle.prototype = {
  construct: function (root, initialValue) {
    this.buttonElement = root.querySelector('.c-toggle--button')
    this.rootElement = root

    this.buttonElement.addEventListener('click', this.onClick.bind(this))

    this.setValue(initialValue, true)

    engine.tool.pubsub.decorate(this)

    return this
  },
  getValue: function () {
    return this.buttonElement.getAttribute('aria-checked') == 'true'
  },
  onClick: function () {
    return this.setValue(!this.getValue())
  },
  setValue: function (value, isInitial = false) {
    this.buttonElement.setAttribute('aria-checked', value ? 'true' : 'false')

    if (!isInitial) {
      this.emit('change', this.getValue())
    }

    return this
  },
}
