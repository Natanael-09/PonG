let leftPaddle;
let rightPaddle;
let ball;
let leftScore = 0;
let rightScore = 0;
let gameOver = false;
let gameMode = "menu";
let ballImage;
let impactImage; // Imagem do impacto
let impactVisible = false; // Controle de visibilidade do impacto
let impactTimer = 0; // Timer para controlar a duração do impacto
let impactDuration = 500; // Duração do impacto em ms
let scoreGif; // GIF que será mostrado entre os pontos
let ballDelay = false; // Controle de delay
let delayStartTime = 0; // Tempo em que o ponto foi marcado
let delayDuration = 1000; // Duração do delay em milissegundos

function preload() {
  ballImage = loadImage('MXfo.gif'); // Carregar o novo GIF
  impactImage = loadImage('Z92e.gif'); // Carregar o GIF de impacto
  scoreGif = loadImage('XVo6.gif'); // Carregar o GIF da ampulheta
}

function setup() {
  createCanvas(400, 400);
  resetGame();
}

function resetGame() {
  leftPaddle = new Paddle(true);
  rightPaddle = new Paddle(false);
  ball = new Ball();
  gameOver = false;
  impactVisible = false; // Resetar visibilidade do impacto
  ballDelay = false; // Resetar estado de delay
}

function draw() {
  background(0);
  
  if (gameMode === "menu") {
    showMenu();
  } else if (gameMode === "playing") {
    playGame();
  } else if (gameMode === "gameOver") {
    showGameOver();
  }

  // Controlar a exibição do GIF de impacto
  if (impactVisible) {
    image(impactImage, ball.x - 50, ball.y - 50, 100, 100); // Ajustar posição e tamanho conforme necessário
    if (millis() - impactTimer > impactDuration) { // Dura conforme impactDuration
      impactVisible = false; // Ocultar após a duração
    }
  }
}

function showMenu() {
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Menu do Jogo", width / 2, height / 2 - 40);
  textSize(24);
  text("1. Jogador (vs IA)", width / 2, height / 2);
  text("2. 2 Jogadores", width / 2, height / 2 + 40);
  text("Pressione 1 ou 2 para jogar", width / 2, height / 2 + 100);
}

function showGameOver() {
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Fim de Jogo!", width / 2, height / 2 - 40);
  textSize(24);
  text("Escore: " + leftScore + " - " + rightScore, width / 2, height / 2);
  text("Pressione R para Reiniciar", width / 2, height / 2 + 40);
}

function playGame() {
  leftPaddle.show();
  leftPaddle.update();
  rightPaddle.show();
  
  if (rightPaddle.isAI) {
    rightPaddle.updateAutomatically(ball);
  } else {
    rightPaddle.update();
  }

  if (!ballDelay) { // A bola só se move se não houver delay
    ball.show();
    ball.update(leftPaddle, rightPaddle);
  }

  textSize(30);
  fill(255);
  text(leftScore, 50, 40);
  
  // Exibir o GIF da ampulheta no meio
  image(scoreGif, width / 2 - 20, 20, 40, 40); // Ajuste a posição e o tamanho conforme necessário
  
  text(rightScore, width - 80, 40);

  if (leftScore >= 10 || rightScore >= 10) {
    gameOver = true;
    gameMode = "gameOver";
  }

  // Controlar o estado de delay da bola
  if (ballDelay && millis() - delayStartTime > delayDuration) {
    ballDelay = false; // Parar o delay
  }
}

function keyPressed() {
  if (gameMode === "menu") {
    if (key === '1') {
      gameMode = "playing"; 
      rightPaddle.isAI = true; 
      ball.reset(); 
    } else if (key === '2') {
      gameMode = "playing"; 
      rightPaddle.isAI = false;
      ball.reset(); 
    }
  } else if (gameMode === "gameOver" && key === 'r') { 
    leftScore = 0;
    rightScore = 0;
    resetGame(); 
    gameMode = "menu"; 
  }
}

class Paddle {
  constructor(isLeft) {
    this.width = 10;
    this.height = 80;
    this.x = isLeft ? 0 : width - this.width;
    this.y = height / 2 - this.height / 2;
    this.isLeft = isLeft;
    this.isAI = false; // Começa como um jogador humano
  }

  show() {
    fill(255);
    rect(this.x, this.y, this.width, this.height);
  }

