(function (exports, require) {
  const mcts = require("mcts");

  exports.Action = function (p) {
    mcts.Action.call(this);

    this.pos = p;
  };

  exports.Action.prototype = Object.create(mcts.Action.prototype);

  exports.Action.prototype.toString = function () {
    return "" + this.pos;
  };

  exports.Game = function (o) {
    if (o instanceof exports.Game) {
      // copy game
      mcts.Game.call(this, o);
      this.board = o.board.slice();
      this.age = o.age.slice();
      this.his = o.his.slice();
    } else {
      // initialize new game
      mcts.Game.call(this, { nPlayers: 2 });
      this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      this.age = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      this.his = [];
    }
  };

  exports.Game.prototype = Object.create(mcts.Game.prototype);

  exports.Game.prototype.copyGame = function () {
    return new exports.Game(this);
  };

  exports.Game.prototype.toString = function () {
    var s = "";
    for (var i = 0; i < this.board.length; i++) {
      switch (this.board[i]) {
        case 0:
          s += ".";
          break;
        case 1:
          s += "X";
          break;
        case 2:
          s += "O";
          break;
      }
      if (i % 3 == 2) s += "\n";
    }
    s += "\n" + mcts.Game.prototype.toString.call(this);
    return s;
  };

  var lines = [
    // rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  exports.Game.prototype.allActions = function () {
    var as = [];
    for (var i = 0; i < this.board.length; i++) {
      if (this.board[i] == 0) {
        as.push(new exports.Action(1 + i));
      }
    }
    return as;
  };

  exports.Game.prototype.doAction = function (a) {
    mcts.Game.prototype.doAction.call(this, a);
    let m = [a.pos - 1];
    for (var i = 0; i < this.age.length; i++) {
      if (this.board[i] == this.currentPlayer) {
        this.age[i] = (this.age[i] + 1) % 4;
        if (this.age[i] == 0) {
          this.board[i] = 0;
          m.push(i);
        }
      }
    }
    this.board[a.pos - 1] = this.currentPlayer;
    this.age[a.pos - 1] = 1;
    this.his.push(m);
    var e = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var n1 = 0;
      var n2 = 0;
      for (var j = 0; j < line.length; j++) {
        switch (this.board[line[j]]) {
          case 1:
            n1++;
            break;
          case 2:
            n2++;
            break;
          case 0:
            e = true;
        }
      }
      if (n1 == 3) {
        this.winner = 1;
        break;
      }
      if (n2 == 3) {
        this.winner = 2;
        break;
      }
    }
    if (!this.isGameOver()) {
      if (!e) {
        this.winner = 0;
      } else {
        this.currentTurn++;
        this.currentPlayer = (this.currentPlayer % 2) + 1;
      }
    }
  };

  exports.Game.prototype.takeBack = function () {
    if (this.currentTurn > 1) {
      if (!this.isGameOver()) {
        this.currentPlayer = (this.currentPlayer % 2) + 1;
        this.currentTurn--;
      }
      for (var i = 0; i < this.age.length; i++) {
        if (this.board[i] === this.currentPlayer) {
          this.age[i]--;
        }
      }
      let last = this.his.pop();
      if (last.length === 1) {
        this.board[last[0]] = 0;
        this.age[last[0]] = 0;
      } else if (last.length === 2) {
        this.board[last[0]] = 0;
        this.age[last[0]] = 0;
        this.board[last[1]] = this.currentPlayer;
        this.age[last[1]] = 3;
      }
      this.winner = -1;
    }
  };
})(
  typeof exports === "undefined" ? (this.exports_ittt = {}) : exports,
  typeof exports === "undefined"
    ? function (m) {
        return this["exports_" + m];
      }
    : require
);
