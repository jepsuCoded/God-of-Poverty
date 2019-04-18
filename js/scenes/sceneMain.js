class SceneMain extends Phaser.Scene {
  constructor() {
    super('SceneMain');
  }
  
  preload() {
    _scene = this;
    this.elapsedTime = Date.now();
    this.tutorial = _data.tutorial;
    this.openEnded = false;
    this.objective = 2000;
    this.gameOver = true;
    this.sizeFont = 21;
    this.tempTest = this.add.text(0, -100, 'WWWWWWWWWW', {fontSize: this.sizeFont, fontFamily: 'Gaegu'});
    this.scaleFont = 121/this.tempTest.width;
    this.sizeFont *= this.scaleFont;
    //localforage.clear();
    this.bonus = 0;
    this.getBonus = 0;
    this.allData = new DataManager();
    this.input.setTopOnly(true);
    this.initSystem();
    //this.createUI();
    this.createResources();
    this.createShop();
    this.allData.load();
  }
  
  create() {
    this.overlay = this.add.rectangle(0, 0, game.config.width, game.config.height, this.color.disabled[1]).setDepth(100).setOrigin(0, 0);
    this.waiting = textObj(this, {
      text: 'Please wait...',
      color: this.color.normal[0],
      orig: [0.5, 0.5],
      size: this.sizeFont,
      depth: 101,
      x: game.cW, y: game.cY
    });
    
    let earnDelay = this.time.addEvent({
      delay: 1000,
      callback: function() {
        this.tutorial = _data.tutorial;
        
        _scene.initTutorial();
        
        let done = false;
        _scene.overlay.destroy();
        _scene.waiting.destroy();
        while (!done) {
          if (_data.earned < 0) {
            done = true;
            _scene.gameOver = false;
          } else if (_data.earned > 0) {
            let earn = _data.earned;
            let count = 0;
            _data.people.forEach(person => count += person.level);
            _data.display.soul_text.setText(count > 1 ? formatValue(count, 0) + ' SOULS' : count + ' SOUL');
            
            tooltip({
              title: 'OMG! Welcome back Philomenus!',
              text: 'While you were away we\'ve gathered ₱' + formatValue(_data.earned) + ' Soul Coins just for you!',
              frame: 4,
              info: 'Press anywhere to continue',
              cancel: function() {incrementCash('peso', earn); _scene.gameOver = false}
            });
            _data.earned = -1;
            done = true;
          } else {
            done = true;
            _scene.gameOver = false;
          }
        }
      }
    });
  }
  
  update() {
    
    this.engine.onTick(Date.now());
    
    if (Date.now() - this.elapsedTime > 2000) {
      let count = 0;
      _data.people.forEach(person => count += person.level);
      let points = Math.round(_data.god.level + (count*0.1));
      this.getBonus = Math.round(points*100);
      _data.display.soul_text.setText(count > 1 ? formatValue(count, 0) + ' SOULS' : count + ' SOUL');
      _data.shop.upgrade[2].ui.info.setText('Gives you ' + formatValue(this.getBonus*100) + '% earnings!');
      this.elapsedTime = Date.now();
      this.allData.save();
      this.goalPercent.setText((parseInt((count/this.objective)*100)) + '%');
      if (count >= this.objective && !this.gameOver && !this.openEnded) {
        this.gameOver = true;
        tooltip({
          title: 'You have reached your goal!',
          text: 'You\'ve acquired ' + formatValue(count, 0) + ' souls! Purify these souls to complete the mission that Zeus gave you!',
          frame: 4,
          info: 'Press anywhere to continue',
        });
      }
    }
    
    if (this.engine.currencies.soul.value < 0) {
      this.engine.currencies.soul.incrementBy(-this.engine.currencies.soul.value);
      _data.display.cash_text.soul.setText(0);
    }
    if (this.engine.currencies.peso.value < 0) {
      this.engine.currencies.peso.incrementBy(-this.engine.currencies.peso.value);
      _data.display.cash_text.peso.setText(0);
    }
    
    _data.people.forEach((person, i) => {
      if (!_data.people[i].hidden) {
        const cost = person.producer.calculateCost(_data.count);
        if(this.engine.currencies.soul.value - cost.price >= 0) {
          person.discover(true);
        } else person.discover(false);
      }
    });
  }
  
  initTutorial() {
    if (this.tutorial) {
      this.tutorial_todo = textObj(_scene, {
        x: game.cW, y: game.config.height-(this.sizeFont/2),
        text: 'Reach Level 5',
        orig: [0.5, 0.5],
        color: this.color.info[0],
      });
      this.tutorial_todo.setVisible(false);
      _data.display.cash.peso.setVisible(false);
      _data.display.cash_holder.peso.setVisible(false);
      _data.display.cash_text.peso.setVisible(false);
      _data.display.soul_text.setVisible(false);
      _data.display.bonus_text.setVisible(false);
      _data.people[0].hide();
      _data.buttons.upgrade.setVisible(false);
      _data.buttons.manager.setVisible(false);
      _data.buttons.page_previous.setVisible(false);
      _data.buttons.page_next.setVisible(false);
      
      let zeus = 'Zeus, the king of gods';
      tooltip({
        title: zeus,
        text: 'It\'s been a while my dear friend Philomenus. I got a report from one of my disciple who descended to the mortal world, that one of the third-world country is in an imbalanced state.',
        info: 'Tap to proceed',
        cancel: function () {
          tooltip({
            title: zeus,
            text: 'It is stated that the number of unprosperous people are growing rapidly. My task for you Philomenus, as the god of poverty, is to capture their souls then nourished it with your power to purify their souls bringing them luck, positivity and kindness.',
            info: 'Tap to proceed',
            cancel: function () {
              tooltip({
                title: zeus,
                text: 'You only need to capture a total of ' + _scene.objective + ' souls then I\'ll come back once you purified them all.',
                info: 'Tap to proceed',
                cancel: function () {
                  tooltip({
                    title: zeus,
                    text: 'Your mission has now started, descend to the earth, to the country of the Philippines and let the state of this country be balance again. My disciple will accompany you and will guide you to be succesful.',
                    info: 'Tap to proceed',
                    cancel: function () {
                      tooltip({
                        title: zeus,
                        text: 'I\'m counting on you Philomenus.',
                        info: 'Tap to proceed',
                        cancel: function () {
                          _data.tapper.tween(_scene, {
                            x: 0.75,
                            y: (_scene.align.config.rows/2)-1,
                            width: game.config.width*0.75,
                            height: 128,
                            duration: 500,
                            ease: 'Bounce',
                            function: function() {
                              _scene.sfx_bonus.play();
                              tooltip({
                                title: 'Sacred Touch Skill Acquired!',
                                text: 'Every scrap metal you touch will turn into coins which will then be transformed as a soul cash, it is the value of your soul power. Use it wisely to be succesful on this mission. (the in-game main currency)',
                                info: 'Tap to proceed',
                                cancel: function() {
                                  tooltip({
                                    title: 'Tip',
                                    text: 'Tapping the button will earn you soul cash, soul cash value will increase as you level up. Reached level 5 to start acquiring human souls.',
                                    info: 'Tap to proceed',
                                    cancel: function() {
                                      _scene.tutorial_todo.setVisible(true);
                                    }
                                  });
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
      this.tutorial_1 = function() {
        _data.tapper.tween(_scene, {
          x: -0.5,
          y: _scene.align.config.rows-3.5,
          width: game.config.width,
          height: 96,
          duration: 500,
          ease: 'Cubic',
          function: function() {
            _scene.sfx_bonus.play();
            tooltip({
              title: 'Succeed!',
              text: 'You now have enough soul cash to capture a person\'s soul. Once a human has a captured soul, their soul will get covered by your power. Once the soul is full, you can collect it\'s value and will be converted into soul coin, a lesser type of soul power.',
              info: 'Tap to proceed',
              cancel: function() {
                tooltip({
                  title: 'Next Objective',
                  text: 'You can hire a soul worker to automate the process of collecting soul value in exchange of soul coins. Gather atleast ₱' + formatValue(_data.shop.manager[0].cost, 1) + ' soul coins.',
                  info: 'Tap to proceed',
                  cancel: function() {
                    _scene.tutorial_todo.setText('Gather ₱' + formatValue(_data.shop.manager[0].cost, 1) + ' soul coins');
                    _scene.tutorial_todo.setPosition(game.cW, game.config.height-128+24);
                  }
                });
              }
            });
            _data.display.cash.peso.setVisible(true);
            _data.display.cash_holder.peso.setVisible(true);
            _data.display.cash_text.peso.setVisible(true);
            _data.display.soul_text.setVisible(true);
            _data.people[0].show();
          }
        });
      };
      
      this.tutorial_2 = function() {
        _scene.sfx_bonus.play();
        tooltip({
          title: 'Succeed!',
          text: 'Soul workers now available! Hire a soul worker now and they will do the collection for you automatically even if you we\'re away doing something else.',
          info: 'Tap to proceed',
          cancel: function() {
            _scene.tutorial_1 = undefined;
            _scene.tutorial_todo.setVisible(false);
          }
        });
      };
      
      this.tutorial_3 = function() {
        _scene.sfx_bonus.play();
        tooltip({
          title: 'Succeed!',
          text: 'Now that you have the basic knowledge of how everything works, it is now time for you to gather and capture as many soul as you can and the King of god will be proud of you!',
          info: 'Tap to proceed',
          cancel: function() {
            _scene.tutorial = false;
            _scene.tutorial_2 = undefined;
            _scene.tutorial_3 = undefined;
            _scene.tutorial_todo.destroy();
            
            _data.buttons.upgrade.setVisible(true);
            _data.buttons.page_previous.setVisible(true);
            _data.buttons.page_next.setVisible(true);
          }
        });
      };
    }
  }
  
  initSystem() {
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
    
    this.align = new AlignGrid({
      scene: this,
      cols: 10,
      rows: 20
    });
    
    this.align.centerX = (this.align.config.cols-1)*0.5;
    this.align.centerY = (this.align.config.rows-1)*0.5;
    
    this.engine = new Engine();
    
    this.sfx_levelup = this.sound.add('levelup');
    this.sfx_cash_claim = this.sound.add('cash_claim');
    this.sfx_coin_claim = this.sound.add('coin_claim');
    this.sfx_bonus = this.sound.add('bonus');
    this.sfx_button_icon = this.sound.add('button_icon');
    this.sfx_button_person = this.sound.add('button_person');
    this.sfx_button_upgrade = this.sound.add('button_upgrade');
    this.sfx_button_disabled = this.sound.add('button_disabled');
    
    if (!this.sfx_bg_music) {
      this.sfx_bg_music = this.sound.add('bg_music', {
        loop: true
      });
      this.sfx_bg_music.play();
    }
    
    // Create currencies
    for (const currency in _data.cash) {
      this.engine.createCurrency(currency, _data.cash[currency]);
    }
    
    // Create people
    let factor = 1.08;
    let cost = PEOPLE[0].cost;
    let amount = PEOPLE[0].output.amount;
    let time = PEOPLE[0].output.time;
    PEOPLE.forEach((person, i) => {
      let timeFactor = (2/PEOPLE.length)*(i+1);
      let page = Math.ceil((i+1)/4);
      let pos = ((i % 4) * 3) + 4;
      _data.people.push(new Person(this, {
        id: i,
        page: page,
        timeFactor: timeFactor,
        name: person.name,
        description: person.description || 'No description',
        image: person.image,
        position: pos,
        cost: cost,
        costFactor: factor,//person.costFactor,
        getOutput: {
          amount: amount,//person.output.amount,
          time: time//person.output.time
        }
      }));
      factor = factor*100;
      factor += 4;
      factor /= 100;
      
      cost = Math.pow(factor, PEOPLE[0].cost*(i+1)*0.8)*(25-(4*i));
      amount = Math.pow(factor, PEOPLE[0].output.amount*(i+1*(10)));
      time = Math.pow(PEOPLE[0].output.time*(i+1), 1.05);
    });
    
    _data.page = {
      current: 1,
      last: Math.ceil(PEOPLE.length/4),
      count: 1
    };
    
    this.createTapper();
    
    this.createDisplay();
    
    this.goalPercent = textObj(_scene, {
      text: '100%',
      orig: [1, 0.5],
      align: 'right',
      x: game.config.width-2,
      y: game.config.height-(this.sizeFont/2),
      color: this.color.normal[0],
      depth: 100
    });
    
    _data.tapper.tween(this, {
      x: -0.5,
      y: this.align.config.rows-3.5,
      width: game.config.width,
      height: 96,
      duration: 5,
      ease: 'Cubic'
    });
    
    // Create button icons
    _data.buttons = {
      upgrade: new Button(this, {
        image: 'button_icons',
        frame: 0,
        posX: 0.5,
        posY: 15.5,
        scale: 0.75,
        function: function() {
          if (_data.buttons.upgrade.frame.name != 5 && _data.buttons.manager.frame.name == 5) {
            _data.shop.showUI = false;
            _data.shop.page.selected = '';
            _data.shop.manager.forEach(item => item.hide());
            _data.shop.ui.placeholder.setVisible(false);
            _data.shop.bg_mask.setVisible(false);
            _data.shop.page_previous.setVisible(false);
            _data.shop.page_next.setVisible(false);
            _data.shop.manager_text.setVisible(false);
            toggleModal({name: 'manager', frame: 1}, false);
          }
          if (!_data.shop.showUI && _data.buttons.upgrade.frame.name != 5) {
            _scene.align.placeAt(7.75, 15.5, _data.buttons.upgrade_count);
            _data.buttons.upgrade_count_text.setPosition(_data.buttons.upgrade_count.x, _data.buttons.upgrade_count.y);
            _data.buttons.upgrade_count.setVisible(true);
            _data.buttons.upgrade_count_text.setVisible(true);
            
            _data.shop.showUI = true;
            _data.shop.page.selected = 'upgrade';
            _data.shop.toggleVisibility(true, 'upgrade');
            _data.shop.ui.placeholder.setVisible(true);
            _data.shop.bg_mask.setVisible(true);
            _data.shop.page_previous.setVisible(true);
            _data.shop.page_next.setVisible(true);
            _data.shop.upgrade_text.setVisible(true);
            if (_data.shop.page.upgrade.current <= 1)
              _data.shop.page_previous.locked(_scene, _scene.color.normal[1]);
            else
              _data.shop.page_previous.unlocked();
            if (_data.shop.page.upgrade.current >= _data.shop.page.upgrade.last)
              _data.shop.page_next.locked(_scene, _scene.color.normal[1]);
            else
              _data.shop.page_next.unlocked();
            toggleModal({name: 'upgrade', frame: 5}, true);
          } else if (_data.shop.showUI && _data.buttons.upgrade.frame.name == 5 && _data.buttons.manager.frame.name != 5) {
            _scene.align.placeAt(7.75, 15.5, _data.buttons.upgrade_count);
            _data.buttons.upgrade_count_text.setPosition(_data.buttons.upgrade_count.x, _data.buttons.upgrade_count.y);
            _data.buttons.upgrade_count.setVisible(false);
            _data.buttons.upgrade_count_text.setVisible(false);
            
            _data.shop.showUI = false;
            _data.shop.page.selected = '';
            _data.shop.upgrade.forEach(item => item.hide());
            _data.shop.ui.placeholder.setVisible(false);
            _data.shop.bg_mask.setVisible(false);
            _data.shop.page_previous.setVisible(false);
            _data.shop.page_next.setVisible(false);
            _data.shop.upgrade_text.setVisible(false);
            toggleModal({name: 'upgrade', frame: 0}, false);
          }
        }
      }),
      manager: new Button(this, {
        image: 'button_icons',
        frame: 1,
        posX: 2.125,
        posY: 15.5,
        scale: 0.75,
        function: function() {
          if (_data.buttons.manager.frame.name != 5 && _data.buttons.upgrade.frame.name == 5) {
            _data.shop.showUI = false;
            _data.shop.page.selected = '';
            _data.shop.upgrade.forEach(item => item.hide());
            _data.shop.ui.placeholder.setVisible(false);
            _data.shop.bg_mask.setVisible(false);
            _data.shop.page_previous.setVisible(false);
            _data.shop.page_next.setVisible(false);
            _data.shop.upgrade_text.setVisible(false);
            toggleModal({name: 'upgrade', frame: 0}, false);
          }
          if (!_data.shop.showUI && _data.buttons.manager.frame.name != 5) {
            _data.buttons.upgrade_count.setVisible(false);
            _data.buttons.upgrade_count_text.setVisible(false);
            _data.shop.showUI = true;
            _data.shop.page.selected = 'manager';
            _data.shop.toggleVisibility(true, 'manager');
            _data.shop.ui.placeholder.setVisible(true);
            _data.shop.bg_mask.setVisible(true);
            _data.shop.page_previous.setVisible(true);
            _data.shop.page_next.setVisible(true);
            _data.shop.manager_text.setVisible(true);
            if (_data.shop.page.manager.current <= 1)
              _data.shop.page_previous.locked(_scene, _scene.color.normal[1]);
            else
              _data.shop.page_previous.unlocked();
            if (_data.shop.page.manager.current >= _data.shop.page.manager.last)
              _data.shop.page_next.locked(_scene, _scene.color.normal[1]);
            else
              _data.shop.page_next.unlocked();
            toggleModal({name: 'manager', frame: 5}, true);
          } else if (_data.shop.showUI && _data.buttons.upgrade.frame.name != 5 && _data.buttons.manager.frame.name == 5) {
            _data.shop.showUI = false;
            _data.shop.page.selected = '';
            _data.shop.manager.forEach(item => item.hide());
            _data.shop.ui.placeholder.setVisible(false);
            _data.shop.bg_mask.setVisible(false);
            _data.shop.page_previous.setVisible(false);
            _data.shop.page_next.setVisible(false);
            _data.shop.manager_text.setVisible(false);
            toggleModal({name: 'manager', frame: 1}, false);
          }
        }
      }),
      page_previous: new Button(this, {
        image: 'button_icons',
        frame: 2,
        posX: 6.88,
        posY: 15.5,
        scale: 0.75,
        function: function() {
          if (_data.page.current === 1)
            _data.buttons.page_previous.locked(_scene);
          else {
            _data.buttons.page_next.unlocked();
            
            _data.page.current--;
            _data.people.forEach(person => {
              if (person.page == _data.page.current)
                person.show();
              else person.hide();
            });
            if (_data.page.current === 1)
              _data.buttons.page_previous.locked(_scene);
          }
        }
      }),
      page_next: new Button(this, {
        image: 'button_icons',
        frame: 2,
        flipX: true,
        posX: 8.5,
        posY: 15.5,
        scale: 0.75,
        function: function() {
          if (_data.page.current === _data.page.last || _data.page.current == Math.ceil(_data.page.count/4))
            _data.buttons.page_next.locked(_scene);
          else {
            _data.buttons.page_previous.unlocked();
            _data.page.current++;
            _data.people.forEach(person => {
              if (person.page == _data.page.current)
                person.show();
              else person.hide();
            });
            if (_data.page.current === _data.page.last || _data.page.current == Math.ceil(_data.page.count/4))
              _data.buttons.page_next.locked(_scene);
          }
        }
      }),
      setting: new Button(this, {
        image: 'button_icons',
        frame: 4,
        posX: 8.5,
        posY: 0.5,
        scale: 0.75,
        depth: 1,
        function: function() {
          if (_scene.scale.isFullscreen) {
            _scene.scale.stopFullscreen();
            // On stop fulll screen
          } else {
            _scene.scale.startFullscreen();
            // On start fulll screen
          }
        }
      }),
      upgrade_count: new Button(this, {
        image: 'button_count',
        frame: 0,
        posX: 7.75,
        posY: 15.5,
        scale: 0.75,
        function: function() {
          switch (_data.count) {
            case 1: _data.count = 10; break;
            case 10: _data.count = 100; break;
            case 100: _data.count = 1; break;
            default: break;
          }
          _data.buttons.upgrade_count_text.setText(_data.count !== -1 ? '+' + _data.count : '+MAX');
          _data.people.forEach(person => {
            person.ui.cost.setText('$' + formatValue(person.producer.calculateCost(_data.count).price));
          });
          _data.shop.upgrade.forEach(item => {
            if (typeof item.cost == 'number') {
              let cost = item.cost;
              let totalCost = cost;
              for (let i = 1; i <= _data.count; i++) {
                if (_data.count == 1) continue;
                cost *= item.costFactor;
                totalCost += cost;
              }
              item.ui.cost.setText('₱' + formatValue(totalCost));
            }
          });
        }
      }),
      upgrade_count_text: textObj(_scene, {
        text: '+1',
        size: this.sizeFont*1.5,
        depth: 2,
        align: 'center',
        color: this.color.primary[0],
        orig: [0.5, 0.5]
      }),
      close_people: new Button(this, {
        image: 'button_icons',
        frame: 5,
        posX: 8.5,
        posY: 15.5,
        scale: 0.75,
        show: false,
        function: function() {
          _data.people.forEach(person => {
            if (person.isSelected) {
              _data.count = 1;
              _data.buttons.upgrade_count_text.setText('+' + _data.count);
              _data.people.forEach(person => {
                person.ui.cost.setText('$' + formatValue(person.producer.calculateCost(_data.count).price));
              });
              
              _data.buttons.upgrade_count.setVisible(false);
              _data.buttons.upgrade_count_text.setVisible(false);
              if (!_scene.tutorial && !_scene.tutorial_2) {
                _data.buttons.upgrade.setVisible(true);
                _data.buttons.manager.setVisible(true);
              }
              if (_scene.tutorial && !_scene.tutorial_1 && _scene.tutorial_2) {
                _data.buttons.manager.setVisible(true);
              }
              person.isSelected = false;
              
              person.ui.count.setVisible(false);
              person.ui.count_text.setVisible(false);
              if (person.ui.description.visible)
                person.ui.description.setVisible(false);
              person.ui.tween({
                target: {
                  height: person.ui.placeholder.height,
                  width: person.ui.placeholder.width,
                  y: 4.25
                },
                // width: game.config.width-6-32,
                height: 96-14,
                y: person.position,
                duration: 75,
                person: person,
                ease: 'Cubic.out',
                function: function() {
                  _data.people.forEach(person => {
                    if (!person.hidden) {
                      if (!person.isSelected && person.page == _data.page.current)
                        person.show();
                    }
                  });
                  _data.display.text_refresh();
                  _data.buttons.close_people.setVisible(false);
                  
                  if (!_scene.tutorial && !_scene.tutorial_2) {
                    _data.buttons.page_next.setVisible(true);
                    _data.buttons.page_previous.setVisible(true);
                  }
                }
              });
            }
          });
        }
      }),
    };
    
    _data.buttons.upgrade_count.setVisible(false);
    _data.buttons.upgrade_count_text.setVisible(false);
    
    _data.buttons.upgrade_count_text.setPosition(_data.buttons.upgrade_count.x, _data.buttons.upgrade_count.y);
    _data.buttons.page_previous.locked(_scene);
    _data.buttons.page_next.locked(_scene);
  }
  
  createTapper() {
    _data.tapper = {
      count: 0.1*_data.bonus,
      level_factor: 1.5,
      level_target: 10,
      level_current: 0,
      amount: 0.1,
      purify: textObj(_scene, {
        text: 'PURIFY',
        color: _scene.color.info[0],
        orig: [0.5, 0.5],
        depth: 11,
        size: _scene.sizeFont*3
      }),
      button: this.add.nineslice(
        0, 0,
        game.config.width, 96,
        {key: 'ui_nineslice', frame: 2},
        32,
        32
      ).setDepth(5).setOrigin(0, 0),
      button_pressed: this.add.nineslice(
        0, 0,
        game.config.width, 96,
        {key: 'ui_nineslice', frame: 3},
        32,
        32
      ).setDepth(4).setOrigin(0, 0),
      icon: this.add.image(0, 0, 'button_hand_pick').setDepth(6).setOrigin(0.5, 0.5),
      setPos: function(scene, x, y) {
        scene.align.placeAt(x, y, _data.tapper.button);
        scene.align.placeAt(x, y, _data.tapper.button_pressed);
        _data.tapper.icon.setPosition(_data.tapper.button.x+_data.tapper.button.width/2, _data.tapper.button.y-4+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
        _data.tapper.purify.setPosition(_data.tapper.button.x+_data.tapper.button.width/2, _data.tapper.button.y-6+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
        
        _data.tapper.defaultPos = {x: _data.tapper.button_pressed.x, y: _data.tapper.button_pressed.y};
        _data.tapper.defaultPosIndex = {x: x, y: y};
        _data.tapper.defaultSize = {width: _data.tapper.button_pressed.width, height: _data.tapper.button_pressed.height};
      },
      setSize: function(width, height) {
        _data.tapper.button.resize(width, height);
        _data.tapper.button_pressed.resize(width, height);
        if (width-32 != _data.tapper.icon.width && width <= height) {
          let scale = (width-32)/_data.tapper.icon.width;
          if (scale > 1.25) scale = 1.25;
          _data.tapper.icon.setScale(scale, scale);
        } else if (height-32 != _data.tapper.icon.height && height <= width) {
          let scale = (height-32)/_data.tapper.icon.height;
          if (scale > 1.25) scale = 1.25;
          _data.tapper.icon.setScale(scale, scale);
        } else
          _data.tapper.icon.setScale(1, 1);
        
        _data.tapper.icon.setPosition(_data.tapper.button.x+_data.tapper.button.width/2, _data.tapper.button.y-4+_data.tapper.button.height/2);
        _data.tapper.purify.setPosition(_data.tapper.button.x+_data.tapper.button.width/2, _data.tapper.button.y-6+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
        
        _data.tapper.defaultPos = {x: _data.tapper.button_pressed.x, y: _data.tapper.button_pressed.y};
        _data.tapper.defaultSize = {width: _data.tapper.button_pressed.width, height: _data.tapper.button_pressed.height};
      },
      resetInteractive: function() {
        _data.tapper.button_pressed.input.hitArea.setSize(_data.tapper.defaultSize.width, _data.tapper.defaultSize.height);
      },
      tween: function(scene, config) {
        if (config.x || config.y) {
          scene.tweens.add({
            targets: _data.tapper.defaultPosIndex,
            x: config.x || _data.tapper.defaultPosIndex.x,
            y: config.y || _data.tapper.defaultPosIndex.y,
            duration: config.duration,
            ease: config.ease || 'Linear',
            onUpdate: function (tweens) {
              _data.tapper.setPos(scene, tweens.targets[0].x, tweens.targets[0].y);
            },
            onComplete: function(tweens) {
              if (config.function) config.function();
              //_data.tapper.resetInteractive();
            }
          });
        }
        if (config.width || config.height) {
          scene.tweens.add({
            targets: _data.tapper.defaultSize,
            width: config.width || _data.tapper.defaultSize.width,
            height: config.height || _data.tapper.defaultSize.height,
            duration: config.duration,
            ease: config.ease || 'Linear',
            onUpdate: function (tweens) {
              _data.tapper.setSize(tweens.targets[0].width, tweens.targets[0].height);
            },
            onComplete: function(tweens) {
              _data.tapper.resetInteractive();
              _data.display.text_refresh();
            }
          });
        }
      }
    };
    
    _data.tapper.purify.setVisible(false)
    
    _data.tapper.button_pressed.setInteractive({useHandCursor: true})
      .on('pointerdown', function() {
        _data.tapper.button.y = game.config.height*2;
        _data.tapper.icon.setPosition(_data.tapper.button_pressed.x+_data.tapper.button.width/2, _data.tapper.button_pressed.y+8+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
        _data.tapper.purify.setPosition(_data.tapper.button_pressed.x+_data.tapper.button.width/2, _data.tapper.button_pressed.y+6+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
      }, this)
      .on('pointerout', function(pointer) {
        _data.tapper.button.y = _data.tapper.defaultPos.y;
        _data.tapper.icon.setPosition(_data.tapper.button.x+_data.tapper.button.width/2, _data.tapper.button.y-4+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
        _data.tapper.purify.setPosition(_data.tapper.button.x+_data.tapper.button.width/2, _data.tapper.button.y-6+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
      }, this)
      .on('pointerup', function(pointer) {
        
        this.sfx_cash_claim.play();
        
        if (_data.tapper.button.x == _data.tapper.button_pressed.x && _data.tapper.button.y == _data.tapper.button_pressed.y)
          return;
        _data.tapper.button.y = _data.tapper.defaultPos.y;
        _data.tapper.icon.setPosition(_data.tapper.button.x+_data.tapper.button.width/2, _data.tapper.button.y-4+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
        _data.tapper.purify.setPosition(_data.tapper.button.x+_data.tapper.button.width/2, _data.tapper.button.y-6+_data.tapper.button.height/2);//+_data.tapper.button.height/2);
        if (_data.tapper.purify.visible && this.gameOver && !this.openEnded) {
          this.allData.save();
          localforage.setItem('gameover', true);
          
          tooltip({
            title: 'Ay! Congratulations!',
            text: 'You finished the game! Thank you so much for playing my game I really appreciate your effort on completing my first ever (short) game! Comment down SUB2PEWDS and tell them to finish the game to know why! Because there is no reason why! (I\'m just doing my part here)',
            frame: 4,
            info: 'seriously, sub to pewdiepie if you haven\'t\nTap anywhere to proceed',
            cancel: function() {
              //_scene.gameOver = false;
              //_scene.openEnded = true;
              localforage.setItem('gameover', true);
              _data.bonus += _scene.getBonus;
              let b = _data.bonus;
              localforage.clear();
              _data = {
                bonus: b,
                tutorial: false,
                earned: -1,
                count: 1,
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
              _scene.scene.restart();
              return;
            },
            depth: 100
          });
        }
        if (_data.tapper.purify.visible && !this.gameOver) {
          _data.bonus += this.getBonus;
          let b = _data.bonus;
          localforage.clear();
          _data = {
            bonus: b,
            earned: -1,
            count: 1,
            tutorial: false,
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
          this.scene.restart();
          return;
        }
        
        incrementCash('soul', _data.tapper.amount);
        
        popupText(this, {
          x: game.cW,
          y: _data.tapper.button.y,
          text: formatValue(_data.levels.tapper*_data.tapper.count),
          color: this.color.normal[0],
          cash: {key: 'icon_currencies', frame: 0},
          size: this.sizeFont*2*_data.tapper.icon.scaleX,
          duration: 200,
          offset: 24
        });
        _data.display.cash_text.soul.setText(setCurrency('soul'));
        _data.display.level_bar_update();
        
        //console.log(this.engine.currencies['soul'].value);
        //localforage.setItem('DATA', _data);
        //this.allData.iWillSave(true);
        
      }, this);
    
    _data.god = {
      level: 1
    };
    
    _data.levels = {
      tapper: 1
    };
    
    let value = (_data.tapper.count*10)*_data.levels.tapper;
    _data.tapper.amount = value/10;
    
    _data.tapper.setPos(this, 0.5, this.align.config.rows/4);
    _data.tapper.setSize(game.config.width-64, game.config.width-64);
    _data.tapper.resetInteractive();
  }
  
  createDisplay() {
  _data.display = {
    ui: this.add.image(0, 0, 'ui_placeholder').setDepth(0).setOrigin(0, 0),
    cash: {
      soul: this.add.image(0, 0, 'icon_currencies', 0)
        .setDepth(2),
      peso: this.add.image(0, 0, 'icon_currencies', 1)
        .setDepth(2),
    },
    cash_holder: {
      soul: this.add.image(0, 0, 'ui_cash_holder')
        .setDepth(1),
      peso: this.add.image(0, 0, 'ui_cash_holder')
        .setDepth(1),
    },
    cash_text: {
      soul: textObj(this, {
        text: setCurrency('soul'),
        depth: 2,
        orig: [1, 0.5],
        color: this.color.disabled[0],
        align: 'right'
      }),
      peso: textObj(this, {
        text: setCurrency('peso'),
        depth: 2,
        orig: [1, 0.5],
        color: this.color.disabled[0],
        align: 'right'
      })
    },
    level_text: textObj(this, {
      text: 'LEVEL 1',
      depth: 2,
      orig: [0.5, 0.5],
      size: this.sizeFont*1.1,
      color: this.color.normal[0],
    }),
    bonus_text: textObj(this, {
      text: _data.bonus > 1 ? '+' + formatValue((_data.bonus-1)*100) + '%' : '',
      depth: 2,
      orig: [0.5, 0.5],
      size: this.sizeFont*1.1,
      color: this.color.normal[0],
      align: 'right'
    }),
    soul_text: textObj(this, {
      text: 'NO SOUL',
      depth: 2,
      orig: [0.5, 0.5],
      size: this.sizeFont*1.1,
      color: this.color.normal[0],
      align: 'left'
    }),
    level_bar: this.add.rectangle(
      game.cX,
      64+16,
      game.config.width,
      16, this.color.primary[1]).setDepth(2).setOrigin(0, 0).setScale(0, 1),
    level_bar_update: function() {
      _data.tapper.level_current += _data.shop.upgrade[1].level;
      let percent = _data.tapper.level_current / _data.tapper.level_target;
      if (_data.tapper.level_current > _data.tapper.level_target) {
        percent = 0;
        _data.tapper.level_current = 0;
        _data.tapper.level_target = Math.floor(_data.tapper.level_target*_data.tapper.level_factor);
        _data.tapper.count *= 2;
        let value = (_data.tapper.count*10)*_data.levels.tapper;
        _data.tapper.amount = value/10;
        _data.god.level++;
        _data.display.level_text.setText('LEVEL ' + _data.god.level);
        _scene.sfx_levelup.play();
        popupText(_scene, {
          x: game.cW,
          y: _data.display.level_bar.y,
          offset: 32,
          text: 'Level Up! Soul cash value increased!',
          bg: _scene.color.success[0],
          color: _scene.color.disabled[0],
          duration: 1500,
          ease: 'Cubic.easeInOut',
          padding: { x: 8, y: 8 }
        });
        
        if (_data.god.level == 5) {
          if (_scene.tutorial_1) _scene.tutorial_1();
        }
      }
      _data.display.level_holder_text.setText(formatValue(_data.tapper.level_current) + '/' + formatValue(_data.tapper.level_target));
      _scene.tweens.add({
        targets: _data.display.level_bar,
        scaleX: percent,
        duration: percent === 0 ? 200 : 100
      });
      
      _data.shop.upgrade.forEach(item => {
        if (item.levelRequire == _data.god.level) {
          item.levelRequire = undefined;
        }
      });
    },
    level_holder: this.add.rectangle(
      game.cX,
      64+16-2,
      game.config.width,
      20, this.color.info[1]).setDepth(1).setOrigin(0, 0),
    level_holder_text: textObj(this, {
      text: '0/' + _data.tapper.level_target,
      depth: 3,
      orig: [0.5, 0.5],
      align: 'center',
      color: this.color.disabled[0]
    }),
    text_refresh: function() {
      popupText(_scene, {
        x: 0,
        y: -100,
        text: (_data.levels.tapper*_data.tapper.count).toFixed(1),
        color: _scene.color.normal[0],
        cash: {key: 'icon_currencies', frame: 0},
        size: _scene.sizeFont*2*_data.tapper.icon.scaleX,
        duration: 5,
        offset: 24
      });
      _data.people.forEach(person => {
        person.ui.name.setText(person.ui.name.text);
        person.ui.info.setText(person.ui.info.text);
        person.ui.cost.setText(person.ui.cost.text);
      });
      
      _data.display.cash_text.soul.setText(_data.display.cash_text.soul.text);
      _data.display.cash_text.peso.setText(_data.display.cash_text.peso.text);
      _data.display.soul_text.setText(_data.display.soul_text.text);
      _data.display.level_text.setText(_data.display.level_text.text);
      _data.display.bonus_text.setText(_data.display.bonus_text.text);
      _data.display.level_holder_text.setText(_data.display.level_holder_text.text);
    }
  };
  this.align.placeAt(1.5, 0.5, _data.display.cash_holder.soul);
  this.align.placeAt(0.5, 0.5, _data.display.cash.soul);
  this.align.placeAt(2.5, 0.5, _data.display.cash_text.soul);
  this.align.placeAt(5.5, 0.5, _data.display.cash_holder.peso);
  this.align.placeAt(4.5, 0.5, _data.display.cash.peso);
  this.align.placeAt(6.5, 0.5, _data.display.cash_text.peso);
  this.align.placeAt(1, 1.5, _data.display.soul_text);
  this.align.placeAt(4.5, 1.5, _data.display.level_text);
  this.align.placeAt(8.5, 1.5, _data.display.bonus_text);
  this.align.placeAt(4.5, 2.25, _data.display.level_holder_text);
  
  //_data.display.level.setStrokeStyle(2, this.color.info[1]);
}

createShop() {
  _data.shop = {
    showUI: false,
    upgrade: [],
    manager: [],
    upgrade_text: textObj(_scene, {
      text: 'Upgrade Skills',
      color: this.color.primary[0],
      orig: [0, 0.5],
      size: this.sizeFont*1.25,
      depth: 5
    }),
    manager_text: textObj(_scene, {
      text: 'Soul Workers',
      color: this.color.primary[0],
      orig: [0, 0.5],
      size: this.sizeFont*1.25,
      depth: 5
    }),
    page: {
      selected: '',
      upgrade: {
        current: 1,
        last: Math.ceil(UPGRADES.length/4),
        count: 1
      },
      manager: {
        current: 1,
        last: Math.ceil(_data.people.length/4),
        count: 1
      },
    },
    toggleVisibility: function(toggle, shop) {
      _data.shop[shop].forEach(item => {
        item.toggleVisibility(toggle);
      });
    },
    ui: {
      placeholder: this.add.nineslice(
        0, 96,
        game.config.width, 32*12,
        {key: 'ui_nineslice', frame: 0},
        32,
        32
      ).setDepth(4).setOrigin(0, 0),
      upgrade: {
        //tapper:
      }
    },
    bg_mask: this.add.rectangle(
      0,
      0,
      game.config.width,
      game.config.height,
      this.color.dark[1], 0.8).setDepth(0).setOrigin(0, 0),
    page_previous: new Button(this, {
      image: 'button_icons',
      frame: 2,
      posX: 7.08,
      posY: 13.5,
      scale: 0.6,
      depth: 5,
      function: function() {
        if (_data.shop.page[_data.shop.page.selected].current <= 1)
          _data.shop.page_previous.locked(_scene, _scene.color.normal[1]);
        else {
          _data.shop.page_next.unlocked();
          
          _data.shop.page[_data.shop.page.selected].current--;
          _data.shop[_data.shop.page.selected].forEach(item => {
            item.toggleVisibility(item.page == _data.shop.page[_data.shop.page.selected].current);
          });
          if (_data.shop.page[_data.shop.page.selected].current <= 1)
            _data.shop.page_previous.locked(_scene, _scene.color.normal[1]);
        }
      }
    }),
    page_next: new Button(this, {
      image: 'button_icons',
      frame: 2,
      flipX: true,
      posX: 8.5,
      posY: 13.5,
      scale: 0.6,
      depth: 5,
      function: function() {
        if (_data.shop.page[_data.shop.page.selected].current >= _data.shop.page[_data.shop.page.selected].last)// && _data.shop.page[_data.shop.page.selected].current == Math.ceil(_data.page.count/4))
        _data.shop.page_next.locked(_scene, _scene.color.normal[1]);
        else {
          _data.shop.page_previous.unlocked();
          
          _data.shop.page[_data.shop.page.selected].current++;
          _data.shop[_data.shop.page.selected].forEach(item => {
            item.toggleVisibility(item.page == _data.shop.page[_data.shop.page.selected].current);
          });
          if (_data.shop.page[_data.shop.page.selected].current >= _data.shop.page[_data.shop.page.selected].last)// && _data.shop.page[_data.shop.page.selected].current == Math.ceil(_data.page.count/4))
          _data.shop.page_next.locked(_scene, _scene.color.normal[1]);
        }
        
      }
    }),
  };
  _data.shop.ui.placeholder.setInteractive().on('pointerup', function() {
    return;
  });
  _data.shop.bg_mask.setInteractive().on('pointerup', function() {
    return;
  });
  _data.shop.ui.placeholder.setVisible(false);
  _data.shop.bg_mask.setVisible(false);
  
  _data.shop.page_previous.setVisible(false);
  _data.shop.page_next.setVisible(false);
  
  _data.shop.upgrade_text.setVisible(false);
  _data.shop.manager_text.setVisible(false);
  
  _data.shop.page_previous.locked(this, this.color.normal[1]);
  _data.shop.page_next.locked(this, this.color.normal[1]);
  
  this.align.placeAt(0.5, 13.5, _data.shop.upgrade_text);
  this.align.placeAt(0.5, 13.5, _data.shop.manager_text);
  
  UPGRADES.forEach((item, i) => {
    let page = Math.ceil((i+1)/4);
    let pos = ((i % 4) * 2.5) + 4.25;
    _data.shop.upgrade.push(new ShopItem({
      id: i,
      page: page,
      shop: 'upgrade',
      name: item.name,
      level: item.level,
      levelRequire: item.levelRequire || undefined,
      description: item.description,
      icon: item.icon,
      position: pos,
      cost: item.cost,
      costFactor: item.costFactor,
      callback: item.function
    }));
  });
  
  _data.people.forEach((person, i) => {
    let page = Math.ceil((i+1)/4);
    let pos = ((i % 4) * 2.5) + 4.25;
    _data.shop.manager.push(new ShopItem({
      id: i,
      page: page,
      shop: 'manager',
      name: 'Hire a Soul Worker for',
      level: 0,
      description: person.name,
      icon: person.image,
      position: pos,
      cost: person.manager.basePrice.amount,
      costFactor: 1,
      callback: function() {
        if (person.manager.count <= 0) {
          if (person.manager.purchase()) {
            if (!person.isProcessing) person.startProcessing();
            _data.shop.manager[i].ui.cost.setText('HIRED');
            _data.shop.manager[i].ui.name.setText('Hired Soul Worker for');
            _data.shop.manager[i].ui.cost.setColor(_scene.color.disabled[0]);
            _data.shop.manager[i].ui.button.setFillStyle(_scene.color.primary[1]);
            _data.shop.manager[i].ui.button.removeInteractive();
          }
        }
      }
    }));
  });
}

createResources() {
  _data.people.forEach((person, i) => {
    person.key = 'coin_' + i;
    person.resource = this.engine.createResource({
      key: person.key,
      basePrice: {
        currency: 'peso',
        amount: person.getOutput.amount
      },
      count: 0
    });
    person.producer = this.engine.createProducer({
      key: person.name,
      outputs: {
        resources: {
          [person.key]: {
            productionTime: person.getOutput.time,
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
    });
    person.manager = this.engine.createReactor({
      key: person.name + '_mgr',
      entityType: 'producer',
      entityKey: person.name,
      basePrice: {
        currency: 'peso',
        amount: Math.pow(person.costFactor, 25)*person.cost
      },
      count: 0,
      maxCount: 1,
      eventHandlers: [{
        event: 'PRODUCER_OUTPUT',
        handler: function(e) {
          if (this.count === 0) {
            this.entity.processingEnabled = false;
          }
        }//.bind(person)
      }]
    });
    person.manager.on('REACTOR_PURCHASED', (e) => {
      const manager = e;
      manager.entity.processingEnabled = true;
    });
    person.producer.on('PRODUCER_OUTPUT', (e) => {
      //e.producer.processingEnabled = false;
      _data.people[i].claim = e.output.calculatePrice(e.output.count).amount;
      e.output.incrementBy(-e.output.count);
    });
  });
}
}
