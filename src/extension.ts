// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "yuruteto" is now active!');

	// Register the Tetris game command
	const disposable = vscode.commands.registerCommand('yuruteto.startTetris', () => {
		TetrisPanel.createOrShow(context.extensionUri);
	});

	context.subscriptions.push(disposable);
}

/**
 * Manages Tetris webview panels
 */
class TetrisPanel {
	public static currentPanel: TetrisPanel | undefined;
	public static readonly viewType = 'tetris';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (TetrisPanel.currentPanel) {
			TetrisPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			TetrisPanel.viewType,
			'Tetris Game',
			column || vscode.ViewColumn.One,
			{
				// Enable javascript in the webview
				enableScripts: true,
				// And restrict the webview to only loading content from our extension's `media` directory.
				localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
			}
		);

		TetrisPanel.currentPanel = new TetrisPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public dispose() {
		TetrisPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		const webview = this._panel.webview;
		this._panel.title = 'Tetris Game';
		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the URI for the audio file
		const audioUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'suno.bgm.mp3'));
		
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Tetris Game</title>
	<style>
		body {
			font-family: var(--vscode-font-family);
			background-color: var(--vscode-editor-background);
			color: var(--vscode-editor-foreground);
			margin: 0;
			padding: 20px;
			display: flex;
			justify-content: center;
			align-items: center;
			min-height: 100vh;
		}
		
		.game-container {
			display: flex;
			gap: 20px;
			align-items: flex-start;
		}
		
		.game-board {
			border: 2px solid var(--vscode-panel-border);
			background-color: #000;
		}
		
		.game-info {
			display: flex;
			flex-direction: column;
			gap: 10px;
			min-width: 150px;
		}
		
		.info-panel {
			background-color: var(--vscode-panel-background);
			border: 1px solid var(--vscode-panel-border);
			padding: 10px;
			border-radius: 4px;
		}
		
		.controls {
			font-size: 12px;
			line-height: 1.4;
		}
		
		button {
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			padding: 8px 16px;
			border-radius: 4px;
			cursor: pointer;
			width: 100%;
			margin-top: 10px;
		}
		
		button:hover {
			background-color: var(--vscode-button-hoverBackground);
		}
		
		.score, .level, .lines {
			margin: 5px 0;
			font-weight: bold;
		}

		.audio-controls {
			display: flex;
			align-items: center;
			gap: 10px;
			margin-top: 10px;
		}

		.audio-controls button {
			width: auto;
			padding: 4px 8px;
			margin: 0;
		}

		.volume-control {
			display: flex;
			align-items: center;
			gap: 5px;
			margin-top: 5px;
		}

		.volume-control input {
			width: 80px;
		}
	</style>
