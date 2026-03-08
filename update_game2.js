const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newGameCode = `
type RoleType = 'serf' | 'priest' | 'knight' | 'lord';

interface Player {
  id: number;
  role: RoleType;
  position: number;
}

const ROLE_DETAILS: Record<RoleType, { name: string, icon: React.ElementType, color: string }> = {
  serf: { name: 'Serf', icon: User, color: 'bg-stone-600' },
  priest: { name: 'Priest', icon: Book, color: 'bg-blue-800' },
  knight: { name: 'Knight', icon: Shield, color: 'bg-slate-400' },
  lord: { name: 'Lord', icon: Crown, color: 'bg-purple-800' }
};

const BOARD_SIZE = 25;
const SNAKES: Record<number, number> = { 14: 6, 21: 9, 24: 3 };
const LADDERS: Record<number, number> = { 4: 15, 8: 18, 11: 20 };

const BOARD_FACTS: Record<number, { title: string, text: Record<RoleType, string> }> = {
  1: { 
    title: "476 AD: Fall of Rome", 
    text: {
      serf: "The empire falls. You seek protection from local strongmen, binding yourself to the land.",
      priest: "Central authority collapses, leaving the Church as the main unifying force in Europe.",
      knight: "With no imperial army, local lords rely on mounted warriors like you to maintain order.",
      lord: "You seize the opportunity to claim land and power in the absence of Roman governance."
    }
  },
  4: { 
    title: "1088 AD: Universities", 
    text: {
      serf: "Universities are founded, but as a serf, you remain tied to the fields, far from education.",
      priest: "You travel to Bologna to study theology and law, expanding the Church's intellectual power.",
      knight: "You have little use for books, preferring the martial arts, though some nobles begin to study.",
      lord: "You sponsor scholars and clerks to help administer your growing, complex estates."
    }
  },
  6: { 
    title: "Dark Ages", 
    text: {
      serf: "Progress is slow. You toil endlessly in the fields just to survive the harsh winters.",
      priest: "You preserve ancient knowledge by painstakingly copying manuscripts in your monastery.",
      knight: "You engage in constant, brutal skirmishes with rival factions to secure territory.",
      lord: "You struggle to maintain control over your fiefdom amidst constant raids and poor harvests."
    }
  },
  8: { 
    title: "1095 AD: The Crusades", 
    text: {
      serf: "You are drafted as a foot soldier, hoping for salvation and an escape from poverty.",
      priest: "You preach the Pope's call to arms, promising remission of sins for those who fight.",
      knight: "You sew a red cross to your tunic and ride to the Holy Land in search of glory and wealth.",
      lord: "You mortgage your lands to finance an expedition, hoping to conquer new territories in the East."
    }
  },
  9: { 
    title: "Feudalism", 
    text: {
      serf: "You are legally bound to the land, owing labor and taxes to your lord.",
      priest: "The Church integrates into the feudal system, holding vast lands and wielding immense power.",
      knight: "You swear fealty to a lord, receiving a fief in exchange for your military service.",
      lord: "You sit at the top of the local hierarchy, extracting wealth from the peasants who work your land."
    }
  },
  11: { 
    title: "1450 AD: Printing Press", 
    text: {
      serf: "Pamphlets begin to circulate. Though you cannot read, you hear radical new ideas spoken aloud.",
      priest: "You worry as cheap, printed Bibles threaten the Church's monopoly on interpreting scripture.",
      knight: "Chivalric romances are printed, romanticizing your fading way of life.",
      lord: "You purchase printed books to build a library, showcasing your wealth and Renaissance learning."
    }
  },
  14: { 
    title: "1347 AD: Black Death", 
    text: {
      serf: "The plague ravages your village. With labor scarce, you might finally demand wages.",
      priest: "You minister to the dying, risking your own life. Many question why God allows such suffering.",
      knight: "Your armor cannot protect you from the plague. The old social order begins to collapse.",
      lord: "Your serfs are dying, leaving fields unharvested. Your wealth and power are severely threatened."
    }
  },
  15: { 
    title: "Scholasticism", 
    text: {
      serf: "The debates of scholars mean nothing to you; the harvest is all that matters.",
      priest: "You debate the works of Aristotle and Thomas Aquinas, reconciling faith with reason.",
      knight: "You leave the thinking to the monks, focusing instead on tournaments and warfare.",
      lord: "You employ university-educated advisors to help navigate complex political treaties."
    }
  },
  18: { 
    title: "Rise of Merchants", 
    text: {
      serf: "You flee to a growing town. 'City air makes you free,' they say, escaping your feudal bonds.",
      priest: "You condemn the sin of usury (charging interest), yet the Church relies on merchant bankers.",
      knight: "You resent the wealthy merchants who buy their way into the nobility you earned by blood.",
      lord: "You tax the lucrative trade routes passing through your lands, growing incredibly wealthy."
    }
  },
  20: { 
    title: "Renaissance Dawn", 
    text: {
      serf: "Life improves slightly as the economy shifts, but you are still at the bottom of society.",
      priest: "The Church sponsors magnificent art and architecture, though some criticize the extravagance.",
      knight: "Gunpowder makes your armor obsolete. You transition into a courtier or military officer.",
      lord: "You become a patron of the arts, commissioning portraits and grand palaces."
    }
  },
  21: { 
    title: "Censorship", 
    text: {
      serf: "You are warned against listening to heretical preachers who challenge the social order.",
      priest: "You help compile lists of banned books to protect the faithful from dangerous ideas.",
      knight: "You are tasked with enforcing the Church's bans, arresting those who possess forbidden texts.",
      lord: "You carefully hide your collection of controversial philosophical treatises."
    }
  },
  24: { 
    title: "Viking Raids", 
    text: {
      serf: "Fierce warriors from the north attack! You flee to the lord's castle for protection.",
      priest: "Monasteries are prime targets for their wealth. You hide the sacred relics.",
      knight: "You ride out to defend the realm, facing terrifying berserkers in battle.",
      lord: "You build massive stone fortifications to protect your lands from the relentless raiders."
    }
  },
  25: { 
    title: "The Modern Era", 
    text: {
      serf: "The feudal system crumbles. You step into a new world as a free laborer.",
      priest: "The Reformation challenges your authority, forever changing the religious landscape.",
      knight: "The era of the armored knight is over, replaced by professional standing armies.",
      lord: "Your absolute power wanes as centralized nation-states begin to form."
    }
  }
};

function getCellCenter(cell: number) {
  const rowFromBottom = Math.floor((cell - 1) / 5);
  const colFromLeft = (rowFromBottom % 2 === 0) ? (cell - 1) % 5 : 4 - ((cell - 1) % 5);
  return {
    x: (colFromLeft * 20) + 10,
    y: ((4 - rowFromBottom) * 20) + 10
  };
}

function RolesView() {
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing'>('setup');
  const [numPlayers, setNumPlayers] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  
  const [message, setMessage] = useState("Roll the dice to begin your journey!");
  const [fact, setFact] = useState<{title: string, text: string} | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(1);

  const startGame = () => {
    const initialPlayers: Player[] = Array.from({ length: numPlayers }).map((_, i) => ({
      id: i,
      role: ['serf', 'priest', 'knight', 'lord'][i] as RoleType,
      position: 1
    }));
    setPlayers(initialPlayers);
    setCurrentPlayerIndex(0);
    setGamePhase('playing');
    setMessage(\`Player 1 (\${ROLE_DETAILS[initialPlayers[0].role].name}), it's your turn!\`);
    setFact({
      title: BOARD_FACTS[1].title,
      text: BOARD_FACTS[1].text[initialPlayers[0].role]
    });
  };

  const rollDice = () => {
    const currentPlayer = players[currentPlayerIndex];
    if (isRolling || currentPlayer.position >= BOARD_SIZE) return;
    
    setIsRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);
    
    setTimeout(() => {
      let newPos = currentPlayer.position + roll;
      if (newPos > BOARD_SIZE) newPos = BOARD_SIZE;
      
      let msg = \`\${ROLE_DETAILS[currentPlayer.role].name} rolled a \${roll}. \`;
      let finalPos = newPos;

      if (SNAKES[newPos]) {
        msg += \`Oh no! A setback! Slide down to \${SNAKES[newPos]}.\`;
        finalPos = SNAKES[newPos];
      } else if (LADDERS[newPos]) {
        msg += \`Huzzah! An advancement! Climb up to \${LADDERS[newPos]}.\`;
        finalPos = LADDERS[newPos];
      } else {
        msg += \`Moved to square \${newPos}.\`;
      }

      const newPlayers = [...players];
      newPlayers[currentPlayerIndex].position = finalPos;
      setPlayers(newPlayers);
      
      const nextPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
      
      if (finalPos >= BOARD_SIZE) {
        setMessage(\`\${ROLE_DETAILS[currentPlayer.role].name} has reached the Modern Era and won the game!\`);
      } else {
        setTimeout(() => {
          setCurrentPlayerIndex(nextPlayerIndex);
          setMessage(\`\${ROLE_DETAILS[players[nextPlayerIndex].role].name}'s turn. \${msg}\`);
        }, 1500);
      }

      const factData = BOARD_FACTS[finalPos];
      if (factData) {
        setFact({ title: factData.title, text: factData.text[currentPlayer.role] });
      } else {
        setFact({ 
          title: \`Year \${400 + finalPos * 40}\`, 
          text: \`As a \${ROLE_DETAILS[currentPlayer.role].name}, life continues in its medieval rhythm.\` 
        });
      }
      
      setIsRolling(false);
    }, 800);
  };

  const resetGame = () => {
    setGamePhase('setup');
    setPlayers([]);
    setFact(null);
  };

  if (gamePhase === 'setup') {
    return (
      <div className="max-w-3xl mx-auto animate-in fade-in duration-500 text-center">
        <h2 className="text-5xl md:text-6xl font-display font-black text-ink-900 mb-6 drop-shadow-sm">Snakes & Ladders</h2>
        <p className="text-xl font-serif text-ink-800 mb-12">Choose the number of players to begin your historical journey.</p>
        
        <div className="illuminated-border p-8 bg-parchment-200 inline-block">
          <div className="flex items-center justify-center gap-6 mb-8">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setNumPlayers(num)}
                className={\`w-16 h-16 rounded-full text-2xl font-display font-bold border-2 transition-all \${numPlayers === num ? 'bg-crimson-700 text-parchment-100 border-gold-500 shadow-lg scale-110' : 'bg-parchment-100 text-ink-900 border-ink-900/20 hover:bg-parchment-300'}\`}
              >
                {num}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            {Array.from({ length: numPlayers }).map((_, i) => {
              const roleKey = ['serf', 'priest', 'knight', 'lord'][i] as RoleType;
              const role = ROLE_DETAILS[roleKey];
              const Icon = role.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-parchment-100 rounded border border-ink-900/10">
                  <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-white \${role.color}\`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-display font-bold text-ink-900">Player {i + 1}: {role.name}</span>
                </div>
              );
            })}
          </div>

          <button onClick={startGame} className="medieval-button px-12 py-4 text-xl w-full">
            Begin Journey
          </button>
        </div>
      </div>
    );
  }

  // Generate grid cells (5x5)
  const cells = [];
  for (let row = 4; row >= 0; row--) {
    for (let col = 0; col < 5; col++) {
      const isEvenRow = row % 2 === 0;
      const actualCol = isEvenRow ? col : 4 - col;
      const cellNum = row * 5 + actualCol + 1;
      cells.push(cellNum);
    }
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-display font-black text-ink-900 mb-2 drop-shadow-sm">Snakes & Ladders</h2>
        <p className="text-lg font-serif text-ink-800">Navigate the perils and progress of the Middle Ages.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Game Board */}
        <div className="lg:col-span-2 illuminated-border p-4 bg-parchment-200 relative">
          
          {/* SVG Overlay for Snakes and Ladders */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ padding: '1rem' }}>
            {Object.entries(LADDERS).map(([start, end]) => {
              const s = getCellCenter(parseInt(start));
              const e = getCellCenter(end);
              return (
                <g key={\`ladder-\${start}\`}>
                  <line x1={\`\${s.x}%\`} y1={\`\${s.y}%\`} x2={\`\${e.x}%\`} y2={\`\${e.y}%\`} stroke="#8B5A2B" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
                  <line x1={\`\${s.x}%\`} y1={\`\${s.y}%\`} x2={\`\${e.x}%\`} y2={\`\${e.y}%\`} stroke="#D2B48C" strokeWidth="8" strokeDasharray="4 8" strokeLinecap="round" opacity="0.9" />
                </g>
              );
            })}
            {Object.entries(SNAKES).map(([start, end]) => {
              const s = getCellCenter(parseInt(start));
              const e = getCellCenter(end);
              // Calculate a control point for a curvy snake
              const cx = (s.x + e.x) / 2 + (Math.random() * 20 - 10);
              const cy = (s.y + e.y) / 2 + (Math.random() * 20 - 10);
              return (
                <path 
                  key={\`snake-\${start}\`}
                  d={\`M \${s.x} \${s.y} Q \${cx} \${cy} \${e.x} \${e.y}\`}
                  fill="none"
                  stroke="#4A7c59"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.7"
                  vectorEffect="non-scaling-stroke"
                  transform="scale(0.01) scale(100)" // Hack to use percentages in path, actually let's just use a simpler approach
                />
              );
            })}
          </svg>
          {/* Real SVG overlay using 100x100 viewBox for percentage mapping */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10 p-4 drop-shadow-md" preserveAspectRatio="none">
             {Object.entries(LADDERS).map(([start, end]) => {
              const s = getCellCenter(parseInt(start));
              const e = getCellCenter(end);
              return (
                <g key={\`ladder-svg-\${start}\`}>
                  <line x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                  <line x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="#D2B48C" strokeWidth="1" strokeDasharray="1 2" strokeLinecap="round" opacity="0.9" />
                </g>
              );
            })}
            {Object.entries(SNAKES).map(([start, end]) => {
              const s = getCellCenter(parseInt(start));
              const e = getCellCenter(end);
              const cx = (s.x + e.x) / 2 + 10;
              const cy = (s.y + e.y) / 2 - 10;
              return (
                <path 
                  key={\`snake-svg-\${start}\`}
                  d={\`M \${s.x} \${s.y} Q \${cx} \${cy} \${e.x} \${e.y}\`}
                  fill="none"
                  stroke="#8B0000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              );
            })}
          </svg>

          <div className="grid grid-cols-5 gap-2 relative z-20">
            {cells.map(cell => {
              const playersHere = players.filter(p => p.position === cell);
              
              return (
                <div 
                  key={cell} 
                  className={\`relative aspect-square flex flex-col items-center justify-center border-2 \${playersHere.length > 0 ? 'border-gold-500 bg-gold-400/20 shadow-inner' : 'border-ink-900/20 bg-parchment-100'} rounded-lg transition-all\`}
                >
                  <span className="absolute top-1 left-1 text-[10px] md:text-xs font-display font-bold text-ink-600 opacity-50">{cell}</span>
                  
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {playersHere.map(p => {
                      const role = ROLE_DETAILS[p.role];
                      const Icon = role.icon;
                      return (
                        <div key={p.id} className={\`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-white shadow-md border border-white/50 \${role.color} animate-in zoom-in\`}>
                          <Icon className="w-3 h-3 md:w-4 md:h-4" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls & Info */}
        <div className="space-y-6 flex flex-col">
          <div className="illuminated-border p-6 bg-parchment-100 text-center flex-shrink-0">
            <div className="flex justify-center gap-2 mb-4">
              {players.map((p, i) => {
                const role = ROLE_DETAILS[p.role];
                const isCurrent = i === currentPlayerIndex;
                return (
                  <div key={p.id} className={\`flex flex-col items-center p-2 rounded \${isCurrent ? 'bg-gold-400/20 border border-gold-500' : 'opacity-50'}\`}>
                    <div className={\`w-6 h-6 rounded-full flex items-center justify-center text-white \${role.color}\`}>
                      <role.icon className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] font-bold uppercase mt-1">{role.name}</span>
                  </div>
                )
              })}
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-ink-900 text-gold-500 rounded-xl border-2 border-gold-500 shadow-lg mb-4 text-3xl font-display font-black">
                {isRolling ? <Loader2 className="w-8 h-8 animate-spin" /> : diceValue}
              </div>
              <p className="text-base font-serif italic text-ink-800 h-12 flex items-center justify-center">{message}</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={rollDice}
                disabled={isRolling || players.some(p => p.position >= BOARD_SIZE)}
                className="medieval-button py-3 w-full text-lg"
              >
                {players.some(p => p.position >= BOARD_SIZE) ? 'Game Over' : \`Roll Dice (\${ROLE_DETAILS[players[currentPlayerIndex].role].name})\`}
              </button>
              
              <button 
                onClick={resetGame}
                className="py-2 text-xs font-display font-bold uppercase tracking-widest text-crimson-700 hover:text-crimson-600 transition-colors"
              >
                End Game
              </button>
            </div>
          </div>

          {/* Fact Card */}
          {fact && (
            <div className="illuminated-border p-6 bg-parchment-200 relative overflow-hidden flex-grow">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Book className="w-32 h-32 text-ink-900" />
              </div>
              <h3 className="text-xs font-display font-bold uppercase tracking-widest text-crimson-800 mb-2 border-b-2 border-ink-900/10 pb-2">Historical Record</h3>
              <h4 className="text-xl font-display font-black text-ink-900 mb-3">{fact.title}</h4>
              <p className="text-base font-serif text-ink-800 leading-relaxed relative z-10">{fact.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

// Need to import Crown if it's not imported
if (!code.includes('Crown')) {
    code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, "import { $1, Crown } from 'lucide-react';");
}

// Replace everything from const BOARD_SIZE to the end of RolesView
const startRegex = /const BOARD_SIZE = 25;[\s\S]*?function RolesView\(\) \{[\s\S]*?\}\s*\n\s*$/m;
code = code.replace(startRegex, newGameCode);

fs.writeFileSync('src/App.tsx', code);
