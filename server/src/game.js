const COLORS = ['#e74c3c', '#3498db', '#f1d315', '#27ae60', '#e67e22', '#8e44ad', '#16a085', '#34495e'];
const DEBUG = true;

const log = t => DEBUG && console.log(t);
const sleep = async t => await new Promise(r => setTimeout(r, t));

class Player {
  /**
   * @param {string} id
   * @param {string} name
   * @param {Object} socket
   * @param {Field.index} fieldIndex
   * @param {color} name
   */
  constructor(id, name, socket, fieldIndex, color) {
    this.id = id;
    this.name = name;
    this.socket = socket;
    this.fieldIndex = fieldIndex;
    this.color = color;
    this.sleep = 0;
    this.finished = false;
  }
}

class Field {
  /**
   * @param {number} index
   * @param {number} sleep
   * @param {number} goesTo
   */
  constructor(index, sleep, goesTo = 0) {
    this.index = index;
    this.goesTo = goesTo;
    this.sleep = sleep;
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
    this.nextColorIndex = 0;
    this.rolling = false;
  }

  /**
   * @param {string} id
   * @param {string} name
   * @param {Object} socket
   * @returns {number}
   */
  addPlayer(id, name, socket) {
    const player = new Player(id, name, socket, 0, COLORS[this.nextColorIndex]);
    this.players.push(player);
    this.nextColorIndex = (this.nextColorIndex + 1) % COLORS.length;
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
    if (toField.goesTo && toField.goesTo !== from) {
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
    if (player.sleep) {
      player.sleep -= 1;
      log(`New turn: ${player.name} sleeping (${player.sleep} more turns)`);
      this.sendRoll(player, 0);
    } else {
      const rolled = Math.ceil(Math.random() * 6);
      log(`New turn: ${player.name} rolled ${rolled}`);
      this.sendRoll(player, rolled);
      await sleep(700);
      await this.movePlayer(player.id, player.fieldIndex, player.fieldIndex + rolled);
    }
    const numOfPlayersFinished = this.players.filter(p => p.finished).length;
    if (numOfPlayersFinished !== this.players.length) {
      this.turnOfPlayer = (this.turnOfPlayer + 1) % this.players.length;
      while (this.players[this.turnOfPlayer].finished) {
        this.turnOfPlayer = (this.turnOfPlayer + 1) % this.players.length;
      }
    } else {
      this.state = GameState.FINISHED;
    }
    this.rolling = false;
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
        color: p.color,
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
    new Field(0, 0),
    new Field(1, 0),
    new Field(2, 0),
    new Field(3, 0),
    new Field(4, 0),
    new Field(5, 0, 7),
    new Field(6, 0, 13),
    new Field(7, 0),
    new Field(8, 0, 10),
    new Field(9, 0),
    new Field(10, 0),
    new Field(11, 0, 9),
    new Field(12, 0),
    new Field(13, 0),
    new Field(14, 0, 7),
    new Field(15, 0),
    new Field(16, 0),
    new Field(17, 0, 23),
    new Field(18, 0),
    new Field(19, 0),
    new Field(20, 0),
    new Field(21, 0),
    new Field(22, 0, 18),
    new Field(23, 0),
    new Field(24, 2),
    new Field(25, 0, 23),
    new Field(26, 0, 27),
    new Field(27, 0),
    new Field(28, 0),
    new Field(29, 0, 34),
    new Field(30, 0),
    new Field(31, 0),
    new Field(32, 0),
    new Field(33, 0),
    new Field(34, 0, 28),
    new Field(35, 0, 37),
    new Field(36, 0),
    new Field(37, 0),
    new Field(38, 0),
    new Field(39, 0, 36),
    new Field(40, 0),
    new Field(41, 0),
    new Field(42, 1),
    new Field(43, 0),
    new Field(44, 0, 41),
    new Field(45, 0),
    new Field(46, 0, 33),
    new Field(47, 0),
    new Field(48, 0, 45),
    new Field(49, 0, 47),
    new Field(50, 0),
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
