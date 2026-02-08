module.exports = (layout) => {
  if (!layout) {
    return null;
  }

  return {
    version: layout.version,
    layout: layout.layout.map((block) => ({
      id: block.id,
      type: block.type,
      order: block.order,
      config: block.config || {},
    })),
  };
};

