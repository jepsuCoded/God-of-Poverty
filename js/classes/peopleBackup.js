class Person extends Phaser.GameObjects.Image {
  constructor(scene, _) {
    super (scene, 0, 0, 'ui_people');
    this.setScrollFactor(0);
    this.id = _.id;
    this.name = _.name;
    this.description = _.description;
    this.cost = _.cost;
    this.costFactor = _.costFactor;
    this.level = 0;
    this.output = {
      amount: _.output.amount,
      time: _.output.time
    };
    
    this.color = scene.color;
    this.graphicColor = {
      green: 0x84ad52,
      red: 0xc0461f,
      normal: 0xbcb19f,
      info: 0xcead73
    };
    
    this.avatar = scene.add.image(0, 0, _.image).setDepth(1).setScrollFactor(0);
    this.ui = {
      name: scene.add.text(0, 0, this.name, {
        fontSize: scene.sizeFont,
        color: this.color.normal,
        fontFamily: 'Gaegu',
      }).setDepth(1).setOrigin(0, 0.5).setScrollFactor(0),
      cost: scene.add.text(0, 0, '$' + scene.engine.formatNumber(this.cost, this.cost%1 === 0 ? 1 : 1), {
        fontSize: scene.sizeFont*0.762,
        color: this.color.normal,
        fontFamily: 'Gaegu',
        align: 'right'
      }).setDepth(2).setOrigin(1, 0.5).setScrollFactor(0),
      
      info: scene.add.text(0, 0, 'Lv' + 0 + ' / ' + '₱1', {
        fontSize: scene.sizeFont*0.762,
        color: this.color.disabled,
        fontFamily: 'Gaegu',
        align: 'right'
      }).setDepth(2).setOrigin(0.5, 0.5).setScrollFactor(0),
      
      //Damn lazy to compute all of it by hand lol
      /*progress: new Bar({
        scene: scene,
        color: 0xbcb19f,
        opacity: 1,
        width: 32*5.5,
        height: 8*3,
        x: 96/2.4,
        y: (64-8)/2.75
      })*/
      progress: scene.add.rectangle(
        96/2.4,
        (64-8)/2.75,
        32*5.5,
        8*3, this.graphicColor.normal).setDepth(1).setOrigin(0.5, 0.5).setScrollFactor(0)
    };
    //this.ui.progressInfo.fillStyle(0xbcb19f);
    //this.ui.progressInfo.fillRectShape(this.ui.progress);
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
    
    scene.add.existing(this);
    
    this.placement = _.position * scene.align.config.cols;
    
    scene.align.placeAtIndex(scene.align.centerX+this.placement, this);
    scene.align.placeAtIndex(scene.align.centerX+this.placement-3, this.avatar);
    scene.align.placeAt(3, _.position-0.5, this.ui.name);
    scene.align.placeAt(8.5, _.position-0.5, this.ui.cost);
    
    this.ui.progress.setPosition(this.ui.progress.x+this.x, this.ui.progress.y+this.y);
    this.ui.info.setPosition(this.ui.progress.x, this.ui.progress.y);
    
    if (this.id === 0) {
      this.lock(scene);
      this.hidden = false;
    } else {
      this.hide(scene);
      this.hidden = true;
    }
  }
  
  lock(scene) {
    // Set text
    this.ui.name.setText('UNKNOWN');
    this.ui.info.setText('Discover');
    
    // Set tint
    this.setTint(0x847f7f);
    this.avatar.setTintFill(0x847f7f);
    
    this.ui.progress.setVisible(false);
    
    // Set text color
    this.ui.info.setColor(this.color.info);
    this.ui.name.setColor(this.color.disabled);
  }
  
  hide(scene) {
    this.ui_hide = new Bar({
      scene: scene,
      color: 0x3e3d4c,
      opacity: 1,
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y
    }).setDepth(2).setScrollFactor(0);
  }
  
  discover(bool) {
    if (this.bought) return;
    
    if (bool) {
      this.discoverable = true;
      this.ui.progress.setVisible(true);
      this.ui.progress.setFillStyle(this.graphicColor.green);
      this.ui.info.setColor(this.color.disabled);
    } else {
      this.discoverable = false;
      this.ui.progress.setVisible(false);
      //this.ui.info.setColor(this.color.info);
    }
  }
  
  unlock() {
    if (!this.discoverable) return;
    
    let next = _scene.people.ui[this.id+1];
    if (next) {
      next.hidden = false;
      next.ui_hide.destroy();
      next.lock();
    }
    
    this.level++;
    
    _scene.people.producer[this.id].incrementBy(1);
    _scene.engine.currencies.soul.incrementBy(-this.cost);
    
    this.ui.progress.destroy();
    this.ui.progress = _scene.add.rectangle(
      96/2.4,
      (64-8)/2.75,
      32*5.5,
      8*3, this.graphicColor.normal).setDepth(1).setOrigin(0.5, 0.5);
    
    this.ui.progress.setInteractive().on('pointerup', this.startProcessing, this);
    this.ui.progress.setPosition(this.ui.progress.x+this.x, this.ui.progress.y+this.y);
    
    this.bought = true;
    
    // Set text
    this.ui.name.setText(this.name);
    this.ui.info.setText('Collect / ₱' + _scene.people.resource[this.id].calculatePrice(game.c_scenee.producer[this.id].count).amount);
    
    // Clear tint
    this.clearTint();
    this.avatar.clearTint();
    
    // Set text color
    this.ui.name.setColor(this.color.normal);
    this.ui.cost.setText('$' + _scene.engine.formatNumber(game.c_scenee.producer[this.id].calculateCost(1).price, 1));
    this.ui.info.setColor(this.color.disabled);
    this.ui.progress.setFillStyle(this.graphicColor.normal);
  }
  
  startProcessing() {
    let producer = _scene.people.producer[this.id];
    if (producer.count && !producer.processingEnabled) {
      this.ui.progress.setFillStyle(this.graphicColor.normal);
      
      this.tweenProgress(_scene)
      
      this.ui.info.setText(this.level + 'x / ₱' + _scene.people.resource[this.id].calculatePrice(game.c_scenee.producer[this.id].count).amount);
      
      if (this.claim) _scene.engine.currencies.soul.incrementBy(this.claim);
      producer.processingEnabled = true;
    }
  }
  
  tweenProgress(scene) {
    this.ui.progress.width = 0
    scene.tweens.add({
      targets: this.ui.progress,
      width: this.ui.progressWidth,
      duration: this.output.time,
      onComplete: function() {
        if (scene.people.producer[this.id].processingEnabled) {
          scene.people.producer[this.id].processingEnabled = false;
          this.startProcessing();
        } else {
          this.ui.progress.setFillStyle(this.graphicColor.info);
          this.ui.info.setText('CLAIM / ₱' + _scene.people.resource[this.id].calculatePrice(game.c_scenee.producer[this.id].count).amount);
        }
      },
      onCompleteScope: this
    });
  }
}