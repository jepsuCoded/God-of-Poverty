class SceneMain extends Phaser.Scene {
  constructor() {
    super('SceneMain');
  }
  
  preload() {
    _scene = this;
    
    this.sizeFont = 21;
    let test = this.add.text(0, 0, 'WWWWWWWWWW', {fontSize: this.sizeFont, fontFamily: 'Gaegu'});
    this.scaleFont = 121/test.width;
    this.sizeFont *= this.scaleFont;
    test.destroy();
  }
  
  create() {
    this.initSystem();
    //this.createUI();
    this.createResources();
    
    /*
    this.createStatusbar();
    this.createNavbar();
    this.createResources();
    */
    //this.align.showNumbers();
    
  }
  
  update() {
    
    this.engine.onTick(Date.now());
    
    //this.statusbar.cash = this.engine.currencies['soul'].value;
    //this.statusbar.cashInfo.setText('$' + this.engine.formatNumber(this.engine.currencies['soul'].value, this.statusbar.cash % 1 === 0 ? 0 : 1));
    /*
    if (this.engine.currencies.soul.value - (this.navbar.upgrade.cost * Math.pow(this.navbar.upgrade.costFactor, this.navbar.mustache.level)).toFixed(1) >= 0) this.navbar.upgrade.image.clearTint();
    */
    _data.people.forEach((person, i) => {
      if (!_data.people[i].hidden) {
        const cost = person.producer.calculateCost(1);
        if(this.engine.currencies.soul.value - cost.price >= 0) {
          person.discover(true);
        } else person.discover(false);
      }
    });
    
  }
  
  initSystem() {
    this.color = {
      normal: ['#c4bfbf', 0xc4bfbf],
      primary: ['#bcb19f', 0xbcb19f],
      disabled: ['#3e3d4c', 0x3e3d4c],
      info: ['#847f7f', 0x847f7f],
      secondary: ['#5a5a63', 0x5a5a63],
      error: ['#c0461f', 0xc0461f],
      success: ['#84ad42', 0x84ad42]
    };
    
    this.align = new AlignGrid({
      scene: this,
      cols: 10,
      rows: 20
    });
    
    this.align.centerX = (this.align.config.cols-1)*0.5;
    this.align.centerY = (this.align.config.rows-1)*0.5;
    
    this.engine = new Engine();
    
    // Create currencies
    for (const currency in _data.cash) {
      this.engine.createCurrency(currency, _data.cash[currency]);
    }
    
    // Create people
    PEOPLE.forEach((person, i) => {
      let pos = (i * 3) + 4;
      _data.people.push(new Person(this, {
        id: i,
        name: person.name,
        description: person.description || 'No description',
        image: person.image,
        position: pos,
        cost: person.cost,
        costFactor: person.costFactor,
        getOutput: {
          amount: person.output.amount,
          time: person.output.time
        }
      }));
    });
    
    // Create button tapper
    // ~ too long so I need to seperate
    //   it to its own function
    this.createTapper();
    
    this.createDisplay();
    
    _data.tapper.tween(this, {
      x: -0.5,
      y: this.align.config.rows-3.5,
      width: game.config.width,
      height: 96,
      duration: 50,
      ease: 'Cubic'
    });
    
    // Create button icons
    _data.buttons = {
      upgrade: new Button(this, {
        image: 'button_icons',
        frame: 0,
        posX: 0.5,
        posY: 15.5,
        scale: 0.75
      }),
      shop: new Button(this, {
        image: 'button_icons',
        frame: 1,
        posX: 2.125,
        posY: 15.5,
        scale: 0.75
      }),
      page_previous: new Button(this, {
        image: 'button_icons',
        frame: 2,
        posX: 6.88,
        posY: 15.5,
        scale: 0.75
      }),
      page_next: new Button(this, {
        image: 'button_icons',
        frame: 2,
        flipX: true,
        posX: 8.5,
        posY: 15.5,
        scale: 0.75
      }),
      setting: new Button(this, {
        image: 'button_icons',
        frame: 4,
        posX: 8.5,
        posY: 0.5,
        scale: 0.75,
        depth: 4
      })
    };
  }
  
  createTapper() {
    _data.tapper = {
      count: 0.1,
      level_factor: 1.5,
      level_target: 10,
      level_current: 0,
      button: this.add.nineslice(
        0, 0,
        game.config.width, 96,
        {key: 'ui_nineslice', frame: 2},
        32,
        32
      ).setDepth(9).setOrigin(0, 0),
      button_pressed: this.add.nineslice(
        0, 0,
        game.config.width, 96,
        {key: 'ui_nineslice', frame: 3},
        32,
        32
      ).setDepth(8).setOrigin(0, 0),
      icon: this.add.image(0, 0, 'button_hand_pick').setDepth(10).setOrigin(0.5, 0.5),
      setPos: function(scene, x, y) {
        scene.align.placeAt(x, y, _data.tapper.button);
        scene.align.placeAt(x, y, _data.tapper.button_pressed);
        _data.tapper.icon.setPosition(_data.tapper.button.x+_data.tapper.button.width/2, _data.tapper.button.y-4+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
        
        _data.tapper.defaultPos = {x: _data.tapper.button_pressed.x, y: _data.tapper.button_pressed.y};
        _data.tapper.defaultPosIndex = {x: x, y: y};
        _data.tapper.defaultSize = {width: _data.tapper.button_pressed.width, height: _data.tapper.button_pressed.height};
      },
      setSize: function(width, height) {
        _data.tapper.button.resize(width, height);
        _data.tapper.button_pressed.resize(width, height);
        if (width-32 != _data.tapper.icon.width && width <= height) {
          let scale = (width-32)/_data.tapper.icon.width;
          if (scale > 1.25) scale = 1.25;
          _data.tapper.icon.setScale(scale, scale);
        } else if (height-32 != _data.tapper.icon.height && height <= width) {
          let scale = (height-32)/_data.tapper.icon.height;
          if (scale > 1.25) scale = 1.25;
          _data.tapper.icon.setScale(scale, scale);
        } else
          _data.tapper.icon.setScale(1, 1);
        
        _data.tapper.icon.setPosition(_data.tapper.button.x+_data.tapper.button.width/2, _data.tapper.button.y-4+_data.tapper.button.height/2);//+_data.tapper.button.height/2);

        _data.tapper.defaultPos = {x: _data.tapper.button_pressed.x, y: _data.tapper.button_pressed.y};
        _data.tapper.defaultSize = {width: _data.tapper.button_pressed.width, height: _data.tapper.button_pressed.height};
      },
      resetInteractive: function() {
        _data.tapper.button_pressed.input.hitArea.setSize(_data.tapper.defaultSize.width, _data.tapper.defaultSize.height);
      },
      tween: function(scene, config) {
        if (config.x || config.y) {
          scene.tweens.add({
            targets: _data.tapper.defaultPosIndex,
            x: config.x || _data.tapper.defaultPosIndex.x,
            y: config.y || _data.tapper.defaultPosIndex.y,
            duration: config.duration,
            ease: config.ease || 'Linear',
            onUpdate: function (tweens) {
              _data.tapper.setPos(scene, tweens.targets[0].x, tweens.targets[0].y);
            },
            onComplete: function(tweens) {
              //_data.tapper.resetInteractive();
            }
          });
        }
        if (config.width || config.height) {
          scene.tweens.add({
            targets: _data.tapper.defaultSize,
            width: config.width || _data.tapper.defaultSize.width,
            height: config.height || _data.tapper.defaultSize.height,
            duration: config.duration,
            ease: config.ease || 'Linear',
            onUpdate: function (tweens) {
              _data.tapper.setSize(tweens.targets[0].width, tweens.targets[0].height);
            },
            onComplete: function(tweens) {
              _data.tapper.resetInteractive();
            }
          });
        }
      }
    };
    _data.tapper.button_pressed.setInteractive({useHandCursor: true})
      .on('pointerdown', function() {
        _data.tapper.button.y = game.config.height*2;
        _data.tapper.icon.setPosition(_data.tapper.button_pressed.x+_data.tapper.button.width/2, _data.tapper.button_pressed.y+8+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
      }, this)
      .on('pointerout', function(pointer) {
        _data.tapper.button.y = _data.tapper.defaultPos.y;
        _data.tapper.icon.setPosition(_data.tapper.button.x+_data.tapper.button.width/2, _data.tapper.button.y-4+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
      }, this)
      .on('pointerup', function(pointer) {
        if (_data.tapper.button.x == _data.tapper.button_pressed.x && _data.tapper.button.y == _data.tapper.button_pressed.y)
          return;
        _data.display.level_bar_update();
        _data.tapper.button.y = _data.tapper.defaultPos.y;
        _data.tapper.icon.setPosition(_data.tapper.button.x+_data.tapper.button.width/2, _data.tapper.button.y-4+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
        this.engine.currencies['soul'].incrementBy(_data.levels.tapper*_data.tapper.count);
        _data.display.cash_text.soul.setText(setCurrency('soul'));
        popupText(this, {
          x: pointer.x, 
          y: pointer.y, 
          text: '+' + (_data.levels.tapper*_data.tapper.count).toFixed(1), 
          color: this.color.normal[0], 
          strokeThickness: _data.tapper.icon.scaleX <= 1 ? 0 : 1,
          size: this.sizeFont*1.524*_data.tapper.icon.scaleX,
          duration: 500, 
          offset: 48
        });
      }, this);
    
    _data.god = {
      level: 1
    };
    
    _data.levels = {
      tapper: 1
    };
    
    _data.tapper.setPos(this, 0.5, this.align.config.rows/4);
    _data.tapper.setSize(game.config.width-64, game.config.width-64);
    _data.tapper.resetInteractive();
  }
  
  createDisplay() {
    _data.display = {
      ui: this.add.image(0, 0, 'ui_placeholder').setDepth(3).setOrigin(0, 0),
      cash: {
        soul: this.add.image(0, 0, 'icon_currencies', 0)
          .setDepth(5),
        peso: this.add.image(0, 0, 'icon_currencies', 1)
          .setDepth(5),
      },
      cash_holder: {
        soul: this.add.image(0, 0, 'ui_cash_holder')
          .setDepth(4),
        peso: this.add.image(0, 0, 'ui_cash_holder')
          .setDepth(4),
      },
      cash_text: {
        soul: textObj(this, {
          text: setCurrency('soul'),
          depth: 5,
          orig: [1, 0.5],
          color: this.color.disabled[0],
          align: 'right'
        }),
        peso: textObj(this, {
          text: setCurrency('peso'),
          depth: 5,
          orig: [1, 0.5],
          color: this.color.disabled[0],
          align: 'right'
        })
      },
      level_text: textObj(this, {
        text: 'LEVEL 1',
        depth: 4,
        orig: [0.5, 0.5],
        size: this.sizeFont*1.1,
        color: this.color.normal[0],
      }),
      level_bar: this.add.rectangle(
        game.cX,
        64+16,
        game.config.width,
        16, this.color.primary[1]).setDepth(4).setOrigin(0, 0).setScale(0, 1),
      level_bar_update: function() {
        _data.tapper.level_current++;
        let percent = _data.tapper.level_current / _data.tapper.level_target;
        if (percent >= 1) {
          percent = 0;
          _data.tapper.level_current = 0;
          _data.tapper.level_target = Math.floor(_data.tapper.level_target*_data.tapper.level_factor);
          _data.tapper.count *= 2;
          _data.god.level++;
          _data.display.level_text.setText('LEVEL ' + _data.god.level);
        }
        _data.display.level_holder_text.setText(_data.tapper.level_current + '/' + _data.tapper.level_target);
        _data.display.level_bar.setScale(percent, 1);
        
      },
      level_holder: this.add.rectangle(
        game.cX,
        64+16-2,
        game.config.width,
        20, this.color.info[1]).setDepth(3).setOrigin(0, 0),
      level_holder_text: textObj(this, {
        text: '0/' + _data.tapper.level_target,
        depth: 4,
        orig: [0.5, 0.5],
        align: 'center',
        color: this.color.disabled[0]
      })
    };
    this.align.placeAt(1.5, 0.5, _data.display.cash_holder.soul);
    this.align.placeAt(0.5, 0.5, _data.display.cash.soul);
    this.align.placeAt(2.5, 0.5, _data.display.cash_text.soul);
    this.align.placeAt(5.5, 0.5, _data.display.cash_holder.peso);
    this.align.placeAt(4.5, 0.5, _data.display.cash.peso);
    this.align.placeAt(6.5, 0.5, _data.display.cash_text.peso);
    this.align.placeAt(4.5, 1.5, _data.display.level_text);
    this.align.placeAt(4.5, 2.25, _data.display.level_holder_text);
    
    //_data.display.level.setStrokeStyle(2, this.color.info[1]);
  }
  
  createResources() {
    _data.people.forEach((person, i) => {
      person.key = 'coin_' + i;
      person.resource = this.engine.createResource({
        key: person.key,
        basePrice: {
          currency: 'peso',
          amount: person.getOutput.amount
        },
        count: 0
      });
      person.producer = this.engine.createProducer({
        key: person.name,
        outputs: {
          resources: {
            [person.key]: {
              productionTime: person.getOutput.time,
              productionAmount: 1
            }
          }
        },
        baseCost: {
          currency: 'soul',
          amount: person.cost
        },
        costCoefficient: person.costFactor,
        count: 0,
        processingEnabled: false,
      });
      /*
      this.people.manager.push(this.engine.createManager({
        key: "Lumberjack Manager",
        entityType: "producer",
        entityKey: "Lumberjack",
        basePrice: {
          currency: "gold",
          amount: 500
        },
        count: 0,
        maxCount: 1,
        eventHandlers: eventHandlers
      }));*/
      person.producer.on("PRODUCER_OUTPUT", (e) => {
        //e.producer.processingEnabled = false;
        _data.people[i].claim = e.output.calculatePrice(e.output.count).amount;
        e.output.incrementBy(-e.output.count);
      });
    });
  }
}