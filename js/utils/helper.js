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
    backgroundColor: config.bg || null,
    padding: config.padding || null,
    fontFamily: 'Gaegu',
    align: config.align || 'center'
  }).setDepth(config.depth || 100).setOrigin(config.orig?config.orig[0]:0.5, config.orig?config.orig[1]:0.5);
  if (config.cash) textObj.x += ((32+textObj.width)/2)-textObj.width/2;
  let cashIcon;
  if (config.cash) {
    let size = textObj.height;//config.size || scene.sizeFont;
    cashIcon = scene.add.image(
      config.x,
      config.y-(config.offset || 0),
      config.cash.key, config.cash.frame)
      .setScale(32/size, 32/size).setDepth(100).setOrigin(0.5, 0.5)
      .setTint(_scene.color.normal[1]);
    cashIcon.x -= ((32+textObj.width)/2)-16;
  }
  scene.tweens.timeline({
    targets: [textObj, cashIcon],
    tweens: [{
      targets: [textObj, cashIcon],
      y: '-=8',
      duration: 500,//config.duration,
      ease: 'Bounce'
    },
    {
      targets: [textObj, cashIcon],
      y: '+=2',
      alpha: 0,
      delay: config.duration,
      duration: 200,//config.duration*0.5,
      ease: 'Cubic',
      onComplete: function() {
        textObj.destroy();
        if (config.cash)
          cashIcon.destroy();
      },
    }
    ]
  });
};

const textObj = (scene, config) => {
  return scene.add.text(config.x || 0, config.y || 0, config.text, {
    fontSize: config.size || scene.sizeFont,
    color: config.color || '#000000',
    fontFamily: 'Gaegu',
    align: config.align || 'left',
    backgroundColor: config.bg || null,
    padding: config.padding || null,
    wordWrap: {
      width: config.wordWrap
      ? config.wordWrap.width
        : null,
      useAdvancedWrap: config.wordWrap
      ? config.wordWrap.useAdvancedWrap
        : false
    },
    lineSpacing: 3
  }).setDepth(config.depth).setOrigin(config.orig[0] || 0, config.orig[1] || 0);
};

const setCurrency = key => {
  return _scene.engine.formatNumber(_scene.engine.currencies[key].value, 1);
};

const formatValue = (value, n = 1) => {
  return _scene.engine.formatNumber(value, n);
};

const incrementCash = (cash, amount) => {
  if (amount !== 0) {
    popupText(_scene, {
      text: amount < 0 ? formatValue(amount) : '+' + formatValue(amount),
      color: _scene.color.normal[0],
      x: _data.display.cash_text[cash].x,
      y: _data.display.cash_text[cash].y-13,
      duration: 100,
      orig: [1, 0.5],
      depth: 4,
      align: 'right'
    });
  }
  let value = _scene.engine.currencies[cash].value;
  _scene.engine.currencies[cash].incrementBy(-value);
  let newValue = 0;
  newValue = value*10;
  newValue += amount*10;
  newValue /= 10;
  _scene.engine.currencies[cash].incrementBy(newValue);
  _data.display.cash_text[cash].setText(setCurrency(cash));
  
  if (cash == 'peso' && newValue >= _data.shop.manager[0].cost && _scene.tutorial && _scene.tutorial_1 && _scene.tutorial_2) {
    _scene.tutorial_2();
  }
};

const toggleModal = (key, toggle) => {
  if (toggle) {
    if (_data.shop.page[key.name].current > 1)
      _data.shop.page_previous.unlocked();
    if (_data.shop.page[key.name].current < _data.shop.page[key.name].last)
      _data.shop.page_next.unlocked();
    
    _data.display.ui.setDepth(-1);
    _data.display.level_bar.setDepth(-1);
    _data.display.soul_text.setDepth(-1);
    _data.display.level_text.setDepth(-1);
    _data.display.bonus_text.setDepth(-1);
    _data.display.level_holder.setDepth(-1);
    _data.display.level_holder_text.setDepth(-1);
    for (const button in _data.buttons) {
      if (button != 'upgrade' && button != 'manager' && button != 'upgrade_count' && button != 'upgrade_count_text') {
        _data.buttons[button].setDepth(-1);
      }
      if (button == key.name) {
        _data.buttons[button].setFrame(5);
      }
    }
  } else {
    _data.display.ui.setDepth(0);
    _data.display.level_bar.setDepth(2);
    _data.display.soul_text.setDepth(1);
    _data.display.level_text.setDepth(1);
    _data.display.bonus_text.setDepth(1);
    _data.display.level_holder.setDepth(1);
    _data.display.level_holder_text.setDepth(3);
    for (const button in _data.buttons) {
      if (button != 'upgrade' && button != 'manager'&& button != 'upgrade_count' && button != 'upgrade_count_text') {
        _data.buttons[button].setDepth(1);
      }
      if (button == key.name) {
        _data.buttons[button].setFrame(key.frame);
      }
    }
  }
};

