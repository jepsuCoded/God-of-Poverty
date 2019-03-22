class SceneLoad extends Phaser.Scene {
  constructor() {
    super('SceneLoad');
  }
  
  preload() {
    this.load.image('ui_people', 'img/ui/ui_people.png');
    this.load.image('ui_statusbar', 'img/ui/ui_statusbar.png');
    this.load.image('ui_navbar', 'img/ui/ui_navbar.png');
    
    this.load.image('people_beggar', 'img/people/beggar.png');
    
    this.load.image('god_avatar', 'img/god_avatar.png');
    
    
    this.load.spritesheet('navbar_mustache', 'img/buttons/navbar_mustache.png', {frameWidth: 32*4, frameHeight: 64});
    this.load.spritesheet('navbar_manager', 'img/buttons/navbar_manager.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('navbar_upgrade', 'img/buttons/navbar_upgrade.png', {frameWidth: 32, frameHeight: 32});
  }
  
  create() {
    this.scene.start('SceneMain');
  }
}