  update() {
    if (this.isLeft) {
      // Controles para a raquete da esquerda
      if (keyIsDown(87)) { // Tecla W
        this.y -= 5; // Mover para cima
      }
      if (keyIsDown(83)) { // Tecla S
        this.y += 5; // Mover para baixo
      }
    } 
    else if (!this.isAI) {
      // Controles para a raquete da direita se não for IA
      if (keyIsDown(UP_ARROW)) {
        this.y -= 5; // Mover para cima
      }
      if (keyIsDown(DOWN_ARROW)) {
        this.y += 5; // Mover para baixo
      }
    }

    // Limitar a movimentação da raquete
    this.y = constrain(this.y, 0, height - this.height);
  }

  updateAutomatically(ball) {
    // Movimento automático da raquete da direita (IA)
    if (ball.y < this.y) {
      this.y -= 3; // Mover para cima
    } else if (ball.y > this.y + this.height) {
      this.y += 3; // Mover para baixo
    }

    // Limitar a movimentação da raquete
    this.y = constrain(this.y, 0, height - this.height);
  }
}

class Ball {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = width / 2; // Posição X inicial centralizada
    this.y = height / 2; // Posição Y inicial centralizada
    this.radius = 20; // Raio da bola
    this.currentSpeed = 0; // Velocidade atual da bola
    this.maxSpeed = 5; // Velocidade máxima da bola
    this.acceleration = 0.1; // Aceleração da bola
    this.xSpeed = 0; // Inicializar xSpeed em 0
    this.ySpeed = 0; // Inicializar ySpeed em 0
  }

  show() {
    if (ballImage) { // Verifique se a imagem da bola foi carregada
      // Exibe a bola
      image(ballImage, this.x - this.radius, this.y - this.radius, this.radius * 2.5, this.radius * 2.5); // Aumentar a escala (2.5x) do tamanho do GIF
    } else {
      console.error("A imagem da bola não foi carregada");
    }
  }

  update(leftPaddle, rightPaddle) {
    // Verificando a pontuação e o respawn da bola
    if (this.x < 0) {
      rightScore += 1;
      ballDelay = true; // Iniciar o delay
      delayStartTime = millis(); // Capturar o tempo
      this.reset(); // Reseta a posição da bola
      return; // Sair da função para não mover a bola
    }

    if (this.x > width) {
      leftScore += 1;
      ballDelay = true; // Iniciar o delay
      delayStartTime = millis(); // Capturar o tempo
      this.reset(); // Reseta a posição da bola
      return; // Sair da função para não mover a bola
    }

    if (!ballDelay) {
      // Aumentar a velocidade gradualmente
      if (this.currentSpeed < this.maxSpeed) {
        this.currentSpeed += this.acceleration; // Aumenta a velocidade devagar
      }

      if (this.xSpeed === 0 && this.ySpeed === 0) {
        this.xSpeed = (random() < 0.5 ? 1 : -1) * this.currentSpeed; // Define a direção horizontal
        this.ySpeed = (random() < 0.5 ? 1 : -1) * this.currentSpeed; // Define a direção vertical
      }

      this.x += this.xSpeed; // Atualizar posição horizontal
      this.y += this.ySpeed; // Atualizar posição vertical

      // Verificar colisão com o topo e o fundo
      if (this.y < 0 || this.y > height) {
        this.ySpeed *= -1; // Inverter direção
      }

      // Verificar colisão com as raquetes
      if (this.x < leftPaddle.x + leftPaddle.width &&
          this.y > leftPaddle.y &&
          this.y < leftPaddle.y + leftPaddle.height) {
        this.xSpeed *= -1; // Invertendo a direção na colisão
        this.xSpeed += this.acceleration; // Adiciona incremento à velocidade
        this.ySpeed += this.acceleration * (random() < 0.5 ? 1 : -1); // Adiciona aleatoriedade à direção vertical
        this.x = leftPaddle.x + leftPaddle.width;

        // Ativar impacto
        impactVisible = true;
        impactTimer = millis(); // Iniciar o timer
      }

      if (this.x > rightPaddle.x &&
          this.y > rightPaddle.y &&
          this.y < rightPaddle.y + rightPaddle.height) {
        this.xSpeed *= -1; // Invertendo a direção na colisão
        this.xSpeed += this.acceleration; // Adiciona incremento à velocidade
        this.ySpeed += this.acceleration * (random() < 0.5 ? 1 : -1); // Adiciona aleatoriedade à direção vertical
        this.x = rightPaddle.x - this.radius;

        // Ativar impacto
        impactVisible = true;
        impactTimer = millis(); // Iniciar o timer
      }
    }
  }
}
 
