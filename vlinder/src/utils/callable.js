export default class Callable extends Function {
  constructor() {
    super('...args', 'return this.__self__.__call__(...args)')
    var self = this.bind(this)
    this.__self__ = self
    return self
  }

  __call__() {
    throw new Error("Abstract Method")
  }
}
