app.storage.tutorial = {
  clear: () => app.storage.clear('tutorial'),
  get: () => new Set(app.storage.get('tutorial') || []),
  set: function (values) {
    app.storage.set('tutorial', new Set(values))
    return this
  },
  // Helpers
  add: function (value) {
    const values = this.get()
    values.add(value)
    return this.set(values)
  },
  has: function (value) {
    return this.get().has(value)
  },
  remove: function (value) {
    const values = this.get()
    values.remove(value)
    return this.set(values)
  },
  size: function () {
    return this.get().size
  },
}