</head>
<body>
	<div class="game-container">
		<canvas id="gameCanvas" class="game-board" width="300" height="600"></canvas>
		<div class="game-info">
			<div class="info-panel">
				<div class="score">Score: <span id="score">0</span></div>
				<div class="level">Level: <span id="level">1</span></div>
				<div class="lines">Lines: <span id="lines">0</span></div>
			</div>
			
			<div class="info-panel">
				<h4>Next Piece</h4>
				<canvas id="nextCanvas" width="120" height="120"></canvas>
			</div>
			
			<div class="info-panel controls">
				<h4>Controls</h4>
				<div>← → : Move</div>
				<div>↓ : Soft Drop</div>
				<div>↑ : Rotate</div>
				<div>Space : Hard Drop</div>
				<div>P : Pause</div>
			</div>

			<div class="info-panel">
				<h4>🎵 BGM</h4>
				<div class="audio-controls">
					<button id="playPauseBtn">🎵 Play</button>
					<button id="stopBtn">⏹️ Stop</button>
				</div>
				<div class="volume-control">
					<span>Volume:</span>
					<input type="range" id="volumeSlider" min="0" max="100" value="30">
					<span id="volumeValue">30%</span>
				</div>
			</div>
			
			<button id="startButton">Start Game</button>
			<button id="pauseButton">Pause</button>
			<button id="resetButton">Reset</button>
		</div>
	</div>

	<!-- BGM Audio Element -->
	<audio id="bgmAudio" loop preload="auto">
		<source src="${audioUri}" type="audio/mpeg">
		Your browser does not support the audio element.
	</audio>

	<script>
		const canvas = document.getElementById('gameCanvas');
		const ctx = canvas.getContext('2d');
		const nextCanvas = document.getElementById('nextCanvas');
		const nextCtx = nextCanvas.getContext('2d');
		
		// BGM Controls
		const bgmAudio = document.getElementById('bgmAudio');
		const playPauseBtn = document.getElementById('playPauseBtn');
		const stopBtn = document.getElementById('stopBtn');
		const volumeSlider = document.getElementById('volumeSlider');
		const volumeValue = document.getElementById('volumeValue');
		
		// Set initial volume
		bgmAudio.volume = 0.3;
		
		// BGM Control Handlers
		playPauseBtn.addEventListener('click', () => {
			if (bgmAudio.paused) {
				bgmAudio.play().then(() => {
					playPauseBtn.textContent = '⏸️ Pause';
				}).catch(e => {
					console.log('Audio play failed:', e);
				});
			} else {
				bgmAudio.pause();
				playPauseBtn.textContent = '🎵 Play';
			}
		});
		
		stopBtn.addEventListener('click', () => {
			bgmAudio.pause();
			bgmAudio.currentTime = 0;
			playPauseBtn.textContent = '🎵 Play';
		});
		
		volumeSlider.addEventListener('input', (e) => {
			const volume = e.target.value / 100;
			bgmAudio.volume = volume;
			volumeValue.textContent = e.target.value + '%';
		});
		
		// Auto-play BGM when game starts (with user interaction)
		let bgmStarted = false;
		
		const BOARD_WIDTH = 10;
		const BOARD_HEIGHT = 20;
		const BLOCK_SIZE = 30;
		
		// Tetris pieces (tetrominoes)
		const PIECES = [
			// I piece
			[
				[0, 0, 0, 0],
				[1, 1, 1, 1],
				[0, 0, 0, 0],
				[0, 0, 0, 0]
			],
			// O piece
			[
				[0, 0, 0, 0],
				[0, 1, 1, 0],
				[0, 1, 1, 0],
				[0, 0, 0, 0]
			],
			// T piece
			[
				[0, 0, 0, 0],
				[0, 1, 0, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0]
			],
			// S piece
			[
				[0, 0, 0, 0],
				[0, 1, 1, 0],
				[1, 1, 0, 0],
				[0, 0, 0, 0]
			],
			// Z piece
			[
				[0, 0, 0, 0],
				[1, 1, 0, 0],
				[0, 1, 1, 0],
				[0, 0, 0, 0]
			],
			// J piece
			[
				[0, 0, 0, 0],
				[1, 0, 0, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0]
			],
			// L piece
			[
				[0, 0, 0, 0],
				[0, 0, 1, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0]
			]
		];
		
		const COLORS = [
			'#00FFFF', // I - Cyan
			'#FFFF00', // O - Yellow
			'#800080', // T - Purple
			'#00FF00', // S - Green
			'#FF0000', // Z - Red
			'#0000FF', // J - Blue
			'#FFA500'  // L - Orange
		];
		
		let board = [];
		let currentPiece = null;
		let nextPiece = null;
		let currentX = 0;
		let currentY = 0;
		let score = 0;
		let level = 1;
		let lines = 0;
		let gameRunning = false;
		let gameLoop = null;
		let dropTime = 0;
		let lastTime = 0;
		
		// Initialize game board
		function initBoard() {
			board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
		}
		
		// Create new piece
		function createPiece() {
			const pieceIndex = Math.floor(Math.random() * PIECES.length);
			return {
				shape: PIECES[pieceIndex],
				color: pieceIndex,
				rotation: 0
			};
		}
		
		// Rotate piece matrix
		function rotatePiece(piece) {
			const rotated = piece.shape[0].map((_, i) =>
				piece.shape.map(row => row[i]).reverse()
			);
			return { ...piece, shape: rotated };
		}
		
		// Check if piece can be placed at position
		function isValidPosition(piece, x, y) {
			for (let py = 0; py < 4; py++) {
				for (let px = 0; px < 4; px++) {
					if (piece.shape[py][px]) {
						const newX = x + px;
						const newY = y + py;
						
						if (newX < 0 || newX >= BOARD_WIDTH || 
							newY >= BOARD_HEIGHT || 
							(newY >= 0 && board[newY][newX])) {
							return false;
						}
					}
				}
			}
			return true;
		}
		
		// Place piece on board
		function placePiece() {
			for (let py = 0; py < 4; py++) {
				for (let px = 0; px < 4; px++) {
					if (currentPiece.shape[py][px]) {
						const x = currentX + px;
						const y = currentY + py;
						if (y >= 0) {
							board[y][x] = currentPiece.color + 1;
						}
					}
				}
			}
		}
		
		// Clear completed lines
		function clearLines() {
			let linesCleared = 0;
			for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
				if (board[y].every(cell => cell !== 0)) {
					board.splice(y, 1);
					board.unshift(Array(BOARD_WIDTH).fill(0));
					linesCleared++;
					y++; // Check this line again
				}
			}
			
			if (linesCleared > 0) {
				lines += linesCleared;
				score += linesCleared * 100 * level;
				level = Math.floor(lines / 10) + 1;
				updateUI();
			}
		}
		
		// Move piece down
		function dropPiece() {
			if (isValidPosition(currentPiece, currentX, currentY + 1)) {
				currentY++;
			} else {
				placePiece();
				clearLines();
				spawnNewPiece();
			}
		}
		
		// Spawn new piece
		function spawnNewPiece() {
			currentPiece = nextPiece;
			nextPiece = createPiece();
			currentX = Math.floor(BOARD_WIDTH / 2) - 2;
			currentY = 0;
			
			if (!isValidPosition(currentPiece, currentX, currentY)) {
				gameOver();
			}
		}
		
		// Game over
		function gameOver() {
			gameRunning = false;
			alert('Game Over! Score: ' + score);
		}
		
		// Update UI elements
		function updateUI() {
			document.getElementById('score').textContent = score;
			document.getElementById('level').textContent = level;
			document.getElementById('lines').textContent = lines;
		}
		
		// Draw block
		function drawBlock(ctx, x, y, color) {
			ctx.fillStyle = COLORS[color];
			ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
			ctx.strokeStyle = '#FFF';
			ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
		}
		
		// Draw board
		function drawBoard() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			
			for (let y = 0; y < BOARD_HEIGHT; y++) {
				for (let x = 0; x < BOARD_WIDTH; x++) {
					if (board[y][x]) {
						drawBlock(ctx, x, y, board[y][x] - 1);
					}
				}
			}
		}
		
		// Draw current piece
		function drawCurrentPiece() {
			if (currentPiece) {
				for (let py = 0; py < 4; py++) {
					for (let px = 0; px < 4; px++) {
						if (currentPiece.shape[py][px]) {
							drawBlock(ctx, currentX + px, currentY + py, currentPiece.color);
						}
					}
				}
			}
		}
		
		// Draw next piece
		function drawNextPiece() {
			nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
			if (nextPiece) {
				for (let py = 0; py < 4; py++) {
					for (let px = 0; px < 4; px++) {
						if (nextPiece.shape[py][px]) {
							nextCtx.fillStyle = COLORS[nextPiece.color];
							nextCtx.fillRect(px * 20 + 10, py * 20 + 10, 20, 20);
							nextCtx.strokeStyle = '#FFF';
							nextCtx.strokeRect(px * 20 + 10, py * 20 + 10, 20, 20);
						}
					}
				}
			}
		}
		
		// Game loop
		function gameUpdate(time = 0) {
			if (!gameRunning) return;
			
			const deltaTime = time - lastTime;
			lastTime = time;
			dropTime += deltaTime;
			
			if (dropTime > 1000 / level) {
				dropPiece();
				dropTime = 0;
			}
			
			drawBoard();
			drawCurrentPiece();
			drawNextPiece();
			
			requestAnimationFrame(gameUpdate);
		}
		
		// Start game
		function startGame() {
			initBoard();
			score = 0;
			level = 1;
			lines = 0;
			gameRunning = true;
			
			currentPiece = createPiece();
			nextPiece = createPiece();
			currentX = Math.floor(BOARD_WIDTH / 2) - 2;
			currentY = 0;
			
			updateUI();
			
			// Start BGM when game starts
			if (!bgmStarted) {
				bgmAudio.play().then(() => {
					playPauseBtn.textContent = '⏸️ Pause';
					bgmStarted = true;
				}).catch(e => {
					console.log('BGM autoplay failed:', e);
				});
			}
			
			requestAnimationFrame(gameUpdate);
		}
		
		// Pause game
		function pauseGame() {
			gameRunning = !gameRunning;
			if (gameRunning) {
				requestAnimationFrame(gameUpdate);
			}
		}
		
		// Reset game
		function resetGame() {
			gameRunning = false;
			startGame();
		}
		
		// Handle keyboard input
		document.addEventListener('keydown', (e) => {
			if (!gameRunning || !currentPiece) return;
			
			switch (e.key) {
				case 'ArrowLeft':
					if (isValidPosition(currentPiece, currentX - 1, currentY)) {
						currentX--;
					}
					break;
				case 'ArrowRight':
					if (isValidPosition(currentPiece, currentX + 1, currentY)) {
						currentX++;
					}
					break;
				case 'ArrowDown':
					if (isValidPosition(currentPiece, currentX, currentY + 1)) {
						currentY++;
					}
					break;
				case 'ArrowUp':
					const rotated = rotatePiece(currentPiece);
					if (isValidPosition(rotated, currentX, currentY)) {
						currentPiece = rotated;
					}
					break;
				case ' ':
					while (isValidPosition(currentPiece, currentX, currentY + 1)) {
						currentY++;
					}
					break;
				case 'p':
				case 'P':
					pauseGame();
					break;
			}
		});
		
		// Button event listeners
		document.getElementById('startButton').addEventListener('click', startGame);
		document.getElementById('pauseButton').addEventListener('click', pauseGame);
		document.getElementById('resetButton').addEventListener('click', resetGame);
		
		// Initialize
		initBoard();
		drawBoard();
	</script>
</body>
</html>`;
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
