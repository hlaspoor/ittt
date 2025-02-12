const mcts = require("mcts");
const game = require("ittt");

var maxTrials = 100000;
var maxTime = 3000;
var g, p;
var timer;
var inThinking = false;

function startThinking() {
  g.currentActions = g.allActions();
  timer = window.setTimeout(function () {
    if (!g.isGameOver()) {
      inThinking = true;
      let state = p.startThinking(g);
      state.startTime = Date.now();
      timer = window.setTimeout(function () {
        computerThinking_continue(state);
      }, 0);
    }
  }, 200);
}

function computerThinking_continue(state) {
  let now = Date.now();
  if (now - state.startTime < maxTime && p.continueThinking(state, 1000)) {
    $("#msg").text("Thinking...");
    timer = window.setTimeout(function () {
      computerThinking_continue(state);
    }, 0);
    return;
  }
  let a = p.stopThinking(state);
}

function renderBoard() {
  for (let i = 0; i < 9; i++) {
    let c = g.board[i];
    $("#v" + (i + 1)).attr("class", c == 0 ? "empty" : c == 1 ? "cross" : "circle");
    $("#c" + (i + 1)).removeClass("winner");

    let idx = g.age[i];
    if (idx > 0) {
      $("#v" + (i + 1)).addClass("age" + idx);
    }
    if (idx === 3 && c === g.currentPlayer) {
      $("#v" + (i + 1)).addClass("waittoclear");
    }
  }
}

function newGame() {
  g = new game.Game();
  p = new mcts.MCTSPlayer({ nTrials: maxTrials });
  $("#searchdata").html("");
  $("#msg").html("");

  for (let i = 0; i < 9; i++) {
    $("#v" + (i + 1)).attr("class", "empty");
    $("#c" + (i + 1)).attr("class", "board-cell");
  }
  p.searchCallback = function (state) {
    let data = "[MCTS " + state.root.totalNodeCount + " nodes in " + state.time + " ms]\n";
    for (let i = 0; i < state.root.children.length; i++) {
      let n = state.root.children[i];
      data += (n === state.best ? "*" : " ") + " " + n.toString() + "\n";
    }
    if (state.best) {
      // data += "\nAverage Search Depth " + state.avgSearchDepth.toFixed(4) + "\nAverage Game Depth " + state.avgGameDepth.toFixed(4) + "\nAverage Branching Factor " + state.avgBranchingFactor.toFixed(4) + "\n";
      data += "bestmove " + (g.currentPlayer == 1 ? "X" : "O") + state.best.action.pos;
      if (!g.isGameOver()) {
        let p = g.currentPlayer == 1 ? "X" : "O";
        $("#msg").html(p + "'s turn to move");
      }

      // data += g.toString();
      inThinking = false;
    }
    $("#searchdata").html("<pre>" + data + "</pre>");
  };

  $(".board-cell").on("click", (event) => {
    if (g.isGameOver()) {
      return;
    }
    if (inThinking) {
      return;
    }
    let pos = parseInt(event.currentTarget.id.substring(1));
    g.currentActions = g.allActions();
    for (let i = 0; i < g.currentActions.length; i++) {
      let a = g.currentActions[i];
      if (pos == a.pos) {
        g.doAction(a);
        for (let i = 0; i < 9; i++) {
          let c = g.board[i];
          let gameOver = g.isGameOver();
          $("#v" + (i + 1)).attr("class", c == 0 ? "empty" : c == 1 ? "cross" : "circle");
          let idx = g.age[i];
          if (idx > 0) {
            $("#v" + (i + 1)).addClass("age" + idx);
            if (!gameOver && idx == 3 && c === g.currentPlayer) {
              $("#v" + (i + 1)).addClass("waittoclear");
            } else if (gameOver) {
              if (g.winner == c) {
                $("#c" + (i + 1)).addClass("winner");
                $("#msg").html("Game Over, " + (g.winner == 1 ? "X" : "O") + " Wins!");
              }
            }
          }
        }
        startThinking();
        break;
      }
    }
  });

  startThinking();
}

$(() => {
  $("#btnRestart").on("click", () => {
    if (inThinking) {
      return;
    }
    newGame();
  });
  $("#btnTakeBack").on("click", () => {
    if (inThinking) {
      return;
    }
    if (g.currentTurn === 1) {
      return;
    }
    g.takeBack();
    renderBoard();
    startThinking();
  });
  newGame();
});
