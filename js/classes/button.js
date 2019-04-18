class Button extends Phaser.GameObjects.Image {
  constructor(scene, config) {
    super(scene, 0, 0, config.image, config.frame || 0);
    scene.align.placeAt(config.posX, config.posY, this);
    this.setScale(config.scale || 1, config.scale || 1);
    this.setFlipX(config.flipX || false);
    this.setDepth(config.depth || 1);
    //this.setActive(config.show!==undefined?config.show:true);
    this.setVisible(config.show!==undefined?config.show:true);
    this.isPushed = false;
    this.isLocked = false;
    this.setInteractive({useHandCursor: true})
      .on('pointerdown', function() {
        if (this.isLocked) return;
        _scene.sfx_button_icon.play();
        this.setTint(scene.color.info[1]);
        this.y += 1;
        this.isPushed = true;
      }, this)
      .on('pointerup', function() {
        if (!this.isPushed) return;
        this.y -= 1;
        
        this.clearTint();
        this.isPushed = false;
        if (config.function) config.function();
      }, this)
      .on('pointerout', function() {
        if (!this.isPushed) return;
        this.y -= 1;
        
        this.isPushed = false;
        this.clearTint();
      }, this);
    scene.add.existing(this);
  }
  
  locked(scene, color = _scene.color.secondary[1]) {
    this.isLocked = true;
    this.setTint(color);
  }
  
  unlocked() {
    this.isLocked = false;
    this.clearTint();
  }
}
