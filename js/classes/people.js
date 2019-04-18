class Person {
  constructor(scene, _) {
    this.id = _.id;
    this.name = _.name;
    this.page = _.page;
    this.image = _.image;
    this.description = _.description;
    this.cost = _.cost;
    this.cash = {
      cost: 'soul',
      output: 'peso'
    };
    (_data.count) = 1;
    this.timeFactor = _.timeFactor;
    this.costFactor = _.costFactor;
    this.level = 0;
    this.milestone = [5, 10, 25, 50, 100, 200, 500, 1000];
    this.getOutput = {
      amount: _.getOutput.amount,
      time: _.getOutput.time
    };
    this.fromSave = false;
    this.ui = {
      placeholder: scene.add.nineslice(
        0, 0,
        game.config.width-6-32, 96-14,
        {key: 'ui_nineslice', frame: 5},
        32,
        32
      ).setOrigin(0.5, 0.5).setDepth(0),
      avatar: scene.add.image(0, 0, _.image).setDepth(2),
      avatar_count_text: textObj(scene, {
        text: '?',
        color: scene.color.disabled[0],
        size: scene.sizeFont * 0.9,
        depth: 2,
        orig: [0, 0.5]
      }),
      newIndicator: textObj(scene, {
        text: 'NEW!',
        color: scene.color.normal[0],
        align: 'center',
        bg: scene.color.error[0],
        size: scene.sizeFont*0.8,
        padding: {x: 4, y: 4},
        orig: [0.5, 0.5],
        depth: 3
      }),
      avatar_bg: scene.add.image(0, 0, 'ui_avatar_bg').setTint(0x847f7f).setDepth(1),
      name: textObj(scene, {
        text: this.name,
        size: scene.sizeFont,
        color: scene.color.normal[0],
        depth: 1,
        orig: [0, 0.5],
        fixedWidth: 64
      }),
      description: textObj(scene, {
        text: '\t\t' + this.description,
        size: scene.sizeFont,
        color: scene.color.normal[0],
        depth: 1,
        orig: [0, 0],
        align: 'justify',
        wordWrap: {width: game.config.width-6-32-64, useAdvancedWrap: true}
      }),
      count_text: textObj(scene, {
        text: 'CAPTURE NEW SOUL +1',
        color: scene.color.disabled[0],
        size: scene.sizeFont*0.9,
        depth: 4,
        orig: [0.5, 0.5],
        align: 'center'
      }),
      count: scene.add.rectangle(
        0, 0,
        32*5.5,
        8*3, scene.color.info[1]).setDepth(1).setOrigin(0.5, 0.5),
      cost:textObj(scene, {
        text: '$' + scene.engine.formatNumber(this.cost, this.cost%1 === 0 ? 1 : 1),
        size: scene.sizeFont*0.862,
        color: scene.color.normal[0],
        align: 'right',
        depth: 2,
        orig: [1, 0.5]
      }),
      info: textObj(scene, {
        text: 'Lv' + 0 + ' / ' + '₱1',
        size: scene.sizeFont*0.762,
        color: scene.color.disabled[0],
        align: 'right',
        depth: 2,
        orig: [0.5, 0.5]
      }),
      
      //Damn lazy to compute all of it by hand lol
      progress: scene.add.rectangle(
        96/2.4,
        (64-8)/2.75,
        32*5.5,
        8*3, scene.color.info[1]).setDepth(1).setOrigin(0.5, 0.5),
      
      setPos: function(_this, y) {
        scene.align.placeAt(scene.align.centerX, y, _this.ui.placeholder);
        scene.align.placeAt(scene.align.centerX-3, y, _this.ui.avatar_bg);
        scene.align.placeAt(scene.align.centerX-3, y, _this.ui.avatar);
        scene.align.placeAt(scene.align.centerX-2.125, y-1, _this.ui.newIndicator);
        //scene.align.placeAt(scene.align.centerX-3, y+0.72, _this.ui.avatar_count_text);
        scene.align.placeAt(3, y-0.25, _this.ui.avatar_count_text);
        scene.align.placeAt(3, y-0.859, _this.ui.name);
        scene.align.placeAt(8.5, y-0.5, _this.ui.cost);
        
        _this.ui.progress.setPosition(40+_this.ui.placeholder.x, 20.363636+_this.ui.placeholder.y);
        _this.ui.info.setPosition(_this.ui.progress.x, _this.ui.progress.y);
        if (_this.ui.progress_bg) _this.ui.progress_bg.setPosition(_this.ui.progress.x, _this.ui.progress.y);
      },
      tween: function(config) {
        if (config.x || config.y) {
          _scene.tweens.add({
            targets: config.target,
            y: config.y,
            duration: config.duration,
            ease: config.ease || 'Linear',
            onUpdate: function (tweens) {
              config.person.ui.setPos(config.person, tweens.targets[0].y);
            },
            onComplete: function(tweens) {
              //_data.tapper.resetInteractive();
            }
          });
        }
        if (config.width || config.height) {
          _scene.tweens.add({
            targets: config.target,
            width: config.width || config.person.ui.placeholder.width,
            height: config.height || config.person.ui.placeholder.height,
            duration: config.duration,
            ease: config.ease || 'Linear',
            onUpdate: function (tweens) {
              config.person.ui.placeholder.resize(tweens.targets[0].width, tweens.targets[0].height);
            },
            onComplete: function() {
              if (config.function) config.function();
            }
          });
        }
      }
    };
    
    this.tweenNew = scene.tweens.timeline({
      targets: this.ui.newIndicator,
      //yoyo: true,
      repeat: -1,
      repeatDelay: 2000,
      tweens: [{
        targets: this.ui.newIndicator,
        y: '-=5',
        ease: 'Cubic',
        duration: 200,
      },
      {
        targets: this.ui.newIndicator,
        y: '+=5',
        ease: 'Elastic',
        duration: 200,
      }],
    });
    
    this.ui.newIndicator.setVisible(false);
    this.ui.newIndicator.hasVisited = false;
    
    this.ui.description.setVisible(false);
    
    this.ui.placeholder.setVisible(false);
    this.ui.placeholder.setVisible(true);
    
    this.ui.progressWidth = this.ui.progress.width;
    this.ui.progress.setInteractive().on('pointerup', this.unlock, this);
    
    let length = 170*scene.scaleFont;
    if (this.ui.name.width > length) {
      let size = scene.sizeFont;
      while (this.ui.name.width > length) {
        size -= 1;
        this.ui.name.setStyle({fontSize: size, fontFamily: 'Gaegu'});
        if (size < 1) break;
      }
    }
    
    this.position = _.position+0.25;
    //this.placement = position * scene.align.config.cols;
    
    _scene.align.placeAt(4.5, 13.75, this.ui.count);
    this.ui.count_text.setPosition(this.ui.count.x, this.ui.count.y);
    
    this.ui.count.setVisible(false);
    this.ui.count_text.setVisible(false);
    
    this.ui.setPos(this, this.position);
    
    if (this.id === 0) {
      this.lock(scene);
      this.hidden = false;
    } else {
      this.hide();
      this.hidden = true;
    }
  }
  
  lock(scene) {
    // Set text
    this.ui.name.setText('UNKNOWN');
    this.ui.info.setText('Discover');
    
    // Set tint
    this.ui.placeholder.setTint(0x847f7f);
    this.ui.avatar.setTintFill(0x847f7f);
    
    // Set text color
    this.ui.info.setColor(_scene.color.info[0]);
    this.ui.name.setColor(_scene.color.disabled[0]);
  }
  
  hide() {
    for (const ui in this.ui) {
      if (typeof this.ui[ui] == 'object')
        this.ui[ui].setVisible(false);
    }
  }
  
  show() {
    for (const ui in this.ui) {
      if (typeof this.ui[ui] == 'object' && ui != 'description' && ui != 'count' && ui != 'count_text' && !this.hidden)
        if (ui == 'newIndicator') {
          if (!this.ui[ui].hasVisited && this.bought) this.ui[ui].setVisible(true);
        }
      else this.ui[ui].setVisible(true);
    }
  }
  
  discover(bool) {
    if (this.bought) {
      if (bool) {
        this.canUpgrade = true;
        if (!this.onUpgradeDown)
          this.ui.count.setFillStyle(_scene.color.normal[1]);
      } else {
        if (!this.onUpgradeDown)
          this.ui.count.setFillStyle(_scene.color.info[1]);
        this.canUpgrade = false;
      }
    } else {
      if (bool) {
        this.discoverable = true;
        this.ui.progress.setFillStyle(_scene.color.primary[1]);
        this.ui.info.setColor(_scene.color.disabled[0]);
      } else {
        this.discoverable = false;
        this.ui.progress.setFillStyle(_scene.color.info[1], 0.5);
      }
    }
  }
  
  unlock() {
    if (!this.discoverable) {
      _scene.sfx_button_disabled.play();
      return;
    }
    
    _scene.sfx_button_upgrade.play();
    
    let next = _data.people[this.id+1];
    
    if (next) {
      next.lock();
      next.hidden = false;
      if (next.page == _data.page.current) {
        next.show();
      }
    }
    
    _data.page.count++;
    if ((_data.page.count-1) % 4 === 0) _data.buttons.page_next.unlocked();
    
    this.level++;
    
    let count = 0;
    _data.people.forEach(person => count += person.level);
    _data.display.soul_text.setText(count > 1 ? formatValue(count, 0) + ' SOULS' : count + ' SOUL');
    
    this.ui.avatar_bg.clearTint();
    
    this.ui.avatar_count_text.setText(this.level + 'x');
    
    this.producer.incrementBy((_data.count));

    if (!this.fromSave) {
      incrementCash(this.cash.cost, -this.cost);
    }
    //_scene.engine.currencies[this.cash.cost].incrementBy(-this.cost);
    _data.display.cash_text.soul.setText(setCurrency('soul'));
    
    this.ui.progress.setFillStyle(_scene.color.info[1]);
    
    this.ui.progress.removeInteractive();
    this.ui.progress_bg = this.ui.progress;
    this.ui.progress = _scene.add.rectangle(
      96/2.4,
      (64-8)/2.75,
      32*5.5,
      8*3, _scene.color.normal[1]).setDepth(1).setOrigin(0.5, 0.5);
    
    this.ui.progress.setInteractive({useHandCursor: true}).on('pointerup', this.startProcessing, this);
    this.ui.progress.setPosition(this.ui.progress.x+this.ui.placeholder.x, this.ui.progress.y+this.ui.placeholder.y);
    
    this.bought = true;
    
    this.resource.state.basePrice.amount = parseInt(this.getOutput.amount * _data.bonus);
    
    this.ui.avatar.setInteractive({useHandCursor: true})
      .on('pointerup', function() {
        if (this.isSelected) return;
        _scene.sfx_button_person.play();
        if (this.ui.newIndicator.visible) {
          this.ui.newIndicator.hasVisited = true;
          this.ui.newIndicator.setVisible(false);
        }
        this.isSelected = true;
        _data.buttons.close_people.setVisible(true);
        _data.buttons.page_next.setVisible(false);
        _data.buttons.page_previous.setVisible(false);
        _data.buttons.upgrade.setVisible(false);
        _data.buttons.manager.setVisible(false);
        
        _scene.align.placeAt(1.25, 15.5, _data.buttons.upgrade_count);
        _data.buttons.upgrade_count_text.setPosition(_data.buttons.upgrade_count.x, _data.buttons.upgrade_count.y);
        
        _data.buttons.upgrade_count.setVisible(true);
        _data.buttons.upgrade_count_text.setVisible(true);
        
        _data.people.forEach(person => {
          if (!person.hidden && person.id != this.id) person.hide();
        });
        this.ui.tween({
          target: {
            height: this.ui.placeholder.height,
            width: this.ui.placeholder.width,
            y: this.position
          },
          // width: game.config.width-6-32,
          height: 384-14,
          y: 4.25,
          duration: 100,
          ease: 'Cubic.out',
          person: this,
          function: function() {
            _data.people.forEach(person => {
              if (person.isSelected) {
                _scene.align.placeAt(0, 5.75, person.ui.description);
                person.ui.description.setPosition(game.cW-person.ui.description.width/2, person.ui.description.y);
                person.ui.description.setVisible(true);
                
                person.ui.count.setVisible(true);
                person.ui.count_text.setVisible(true);
                
                _data.display.text_refresh();
              }
            });
          }
        });
      }, this);
    
    this.ui.count.setInteractive({useHandCursor: true})
      .on('pointerdown', function() {
        if (!this.canUpgrade) {
          popupText(_scene, {
            x: this.ui.count.x,
            y: this.ui.count.y,
            offset: 32,
            text: 'Cost $' + formatValue(this.producer.calculateCost(_data.count).price) + ' to capture',
            color: _scene.color.normal[0],
            bg: _scene.color.error[0],
            duration: 1500,
            ease: 'Cubic.out',
            padding: { x: 8, y: 8 }
          });
        }
        else {
          this.onUpgradeDown = true;
          this.ui.count.setFillStyle(_scene.color.primary[1]);
        }
      }, this)
      .on('pointerout', function() {
        this.ui.count.setFillStyle(_scene.color.success[1]);
        this.onUpgradeDown = false;
      }, this)
      .on('pointerup', function() {
        this.ui.count.setFillStyle(_scene.color.success[1]);
        this.onUpgradeDown = false;
        
        if (this.canUpgrade) {
          _scene.sfx_button_upgrade.play();
          
          _data.display.text_refresh();
          
          let count = 0;
          _data.people.forEach(person => count += person.level);
          _data.display.soul_text.setText(count > 1 ? formatValue(count, 0) + ' SOULS' : count + ' SOUL');
          
          popupText(_scene, {
            x: this.ui.count.x,
            y: this.ui.count.y,
            offset: 32,
            text: 'New Soul Captured +1',
            bg: _scene.color.primary[0],
            color: _scene.color.disabled[0],
            duration: 1000,
            ease: 'Cubic.easeInOut',
            padding: { x: 8, y: 8 }
          });
          this.cost =  this.producer.calculateCost(_data.count).price;
          incrementCash(this.cash.cost, -this.cost);
          _data.display.cash_text.soul.setText(setCurrency('soul'));
          
          this.producer.incrementBy(_data.count);
          this.level += _data.count;
          this.ui.avatar_count_text.setText(this.level + 'x');
          this.ui.cost.setText('$' + formatValue(this.producer.calculateCost(_data.count).price));
          
          this.getMilestone();
          
          if (this.isProcessing)
            this.ui.info.setText('SOUL IS FILLING / ₱' + formatValue(this.resource.calculatePrice(this.producer.count).amount));
          else if (this.manager.state.count > 0)
            this.ui.info.setText('AUTO-COLLECTING / ₱' + formatValue(this.resource.calculatePrice(this.producer.count).amount));
          else if (!this.claim)
            this.ui.info.setText('PROCESS / ₱' + formatValue(this.resource.calculatePrice(this.producer.count).amount));
          else
            this.ui.info.setText('COLLECT / ₱' + formatValue(this.resource.calculatePrice(this.producer.count).amount));
        } else
          _scene.sfx_button_disabled.play();
      }, this);
    
    this.ui.newIndicator.setVisible(true);
    
    // Set text
    this.ui.name.setText(this.name);
    this.ui.cost.setText('$' + formatValue(this.producer.calculateCost(_data.count).price));
    this.ui.info.setText('PROCESS / ₱' + formatValue(this.resource.calculatePrice(this.producer.count).amount));
    
    // Clear tint
    this.ui.placeholder.clearTint();
    this.ui.avatar.clearTint();
    
    // Set text color
    this.ui.name.setColor(_scene.color.normal[0]);
    this.ui.avatar_count_text.setColor(_scene.color.normal[0]);
    this.ui.info.setColor(_scene.color.disabled[0]);
    this.ui.progress.setFillStyle(_scene.color.normal[1]);
  }
  
  startProcessing() {
    let producer = this.producer;
    if (this.isProcessing && this.manager.count <= 0) return;
    
    if (producer.count) {
      _scene.sfx_coin_claim.play();
      _data.display.level_bar_update();
      
      this.isProcessing = true;
      this.ui.progress.setFillStyle(_scene.color.normal[1]);
      
      this.tweenProgress(_scene);
      
      this.ui.info.setText('SOUL IS FILLING / ₱' + formatValue(this.resource.calculatePrice(this.producer.count).amount));
      
      if (this.claim) {
        incrementCash('peso', this.claim);
        _data.display.cash_text[this.cash.output].setText(setCurrency(this.cash.output));
        
        this.claim = undefined;
      }
      producer.processingEnabled = true;
    }
  }
  
  tweenProgress(scene) {
    this.ui.progress.width = 0;
    scene.tweens.add({
      targets: this.ui.progress,
      width: this.ui.progressWidth,
      duration: this.getOutput.time,
      onComplete: function() {
        if (this.manager.count == 1) {
          //this.producer.processingEnabled = false;
          this.startProcessing();
          this.ui.progress.removeInteractive();
          this.ui.info.setText('AUTO-COLLECTING / ₱' + formatValue(this.resource.calculatePrice(this.producer.count).amount));
        } else
          this.ui.info.setText('COLLECT / ₱' + formatValue(this.resource.calculatePrice(this.producer.count).amount));
        
        this.isProcessing = false;
        
        this.ui.progress.setFillStyle(_scene.color.primary[1]);
        //}
      },
      onCompleteScope: this
    });
  }
  
  getMilestone() {
    let count = 0;
    for (let i = this.milestone.length-1; i >= 0; i--) {
      if (this.level >= this.milestone[i]) {
        count++;
        this.milestone.shift();
      }
    }
    if (count > 0) {
      _scene.sfx_bonus.play();
      popupText(_scene, {
        x: this.ui.placeholder.x,
        y: this.ui.placeholder.y,
        //offset: 32,
        text: 'Reduced processing time',
        bg: _scene.color.success[0],
        color: _scene.color.disabled[0],
        duration: 1000,
        ease: 'Cubic.easeInOut',
        padding: { x: 8, y: 8 }
      });
      this.getOutput.time /= (this.timeFactor*count)+1;
      this.producer.outputs.resources[this.key].productionTime = this.getOutput.time;
    }
  }
}