class SceneMain extends Phaser.Scene {
  constructor() {
    super('SceneMain');
  }
  
  preload() {
    _scene = this;
    
    this.sizeFont = 21;
    let test = this.add.text(0, 0, 'WWWWWWWWWW', {fontSize: this.sizeFont});
    this.scaleFont = 101/test.width;
    this.sizeFont *= this.scaleFont;
    test.destroy();
  }
  
  create() {
    /*
    this.viewCam = this.cameras.main;
    this.viewCam.setVisible(true);
    this.viewCam.setSize(10000, 10000);
    */
    console.log(data);
    this.createUI();
    
    this.engine.createCurrency('soul', 1);
    
    this.createStatusbar();
    this.createNavbar();
    this.createResources();
    
    //this.align.showNumbers();
    
  }
  
  update() {
    /*
    this.viewCam.setPosition(0, this.viewCam.y-0.2);
    this.viewCam.setScroll(0, this.viewCam.y-0.2);
    */
    this.engine.onTick(Date.now());
    
    this.statusbar.cash = this.engine.currencies['soul'].value;
    this.statusbar.cashInfo.setText('$' + this.engine.formatNumber(this.engine.currencies['soul'].value, this.statusbar.cash % 1 === 0 ? 0 : 1));
    
    if (this.engine.currencies.soul.value - (this.navbar.upgrade.cost * Math.pow(this.navbar.upgrade.costFactor, this.navbar.mustache.level)).toFixed(1) >= 0) this.navbar.upgrade.image.clearTint();
    
    this.people.producer.forEach((person, i) => {
      if (!this.people.ui[i].hidden) {
        const cost = person.calculateCost(1);
        if(this.engine.currencies.soul.value - cost.price > 0) {
          this.people.ui[i].discover(true);
        } else this.people.ui[i].discover(false);
      }
    });
    
  }
  
  createUI() {
    this.color = {
      normal: '#c4bfbf',
      disabled: '#3e3d4c',
      info: '#847f7f',
      error: '#c0461f',
      success: '#84ad42'
    };
    
    this.align = new AlignGrid({
      scene: this,
      cols: 10,
      rows: 20
    });
    
    this.engine = new Engine();
    
    this.people = [];
    
    this.align.centerX = (this.align.config.cols-1)*0.5;
    this.align.centerY = (this.align.config.rows-1)*0.5;
    
    this.touchZone = this.add.rectangle(0, 0, game.config.width, game.config.height);
    this.touchZone.setOrigin(0, 0);
    this.cash = {soul: 1, money: 0};
    
    this.people = {ui: [], resource: [], producer: [], manager: []};
    
    PEOPLE.forEach((person, i) => {
      let pos = (i * 3) + 4;
      this.people.ui.push(new Person(this, {
        id: i,
        name: person.name,
        image: person.image,
        position: pos,
        value: person.value,
        cost: person.cost,
        costFactor: person.costFactor,
        output: {
          amount: person.output.amount,
          time: person.output.time
        }
      }));
    });
    
    this.ui_dialogue = this.add.nineslice(
      game.config.width/2, game.config.height/2,
      96*2, 96*2,
      {key: 'ui_nineslice', frame: 2},
      32,
      32
    ).setDepth(9).setOrigin(0.5, 0.5);
    
    this.ui_icon = this.add.image(game.config.width/2, game.config.height/2, 'button_hand_pick').setDepth(10).setScale(2);
  }
  
  createStatusbar() {
    this.statusbar = {
      ui: this.add.image(0, 0, 'ui_statusbar').setDepth(2).setOrigin(0, 0).setScrollFactor(1),
      avatar: this.add.image(0, 0, 'god_avatar').setDepth(3),
      level: 0,
      levelInfo: this.add.text(0, 0, 'Lv. 0', {
        fontSize: this.sizeFont,
        fontFamily: 'Gaegu',
        color: '#c4bfbf'
      }).setDepth(2).setOrigin(0, 0.25),
      cash: 5,
      cashInfo: this.add.text(0, 0, '$5', {
        fontSize: this.sizeFont*1.238,
        fontFamily: 'Gaegu',
        color: '#c4bfbf'
      }).setDepth(2).setOrigin(0, 0.25),
    };
    
    this.align.placeAtIndex(11, this.statusbar.avatar);
    this.align.placeAt(2.25, 1.3, this.statusbar.levelInfo);
    this.align.placeAt(2.25, 0.3, this.statusbar.cashInfo);
  }
  