const tooltip = ({x = game.cW, y = game.cY, title, text, frame = 4, callback, cancel, info, align = 'center', depth = 0, useWordWrap = true}) => {
  let fix = false;
  let hr = title ? '---~---' : ' ';
  let bgmask = _scene.add.rectangle(
    0,
    0,
    game.config.width,
    game.config.height,
    _scene.color.dark[1], 0.8).setDepth(8+depth).setOrigin(0, 0)
    .setInteractive()
    .on('pointerup', function() {
      if (pressContinue) {
        if (pressContinue.visible) {
          if (cancel) cancel();
          bgmask.destroy();
          textTooltip.destroy();
          pressContinue.destroy();
          scroll = undefined;
          ui.destroy();
          return;
        }
      }
      if (scroll) scroll.stop();
      if (textTooltip)
        textTooltip.setText([title, hr, text]);
      if (info) pressContinue.setVisible(true);
      if (callback) callback();
    });
  var textTooltip = textObj(_scene, {
    x: x,
    y: y,
    text: [title, hr, text],
    depth: 10+depth,
    color: _scene.color.normal[0],
    orig: [0.5, 0],
    align: align,
    size: _scene.sizeFont*1.15,
    padding: {left: 32, right: 32, top: frame == 1 ? 6 : 16, bottom: 16},
    wordWrap: useWordWrap ? {width: game.cW+96,useAdvancedWrap: true} : {}
  });
  textTooltip.setInteractive()
    .on('pointerup', function() {
      if (pressContinue) {
        if (pressContinue.visible) {
          if (cancel) cancel();
          _scene.sfx_button_icon.play();
          bgmask.destroy();
          textTooltip.destroy();
          pressContinue.destroy();
          scroll = undefined;
          ui.destroy();
          return;
        }
      }
      if (scroll) scroll.stop();
      if (textTooltip)
        textTooltip.setText([title, hr, text]);
      if (info) pressContinue.setVisible(true);
      if (callback) callback();
    });
  let width = textTooltip.width;
  var ui = _scene.add.nineslice(
    textTooltip.x, textTooltip.y,
    textTooltip.width, textTooltip.height,
    {key: 'ui_nineslice', frame: frame},
    32,
    32
  ).setDepth(8+depth).setOrigin(0.5, 0.5)
    .setInteractive()
    .on('pointerup', function() {
      //event.stopPropagation();
      if (pressContinue) {
        if (pressContinue.visible) {
          if (cancel) cancel();
          _scene.sfx_button_icon.play();
          bgmask.destroy();
          textTooltip.destroy();
          if (info) pressContinue.destroy();
          scroll = undefined;
          ui.destroy();
          return;
        }
      }
      if (scroll) scroll.stop();
      if (textTooltip)
        textTooltip.setText([title, hr, text]);
      if (info) pressContinue.setVisible(true);
      if (callback) callback();
    });
  ui.setDepth(9+depth);
  textTooltip.y -= textTooltip.height/2;
  if (info) {
    var pressContinue = textObj(_scene, {
      x: x,
      y: textTooltip.y + (textTooltip.height) + 16,
      text: info,
      depth: 9+depth,
      orig: [0.5, 0.5],
      align: 'center',
      color: _scene.color.info[0]
    });
    pressContinue.setVisible(false);
  }
  var scroll = _scene.tweens.add({
    targets: {n: 0},
    n: text.length,
    duration: text.length*20,
    //ease: 'Linear',
    onStart: () => {
        textTooltip.setText('a');
      },
      onUpdate: (tweens) => {
        let nth = tweens.targets[0].n;
        textTooltip.setText([title, hr, text.substring(0, nth)]);
      },
      onComplete: () => {
        if (info) pressContinue.setVisible(true);
        textTooltip.setText([title, hr, text]);
        if (callback) callback();
      }
  });
};

const Dialogue = function({x = game.cW, y = game.cY, title, text, align = 'left', useWordWrap = true}) {
  this.showText = textObj(_scene, {
    x: x, y: y,
    text: [title, text],
    depth: 2,
    align: align,
    orig: [0.5, 0.5],
    size: _scene.sizeFont*1.2,
    color: _scene.color.normal[0],
    padding: {x: 16, y: 16},
    wordWrap: useWordWrap ? {width: game.cW+96,useAdvancedWrap: true} : {}
  });
  this.bg = _scene.add.rectangle(
    this.showText.x, this.showText.y,
    this.showText.width, this.showText.height,
    _scene.color.dark[1]
  ).setStrokeStyle(2, _scene.color.normal[1]);
  
  this.destroy = () => {
    this.showText.destroy();
    this.bg.destroy();
  }
}
