import { Heart, MessageCircle, Star } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Card, CardContent } from "@/components/ui/card";

const ContactHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catch the Items Game</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
    }
    .game-container {
      width: 800px;
      height: 600px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
    }
    .header {
      text-align: center;
      padding: 20px;
      background: rgba(0, 0, 0, 0.2);
    }
    .header h1 {
      font-size: 2em;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    .score {
      font-size: 1.2em;
      font-weight: bold;
      color: #ffeb3b;
    }
    .game-area {
      position: relative;
      height: 480px;
      overflow: hidden;
    }
    .catcher {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 60px;
      background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
      border-radius: 10px;
      transition: left 0.1s ease;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5em;
    }
    .falling-item {
      position: absolute;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2em;
      font-weight: bold;
      animation: fall linear;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }
    .email { background: #4CAF50; }
    .phone { background: #2196F3; }
    .chat { background: #FF9800; }
    .social { background: #9C27B0; }
    @keyframes fall {
      from { top: -50px; }
      to { top: 480px; }
    }
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      font-size: 1.5em;
      z-index: 1000;
    }
    .overlay button {
      margin-top: 20px;
      padding: 10px 20px;
      border: none;
      border-radius: 10px;
      font-size: 1.2em;
      cursor: pointer;
      background: #ffeb3b;
      color: black;
    }
  </style>
</head>
<body>
  <div class="game-container">
    <div class="header">
      <h1>🎮 Catch the Items!</h1>
      <div class="score">Score: <span id="score">0</span></div>
    </div>
    <div class="game-area" id="gameArea">
      <div class="catcher" id="catcher">🏀</div>
      <div class="overlay" id="startOverlay">
        <h2>Welcome! Ready to play?</h2>
        <button onclick="startGame()">Start Game</button>
      </div>
    </div>
  </div>

  <script>
    var score = 0;
    var gameActive = false;
    var catcher = document.getElementById("catcher");
    var gameArea = document.getElementById("gameArea");
    var intervalId;
    
    var contactItems = [
      { symbol: "📧", type: "email", color: "#4CAF50" },
      { symbol: "📞", type: "phone", color: "#2196F3" },
      { symbol: "💬", type: "chat", color: "#FF9800" },
      { symbol: "🌐", type: "social", color: "#9C27B0" }
    ];

    var counts = { email: 0, phone: 0, chat: 0, social: 0 };

    function startGame() {
      score = 0;
      counts = { email: 0, phone: 0, chat: 0, social: 0 };
      document.getElementById("score").textContent = score;
      gameActive = true;
      document.getElementById("startOverlay").style.display = "none";
      intervalId = setInterval(createFallingItem, 1000);
    }

    function endGame() {
      gameActive = false;
      clearInterval(intervalId);

      var favoriteType = Object.keys(counts).reduce(function(a, b) {
        return counts[a] > counts[b] ? a : b;
      });

      var favoriteSymbol = contactItems.find(function(i) { return i.type === favoriteType; }).symbol;
      var messages = [
        "😂 Wow! That was intense!",
        "🎉 You did it!",
        "🚀 Boom! Game Over!"
      ];
      var funnyMsg = messages[Math.floor(Math.random() * messages.length)];

      var overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.innerHTML =
        "<h2>" + funnyMsg + "</h2>" +
        "<p>Final Score: " + score + "</p>" +
        "<p>You like to contact by " + favoriteSymbol + " " + favoriteType + " 😃</p>" +
        "<button onclick='location.reload()'>Play Again</button>";
      gameArea.appendChild(overlay);
    }

    document.addEventListener("mousemove", function(e) {
      if (!gameActive) return;
      var gameRect = gameArea.getBoundingClientRect();
      var relativeX = e.clientX - gameRect.left;
      var percentage = Math.max(5, Math.min(95, (relativeX / gameRect.width) * 100));
      catcher.style.left = percentage + "%";
    });

    document.addEventListener("touchmove", function(e) {
      if (!gameActive) return;
      e.preventDefault();
      var gameRect = gameArea.getBoundingClientRect();
      var relativeX = e.touches[0].clientX - gameRect.left;
      var percentage = Math.max(5, Math.min(95, (relativeX / gameRect.width) * 100));
      catcher.style.left = percentage + "%";
    });

    function createFallingItem() {
      if (!gameActive) return;
      var item = contactItems[Math.floor(Math.random() * contactItems.length)];
      var fallingItem = document.createElement("div");
      fallingItem.className = "falling-item " + item.type;
      fallingItem.textContent = item.symbol;
      fallingItem.style.left = Math.random() * 90 + "%";
      fallingItem.style.backgroundColor = item.color;
      fallingItem.style.animationDuration = (Math.random() * 3 + 2) + "s";
      gameArea.appendChild(fallingItem);
      
      var checkCollision = setInterval(function() {
        var itemRect = fallingItem.getBoundingClientRect();
        var catcherRect = catcher.getBoundingClientRect();
        if (
          itemRect.bottom >= catcherRect.top &&
          itemRect.left < catcherRect.right &&
          itemRect.right > catcherRect.left &&
          itemRect.top < catcherRect.bottom
        ) {
          score++;
          counts[item.type]++;
          document.getElementById("score").textContent = score;
          fallingItem.remove();
          clearInterval(checkCollision);
          if (score >= 50) endGame();
        } else if (itemRect.top > window.innerHeight) {
          fallingItem.remove();
          clearInterval(checkCollision);
        }
      }, 50);
    }
  </script>
</body>
</html>

`;

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <div className="text-center">
            <div className="mx-auto mb-6 w-fit rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-3">
              <MessageCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="mb-4 font-bold text-5xl tracking-tight">
              Get in{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
              Have a question, feedback, or collaboration idea? We'd love to
              hear from you! Send us a message and we'll get back to you
              shortly.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-4 py-2 text-sm dark:bg-black/20">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Quick Response</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-4 py-2 text-sm dark:bg-black/20">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-medium">Friendly Support</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-4 py-2 text-sm dark:bg-black/20">
                <Star className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Creative Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Game Section */}
          <div className="flex items-center justify-center lg:col-span-2">
            <Card className="w-full overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl dark:from-emerald-950/20 dark:to-teal-950/20">
              <CardContent className="p-0">
                <iframe
                  className="h-[600px] w-full border-0"
                  srcDoc={ContactHtml}
                  title="Contact Us - Catch the Contact!"
                />
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="flex items-center justify-center lg:col-span-1">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
