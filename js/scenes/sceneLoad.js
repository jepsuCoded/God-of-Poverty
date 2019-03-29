class SceneLoad extends Phaser.Scene {
  constructor() {
    super('SceneLoad');
  }
  
  preload() {
    this.load.image('ui_people', 'img/ui/ui_people.png');
    this.load.image('ui_statusbar', 'img/ui/ui_statusbar.png');
    this.load.image('ui_navbar', 'img/ui/ui_navbar.png');
    this.load.spritesheet('ui_nineslice', 'img/ui/ui_nineslice.png', {frameWidth: 96, frameHeight: 96});
    
    this.load.image('people_beggar', 'img/people/beggar.png');
    
    this.load.image('god_avatar', 'img/god_avatar.png');
    this.load.image('button_hand_pick', 'img/buttons/button_hand_pick.png');
    this.load.image('button_close', 'img/buttons/button_close.png');
    
    this.load.image('ui_placeholder', 'img/ui/ui_placeholder.png');
    this.load.image('ui_cash_holder', 'img/ui/ui_cash_holder.png');
    
    
    this.load.spritesheet('button_icons', 'img/buttons/button_icons.png', {frameWidth: 48, frameHeight: 48});
    this.load.spritesheet('navbar_mustache', 'img/buttons/navbar_mustache.png', {frameWidth: 32*4, frameHeight: 64});
    this.load.spritesheet('navbar_manager', 'img/buttons/navbar_manager.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('navbar_upgrade', 'img/buttons/navbar_upgrade.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('icon_currencies', 'img/icons/icon_currencies.png', {frameWidth: 32, frameHeight: 40});
  }
  
  create() {
    this.scene.start('SceneMain');
  }
}