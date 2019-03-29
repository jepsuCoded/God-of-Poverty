const index2Dto1D = (x, y, length) => {
  return x + y * length;
};

// useless
const copyArray = fromThis => {
  let toThis = [];
  
  for(let i = 0; i < fromThis.length; i++) {
    toThis[i] = [];
    for(let j = 0; j < fromThis[i].length; j++) {
      toThis[i][j] = fromThis[i][j];
    }
  }
  
  return toThis;
};

const popupText = (scene, config) => {// (x, y, text, color, size, dur, scene, offset = 0) => {
  let textObj = scene.add.text(config.x, config.y-(config.offset || 0), config.text, {
    fontSize: config.size || scene.sizeFont,
    color: config.color || scene.color.normal[0],
    stroke: config.stroke || '#c4bfbf',
    strokeThickness: config.strokeThickness || 0,
    fontFamily: 'Gaegu',
    align: 'center'
  }).setDepth(config.depth || 100).setOrigin(0.5, 0.5);
  
  scene.tweens.add({
    targets: textObj,
    y: '-=50',
    alpha: 0,
    duration: config.duration,
    onComplete: function() {
      textObj.destroy();
    }
  });
};

const textObj = (scene, config) => {
  return scene.add.text(config.x || 0, config.y || 0, config.text, {
    fontSize: config.size || scene.sizeFont,
    color: config.color || '#000000',
    fontFamily: 'Gaegu',
    align: config.align || 'left',
  }).setDepth(config.depth).setOrigin(config.orig[0] || 0, config.orig[1] || 0);
};

const setCurrency = key => {
  return _scene.engine.formatNumber(_scene.engine.currencies[key].value, 1);
};