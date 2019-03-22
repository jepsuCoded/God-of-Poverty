
var game;

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
    //antialias: false,
    scale: {
      parent: 'phaser-game',
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: w,
      height: h,
      autoRound: true
    },
    //roundPixel: true,
    physics: {
      default: 'arcade',
        arcade: {
          debug: 'true'
        }
    },
    backgroundColor: 0x3e3d4c,
    scene: [SceneLoad, SceneMain]
  };
  
  game = new Phaser.Game(config);
  game.model = {};
  game.model.score = 0;
  
};