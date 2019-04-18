const PEOPLE = [
  {
    name: 'Beggars',
    description: 'A person, typically a homeless one, who lives by asking for money or food. They are all over the places from near the churches, street, in front of the fastfood restaurants. Other beggars walk from town to town where there is a lot of people walking by. Beggars in the Philippines are very common from children to very old person.',
    image: 'people_beggar',
    value: 1,
    cost: 35,
    costFactor: 1.08,
    output: {
      amount: 4,
      time: 1000
    }
  },
  {
    name: 'Sampaguita Vendors',
    description: 'Sampaguita Vendors sells sampaguita flower in a form of necklace, they are commonly found near the churches from rural town to urban grounds here in the Philippines. Common sampaguita vendors ages from 6 to 22 years old. Sampaguita flower is the national flower of the Philippines and is used in wedding and religious ceremonies to symbolize love, devotion, purity and divine hope.',
    image: 'people_sampaguita_vendor',
    value: 1,
    cost: 875,
    costFactor: 1.09,
    output: {
      amount: 66,
      time: 2000
    }
  },
  {
    name: 'Scrap Collectors',
    description: 'Scrap collectors travel from house to house using a wooden two-wheel cart or a bicycle with sidecar to ask for a bottle of empty alcohol drinks, scrap metals, or a broken and unusable appliances. Then at the end of the day, they will sell it to a junkshop to earn enough money for the whole day, everyday. Common scrap collectors are uneducated teenager guys and old men due to poverty.',
    image: 'people_scrap_collector',
    value: 1,
    cost: 70,
    costFactor: 1.1,
    output: {
      amount: 70,
      time: 4000
    }
  },
  {
    name: 'Laundresses',
    description: 'Laundresses are the typical housewives who washes and cleans the clothes of their neighbors to earn enough money to feed their family for 2 to 3 days. They are very common in rural areas and sometimes washes clothes near the river. Payment varies for each laundress, often pays per laundry basket or per clothes. ',
    image: 'people_laundress',
    value: 1,
    cost: 70,
    costFactor: 1.1,
    output: {
      amount: 70,
      time: 4000
    }
  },
  {
    name: 'Street Vendors',
    description: 'Street Vendors sell streetfoods such as fishball, kwek kwek(orange eggs), squidballs, calamares and kikiam. Without them, the street will never be the same again as they are very common here in the Philippines. Can be found on any busy areas such as schools, churches, public transportation terminals etc.',
    image: 'people_street_vendor',
    value: 1,
    cost: 165,
    costFactor: 1.11,
    output: {
      amount: 1000,
      time: 5000
    }
  },
  {
    name: 'Rice Farmers',
    description: 'Traditionally, rice farmers doesn\'t use machinery to do their work and often use a carabao and plow to farm the entire field. Farmers bowed down all day planting the rice stalk one by one in each plowed field. Salute to all of the farmers who love their work even though it\'s a very hard work with less income in return.',
    image: 'people_rice_farmer',
    value: 1,
    cost: 165,
    costFactor: 1.11,
    output: {
      amount: 1000,
      time: 5000
    }
  },
  {
    name: 'Fishermen',
    description: 'Fishing is a major source of livelihood for Filipinos living in coastal villages. Fishermen wanders on the sea every single day, sell the fishes to the supermarket to feed their family. Through the hot summer and sometimes stormy day, fishermen travel to the sea to keep their family alive.',
    image: 'people_fisherman',
    value: 1,
    cost: 165,
    costFactor: 1.11,
    output: {
      amount: 1000,
      time: 5000
    }
  },
  {
    name: 'Tricycle Drivers',
    description: 'Tricycle, a motorbike with a sidecar, is one of the most popular smaller public transportation vehicle in the Philippines bringing passengers to their point of destination. Tricycle drivers either have a given set of routes or are for-hire like taxis. Nowadays, Tricycle drivers keeps on growing that leads to lower income because of many competitor fellow public transportation drivers.',
    image: 'people_tricycle_driver',
    value: 1,
    cost: 165,
    costFactor: 1.11,
    output: {
      amount: 1000,
      time: 5000
    }
  },
  /*
  {
    name: 'Dishwashers',
    image: 'people_beggar',
    value: 1,
    cost: 165,
    costFactor: 1.11,
    output: {
      amount: 1000,
      time: 5000
    }
  },
  {
    name: 'Housekeepers',
    image: 'people_beggar',
    value: 1,
    cost: 165,
    costFactor: 1.11,
    output: {
      amount: 1000,
      time: 5000
    }
  },
  {
    name: 'Tricycle Drivers',
    image: 'people_beggar',
    value: 1,
    cost: 165,
    costFactor: 1.11,
    output: {
      amount: 1000,
      time: 5000
    }
  },
  {
    name: 'Jeepney Drivers',
    image: 'people_beggar',
    value: 1,
    cost: 165,
    costFactor: 1.11,
    output: {
      amount: 1000,
      time: 5000
    }
  },*/
];

