const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const boardData = `const BOARD_SIZE = 25;
const SNAKES: Record<number, number> = { 14: 6, 21: 9, 24: 3 };
const LADDERS: Record<number, number> = { 4: 15, 8: 18, 11: 20 };
const BOARD_FACTS: Record<number, { title: string, text: string }> = {
  1: { title: "476 AD: Fall of Rome", text: "The journey begins in the ruins of the Roman Empire. Europe fractures." },
  4: { title: "1088 AD: Universities", text: "The University of Bologna is founded! Knowledge spreads. (Ladder to 15)" },
  6: { title: "Dark Ages", text: "Progress is slow. You toil in the fields." },
  8: { title: "1095 AD: The Crusades", text: "New trade routes to the East bring wealth and ideas! (Ladder to 18)" },
  9: { title: "Feudalism", text: "You are bound to the land, working for a local lord." },
  11: { title: "1450 AD: Printing Press", text: "Gutenberg's invention democratizes knowledge! (Ladder to 20)" },
  14: { title: "1347 AD: Black Death", text: "A devastating plague strikes Europe. (Snake to 6)" },
  15: { title: "Scholasticism", text: "Scholars debate classical philosophy and theology." },
  18: { title: "Rise of Merchants", text: "Trade flourishes in cities like Venice and Florence." },
  20: { title: "Renaissance Dawn", text: "Art and science begin to flourish across the continent." },
  21: { title: "Censorship", text: "The Church bans radical new books. (Snake to 9)" },
  24: { title: "Viking Raids", text: "Fierce warriors from the north attack your settlement! (Snake to 3)" },
  25: { title: "The Modern Era", text: "You have survived the Middle Ages and reached the dawn of the modern world!" }
};
`;

code = code.replace(/interface Choice \{[\s\S]*?const ROLES: Role\[\] = \[[\s\S]*?\];\n/m, boardData);

const rolesViewCode = `function RolesView() {
  const [position, setPosition] = useState(1);
  const [message, setMessage] = useState("Roll the dice to begin your journey through the Middle Ages!");
  const [fact, setFact] = useState<{title: string, text: string} | null>(BOARD_FACTS[1]);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(1);

  const rollDice = () => {
    if (isRolling || position >= BOARD_SIZE) return;
    setIsRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);
    
    setTimeout(() => {
      let newPos = position + roll;
      if (newPos > BOARD_SIZE) newPos = BOARD_SIZE;
      
      let msg = \`You rolled a \${roll}. \`;
      let finalPos = newPos;

      if (SNAKES[newPos]) {
        msg += \`Oh no! A setback! You slide down to \${SNAKES[newPos]}.\`;
        finalPos = SNAKES[newPos];
      } else if (LADDERS[newPos]) {
        msg += \`Huzzah! An advancement! You climb up to \${LADDERS[newPos]}.\`;
        finalPos = LADDERS[newPos];
      } else {
        msg += \`You moved to square \${newPos}.\`;
      }

      setPosition(finalPos);
      setMessage(msg);
      setFact(BOARD_FACTS[finalPos] || { title: \`Year \${400 + finalPos * 40}\`, text: "Life continues in the medieval village. Seasons change, and you work the land." });
      setIsRolling(false);
    }, 800);
  };

  const resetGame = () => {
    setPosition(1);
    setMessage("Roll the dice to begin your journey through the Middle Ages!");
    setFact(BOARD_FACTS[1]);
    setDiceValue(1);
  };

  // Generate grid cells (5x5)
  const cells = [];
  for (let row = 4; row >= 0; row--) {
    for (let col = 0; col < 5; col++) {
      // Zig-zag pattern
      const isEvenRow = row % 2 === 0;
      const actualCol = isEvenRow ? col : 4 - col;
      const cellNum = row * 5 + actualCol + 1;
      cells.push(cellNum);
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-5xl md:text-6xl font-display font-black text-ink-900 mb-4 drop-shadow-sm">Snakes & Ladders</h2>
        <p className="text-xl font-serif text-ink-800 max-w-3xl mx-auto leading-relaxed">
          Navigate the perils and progress of the Middle Ages. Beware the plagues and raids, and seek the innovations that drive society forward!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Game Board */}
        <div className="md:col-span-2 illuminated-border p-6 bg-parchment-200">
          <div className="grid grid-cols-5 gap-2 md:gap-4">
            {cells.map(cell => {
              const isPlayerHere = position === cell;
              const isSnake = Object.keys(SNAKES).includes(cell.toString());
              const isLadder = Object.keys(LADDERS).includes(cell.toString());
              
              return (
                <div 
                  key={cell} 
                  className={\`relative aspect-square flex items-center justify-center border-2 \${isPlayerHere ? 'border-crimson-700 bg-gold-400/30 shadow-inner' : 'border-ink-900/20 bg-parchment-100'} rounded-lg transition-all\`}
                >
                  <span className="absolute top-1 left-2 text-xs font-display font-bold text-ink-600 opacity-50">{cell}</span>
                  
                  {isSnake && <span className="text-2xl opacity-30" title="Snake (Setback)">🐍</span>}
                  {isLadder && <span className="text-2xl opacity-30" title="Ladder (Advancement)">🪜</span>}
                  
                  {isPlayerHere && (
                    <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-300">
                      <div className="w-8 h-8 bg-crimson-700 rounded-full border-2 border-gold-500 shadow-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-parchment-100" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls & Info */}
        <div className="space-y-6">
          <div className="illuminated-border p-6 bg-parchment-100 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-ink-900 text-gold-500 rounded-xl border-2 border-gold-500 shadow-lg mb-4 text-3xl font-display font-black">
                {isRolling ? <Loader2 className="w-8 h-8 animate-spin" /> : diceValue}
              </div>
              <p className="text-lg font-serif italic text-ink-800 h-16 flex items-center justify-center">{message}</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={rollDice}
                disabled={isRolling || position >= BOARD_SIZE}
                className="medieval-button py-4 w-full text-lg"
              >
                {position >= BOARD_SIZE ? 'Journey Complete' : 'Roll Dice'}
              </button>
              
              <button 
                onClick={resetGame}
                className="py-2 text-sm font-display font-bold uppercase tracking-widest text-crimson-700 hover:text-crimson-600 transition-colors"
              >
                Restart Journey
              </button>
            </div>
          </div>

          {/* Fact Card */}
          {fact && (
            <div className="illuminated-border p-6 bg-parchment-200 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Book className="w-32 h-32 text-ink-900" />
              </div>
              <h3 className="text-sm font-display font-bold uppercase tracking-widest text-crimson-800 mb-2 border-b-2 border-ink-900/10 pb-2">Historical Record</h3>
              <h4 className="text-2xl font-display font-black text-ink-900 mb-3">{fact.title}</h4>
              <p className="text-lg font-serif text-ink-800 leading-relaxed relative z-10">{fact.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

code = code.replace(/function RolesView\(\) \{[\s\S]*$/m, rolesViewCode);
code = code.replace(/Mystery Roles/g, 'Snakes & Ladders');
code = code.replace('Assume the identity of a Serf, Scholar, or Librarian and make choices that alter history.', 'Navigate the perils and progress of the Middle Ages in this interactive board game.');

fs.writeFileSync('src/App.tsx', code);
