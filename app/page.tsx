import {
  ArrowRight,
  Cloud,
  Code,
  GitFork,
  Shield,
  ShoppingCart,
  Users,
  Zap,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Generation",
    description:
      "Describe your game idea and let AI generate the complete HTML5 game code instantly",
    iconColor: "text-yellow-500",
    gradientColor: "#eab308",
  },
  {
    icon: Cloud,
    title: "IPFS Version Control",
    description:
      "Every game version is stored on IPFS via Pinata, ensuring permanent and decentralized storage",
    iconColor: "text-blue-500",
    gradientColor: "#3b82f6",
  },
  {
    icon: Shield,
    title: "Wallet Authentication",
    description:
      "Secure ownership and management of your games using blockchain wallet authentication",
    iconColor: "text-green-500",
    gradientColor: "#10b981",
  },
  {
    icon: ShoppingCart,
    title: "Game Marketplace",
    description:
      "Publish your games to the marketplace for players to discover and enjoy",
    iconColor: "text-purple-500",
    gradientColor: "#8b5cf6",
  },
  {
    icon: Users,
    title: "Developer Community",
    description:
      "Share your games with developers, get feedback, and collaborate on improvements",
    iconColor: "text-orange-500",
    gradientColor: "#f97316",
  },
  {
    icon: GitFork,
    title: "Fork & Improve",
    description:
      "Fork community games to learn, modify, and create your own improved versions",
    iconColor: "text-pink-500",
    gradientColor: "#ec4899",
  },
  {
    icon: TrendingUp,
    title: "🏆 Pyth Oracle Integration",
    description:
      "Advanced real-time pricing with Pyth Network oracles. Dynamic game marketplace with multi-asset price intelligence.",
    iconColor: "text-cyan-500",
    gradientColor: "#06b6d4",
  },
];

const heroGame = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Asteroid Shooter</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #0c0c0c 0%, #1a0a2e 50%, #16213e 100%);
            min-height: 100vh;
            font-family: 'Arial', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }

        .game-container {
            position: relative;
            width: 900px;
            height: 700px;
            border: 3px solid #00ffff;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.1);
            background: radial-gradient(ellipse at center, rgba(0, 20, 40, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%);
        }

        #gameCanvas {
            display: block;
            background: transparent;
        }

        .ui-overlay {
            position: absolute;
            top: 15px;
            left: 15px;
            color: #00ffff;
            font-size: 16px;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
            z-index: 10;
            line-height: 1.4;
        }

        .ui-right {
            position: absolute;
            top: 15px;
            right: 15px;
            color: #00ffff;
            font-size: 16px;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
            z-index: 10;
            text-align: right;
            line-height: 1.4;
        }

        .power-up-bar {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            height: 40px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #00ffff;
            border-radius: 20px;
            display: flex;
            align-items: center;
            padding: 5px 15px;
            z-index: 10;
        }

        .power-up-item {
            margin-right: 20px;
            color: #00ffff;
            font-size: 14px;
            display: flex;
            align-items: center;
        }

        .power-up-timer {
            width: 30px;
            height: 6px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
            margin-left: 8px;
            overflow: hidden;
        }

        .power-up-fill {
            height: 100%;
            background: linear-gradient(90deg, #00ff00, #ffff00, #ff0000);
            transition: width 0.1s;
        }

        .menu-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 20;
            backdrop-filter: blur(5px);
        }

        .menu-title {
            color: #00ffff;
            font-size: 42px;
            font-weight: bold;
            margin-bottom: 20px;
            text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
            animation: pulse 2s infinite;
        }

        .menu-subtitle {
            color: #ffffff;
            font-size: 18px;
            margin-bottom: 30px;
            text-align: center;
            line-height: 1.4;
        }

        .menu-button {
            background: linear-gradient(45deg, #00ffff, #0080ff);
            color: #000;
            border: none;
            padding: 12px 35px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            margin: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
        }

        .menu-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 255, 255, 0.5);
            background: linear-gradient(45deg, #00e6e6, #0066ff);
        }

        .level-complete {
            color: #00ff00;
            text-align: center;
        }

        .boss-warning {
            color: #ff4444;
            font-size: 32px;
            text-align: center;
            animation: blink 0.5s infinite;
        }

        .final-score {
            color: #00ffff;
            font-size: 32px;
            margin: 15px 0;
            text-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
        }

        .health-bar {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 20px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #ff0000;
            border-radius: 10px;
            overflow: hidden;
            z-index: 15;
        }

        .health-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff0000, #ffff00, #00ff00);
            transition: width 0.3s;
        }

        .boss-name {
            position: absolute;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            color: #ff4444;
            font-size: 18px;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(255, 68, 68, 0.8);
            z-index: 15;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
        }

        .stars {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        .star {
            position: absolute;
            background: white;
            border-radius: 50%;
            animation: twinkle 3s infinite;
        }

        @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }

        .instructions {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            text-align: center;
            z-index: 25;
        }
    </style>
