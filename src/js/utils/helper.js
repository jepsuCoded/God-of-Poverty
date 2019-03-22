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

const popupText = (x, y, text, color, size, dur, scene, offset = 0) => {
  let textObj = scene.add.text(x, y-offset, text, {
    fontSize: size,
    color: color,
    stroke: '#000000',
    fontFamily: 'Gaegu',
    align: 'center'
  }).setDepth(10).setOrigin(0.5, 0.5);
  
  scene.tweens.add({
    targets: textObj,
    y: '-=50',
    alpha: 0,
    duration: dur,
    onComplete: function() {
      textObj.destroy();
    }
  });
};