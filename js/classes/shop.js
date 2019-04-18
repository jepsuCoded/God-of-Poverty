class ShopItem {
  constructor(_) {
    
    this.shop = _.shop;
    this.id = _.id;
    this.level = _.level;
    this.cost = _.cost;
    this.costFactor = _.costFactor || 0;
    this.name = _.name;
    this.levelRequire = _.levelRequire;
    
    this.callback = _.callback;
    
    this.page = _.page;
    
    this.position = _.position;
    
    this.lock = textObj(_scene, {
      text: 'LOCKED',
      orig: [0.5, 0.5],
      depth: 5,
      color: _scene.color.info[0],
      //bg: _scene.color.disabled[0],
      //padding: {x: 112, y: 24},
      align: 'center'
    });
    this.lockBg = _scene.add.rectangle(
      0,
      0,
      game.config.width-48,
      64, _scene.color.disabled[1]).setDepth(4).setOrigin(0.5, 0.5);
    this.lockBg.setStrokeStyle(2, _scene.color.info[1]);
    this.ui = {
      icon: _scene.add.image(0, 0, _.icon)
        .setDepth(6).setOrigin(0.5, 0.5),
      icon_holder: _scene.add.image(0, 0, 'ui_avatar_bg')
        .setDepth(5).setOrigin(0.5, 0.5),
      name: textObj(_scene, {
        text: this.shop == 'upgrade' && this.level !== 0? 'Lv.1 ' : '' + this.name,
        color: _scene.color.normal[0],
        orig: [0, 0.5],
        depth: 5
      }),
      info: textObj(_scene, {
        text: _.description,
        color: _scene.color.normal[0],
        orig: [0, 0.5],
        depth: 5
      }),
      cost: textObj(_scene, {
        text: typeof this.cost === 'number' ? '₱' + formatValue(_.cost) : this.cost,
        color: _scene.color.normal[0],
        orig: [0.5, 0.5],
        align: 'center',
        depth: 6
      }),
      button: _scene.add.rectangle(
        96/2.4+8,
        (64-8)/2.75,
        32*6,
        8*3, _scene.color.info[1]).setDepth(5).setOrigin(0.5, 0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerdown', () => {
          this.onDown = true;
          this.ui.button.setFillStyle(_scene.color.primary[1]);
          this.ui.cost.setColor(_scene.color.disabled[0]);
        })
        .on('pointerout', () => {
          this.ui.button.setFillStyle(_scene.color.info[1]);
          this.onDown = false;
          this.ui.cost.setColor(_scene.color.normal[0]);
        })
        .on('pointerup', () => {
          this.ui.button.setFillStyle(_scene.color.info[1]);
          this.ui.cost.setColor(_scene.color.normal[0]);
          if (this.onDown) {
            if (typeof this.cost == 'string') {
              this.callback();
              _scene.sfx_button_upgrade.play();
            }
            else if(_scene.engine.currencies.peso.value - (this.cost * Math.pow(this.costFactor, this.level+_data.count)) >= 0) {
              if (_scene.tutorial && _scene.tutorial_2) {
                _scene.tutorial_3();
              }
              _scene.sfx_button_upgrade.play();
              popupText(_scene, {
                x: this.ui.button.x,
                y: this.ui.button.y,
                offset: 32,
                text: this.shop == 'upgrade' ? 'Level Up!' : 'Manager Hired!',
                bg: _scene.color.success[0],
                color: _scene.color.disabled[0],
                duration: 1500,
                ease: 'Cubic.easeInOut',
                padding: { x: 8, y: 8 }
              });
              
              this.callback();
              
              if (this.shop === 'upgrade') {
                if (typeof this.cost === 'string') return;
                let cost = this.cost;
                let totalCost = cost;
                for (let i = 1; i <= _data.count; i++) {
                  if (_data.count == 1) continue;
                  cost *= this.costFactor;
                  totalCost += cost;
                }
                incrementCash('peso', -totalCost);
                this.cost = totalCost;
                this.cost *= this.costFactor;
                
                this.level += _data.count;
                
                cost = this.cost;
                totalCost = cost;
                for (let i = 1; i <= _data.count; i++) {
                  if (_data.count == 1) continue;
                  cost *= this.costFactor;
                  totalCost += cost;
                }
                
                this.ui.name.setText('Lv.' + this.level + ' ' + this.name);
                this.ui.cost.setText('₱' + formatValue(totalCost));
              }
            } else {
              if (typeof this.cost === 'string') return;
              _scene.sfx_button_disabled.play();
              popupText(_scene, {
                x: this.ui.button.x,
                y: this.ui.button.y,
                offset: 32,
                text: 'Cost ₱' + formatValue(this.cost * Math.pow(this.costFactor, this.level+_data.count)) + ' to upgrade',
                bg: _scene.color.error[0],
                color: _scene.color.normal[0],
                duration: 1000,
                ease: 'Cubic.easeInOut',
                padding: { x: 8, y: 8 }
              });
            }
          }
        }),
    };
    
    this.lock.setVisible(false);
    this.lockBg.setVisible(false);
    this.hide();
    
    _scene.align.placeAt(4.5, this.position, this.lock);
    this.lockBg.setPosition(this.lock.x, this.lock.y);
    
    _scene.align.placeAt(1.25, this.position, this.ui.icon);
    _scene.align.placeAt(1.25, this.position, this.ui.icon_holder);
    this.ui.icon.setTint(_scene.color.normal[1]);
    _scene.align.placeAt(2.75, this.position-0.859, this.ui.name);
    _scene.align.placeAt(2.75, this.position-0.25, this.ui.info);
    let pos = {
      x: this.ui.button.x,
      y: this.ui.button.y
    };
    this.ui.button.setPosition(64-16+pos.x+this.ui.info.x, pos.y+this.ui.info.y+8);
    pos = {
      x: this.ui.button.x,
      y: this.ui.button.y
    };
    this.ui.cost.setPosition(pos.x, pos.y);
  }
  
  toggleVisibility(toggle) {
    if (toggle && this.page == _data.shop.page[this.shop].current) {
      for (const obj in this.ui) {
        this.ui[obj].setVisible(toggle);
      }
      if (this.shop == 'manager' && !_data.people[this.id].bought) {
        this.hide();
        this.lock.setVisible(true);
        this.lockBg.setVisible(true);
      }
      if (this.shop == 'upgrade' && this.levelRequire) {
        this.hide();
        this.lock.setVisible(true);
        this.lockBg.setVisible(true);
        this.lock.setText('Requires Level ' + this.levelRequire);
      }
    } else if (!toggle && this.page != _data.shop.page[this.shop].current) {
      for (const obj in this.ui) {
        this.lock.setVisible(false);
        this.lockBg.setVisible(false);
        this.ui[obj].setVisible(toggle);
      }
    }
  }
  
  hide() {
    _data.count = 1;
    _data.buttons.upgrade_count_text.setText('+' + _data.count);
    _data.people.forEach(person => {
      person.ui.cost.setText('$' + formatValue(person.producer.calculateCost(_data.count).price));
    });
    _data.shop.upgrade.forEach(item => {
      if (typeof item.cost == 'number') {
        item.ui.cost.setText('₱' + formatValue(item.cost));
      }
    });
    
    for (const obj in this.ui) {
      this.lock.setVisible(false);
      this.lockBg.setVisible(false);
      this.ui[obj].setVisible(false);
    }
  }
}
