import Boot from './states/Boot';
import Preload from './states/Preload';
import Menu from './states/Menu';
import Setup from './states/Setup';
import Main from './states/Main';

class Game extends Phaser.Game {
  constructor() {
    super(1280, 640, Phaser.AUTO, 'game-area');

    this.state.add('Boot', Boot, false);
    this.state.add('Setup', Setup, false);
    this.state.add('Preload', Preload, false);
    this.state.add('Menu', Menu, false);
    this.state.add('Main', Main, false);

    this.state.start('Boot');
  }
}

new Game();
