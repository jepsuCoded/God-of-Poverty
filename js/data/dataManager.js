class DataManager {
  constructor() {}
  
  save() {
    localforage.setItem('saved', true);
    localforage.setItem('time', Date.now());
    localforage.setItem('bonus', _data.bonus);
    localforage.setItem('main_level', _data.god.level);
    localforage.setItem('main_soul', _scene.engine.currencies.soul.value);
    localforage.setItem('main_peso', _scene.engine.currencies.peso.value);
    
    localforage.setItem('tapper_count', _data.tapper.count);
    localforage.setItem('tapper_factor', _data.tapper.level_factor);
    localforage.setItem('tapper_target', _data.tapper.level_target);
    localforage.setItem('tapper_current', _data.tapper.level_current);
    localforage.setItem('tapper_amount', _data.tapper.amount);
    localforage.setItem('tapper_level', _data.levels.tapper);
    
    localforage.setItem('shop_page', _data.shop.page);
    
    let manager = [];
    for (let i = 0; i < _data.shop.manager.length; i++) {
      let $ = _data.shop.manager[i];
      manager.push({
        level: $.level,
        cost: $.cost,
        ui: {
          text: {
            name: $.ui.name.text,
            cost: $.ui.cost.text
          },
          color: {
            cost: $.ui.cost.style.color,
            button: $.ui.button.fillColor
          }
        }
      });
    }
    localforage.setItem('shop_manager', manager);
    
    let upgrade = [];
    for (let i = 0; i < _data.shop.upgrade.length; i++) {
      let $ = _data.shop.upgrade[i];
      upgrade.push({
        level: $.level,
        cost: $.cost,
        ui: {
          name: $.ui.name.text,
          cost: $.ui.cost.text,
          info: $.ui.info.text
        }
      });
    }
    localforage.setItem('shop_upgrade', upgrade);
    
    let people = [];
    for (let i = 0; i < _data.people.length; i++) {
      let $ = _data.people[i];
      people.push({
        //producer: $.producer,
        manager: $.manager.count,
        cost: $.cost,
        level: $.level,
        bought: $.bought,
        time: $.getOutput.time,
        amount: $.getOutput.amount,
        milestone: $.milestone,
        ui: {
          newIndicator: $.ui.newIndicator.hasVisited,
          text: {
            info: $.ui.info.text,
            name: $.ui.name.text,
            cost: $.ui.cost.text,
            avatar_count_text: $.ui.avatar_count_text.text
          },
          color: {
            count: $.ui.count.fillColor,
            info: $.ui.info.style.color,
            name: $.ui.name.style.color,
            avatar_count_text: $.ui.avatar_count_text.style.color
          }
        }
      });
    }
    localforage.setItem('people', people);
  }
  
  load() {
    localforage.getItem('saved', (err, val) => {
      if (err || !val) {
        console.log('No saved data exist.');
        _data.tutorial = true;
        return;
      }
      localforage.getItem('gameover', (a, b) => {
        if (a || !b) {
          return;
        }
        _scene.gameOver = false;
        _scene.openEnded = true;
      });
      localforage.getItem('bonus', (a, b) => {
        _data.bonus = b;
        _data.display.bonus_text.setText('+' + formatValue((_data.bonus-1)*100) + '%');
      });
      localforage.getItem('main_level', (a, b) => _data.god.level = b);
      localforage.getItem('main_soul', (a, b) => {
        _scene.engine.currencies.soul.value = b;
        incrementCash('soul', 0);
      });
      localforage.getItem('main_peso', (a, b) => {
        _scene.engine.currencies.peso.value = b;
        incrementCash('peso', 0);
      });
      
      localforage.getItem('tapper_count', (a, b) => _data.tapper.count = b);
      localforage.getItem('tapper_factor', (a, b) => _data.tapper.level_factor = b);
      localforage.getItem('tapper_target', (a, b) => _data.tapper.level_target = b);
      localforage.getItem('tapper_current', (a, b) => _data.tapper.level_current = b);
      localforage.getItem('tapper_amount', (a, b) => _data.tapper.amount = b);
      localforage.getItem('tapper_level', (a, b) => {
        let percent = _data.tapper.level_current / _data.tapper.level_target;
        
        _data.levels.tapper = b;
        _data.display.level_text.setText('LEVEL ' + _data.god.level);
        
        _data.shop.upgrade[0].ui.info.setText(formatValue(_data.levels.tapper*100) + '% tapping power');
        
        _data.display.level_holder_text.setText(formatValue(_data.tapper.level_current) + '/' + formatValue(_data.tapper.level_target));
        _scene.tweens.add({
          targets: _data.display.level_bar,
          scaleX: percent,
          duration: percent === 0 ? 200 : 100
        });
      });
      
      localforage.getItem('shop_page', (a, b) => _data.shop.page = b);
      
      localforage.getItem('shop_manager', (a, b) => {
        b.forEach((item, i) => {
          let $ = _data.shop.manager[i];
          $.level = item.level;
          $.cost = item.cost;
          $.ui.name.setText(item.ui.text.name);
          $.ui.cost.setText(item.ui.text.cost);
          $.ui.cost.setColor(item.ui.color.cost);
          $.ui.button.setFillStyle(item.ui.color.button);
          if ($.ui.cost == 'HIRED') $.ui.button.removeInteractive();
          });
      });
      
      localforage.getItem('shop_upgrade', (a, b) => {
        //if (!b) return;
        b.forEach((item, i) => {
          let $ = _data.shop.upgrade[i];
          $.level = item.level;
          $.cost = item.cost;
          $.ui.name.setText(item.ui.name);
          $.ui.info.setText(item.ui.info);
          $.ui.cost.setText(item.ui.cost);
          if ($.levelRequire <= _data.god.level) {
            $.levelRequire = undefined;
          }
        });
      });
      
      localforage.getItem('people', (a, b)  => {
        _data.earned = 0;
        b.forEach((person, i) => {
          let $ = _data.people[i];
          //$.producer = person.producer;
          
          $.milestone = person.milestone;
          
          $.getOutput.time = person.time;
          $.getOutput.amount = person.amount;
          
          $.resource.state.basePrice.amount = parseInt(person.amount * _data.bonus);
          $.producer.outputs.resources[$.key].productionTime = $.getOutput.time;
          
          $.producer.incrementBy(parseInt(person.level-1));
          
          if (person.bought) {
            $.discoverable = true;
            $.fromSave = true;
            $.unlock();
          }
          
          $.cost = person.cost;
          $.level = person.level;
          
          
          //if (person.manager === 0)
          $.startProcessing();
          $.manager.state.count = person.manager;
          
          if ($.manager.state.count > 0) {
            _data.shop.manager[$.id].ui.button.removeInteractive();
            localforage.getItem('time', (a, b) => {
              let delta = Date.now() - b;
              let count = Math.floor(delta/person.time);
              _data.earned += $.resource.calculatePrice($.producer.count).amount*count;
            });
          }
          
          $.ui.newIndicator.hasVisited = person.ui.newIndicator;
          if (person.ui.newIndicator) $.ui.newIndicator.setVisible(false);
          
          $.ui.info.setText(person.ui.text.info);
          $.ui.name.setText(person.ui.text.name);
          $.ui.cost.setText(person.ui.text.cost);
          $.ui.avatar_count_text.setText(person.ui.text.avatar_count_text);
          $.ui.info.setColor(person.ui.color.info);
          $.ui.name.setColor(person.ui.color.name);
          $.ui.avatar_count_text.setColor(person.ui.color.avatar_count_text);
          $.ui.count.setFillStyle(person.ui.color.count);
          
          if ($.page == _data.page.current)
            $.show();
          else $.hide();
        });
      });
    });
  }
}
