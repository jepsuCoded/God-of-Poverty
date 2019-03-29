var game, _scene;
var _data = {
  cash: { soul: 0, peso: 0 },
  tapper: { count: 0.1 },
  people: [],
  upgrade: {
    tapper: 1,
    people: []
  },
  milestone: {
    tapper: [10, 20, 50, 100],
    people: [10, 20, 50, 100]
  }
};

window.onload = function() {
  var isMobile = navigator.userAgent.indexOf("Mobile");
  if(isMobile == -1) {
    isMobile = navigator.userAgent.indexOf("Tablet");
  }
  
  let w = 640/2;
  let h = 1280/2;
  
  if(isMobile != -1) {
    //w = window.innerWidth;
    //h = window.innerHeight;
  }
  
  var config = {
    type: Phaser.AUTO,
    width: w,
    height: h,
    parent: 'phaser-game',
    pixelArt: true,
    antialias: false,
    scale: {
      parent: 'phaser-game',
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: w,
      height: h,
      autoRound: true
    },
    plugins: {
      global: [NineSlice.Plugin.DefaultCfg],
    },
    roundPixel: true,
    physics: {
      default: 'arcade',
        arcade: {
          debug: 'true'
        }
    },
    /*
    input: {
      activePointers: 4
    },
    */
    backgroundColor: 0x3e3d4c,
    scene: [SceneLoad, SceneMain]
  };
  
  game = new Phaser.Game(config);
  game.cW = game.config.width/2;  
  game.cY = game.config.height/2;  
};