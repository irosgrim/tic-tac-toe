class DOM {
  createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children,
      },
    };
  }

  createTextElement(text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text || "",
        children: [],
      },
    };
  }

  render(element, container) {
    const domElement = element.type === "TEXT_ELEMENT"
      ? document.createTextNode(element.props.nodeValue || "")
      : document.createElement(element.type);

    const isProperty = (key) => key !== "children";

    Object.keys(element.props)
      .filter(isProperty)
      .forEach((propertyName) => {
        if (/^on/.test(propertyName)) {
          const eventName = propertyName.substring(2).toLowerCase();
          if (["click", "change", "mouseover"].includes(eventName)) {
            domElement.addEventListener(eventName, element.props[propertyName]);
          }
        }
        domElement[propertyName] = element.props[propertyName];
      });

    element.props.children.forEach((child) => this.render(child, domElement));
    container.appendChild(domElement);
  }
}

class Game {
  constructor(size, currentPlayer = "x") {
    this.size = size;
    this.grid = Array(this.size).fill().map(() => Array(this.size).fill(''));
    this.currentPlayer = currentPlayer;
    this.gameOver = false;
  }

  move(y, x) {
    this.grid[y][x] = this.currentPlayer;
    const winner = this.checkWinner();
    if (winner) {
      console.log("winner is: " + winner);
      this.gameOver = true;
    }
    this.currentPlayer = this.currentPlayer === "o" ? "x" : "o";
  }

  checkWinner() {
    const winningSequences = [
      ...Array(this.size).fill().map((_, y) => this.grid[y].join('')),
      ...Array(this.size).fill().map((_, x) => Array(this.size).fill().map((_, y) => this.grid[y][x]).join('')),
      Array(this.size).fill().map((_, i) => this.grid[i][i]).join(''),
      Array(this.size).fill().map((_, i) => this.grid[i][this.size-i-1]).join('')
    ];

    if (winningSequences.includes("x".repeat(this.size))) return "X";
    if (winningSequences.includes("o".repeat(this.size))) return "O";

    return null;
  }

  restart() {
    this.grid = Array(this.size).fill().map(() => Array(this.size).fill(''));
    this.gameOver = false;
    this.currentPlayer = "o";
    const cells = document.querySelectorAll(".btn");
    cells.forEach((cell) => {
        cell.innerText = ""; 
        cell.className = "btn";
    });
  }
}

class UI extends DOM {
  constructor(game) {
    super();
    this.game = game;
    this.board = document.getElementById("board");
    this.board.style.gridTemplateColumns = `repeat(${game.size}, 1fr)`;
    this.board.style.gridTemplateRows = `repeat(${game.size}, 1fr)`;
    this.board.style.fontSize = `${Math.max(10, (80 / game.size))}vw`;
    this.createBoard();
  }

  createBoard() {
    const els = [];
    for (let y = 0; y < this.game.size; y++) {
      for (let x = 0; x < this.game.size; x++) {
        const button = this.createElement(
          "button",
          {
            title: "btn",
            id: y + "_" + x,
            className: "btn",
            onClick: (e) => {
              if (this.game.grid[y][x] !== "" || this.game.gameOver) return;
              e.target.innerText = this.game.currentPlayer;
              e.target.classList.add(this.game.currentPlayer)
              this.game.move(y, x);
            },
          },
          this.createTextElement("")
        );
        els.push(button);
      }
    }
    els.forEach((el) => this.render(el, this.board));
    this.render(this.createElement("nav", {className: "menu"}, this.createElement("button", {title: "restart", className: "restart", id: "restart", onClick: () => this.game.restart()}, this.createTextElement("Restart"))), document.body)
  }
}

const game = new Game(4);
const ui = new UI(game);
