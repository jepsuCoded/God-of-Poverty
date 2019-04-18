class SceneLoad extends Phaser.Scene {
  constructor() {
    super('SceneLoad');
  }
  
  preload() {
    this.bar = new Bar({
      scene: this,
      width: game.config.width,
      color: 0xbcb19f,
      height: 12,
      x: game.cW,
      y: game.config.height-8
    });
    
    this.sizeFont = 21;
    this.tempTest = this.add.text(0, -100, 'WWWWWWWWWW', {fontSize: this.sizeFont, fontFamily: 'Gaegu'});
    this.scaleFont = 121/this.tempTest.width;
    this.sizeFont *= this.scaleFont;
    
    this.color = {
      normal: ['#c4bfbf', 0xc4bfbf],
      primary: ['#bcb19f', 0xbcb19f],
      disabled: ['#3e3d4c', 0x3e3d4c],
      info: ['#847f7f', 0x847f7f],
      secondary: ['#5a5a63', 0x5a5a63],
      error: ['#c0461f', 0xc0461f],
      success: ['#84ad42', 0x84ad42],
      dark: ['#1e1d2c', 0x1e1d2c]
    };
    _scene = this;
    
    this.bg = this.add.rectangle(0, 0, game.config.width, game.config.height, this.color.disabled[1]).setOrigin(0, 0);
    
    this.load.on('progress', this.onProgress, this);
    
    this.text = textObj(_scene, {
      x: game.cW,
      y: game.config.height-24,
      text: 'Loading',
      orig: [0.5, 0.5],
      color: this.color.info[0],
      size: this.sizeFont
    });
    
    this.load.spritesheet('ui_nineslice', 'img/ui/ui_nineslice.png', {frameWidth: 96, frameHeight: 96});
    
    
    this.load.image('ui_people', 'img/ui/ui_people.png');
    this.load.image('ui_statusbar', 'img/ui/ui_statusbar.png');
    this.load.image('ui_navbar', 'img/ui/ui_navbar.png');
    
    this.disclaimer = new Dialogue({
      title: 'REPL.IT GAME JAM!',
      text: 'An entry for repl.it game jam with an optional theme of CASH, by jepsuCoded. Enjoy the game!',
      frame: 4,
    });
    
    this.load.image('people_beggar', 'img/people/beggar.png');
    this.load.image('people_sampaguita_vendor', 'img/people/sampaguita_vendor.png');
    this.load.image('people_scrap_collector', 'img/people/scrap_collector.png');
    this.load.image('people_laundress', 'img/people/laundress.png');
    this.load.image('people_street_vendor', 'img/people/street_vendor.png');
    this.load.image('people_rice_farmer',  'img/people/rice_farmer.png');
    this.load.image('people_fisherman',  'img/people/fisherman.png');
    this.load.image('people_tricycle_driver',  'img/people/tricycle_driver.png');
    
    this.load.image('button_hand_pick', 'img/buttons/button_hand_pick.png');
    this.load.image('button_close', 'img/buttons/button_close.png');
    this.load.image('button_count', 'img/buttons/button_count.png');
    
    this.load.image('ui_placeholder', 'img/ui/ui_placeholder.png');
    this.load.image('ui_cash_holder', 'img/ui/ui_cash_holder.png');
    this.load.image('ui_avatar_bg', 'img/ui/ui_avatar_bg.png');
    
    this.load.image('upgrade_tap', 'img/icons/upgrade_tap.png');
    this.load.image('upgrade_exp', 'img/icons/upgrade_exp.png');
    this.load.image('upgrade_purify', 'img/icons/upgrade_purify.png');
    
    this.load.spritesheet('button_icons', 'img/buttons/button_icons.png', {frameWidth: 48, frameHeight: 48});
    this.load.spritesheet('navbar_manager', 'img/buttons/navbar_manager.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('navbar_upgrade', 'img/buttons/navbar_upgrade.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('icon_currencies', 'img/icons/icon_currencies.png', {frameWidth: 32, frameHeight: 40});
    
    this.load.audio('bg_music', ['audio/chibi_ninja_by_eric_skiff.mp3']);
    
    this.load.audio('coin_claim', ['audio/sfx/coin_claim.mp3']);
    this.load.audio('cash_claim', ['audio/sfx/cash_claim.mp3']);
    this.load.audio('levelup', ['audio/sfx/levelup.mp3']);
    this.load.audio('button_icon', ['audio/sfx/button_icon.mp3']);
    this.load.audio('bonus', ['audio/sfx/bonus.mp3']);
    this.load.audio('button_person', ['audio/sfx/button_person.mp3']);
    this.load.audio('button_upgrade', ['audio/sfx/button_upgrade.mp3']);
    this.load.audio('button_disabled', ['audio/sfx/button_disabled.mp3']);
  }
  
  onProgress(value) {
    var per = Math.floor(value * 100);
    //this.progText.setText("Loading " + per + "%");
    this.bar.setPercent(value);
  }
  
  create() {
    this.text.setText('Tap anywhere to proceed');
    this.bar.destroy();
    this.bg.setInteractive().on('pointerup', function() {
      this.bg.removeInteractive();
      this.disclaimer.destroy();
      this.bg.setFillStyle(this.color.disabled[1]);
      this.text.setText('GOD\nOF POVERTY').setStyle({fontSize: this.sizeFont*3, align: 'center', color: this.color.primary[0], stroke: this.color.info[0], strokeThickness: 0});
      this.text.setPosition(game.cW, game.config.height*0.25);
      //this.scene.start('SceneMain');
      this.subtitle = textObj(this, {
        x: game.cW, y: game.config.height*0.35,
        text: 'Descending of Philomenus',
        orig: [0.5, 0.5],
        align: 'center',
        color: this.color.primary[0],
        size: this.sizeFont*1.2
      });
      this.foot = textObj(this, {
        x: game.cW, y: game.config.height*0.98,
        text: 'Repl.it Game Jam entry by jepsuCoded',
        orig: [0.5, 0.5],
        align: 'center',
        color: this.color.info[0],
        size: this.sizeFont
      });
      this.version = textObj(this, {
        x: game.config.width*0.98, y: game.config.height*0.02,
        text: 'v0.3.0_beta',
        orig: [1, 0.5],
        align: 'right',
        color: this.color.info[0],
        size: this.sizeFont
      });
      
      localforage.getItem('saved', (err, val) => {
        this.newGame = textObj(this, {
          x: game.cW, y: game.config.height*0.75,
          text: 'New Game',
          color: this.color.disabled[0],
          bg: this.color.info[0],
          padding: {x: 16, y: 12},
          orig: [0.5, 0.5],
          align: 'center',
          size: this.sizeFont*1.1
        });
        
        this.continueGame = textObj(this, {
          x: game.cW, y: game.config.height*0.6,
          text: 'Continue',
          color: this.color.disabled[0],
          bg: this.color.primary[0],
          padding: {x: 16+(17/2), y: 12},
          orig: [0.5, 0.5],
          align: 'center',
          size: this.sizeFont*1.1
        });
        
        if (err || !val) {
          this.continueGame.setVisible(false);
        } else {
          this.continueGame.setInteractive({useHandCursor: true})
            .on('pointerdown', function() {
              this.continueGame.setStyle({
                color: this.color.disabled[0],
                backgroundColor: this.color.normal[0]
              });
            }, this)
            .on('pointerout', function() {
              this.continueGame.setStyle({
                color: this.color.disabled[0],
                backgroundColor: this.color.primary[0]
              });
            }, this)
            .on('pointerup', function() {
              this.continueGame.setStyle({
                color: this.color.disabled[0],
                backgroundColor: this.color.primary[0]
              });
              this.scene.start('SceneMain');
            }, this);
        }
        
        this.newGame.setInteractive({useHandCursor: true})
          .on('pointerdown', function() {
            this.newGame.setStyle({
              color: this.color.disabled[0],
              backgroundColor: this.color.normal[0]
            });
          }, this)
          .on('pointerout', function() {
            this.newGame.setStyle({
              color: this.color.disabled[0],
              backgroundColor: this.color.info[0]
            });
          }, this)
          .on('pointerup', function() {
            this.newGame.setStyle({
              color: this.color.disabled[0],
              backgroundColor: this.color.info[0]
            });
            
            localforage.clear();
            _data.tutorial = true;
            this.scene.start('SceneMain');
          }, this);
      });
    }, this);
  }
}