  createNavbar() {
    this.navbar = {
      ui: this.add.image(0, 0, 'ui_navbar').setDepth(2).setOrigin(0, 0).setScrollFactor(1),
      mustache: {
        text: this.add.text(0, 0, 'Sell 1 mustache', {
          fontSize: this.sizeFont,
          color: this.color.normal,
          fontFamily: 'Gaegu'
        }).setDepth(2).setOrigin(0.5, 0.5),
        level: 1,
        count: 0.1,
        image: this.add.sprite(0, 0, 'navbar_mustache', 0).setDepth(3).setOrigin(0.5, 0.5)
      },
      upgrade: {
        text: this.add.text(0, 0, '$2', {
          fontSize: this.sizeFont,
          color: this.color.normal,
          fontFamily: 'Gaegu'
        }).setDepth(2).setOrigin(0.5, 0.5),
        cost: 2,
        costFactor: 1.08,
        image: this.add.sprite(0, 0, 'navbar_upgrade', 0).setDepth(3).setOrigin(0.5, 0.5)
      },
      manager: {
        text: this.add.text(0, 0, 'Manager', {
          fontSize: this.sizeFont,
          color: this.color.normal,
          fontFamily: 'Gaegu'
        }).setDepth(2).setOrigin(0.5, 0.5),
        image: this.add.sprite(0, 0, 'navbar_manager', 0).setDepth(3).setOrigin(0.5, 0.5)
      }
    };
    
    this.navbar.mustache.image.setInteractive().on('pointerdown', function() {
      this.navbar.mustache.image.setFrame(1);
    }, this);
    this.navbar.mustache.image.setInteractive().on('pointerout', function() {
      this.navbar.mustache.image.setFrame(0);
    }, this);
    this.navbar.mustache.image.setInteractive().on('pointerup', function(pointer) {
      this.engine.currencies['soul'].incrementBy(this.navbar.mustache.level*this.navbar.mustache.count);
      this.navbar.mustache.image.setFrame(0);
      popupText(pointer.x, pointer.y, '+' + (this.navbar.mustache.level*this.navbar.mustache.count).toFixed(1), this.color.normal, this.sizeFont*1.524, 500, this, 56);
    }, this);
    
    this.navbar.upgrade.image.setInteractive().on('pointerdown', function() {
      this.navbar.upgrade.image.setFrame(1);
    }, this);
    this.navbar.upgrade.image.setInteractive().on('pointerout', function() {
      this.navbar.upgrade.image.setFrame(0);
    }, this);
    this.navbar.upgrade.image.setInteractive().on('pointerup', function(pointer) {
      let cost = (this.navbar.upgrade.cost * Math.pow(this.navbar.upgrade.costFactor, this.navbar.mustache.level)).toFixed(1);
      
      if (this.engine.currency('soul').value-cost >= 0) {
        this.navbar.mustache.level++;
        this.engine.currencies['soul'].incrementBy(-cost);
        
        cost = (this.navbar.upgrade.cost * Math.pow(this.navbar.upgrade.costFactor, this.navbar.mustache.level)).toFixed(1);
        
        this.navbar.upgrade.image.setFrame(0);
        this.navbar.upgrade.text.setText('$' + (cost >=1000 ? this.engine.formatNumber(parseInt(cost), 1) : cost));
        
        this.navbar.mustache.text.setText('Sell ' + this.engine.formatNumber(this.navbar.mustache.level, 0) + ' mustaches');
        
        popupText(pointer.x, pointer.y, 'Mustache\nLv. ' + this.navbar.mustache.level, this.color.success, this.sizeFont, 1000, this, 56);
        
        this.navbar.upgrade.image.setTint(0x847d7d);
      } else {
        popupText(pointer.x, pointer.y, 'Insufficient\nSoul cash', this.color.error, this.sizeFont, 1000, this, 56);
      }
    }, this);
    
    this.navbar.upgrade.image.setTint(0x847d7d);
    this.navbar.upgrade.text.setText('$' + this.navbar.upgrade.cost * Math.pow(this.navbar.upgrade.costFactor, this.navbar.mustache.level).toFixed(1));
    
    this.align.placeAt(4.5, 17.75, this.navbar.mustache.image);
    this.align.placeAt(4.5, 19.125, this.navbar.mustache.text);
    this.align.placeAt(1, 18.25, this.navbar.manager.image);
    this.align.placeAt(1, 19.125, this.navbar.manager.text);
    this.align.placeAt(8, 18.25, this.navbar.upgrade.image);
    this.align.placeAt(8, 19.125, this.navbar.upgrade.text);
    this.navbar.ui.setPosition(0, game.config.height-this.navbar.ui.height);
    this.align.placeAt(-0.5, 16.5, this.navbar.ui);
  }
  
  createResources() {
    this.people.ui.forEach((person, i) => {
      let key = 'coin_' + i;
      this.people.resource.push(this.engine.createResource({
        key: key,
        basePrice: {
          curreny: 'soul',
          amount: person.output.amount
        },
        count: 0
      }));
      this.people.producer.push(this.engine.createProducer({
        key: person.name,
        outputs: {
          resources: {
            [key]: {
              productionTime: person.output.time,
              productionAmount: 1
            }
          }
        },
        baseCost: {
          currency: 'soul',
          amount: person.cost
        },
        costCoefficient: person.costFactor,
        count: 0,
        processingEnabled: false,
      }));
      /*
      this.people.manager.push(this.engine.createManager({
        key: "Lumberjack Manager",
        entityType: "producer",
        entityKey: "Lumberjack",
        basePrice: {
          currency: "gold",
          amount: 500
        },
        count: 0,
        maxCount: 1,
        eventHandlers: eventHandlers
      }));*/
      this.people.producer[i].on("PRODUCER_OUTPUT", (e) => {
        //e.producer.processingEnabled = false;
        this.people.ui[i].claim = e.output.calculatePrice(e.output.count).amount;
        e.output.incrementBy(-e.output.count);
      }, this);
    });
  }
}