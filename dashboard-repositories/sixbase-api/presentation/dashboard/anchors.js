const serializeModules = (modules) =>
  modules
    .sort((a, b) => a.modules_anchors.order - b.modules_anchors.order)
    .map(({ uuid, title }) => ({ uuid, label: title }));

const serializeAnchor = ({ uuid, label, order, modules = [] }) => ({
  uuid,
  label,
  order,
  modules: serializeModules(modules),
});

module.exports = class SerializeAnchors {
  #anchors;

  constructor(anchors) {
    this.#anchors = anchors;
  }

  adapt() {
    if (!this.#anchors)
      throw new Error('Expect anchors to be not undefined or null');
    if (Array.isArray(this.#anchors)) {
      return this.#anchors.map(serializeAnchor);
    }
    return serializeAnchor(this.#anchors);
  }
};
