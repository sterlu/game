const COLORS = ['#e74c3c', '#3498db', '#f1d315', '#27ae60', '#e67e22', '#8e44ad', '#16a085', '#34495e'];
const SKINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const DEBUG = true;

const log = t => DEBUG && console.log(t);
const sleep = async t => await new Promise(r => setTimeout(r, t));

class Player {
  /**
   * @param {string} id
   * @param {string} name
   * @param {Object} socket
   * @param {Field.index} fieldIndex
   * @param {number} skinIndex
   */
  constructor(id, name, socket, fieldIndex, skinIndex) {
    this.id = id;
    this.name = name;
    this.socket = socket;
    this.fieldIndex = fieldIndex;
    this.skinIndex = skinIndex;
    this.sleep = 0;
    this.finished = false;
  }
}

class Field {
  /**
   * @param {number} index
   * @param {number} x
   * @param {number} y
   * @param {number} sleep
   * @param {number} goesTo
   * @param {boolean} goesBothWays
   */
  constructor(index, x, y, sleep, goesTo = 0, goesBothWays = false) {
    this.index = index;
    this.x = x;
    this.y = y;
    this.goesTo = goesTo;
    this.sleep = sleep;
    this.goesBothWays = goesBothWays;
    /** @type {Player.id[]} */
    this.players = [];
  }
}

const GameState = {
  PREGAME: 0,
  ONGOING: 1,
  FINISHED: 2,
};

class Game {
  /**
   * @param {string} name
   * @param {Field[]} fields
   */
  constructor(name, fields) {
    this.name = name;
    this.fields = fields;
    /** @type {Player[]} */
    this.players = [];
    /** @type {number} */
    this.turnOfPlayer = 0;
    this.state = GameState.PREGAME;
    this.rolling = false;
    this.sixCounter = 0;
  }

  /**
   * @param {string} id
   * @param {string} name
   * @param {Object} socket
   * @returns {number}
   */
  addPlayer(id, name, socket) {
    const unusedSkins = SKINS.filter(s => this.players.findIndex(p => p.skinIndex === s) === -1);
    console.log(unusedSkins);
    const skin = unusedSkins[Math.floor(Math.random() * unusedSkins.length)];
    console.log(skin);
    const player = new Player(id, name, socket, 0, skin);
    this.players.push(player);

    this.fields[0].players.push(player.id);
    log(`Added player ${name}`);
    this.sendState();
    return this.players.length - 1;
  }

  /**
   * @param {string} id
   */
  removePlayer(id) {
    const index = this.players.findIndex(p => p.id === id);
    if (index < 0) return;
    if (this.state === GameState.ONGOING && index < this.turnOfPlayer) this.turnOfPlayer -= 1;
    if (this.state === GameState.ONGOING && index === this.players.length - 1) this.turnOfPlayer = 0;
    const player = this.players[index];
    log(`Removed player ${player.name}`);
    this.fields[player.fieldIndex].players.splice(this.fields[player.fieldIndex].players.indexOf(player.id), 1);
    this.players.splice(index, 1);
    if (this.players.length === 0) this.state = GameState.PREGAME;
    this.sendState();
  }

  start() {
    if (this.players.length >= 2) {
      this.state = GameState.ONGOING;
      log('Game started');
      this.sendState();
    }
  }

  /**
   * @param {Player.id} playerId
   * @param {Field.index} from
   * @param {Field.index} to
   */
  async movePlayer(playerId, from, to) {
    const player = this.players.find(p => p.id === playerId);
    if (to > this.fields.length - 1) return [];
    if (from === to) return [];
    if (to < 0) to = 0;
    log(`Moving ${player.name} from ${from} to ${to}`);
    const toField = this.fields[to];
    const fromField = this.fields[from];
    const stateChanges = [[playerId, from, to]];
    fromField.players.splice(fromField.players.indexOf(playerId), 1);
    toField.players.push(playerId);
    player.fieldIndex = to;
    player.sleep = toField.sleep;
    if (to === this.fields.length - 1) player.finished = true;
    this.sendState();
    if (toField.players.length > 1 && to !== 0 && to !== 50) {
      await sleep(500);
      log(`Player ${this.players.find(p => p.id === toField.players[0]).name} already on ${to}`);
      stateChanges.push(...(await this.movePlayer(toField.players[0], to, to - 3)));
    }
    if (toField.goesTo && !(toField.goesBothWays && fromField.goesBothWays)) {
      log(`Special field ${to} goes to ${toField.goesTo}`);
      await sleep(600);
      console.log(stateChanges);
      stateChanges.push(...(await this.movePlayer(playerId, to, toField.goesTo)));
    }
    return stateChanges;
  }

