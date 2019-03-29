class Person extends Phaser.GameObjects.Image {
  constructor(scene, _) {
    super (scene, 0, 0, 'ui_people');
    this.setScrollFactor(0);
    this.id = _.id;
    this.name = _.name;
    this.description = _.description;
    this.cost = _.cost;
    this.cash = {
      cost: 'soul',
      output: 'peso'
    }
    this.costFactor = _.costFactor;
    this.level = 0;
    this.getOutput = {
      amount: _.getOutput.amount,
      time: _.getOutput.time
    };
    
    this.ui = {
      avatar: scene.add.image(0, 0, _.image).setDepth(1),
      name: textObj(scene, {
        text: this.name,
        size: scene.sizeFont,
        color: scene.color.normal[0],
        depth: 1,
        orig: [0, 0.5]
      }),
      cost:textObj(scene, {
        text: '$' + scene.engine.formatNumber(this.cost, this.cost%1 === 0 ? 1 : 1),
        size: scene.sizeFont*0.762,
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
        8*3, scene.color.normal[1]).setDepth(1).setOrigin(0.5, 0.5)
    };
    
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
    let position = _.position+0.25;
    this.placement = position * scene.align.config.cols;
    
    scene.align.placeAt(scene.align.centerX, position, this);
    scene.align.placeAt(scene.align.centerX-3, position, this.ui.avatar);
    //scene.align.placeAtIndex(scene.align.centerX+this.placement, this);
    //scene.align.placeAtIndex(scene.align.centerX+this.placement-3, this.ui.avatar);
    scene.align.placeAt(3, position-0.5, this.ui.name);
    scene.align.placeAt(8.5, position-0.5, this.ui.cost);
    
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
    this.ui.avatar.setTintFill(0x847f7f);
    
    this.ui.progress.setVisible(false);
    
    // Set text color
    this.ui.info.setColor(_scene.color.info[0]);
    this.ui.name.setColor(_scene.color.disabled[0]);
  }
  
  hide(scene) {
    this.ui_hide = new Bar({
      scene: scene,
      color: scene.color.disabled[1],
      opacity: 1,
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y
    }).setDepth(2);
  }
  
  discover(bool) {
    if (this.bought) return;
    
    if (bool) {
      this.discoverable = true;
      this.ui.progress.setVisible(true);
      this.ui.progress.setFillStyle(_scene.color.success[1]);
      this.ui.info.setColor(_scene.color.disabled[0]);
    } else {
      this.discoverable = false;
      this.ui.progress.setVisible(false);
    }
  }
  
  unlock() {
    if (!this.discoverable) return;
    
    let next = _data.people[this.id+1];
    if (next) {
      next.hidden = false;
      next.ui_hide.destroy();
      next.lock();
    }
    
    this.level++;
    
    this.producer.incrementBy(1);
    _scene.engine.currencies[this.cash.cost].incrementBy(-this.cost);
    
    this.ui.progress.destroy();
    this.ui.progress = _scene.add.rectangle(
      96/2.4,
      (64-8)/2.75,
      32*5.5,
      8*3, _scene.color.normal[1]).setDepth(1).setOrigin(0.5, 0.5);
    
    this.ui.progress.setInteractive({useHandCursor: true}).on('pointerup', this.startProcessing, this);
    this.ui.progress.setPosition(this.ui.progress.x+this.x, this.ui.progress.y+this.y);
    
    this.bought = true;
    
    // Set text
    this.ui.name.setText(this.name);
    this.ui.info.setText('Collect / ₱' + this.resource.calculatePrice(this.producer.count).amount);
    
    // Clear tint
    this.clearTint();
    this.ui.avatar.clearTint();
    
    // Set text color
    this.ui.name.setColor(_scene.color.normal[0]);
    this.ui.cost.setText('$' + this.producer.calculateCost(1).price, 1);
    this.ui.info.setColor(_scene.color.disabled[0]);
    this.ui.progress.setFillStyle(_scene.color.normal[1]);
  }
  
  startProcessing() {
    let producer = this.producer;
    if (this.isProcessing) return;
    
    if (producer.count) {
      _data.display.level_bar_update();
      
      this.isProcessing = true;
      this.ui.progress.setFillStyle(_scene.color.normal[1]);
      
      this.tweenProgress(_scene);
      
      this.ui.info.setText(this.level + 'x / ₱' + this.resource.calculatePrice(this.producer.count).amount);
      
      if (this.claim) {
        _scene.engine.currencies[this.cash.output].incrementBy(this.claim);
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
      onComplete: function() {/*
        if (this.producer.processingEnabled) {
          console.log(this.getOutput.time);
          this.producer.processingEnabled = false;
          this.startProcessing();
        } else {*/
          this.isProcessing = false;
        
          this.ui.progress.setFillStyle(_scene.color.primary[1]);
          this.ui.info.setText('CLAIM / ₱' + this.resource.calculatePrice(this.producer.count).amount);
        //}
      },
      onCompleteScope: this
    });
  }
}