</head>
<body>
    <div class="game-container">
        <div class="stars" id="stars"></div>
        <div class="ui-overlay">
            <div>Score: <span id="score">0</span></div>
            <div>Lives: <span id="lives">3</span></div>
            <div>Level: <span id="level">1</span></div>
            <div>Enemies: <span id="enemiesLeft">10</span></div>
        </div>
        <div class="ui-right">
            <div>Weapon: <span id="weaponType">Basic</span></div>
            <div>Speed: <span id="speedLevel">1</span></div>
            <div>Shield: <span id="shieldLevel">0</span></div>
        </div>
        <div class="health-bar" id="bossHealthBar" style="display: none;">
            <div class="health-fill" id="bossHealthFill"></div>
        </div>
        <div class="boss-name" id="bossName" style="display: none;"></div>
        <div class="power-up-bar" id="powerUpBar" style="display: none;">
            <div class="power-up-item" id="rapidFireItem" style="display: none;">
                Rapid Fire <div class="power-up-timer"><div class="power-up-fill" id="rapidFireFill"></div></div>
            </div>
            <div class="power-up-item" id="multiShotItem" style="display: none;">
                Multi Shot <div class="power-up-timer"><div class="power-up-fill" id="multiShotFill"></div></div>
            </div>
            <div class="power-up-item" id="laserItem" style="display: none;">
                Laser <div class="power-up-timer"><div class="power-up-fill" id="laserFill"></div></div>
            </div>
        </div>
        <canvas id="gameCanvas" width="900" height="700"></canvas>
        <div class="menu-overlay" id="menuOverlay">
            <div class="menu-title">ASTEROID SHOOTER ADVANCED</div>
            <div class="menu-subtitle">Survive waves of enemies and defeat powerful bosses!<br>Collect power-ups to upgrade your ship!</div>
            <button class="menu-button" id="startButton" onclick="startGame()">START GAME</button>
            <div class="instructions">
                Use ARROW KEYS or WASD to move • SPACEBAR to shoot<br>
                Collect power-ups for better weapons and abilities
            </div>
        </div>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const menuOverlay = document.getElementById('menuOverlay');
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        const levelElement = document.getElementById('level');
        const enemiesLeftElement = document.getElementById('enemiesLeft');
        const weaponTypeElement = document.getElementById('weaponType');
        const speedLevelElement = document.getElementById('speedLevel');
        const shieldLevelElement = document.getElementById('shieldLevel');
        const powerUpBar = document.getElementById('powerUpBar');
        const bossHealthBar = document.getElementById('bossHealthBar');
        const bossHealthFill = document.getElementById('bossHealthFill');
        const bossNameElement = document.getElementById('bossName');

        // Game state
        let gameRunning = false;
        let score = 0;
        let lives = 3;
        let level = 1;
        let enemiesInLevel = 10;
        let enemiesDestroyed = 0;
        let gameSpeed = 1;
        let isBossLevel = false;
        let levelTransition = false;

        // Player stats
        let playerStats = {
            speed: 8,
            fireRate: 300,
            weaponType: 'basic',
            shieldLevel: 0,
            speedLevel: 1
        };

        // Power-ups
        let powerUps = {
            rapidFire: { active: false, timer: 0, duration: 300 },
            multiShot: { active: false, timer: 0, duration: 400 },
            laser: { active: false, timer: 0, duration: 200 }
        };

        // Game objects
        let player = {
            x: canvas.width / 2 - 25,
            y: canvas.height - 80,
            width: 50,
            height: 50,
            shield: 0,
            invulnerable: 0
        };

        let bullets = [];
        let enemies = [];
        let particles = [];
        let powerUpItems = [];
        let boss = null;
        let lastShot = 0;

        // Enemy types
        const enemyTypes = {
            asteroid: { health: 1, speed: 2, points: 10, color: '#ff8800' },
            fastAsteroid: { health: 1, speed: 4, points: 15, color: '#ff4400' },
            tank: { health: 3, speed: 1, points: 30, color: '#888888' },
            shooter: { health: 2, speed: 2, points: 25, color: '#ff0088', canShoot: true },
            splitter: { health: 1, speed: 2, points: 20, color: '#8800ff', splits: true }
        };

        // Boss types
        const bossTypes = {
            megaAsteroid: {
                name: 'Mega Asteroid',
                health: 50,
                maxHealth: 50,
                width: 120,
                height: 120,
                speed: 1,
                points: 500,
                color: '#ff6600',
                shootTimer: 0,
                shootRate: 60,
                pattern: 'spiral'
            },
            mothership: {
                name: 'Alien Mothership',
                health: 80,
                maxHealth: 80,
                width: 150,
                height: 100,
                speed: 0.5,
                points: 800,
                color: '#00ff88',
                shootTimer: 0,
                shootRate: 40,
                pattern: 'spread'
            }
        };

        // Create background stars
        function createStars() {
            const starsContainer = document.getElementById('stars');
            for (let i = 0; i < 150; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.width = Math.random() * 3 + 1 + 'px';
                star.style.height = star.style.width;
                star.style.animationDelay = Math.random() * 3 + 's';
                starsContainer.appendChild(star);
            }
        }

        // Input handling
        const keys = {};
        document.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;
            keys[e.key] = true;
            if (e.key === ' ') {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
            keys[e.key] = false;
        });

        // Shooting system
        function shoot() {
            const now = Date.now();
            let fireRate = powerUps.rapidFire.active ? playerStats.fireRate / 3 : playerStats.fireRate;
            
            if (now - lastShot < fireRate) return;
            lastShot = now;

            if (powerUps.laser.active) {
                shootLaser();
            } else if (powerUps.multiShot.active) {
                shootMultiple();
            } else {
                shootBasic();
            }
        }

        function shootBasic() {
            bullets.push({
                x: player.x + player.width / 2 - 3,
                y: player.y,
                width: 6,
                height: 15,
                speed: 15,
                color: '#ffff00',
                type: 'player'
            });
        }

        function shootMultiple() {
            for (let i = -1; i <= 1; i++) {
                bullets.push({
                    x: player.x + player.width / 2 - 3 + i * 15,
                    y: player.y,
                    width: 6,
                    height: 15,
                    speed: 15,
                    color: '#00ffff',
                    type: 'player',
                    vx: i * 2
                });
            }
        }

        function shootLaser() {
            bullets.push({
                x: player.x + player.width / 2 - 5,
                y: player.y,
                width: 10,
                height: canvas.height,
                speed: 0,
                color: '#ff0088',
                type: 'laser',
                life: 3
            });
        }

        // Enemy creation
        function createEnemy(type, x, y) {
            const enemyData = enemyTypes[type];
            enemies.push({
                x: x || Math.random() * (canvas.width - 40),
                y: y || -40,
                width: 40,
                height: 40,
                type: type,
                health: enemyData.health,
                maxHealth: enemyData.health,
                speed: enemyData.speed * gameSpeed,
                color: enemyData.color,
                points: enemyData.points,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                shootTimer: Math.random() * 60,
                vx: (Math.random() - 0.5) * 2
            });
        }

        // Boss creation
        function createBoss() {
            const bossType = level <= 5 ? 'megaAsteroid' : 'mothership';
            boss = Object.assign({}, bossTypes[bossType]);
            boss.x = canvas.width / 2 - boss.width / 2;
            boss.y = -boss.height;
            boss.vx = 1;
            
            bossHealthBar.style.display = 'block';
            bossNameElement.style.display = 'block';
            bossNameElement.textContent = boss.name;
            updateBossHealth();
        }

        function updateBossHealth() {
            if (boss) {
                const healthPercent = (boss.health / boss.maxHealth) * 100;
                bossHealthFill.style.width = healthPercent + '%';
            }
        }

        // Power-up system
        function createPowerUp(x, y) {
            const types = ['rapidFire', 'multiShot', 'laser', 'health', 'shield', 'speed'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            powerUpItems.push({
                x: x,
                y: y,
                width: 30,
                height: 30,
                type: type,
                speed: 2,
                rotation: 0,
                pulse: 0
            });
        }

        function activatePowerUp(type) {
            switch (type) {
                case 'rapidFire':
                    powerUps.rapidFire.active = true;
                    powerUps.rapidFire.timer = powerUps.rapidFire.duration;
                    break;
                case 'multiShot':
                    powerUps.multiShot.active = true;
                    powerUps.multiShot.timer = powerUps.multiShot.duration;
                    break;
                case 'laser':
                    powerUps.laser.active = true;
                    powerUps.laser.timer = powerUps.laser.duration;
                    break;
                case 'health':
                    lives = Math.min(lives + 1, 5);
                    livesElement.textContent = lives;
                    break;
                case 'shield':
                    player.shield = Math.min(player.shield + 3, 5);
                    playerStats.shieldLevel = player.shield;
                    shieldLevelElement.textContent = playerStats.shieldLevel;
                    break;
                case 'speed':
                    playerStats.speedLevel = Math.min(playerStats.speedLevel + 1, 5);
                    playerStats.speed = 8 + playerStats.speedLevel * 2;
                    speedLevelElement.textContent = playerStats.speedLevel;
                    break;
            }
            updatePowerUpDisplay();
        }

        function updatePowerUpDisplay() {
            let hasActivePowerUps = false;
            
            for (let key in powerUps) {
                const powerUp = powerUps[key];
                const element = document.getElementById(key + 'Item');
                const fill = document.getElementById(key + 'Fill');
                
                if (powerUp.active && powerUp.timer > 0) {
                    hasActivePowerUps = true;
                    element.style.display = 'block';
                    const percent = (powerUp.timer / powerUp.duration) * 100;
                    fill.style.width = percent + '%';
                    
                    powerUp.timer--;
                    if (powerUp.timer <= 0) {
                        powerUp.active = false;
                        element.style.display = 'none';
                    }
                } else {
                    element.style.display = 'none';
                }
            }
            
            powerUpBar.style.display = hasActivePowerUps ? 'block' : 'none';
        }

        // Particle system
        function createParticles(x, y, color, count) {
            count = count || 15;
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 12,
                    vy: (Math.random() - 0.5) * 12,
                    life: 40,
                    maxLife: 40,
                    color: color,
                    size: Math.random() * 5 + 2
                });
            }
        }

        // Collision detection
        function isColliding(rect1, rect2) {
            return rect1.x < rect2.x + rect2.width &&
                   rect1.x + rect1.width > rect2.x &&
                   rect1.y < rect2.y + rect2.height &&
                   rect1.y + rect1.height > rect2.y;
        }

        // Drawing functions
        function drawPlayer() {
            ctx.save();
            ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
            
            // Draw shield
            if (player.shield > 0) {
                ctx.strokeStyle = '#00ffff';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#00ffff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, player.width / 2 + 10, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Flash effect when invulnerable
            if (player.invulnerable > 0 && Math.floor(player.invulnerable / 5) % 2) {
                ctx.globalAlpha = 0.5;
            }
            
            // Draw ship body
            ctx.fillStyle = '#00ffff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(0, -player.height / 2);
            ctx.lineTo(-player.width / 3, player.height / 2);
            ctx.lineTo(0, player.height / 3);
            ctx.lineTo(player.width / 3, player.height / 2);
            ctx.closePath();
            ctx.fill();
            
            // Draw engine effects
            const engineSize = 8 + Math.random() * 4;
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.moveTo(-engineSize, player.height / 2);
            ctx.lineTo(0, player.height / 2 + engineSize * 1.5);
            ctx.lineTo(engineSize, player.height / 2);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }

        function drawBullet(bullet) {
            ctx.save();
            
            if (bullet.type === 'laser') {
                ctx.fillStyle = bullet.color;
                ctx.shadowBlur = 20;
                ctx.shadowColor = bullet.color;
                ctx.fillRect(bullet.x, 0, bullet.width, canvas.height);
            } else {
                ctx.fillStyle = bullet.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = bullet.color;
                
                if (bullet.vx) {
                    bullet.x += bullet.vx;
                }
                
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            }
            
            ctx.restore();
        }

        function drawEnemy(enemy) {
            ctx.save();
            ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            ctx.rotate(enemy.rotation);
            
            ctx.fillStyle = enemy.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = enemy.color;
            
            if (enemy.type === 'tank') {
                ctx.fillRect(-enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
            } else if (enemy.type === 'shooter') {
                ctx.beginPath();
                ctx.moveTo(0, -enemy.height / 2);
                ctx.lineTo(-enemy.width / 2, enemy.height / 2);
                ctx.lineTo(enemy.width / 2, enemy.height / 2);
                ctx.closePath();
                ctx.fill();
            } else {
                // Draw asteroid shape
                ctx.beginPath();
                const sides = 8;
                for (let i = 0; i < sides; i++) {
                    const angle = (i / sides) * Math.PI * 2;
                    const radius = enemy.width / 2 * (0.8 + Math.random() * 0.4);
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
            }
            
            // Draw health bar for damaged enemies
            if (enemy.health < enemy.maxHealth) {
                ctx.restore();
                ctx.save();
                const barWidth = enemy.width;
                const barHeight = 4;
                const x = enemy.x;
                const y = enemy.y - 10;
                
                ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                ctx.fillRect(x, y, barWidth, barHeight);
                
                ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
                const healthWidth = (enemy.health / enemy.maxHealth) * barWidth;
                ctx.fillRect(x, y, healthWidth, barHeight);
            }
            
            ctx.restore();
        }

        function drawBoss() {
            if (!boss) return;
            
            ctx.save();
            ctx.translate(boss.x + boss.width / 2, boss.y + boss.height / 2);
            
            ctx.fillStyle = boss.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = boss.color;
            
            if (boss.name === 'Mega Asteroid') {
                // Draw large rotating asteroid
                ctx.rotate(Date.now() * 0.001);
                ctx.beginPath();
                const sides = 12;
                for (let i = 0; i < sides; i++) {
                    const angle = (i / sides) * Math.PI * 2;
                    const radius = boss.width / 2 * (0.9 + Math.sin(Date.now() * 0.01 + i) * 0.1);
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
            } else {
                // Draw mothership
                ctx.beginPath();
                ctx.ellipse(0, 0, boss.width / 2, boss.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Add details
                ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = Math.cos(angle) * boss.width / 3;
                    const y = Math.sin(angle) * boss.height / 3;
                    ctx.fillRect(x - 3, y - 3, 6, 6);
                }
            }
            
            ctx.restore();
        }

        function drawPowerUp(powerUp) {
            ctx.save();
            ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
            ctx.rotate(powerUp.rotation);
            
            const colors = {
                rapidFire: '#ff8800',
                multiShot: '#8800ff',
                laser: '#ff0088',
                health: '#00ff88',
                shield: '#00ffff',
                speed: '#ffff00'
            };
            
            ctx.fillStyle = colors[powerUp.type];
            ctx.shadowBlur = 15 + Math.sin(powerUp.pulse) * 5;
            ctx.shadowColor = colors[powerUp.type];
            
            // Draw power-up shape based on type
            if (powerUp.type === 'health') {
                // Cross shape
                ctx.fillRect(-powerUp.width / 6, -powerUp.height / 2, powerUp.width / 3, powerUp.height);
                ctx.fillRect(-powerUp.width / 2, -powerUp.height / 6, powerUp.width, powerUp.height / 3);
            } else if (powerUp.type === 'shield') {
                // Shield shape
                ctx.beginPath();
                ctx.moveTo(0, -powerUp.height / 2);
                ctx.lineTo(-powerUp.width / 2, -powerUp.height / 4);
                ctx.lineTo(-powerUp.width / 2, powerUp.height / 4);
                ctx.lineTo(0, powerUp.height / 2);
                ctx.lineTo(powerUp.width / 2, powerUp.height / 4);
                ctx.lineTo(powerUp.width / 2, -powerUp.height / 4);
                ctx.closePath();
                ctx.fill();
            } else {
                // Star shape for other power-ups
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    const outerRadius = powerUp.width / 2;
                    const innerRadius = outerRadius * 0.4;
                    
                    const x1 = Math.cos(angle) * outerRadius;
                    const y1 = Math.sin(angle) * outerRadius;
                    
                    const angle2 = angle + Math.PI / 5;
                    const x2 = Math.cos(angle2) * innerRadius;
                    const y2 = Math.sin(angle2) * innerRadius;
                    
                    if (i === 0) ctx.moveTo(x1, y1);
                    else ctx.lineTo(x1, y1);
                    ctx.lineTo(x2, y2);
                }
                ctx.closePath();
                ctx.fill();
            }
            
            ctx.restore();
        }

        function drawParticle(particle) {
            const alpha = particle.life / particle.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.shadowBlur = 5;
            ctx.shadowColor = particle.color;
            ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
            ctx.restore();
        }

        // Update functions
        function updatePlayer() {
            const speed = playerStats.speed;
            
            if (keys['arrowleft'] || keys['a']) {
                player.x = Math.max(0, player.x - speed);
            }
            if (keys['arrowright'] || keys['d']) {
                player.x = Math.min(canvas.width - player.width, player.x + speed);
            }
            if (keys['arrowup'] || keys['w']) {
                player.y = Math.max(0, player.y - speed);
            }
            if (keys['arrowdown'] || keys['s']) {
                player.y = Math.min(canvas.height - player.height, player.y + speed);
            }
            
            if (keys[' '] || keys['spacebar']) {
                shoot();
            }
            
            if (player.invulnerable > 0) {
                player.invulnerable--;
            }
        }

        function updateBullets() {
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];
                
                if (bullet.type === 'laser') {
                    bullet.life--;
                    if (bullet.life <= 0) {
                        bullets.splice(i, 1);
                        continue;
                    }
                } else {
                    bullet.y -= bullet.speed;
                    if (bullet.y < -bullet.height) {
                        bullets.splice(i, 1);
                        continue;
                    }
                }
                
                // Check enemy collisions
                if (bullet.type === 'player' || bullet.type === 'laser') {
                    for (let j = enemies.length - 1; j >= 0; j--) {
                        if (isColliding(bullet, enemies[j])) {
                            const enemy = enemies[j];
                            enemy.health--;
                            
                            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 5);
                            
                            if (enemy.health <= 0) {
                                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 20);
                                score += enemy.points;
                                scoreElement.textContent = score;
                                enemiesDestroyed++;
                                enemiesLeftElement.textContent = Math.max(0, enemiesInLevel - enemiesDestroyed);
                                
                                // Split enemy if it's a splitter
                                if (enemy.type === 'splitter') {
                                    for (let k = 0; k < 2; k++) {
                                        createEnemy('asteroid', enemy.x + k * 20, enemy.y);
                                    }
                                }
                                
                                // Chance to drop power-up
                                if (Math.random() < 0.15) {
                                    createPowerUp(enemy.x, enemy.y);
                                }
                                
                                enemies.splice(j, 1);
                            }
                            
                            if (bullet.type !== 'laser') {
                                bullets.splice(i, 1);
                            }
                            break;
                        }
                    }
                    
                    // Check boss collision
                    if (boss && isColliding(bullet, boss)) {
                        boss.health--;
                        createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, boss.color, 3);
                        updateBossHealth();
                        
                        if (boss.health <= 0) {
                            createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, boss.color, 50);
                            score += boss.points;
                            scoreElement.textContent = score;
                            
                            // Drop multiple power-ups
                            for (let k = 0; k < 3; k++) {
                                createPowerUp(boss.x + Math.random() * boss.width, boss.y + Math.random() * boss.height);
                            }
                            
                            boss = null;
                            bossHealthBar.style.display = 'none';
                            bossNameElement.style.display = 'none';
                            levelComplete();
                        }
                        
                        if (bullet.type !== 'laser') {
                            bullets.splice(i, 1);
                        }
                    }
                } else if (bullet.type === 'enemy') {
                    // Enemy bullet vs player
                    if (isColliding(bullet, player) && player.invulnerable === 0) {
                        if (player.shield > 0) {
                            player.shield--;
                            playerStats.shieldLevel = player.shield;
                            shieldLevelElement.textContent = playerStats.shieldLevel;
                            player.invulnerable = 60;
                        } else {
                            lives--;
                            livesElement.textContent = lives;
                            player.invulnerable = 120;
                            createParticles(player.x + player.width / 2, player.y + player.height / 2, '#ff4444', 25);
                        }
                        
                        bullets.splice(i, 1);
                        
                        if (lives <= 0) {
                            gameOver();
                        }
                    }
                }
            }
        }

        function updateEnemies() {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                enemy.y += enemy.speed;
                enemy.rotation += enemy.rotationSpeed;
                enemy.x += enemy.vx;
                
                // Keep enemies on screen horizontally
                if (enemy.x < 0 || enemy.x > canvas.width - enemy.width) {
                    enemy.vx *= -1;
                }
                
                // Shooting enemies
                if (enemy.type === 'shooter' && enemyTypes[enemy.type].canShoot) {
                    enemy.shootTimer++;
                    if (enemy.shootTimer > 120) {
                        enemy.shootTimer = 0;
                        bullets.push({
                            x: enemy.x + enemy.width / 2 - 3,
                            y: enemy.y + enemy.height,
                            width: 6,
                            height: 12,
                            speed: 8,
                            color: '#ff4488',
                            type: 'enemy'
                        });
                    }
                }
                
                if (enemy.y > canvas.height) {
                    enemies.splice(i, 1);
                    continue;
                }
                
                // Check player collision
                if (isColliding(enemy, player) && player.invulnerable === 0) {
                    createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 15);
                    enemies.splice(i, 1);
                    
                    if (player.shield > 0) {
                        player.shield--;
                        playerStats.shieldLevel = player.shield;
                        shieldLevelElement.textContent = playerStats.shieldLevel;
                        player.invulnerable = 60;
                    } else {
                        lives--;
                        livesElement.textContent = lives;
                        player.invulnerable = 120;
                        createParticles(player.x + player.width / 2, player.y + player.height / 2, '#ff4444', 25);
                    }
                    
                    if (lives <= 0) {
                        gameOver();
                    }
                }
            }
        }

        function updateBoss() {
            if (!boss) return;
            
            boss.y += boss.speed;
            boss.x += boss.vx;
            
            // Keep boss on screen
            if (boss.x <= 0 || boss.x >= canvas.width - boss.width) {
                boss.vx *= -1;
            }
            
            // Boss shooting patterns
            boss.shootTimer++;
            if (boss.shootTimer > boss.shootRate) {
                boss.shootTimer = 0;
                
                if (boss.pattern === 'spiral') {
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2 + Date.now() * 0.01;
                        const vx = Math.cos(angle) * 3;
                        const vy = Math.sin(angle) * 3 + 2;
                        
                        bullets.push({
                            x: boss.x + boss.width / 2,
                            y: boss.y + boss.height,
                            width: 8,
                            height: 8,
                            speed: 0,
                            vx: vx,
                            vy: vy,
                            color: '#ff6600',
                            type: 'enemy'
                        });
                    }
                } else if (boss.pattern === 'spread') {
                    for (let i = -2; i <= 2; i++) {
                        bullets.push({
                            x: boss.x + boss.width / 2 + i * 20,
                            y: boss.y + boss.height,
                            width: 6,
                            height: 12,
                            speed: 6,
                            vx: i,
                            color: '#00ff88',
                            type: 'enemy'
                        });
                    }
                }
            }
            
            // Move boss bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];
                if (bullet.type === 'enemy' && bullet.vx !== undefined && bullet.vy !== undefined) {
                    bullet.x += bullet.vx;
                    bullet.y += bullet.vy;
                }
            }
        }

        function updatePowerUpItems() {
            for (let i = powerUpItems.length - 1; i >= 0; i--) {
                const powerUp = powerUpItems[i];
                powerUp.y += powerUp.speed;
                powerUp.rotation += 0.1;
                powerUp.pulse += 0.2;
                
                if (powerUp.y > canvas.height) {
                    powerUpItems.splice(i, 1);
                    continue;
                }
                
                if (isColliding(powerUp, player)) {
                    activatePowerUp(powerUp.type);
                    createParticles(powerUp.x, powerUp.y, '#ffffff', 10);
                    powerUpItems.splice(i, 1);
                }
            }
        }

        function updateParticles() {
            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vx *= 0.99;
                particle.vy *= 0.99;
                particle.life--;
                
                if (particle.life <= 0) {
                    particles.splice(i, 1);
                }
            }
        }

        // Level management
        function checkLevelComplete() {
            if (isBossLevel) return;
            
            if (enemiesDestroyed >= enemiesInLevel && enemies.length === 0) {
                if (level % 5 === 0) {
                    // Boss level
                    isBossLevel = true;
                    showBossWarning();
                } else {
                    levelComplete();
                }
            }
        }

        function showBossWarning() {
            levelTransition = true;
            menuOverlay.innerHTML = '<div class="boss-warning">BOSS INCOMING!</div>';
            menuOverlay.style.display = 'flex';
            
            setTimeout(() => {
                createBoss();
                menuOverlay.style.display = 'none';
                levelTransition = false;
            }, 3000);
        }

        function levelComplete() {
            level++;
            enemiesDestroyed = 0;
            enemiesInLevel = Math.min(10 + level * 2, 25);
            gameSpeed += 0.2;
            isBossLevel = false;
            
            levelElement.textContent = level;
            enemiesLeftElement.textContent = enemiesInLevel;
            
            // Show level complete message
            levelTransition = true;
            menuOverlay.innerHTML = '<div class="level-complete"><div class="menu-title">LEVEL ' + (level - 1) + ' COMPLETE!</div><div class="menu-subtitle">Prepare for Level ' + level + '</div></div>';
            menuOverlay.style.display = 'flex';
            
            setTimeout(() => {
                menuOverlay.style.display = 'none';
                levelTransition = false;
            }, 2000);
        }

        function spawnEnemies() {
            if (levelTransition || isBossLevel) return;
            
            const spawnRate = Math.max(0.01, 0.03 - level * 0.001);
            
            if (Math.random() < spawnRate && enemies.length < 15) {
                let enemyType = 'asteroid';
                
                // Choose enemy type based on level
                const rand = Math.random();
                if (level >= 3) {
                    if (rand < 0.2) enemyType = 'tank';
                    else if (rand < 0.4) enemyType = 'fastAsteroid';
                    else if (rand < 0.6 && level >= 5) enemyType = 'shooter';
                    else if (rand < 0.8 && level >= 4) enemyType = 'splitter';
                } else if (level >= 2) {
                    if (rand < 0.3) enemyType = 'fastAsteroid';
                }
                
                createEnemy(enemyType);
            }
        }

        // Game loop
        function gameLoop() {
            if (!gameRunning) return;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.shadowBlur = 0;
            
            // Update game objects
            updatePlayer();
            updateBullets();
            updateEnemies();
            updateBoss();
            updatePowerUpItems();
            updateParticles();
            updatePowerUpDisplay();
            
            // Draw game objects
            drawPlayer();
            bullets.forEach(drawBullet);
            enemies.forEach(drawEnemy);
            drawBoss();
            powerUpItems.forEach(drawPowerUp);
            particles.forEach(drawParticle);
            
            // Spawn enemies
            spawnEnemies();
            
            // Check level completion
            checkLevelComplete();
            
            requestAnimationFrame(gameLoop);
        }

        function startGame() {
            gameRunning = true;
            score = 0;
            lives = 3;
            level = 1;
            enemiesDestroyed = 0;
            enemiesInLevel = 10;
            gameSpeed = 1;
            isBossLevel = false;
            levelTransition = false;
            
            // Reset player
            player.x = canvas.width / 2 - 25;
            player.y = canvas.height - 80;
            player.shield = 0;
            player.invulnerable = 0;
            
            // Reset player stats
            playerStats = {
                speed: 8,
                fireRate: 300,
                weaponType: 'basic',
                shieldLevel: 0,
                speedLevel: 1
            };
            
            // Reset power-ups
            powerUps = {
                rapidFire: { active: false, timer: 0, duration: 300 },
                multiShot: { active: false, timer: 0, duration: 400 },
                laser: { active: false, timer: 0, duration: 200 }
            };
            
            // Clear arrays
            bullets = [];
            enemies = [];
            particles = [];
            powerUpItems = [];
            boss = null;
            lastShot = 0;
            
            // Update UI
            scoreElement.textContent = score;
            livesElement.textContent = lives;
            levelElement.textContent = level;
            enemiesLeftElement.textContent = enemiesInLevel;
            weaponTypeElement.textContent = 'Basic';
            speedLevelElement.textContent = playerStats.speedLevel;
            shieldLevelElement.textContent = playerStats.shieldLevel;
            
            // Hide overlays
            menuOverlay.style.display = 'none';
            bossHealthBar.style.display = 'none';
            bossNameElement.style.display = 'none';
            powerUpBar.style.display = 'none';
            
            gameLoop();
        }

        function gameOver() {
            gameRunning = false;
            
            let message = '';
            if (score < 1000) {
                message = 'Keep practicing, space pilot!';
            } else if (score < 5000) {
                message = 'Good job! You&apos;re getting better!';
            } else if (score < 10000) {
                message = 'Excellent piloting skills!';
            } else {
                message = 'Outstanding! You&apos;re a true ace pilot!';
            }
            
            menuOverlay.innerHTML = '<div class="menu-title" style="color: #ff4444;">GAME OVER</div>' +
                '<div class="final-score">Final Score: ' + score + '</div>' +
                '<div class="menu-subtitle">' + message + '<br>Level Reached: ' + level + '</div>' +
                '<button class="menu-button" onclick="startGame()">PLAY AGAIN</button>' +
                '<div class="instructions">Challenge yourself to reach higher levels!</div>';
            menuOverlay.style.display = 'flex';
            
            // Hide other overlays
            bossHealthBar.style.display = 'none';
            bossNameElement.style.display = 'none';
            powerUpBar.style.display = 'none';
        }

        // Initialize
        createStars();
    </script>