const UPGRADES = [
  {
    name: 'Tapping skill',
    description: '100% tapping power',
    icon: 'upgrade_tap',
    level: 1,
    cost: 10,
    costFactor: 1.1,
    function: function() {
      _data.levels.tapper += _data.count*1.12;
      let value = (_data.tapper.count*10)*_data.levels.tapper;
      _data.tapper.amount = value/10;
      _data.shop.upgrade[0].ui.info.setText(formatValue(_data.levels.tapper*100) + '% tapping power');
    }
  },
  {
    name: 'Work skill',
    description: '1x level experience gain',
    icon: 'upgrade_exp',
    level: 1,
    cost: 40,
    costFactor: 1.3,
    levelRequire: 10,
    function: function() {
      let _this = _data.shop.upgrade[1];
      _this.ui.info.setText((_this.level+1) + 'x level experience gain');
    }
  },
  {
    name: 'Soul Purification',
    description: 'Give a blessing to all of your captured souls',
    icon: 'upgrade_purify',
    cost: 'Start purifying soul!',
    level: 0,
    levelRequire: 15,
    function: function() {
      _data.tapper.icon.setVisible(false);
      _data.tapper.purify.setVisible(true);
      _data.tapper.button.setDepth(10);
      _data.tapper.button_pressed.setDepth(9);
      if (!_scene.gameOver) {
        tooltip({
          //title: 'Divine Blessing',
          y: game.cY - (_data.tapper.button.height/2),
          text: 'Purifying the soul of every people you acquired will bring them positivity, great luck, and guidance. All of it will make them live the life they deserved depending on how nice and strong their beliefs are. However, as a drawback of using soul purification, you will lose all of your soul cash, soul coins, and finally freeing every soul you acquired. You\'ll go back to square one but as a result of using this power, you will get a tremendous soul boost of ' + formatValue(_scene.getBonus*100) + '%!',
          info: 'Press here to cancel',
          frame: 1,
          cancel: function() {
            _data.tapper.icon.setVisible(true);
            _data.tapper.purify.setVisible(false);
            _data.tapper.button.setDepth(5);
            _data.tapper.button_pressed.setDepth(4);
          }
        });
      } else if (_scene.gameOver && !_scene.openEnded) {
        tooltip({
          text: 'You started from the bottom now we\'re here. You have made it this far and you made me proud Philomenus. Purify all of them mortal\'s soul then I will consider this as a completion for the task that I gave you. As expected from the start, you did not disappoint me.', 
          title: 'King of the gods, Zeus',
          info: 'Mission accomplished',
          frame: 4,
          cancel: function() {
            _data.tapper.icon.setVisible(true);
            _data.tapper.purify.setVisible(false);
            _data.tapper.button.setDepth(5);
            _data.tapper.button_pressed.setDepth(4);
            /*_scene.scene.transition({
              target: 'SceneGameover',
              duration: 1000
            })*/
          }
        })
      }
    }
  },
  /*
  {
    name: 'Tapping skill',
    description: 'Increase the tapping power',
    icon: 'button_hand_pick',
    cost: 10,
    costFactor: 1.1,
    function: function() {
      _data.levels.tapper++;
      let value = (_data.tapper.count*10)*_data.levels.tapper;
      _data.tapper.amount = value/10;
    }
  },
  {
    name: 'Work skill',
    description: 'Double the gaining experience',
    icon: 'button_hand_pick',
    cost: 40,
    costFactor: 1.12
  },
  {
    name: 'Work skill',
    description: 'Double the gaining experience',
    icon: 'button_hand_pick',
    cost: 40,
    costFactor: 1.12
  },*/
];
