class Person extends Phaser.GameObjects.Image {
  constructor(scene, _) {
    super (scene, 0, 0, 'ui_people');
    
    this.id = _.id;
    this.name = _.name;
    this.value = _.value;
    this.cost = _.cost;
    this.costFactor = _.costFactor;
    this.level = 0;
    this.output = {
      amount: _.output.amount,
      time: _.output.time
    };
    
    this.color = scene.color;
    
    this.avatar = scene.add.image(0, 0, _.image).setDepth(1);
    this.ui = {
      name: scene.add.text(0, 0, this.name, {
        fontSize: 21,
        color: this.color.normal,
        fontFamily: 'Gaegu',
      }).setDepth(1).setOrigin(0, 0.5),
      cost: scene.add.text(0, 0, '$ ' +scene.engine.formatNumber(this.cost, this.cost%1 === 0 ? 0 : 1), {
        fontSize: 16,
        color: this.color.normal,
        fontFamily: 'Gaegu',
        align: 'right'
      }).setDepth(2).setOrigin(1, 0.5),
      
      info: scene.add.text(0, 0, 'Lv' + 0 + ' / ' + '₱1', {
        fontSize: 16,
        color: this.color.disabled,
        fontFamily: 'Gaegu',
        align: 'right'
      }).setDepth(2).setOrigin(0.5, 0.5),
      
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
        8*3, 0xbcb19f).setDepth(1).setOrigin(0.5, 0.5)
    };
    //this.ui.progressInfo.fillStyle(0xbcb19f);
    //this.ui.progressInfo.fillRectShape(this.ui.progress);
    this.ui.progress.setInteractive().on('pointerup', this.unlock, this)
    
    let length = 126;
    if (this.ui.name.width > length) {
      let size = 21;
      while (this.ui.name.width > length) {
        size -= 0.1;
        this.ui.name.setStyle({fontSize: size});
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
    }).setDepth(10);
  }
  
  discover(bool) {
    if (bool) {
      this.discoverable = true;
      this.ui.progress.setVisible(true);
      this.ui.info.setColor(this.color.disabled);
    } else {
      this.discoverable = false;
      this.ui.progress.setVisible(false);
      //this.ui.info.setColor(this.color.info);
    }
  }
  
  unlock() {
    
    console.log('test')
    if (!this.discoverable) return;
      
      // Set text
    this.ui.name.setText(this.name);
    this.ui.info.setText('Lv' + this.level + '/₱' + this.output.amount);
    
    // Clear tint
    this.clearTint();
    this.avatar.clearTint();
    
    // Set text color
    this.ui.name.setColor(this.color.normal);
    this.ui.info.setColor(this.color.disabled);
  }
}