</body>
</html>
`;

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto px-6 py-20">
        {/* Hero Section */}
        <section className="mb-20 grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 font-medium text-accent-foreground text-xs">
              New • Complete Game Development Platform
            </p>

            <h1 className="mt-6 font-bold text-4xl leading-tight md:text-5xl">
              Create, Version, and Share Games with AI-Powered Tools
            </h1>

            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Build games with AI assistance, manage versions with IPFS storage,
              publish to marketplace, and collaborate with the community. All
              secured by blockchain wallet authentication.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link className="flex items-center gap-2" href="/editor">
                  <Code className="size-4" />
                  Start Creating
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link className="flex items-center gap-2" href="/marketplace">
                  <ShoppingCart className="size-4" />
                  Explore Games
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link className="flex items-center gap-2" href="/community">
                  <Users className="size-4" />
                  Join Community
                </Link>
              </Button>

              <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                <Link className="flex items-center gap-2" href="/pyth-dashboard">
                  <TrendingUp className="size-4" />
                  🏆 Pyth Dashboard
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <iframe
              className="hidden w-full rounded-lg border border-border bg-muted md:block md:h-[76vh]"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={heroGame}
              style={{ minHeight: 400 }}
              title="Cosmic Voyager Game"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl">
              Everything You Need to Build Games
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              From AI-powered generation to community sharing, our platform
              provides all the tools for modern game development
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard
                description={feature.description}
                gradientColor={feature.gradientColor}
                icon={feature.icon}
                iconColor={feature.iconColor}
                key={feature.title}
                title={feature.title}
              />
            ))}
          </div>
        </section>

        {/* Contact Section */}
        {/* <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Reach out
              and let us know how we can help.
            </p>
          </div>
          <div className="flex justify-center">
            <ContactForm />
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 font-bold text-3xl">
              Ready to Start Building?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join the future of game development with AI assistance,
              decentralized storage, and community collaboration
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link className="flex items-center gap-2" href="/editor">
                  Create Your First Game
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