  async turn() {
    const player = this.players[this.turnOfPlayer];
    this.rolling = true;
    let rolled = 0;
    if (player.sleep) {
      player.sleep -= 1;
      log(`New turn: ${player.name} sleeping (${player.sleep} more turns)`);
      this.sendRoll(player, 0);
    } else {
      rolled = 1 + Math.floor(Math.random() * 6);
      log(`New turn: ${player.name} rolled ${rolled}`);
      this.sendRoll(player, rolled);
      await sleep(700);
      if (rolled === 6) this.sixCounter += 1;
      else this.sixCounter = 0;
      if (this.sixCounter === 3) {
        await this.movePlayer(player.id, player.fieldIndex, 0);
        this.sixCounter = 0;
      } else {
        await this.movePlayer(player.id, player.fieldIndex, player.fieldIndex + rolled);
      }
    }
    const numOfPlayersFinished = this.players.filter(p => p.finished).length;
    if (numOfPlayersFinished !== this.players.length) {
      if (rolled !== 6 || this.players[this.turnOfPlayer].sleep || this.sixCounter === 0 || this.players[this.turnOfPlayer].finished) {
        while (true) {
          this.turnOfPlayer = (this.turnOfPlayer + 1) % this.players.length;
          const skipBecauseFinished = this.players[this.turnOfPlayer].finished;
          let skipBecauseSleep = false;
          if (this.players[this.turnOfPlayer].sleep) {
            skipBecauseSleep = true;
            this.players[this.turnOfPlayer].sleep -= 1;
          }
          if (!skipBecauseFinished && !skipBecauseSleep) {
            break;
          }
        }
      }
    } else {
      this.state = GameState.FINISHED;
    }
    this.rolling = false;
    await sleep(700);
    this.sendState();
    log('---\n');
    return this.players.filter(p => p.finished).length;
  }

  printState() {
    this.players.forEach(p => log(`${p.name}: \t${p.fieldIndex}`));
  }

  sendState() {
    this.printState();
    const state = {
      state: this.state,
      turnOfPlayer: this.turnOfPlayer,
      rolling: this.rolling,
      players: this.players.map(p => ({
        name: p.name,
        id: p.id,
        sleep: p.sleep,
        fieldIndex: p.fieldIndex,
        skinIndex: p.skinIndex,
      })),
    };
    this.players.forEach((p) => {
      if (p.socket) p.socket.emit('state', state);
    });
  }

  sendRoll(player, rolled) {
    const message = {
      player: { id: player.id, name: player.name },
      rolled,
    };
    this.players.forEach((p) => {
      if (p.socket) p.socket.emit('rolled', message);
    });
  }

  _logFields() {
    console.log(this.fields)
  }
}

/**
 * @returns {Game}
 */
function createGame() {
  const fields = [
    new Field(0, 56, 98, 0),
    new Field(1, 94, 132, 0),
    new Field(2, 104, 190, 0),
    new Field(3, 107, 252, 0),
    new Field(4, 101, 313, 0),
    new Field(5, 76, 374, 0, 7),
    new Field(6, 57, 434, 0, 13),
    new Field(7, 65, 495, 0),
    new Field(8, 113, 536, 0, 10),
    new Field(9, 174, 545, 0),
    new Field(10, 234, 524, 0),
    new Field(11, 261, 465, 0, 9),
    new Field(12, 276, 406, 0),
    new Field(13, 256, 347, 0),
    new Field(14, 224, 294, 0, 7),
    new Field(15, 206, 235, 0),
    new Field(16, 206, 175, 0, 23),
    new Field(17, 226, 121, 0,),
    new Field(18, 267, 80, 0),
    new Field(19, 317, 52, 0),
    new Field(20, 376, 52, 0),
    new Field(21, 427, 80, 0),
    new Field(22, 452, 132, 0, 18),
    new Field(23, 431, 187, 0),
    new Field(24, 398, 236, 2),
    new Field(25, 371, 290, 0, 23),
    new Field(26, 355, 346, 0, 27),
    new Field(27, 351, 404, 0),
    new Field(28, 367, 462, 0),
    new Field(29, 396, 513, 0, 34, true),
    new Field(30, 453, 540, 0),
    new Field(31, 517, 534, 0),
    new Field(32, 572, 499, 0),
    new Field(33, 603, 445, 0),
    new Field(34, 603, 380, 0, 29, true),
    new Field(35, 578, 322, 0, 37),
    new Field(36, 560, 261, 0),
    new Field(37, 542, 200, 0),
    new Field(38, 542, 139, 0),
    new Field(39, 567, 82, 0, 36),
    new Field(40, 623, 55, 0),
    new Field(41, 685, 56, 0),
    new Field(42, 736, 98, 1),
    new Field(43, 757, 160, 0),
    new Field(44, 753, 225, 0, 41),
    new Field(45, 738, 284, 0),
    new Field(46, 707, 341, 0, 33),
    new Field(47, 686, 399, 0),
    new Field(48, 685, 461, 0, 45),
    new Field(49, 704, 519, 0, 47),
    new Field(50, 700, 580, 0),
  ];
  return new Game('Test igra', fields);
}

module.exports = createGame;

async function test() {
  const game = createGame();
  game.addPlayer('1', 'Braca', {});
  game.addPlayer('2', 'Šomi', {});
  game.addPlayer('3', 'Duje', {});

  while (!game.turn()) {
    await new Promise(r => setTimeout(r, 1000));
  }
}

// test();
