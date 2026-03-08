import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Scroll, Play, Pause, ChevronRight, ChevronLeft, Image as ImageIcon, Shield, Book, User, Loader2, Crown } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';

// --- Data Definitions ---

interface Era {
  id: string;
  title: string;
  year: string;
  hook: string;
  context: string;
  soWhat: string;
  ibConnection: {
    concept: 'Power' | 'Innovation' | 'Interdependence';
    description: string;
  };
  imagePrompt: string;
}

const ERAS: Era[] = [
  {
    id: 'rome',
    title: 'Fall of Rome',
    year: '476 AD',
    hook: 'The eternal city crumbles, and the light of a unified empire goes out.',
    context: 'In 476 AD, the last Western Roman Emperor, Romulus Augustulus, was deposed by the Germanic king Odoacer. The vast network of Roman roads, laws, and legions fractured into isolated, warring kingdoms.',
    soWhat: 'Without a central authority, Europe plunged into centuries of political fragmentation, setting the stage for local lords to seize control and establish the feudal system.',
    ibConnection: {
      concept: 'Power',
      description: 'Power shifted from a centralized, bureaucratic empire to decentralized, localized warlords and chieftains.'
    },
    imagePrompt: 'Cinematic wide shot of ruined Roman marble columns overgrown with dark vines at dusk, a lone Germanic warrior standing amidst the rubble, somber and atmospheric lighting.'
  },
  {
    id: 'geography',
    title: 'Geography & Isolation',
    year: 'c. 500-800 AD',
    hook: 'Mountains and dense forests become the new borders of the world.',
    context: 'With Roman roads falling into disrepair, travel became dangerous. Dense forests, treacherous mountains, and wide rivers physically isolated communities across Europe.',
    soWhat: 'This physical isolation led to the development of distinct local cultures, languages, and self-sufficient manors, making trade rare and dangerous.',
    ibConnection: {
      concept: 'Interdependence',
      description: 'The lack of safe travel broke down the interdependence of the Roman world, forcing communities into strict self-reliance.'
    },
    imagePrompt: 'A misty, impenetrable European forest at dawn, towering ancient trees, a narrow muddy path barely visible, evoking a sense of deep isolation and mystery.'
  },
  {
    id: 'feudalism',
    title: 'Feudalism',
    year: 'c. 800-1300 AD',
    hook: 'A desperate bargain: your labor and freedom in exchange for the safety of castle walls.',
    context: 'To survive Viking raids and local wars, peasants surrendered their land and freedom to powerful lords. In return for working the land (manorialism), they received military protection.',
    soWhat: 'This created a rigid social hierarchy—Kings, Lords, Knights, and Serfs—that defined European society for centuries, stifling social mobility.',
    ibConnection: {
      concept: 'Power',
      description: 'Power was entirely based on land ownership and military might, creating a strict hierarchy of fealty and obligation.'
    },
    imagePrompt: 'A sprawling medieval manor at midday, peasants toiling in golden wheat fields in the foreground, a formidable stone keep looming protectively in the background.'
  },
  {
    id: 'universities',
    title: 'Rise of Universities',
    year: '1088 AD',
    hook: 'Knowledge escapes the monastery walls and takes root in the bustling cities.',
    context: 'The University of Bologna was founded, marking a shift from education controlled solely by monks in isolated abbeys to organized guilds of students and masters in urban centers.',
    soWhat: 'This sparked a revival of legal, medical, and philosophical studies, laying the intellectual groundwork for the Renaissance and challenging the Church\'s monopoly on knowledge.',
    ibConnection: {
      concept: 'Innovation',
      description: 'The innovation of the university system created new spaces for debate and the preservation of classical texts.'
    },
    imagePrompt: 'A dimly lit, crowded medieval lecture hall, dust motes dancing in shafts of sunlight, a scholar in robes pointing to an illuminated manuscript on a wooden lectern.'
  },
  {
    id: 'crusades',
    title: 'The Crusades',
    year: '1095-1291 AD',
    hook: 'Holy wars bridge continents, bringing back blood, silk, and spices.',
    context: 'European Christians launched military expeditions to reclaim the Holy Land from Muslim rule. While largely a military failure for Europe, it opened massive cultural and economic exchanges.',
    soWhat: 'Returning crusaders brought back a taste for Eastern luxury goods, stimulating trade, the rise of merchant classes, and the growth of wealthy port cities like Venice.',
    ibConnection: {
      concept: 'Interdependence',
      description: 'Violent conflict ironically forged new networks of global interdependence, connecting European markets to the Silk Road.'
    },
    imagePrompt: 'A bustling medieval port city, ships with colorful sails unloading exotic spices and vibrant silks, merchants haggling, a clash of European and Middle Eastern architectural styles.'
  },
  {
    id: 'black-death',
    title: 'The Black Death',
    year: '1347-1351 AD',
    hook: 'A silent killer arrives on merchant ships, rewriting the rules of society in a matter of days.',
    context: 'The Bubonic Plague swept through Europe, carried by fleas on rats along trade routes. It wiped out an estimated one-third to one-half of the European population.',
    soWhat: 'The massive loss of life created a severe labor shortage. Serfs could suddenly demand wages or leave their manors, effectively breaking the back of the feudal system.',
    ibConnection: {
      concept: 'Power',
      description: 'A biological catastrophe caused a massive structural shift, transferring economic power from land-owning lords to the surviving laborers.'
    },
    imagePrompt: 'A desolate medieval village street at dusk, a plague doctor with a beaked mask standing in the shadows, an eerie, sickly greenish fog rolling in.'
  },
  {
    id: 'printing-press',
    title: 'The Printing Press',
    year: 'c. 1450 AD',
    hook: 'Metal type and ink shatter the silence of the scriptorium, unleashing a storm of ideas.',
    context: 'Johannes Gutenberg invented the movable-type printing press, allowing books to be produced rapidly and cheaply, rather than being painstakingly copied by hand.',
    soWhat: 'Information became accessible to the masses. This democratization of knowledge fueled the Renaissance, the Scientific Revolution, and the Protestant Reformation.',
    ibConnection: {
      concept: 'Innovation',
      description: 'This technological innovation fundamentally changed how information was stored, shared, and controlled, breaking the monopoly of the elite.'
    },
    imagePrompt: 'Close-up of a wooden Gutenberg printing press, ink-stained hands carefully placing metal type, warm flickering candlelight illuminating the freshly printed page.'
  },
  {
    id: 'censorship',
    title: 'Church & Censorship',
    year: 'Late 15th Century',
    hook: 'The old guard scrambles to build walls around a flood of new ideas.',
    context: 'As printed books spread radical new scientific and religious ideas, the Catholic Church and secular rulers attempted to control the flow of information through censorship and the Index of Forbidden Books.',
    soWhat: 'This set up a centuries-long struggle between the authority of traditional institutions and the unstoppable spread of technological innovation and free thought.',
    ibConnection: {
      concept: 'Power',
      description: 'The struggle to control the printing press was a direct battle over the power to define truth and reality for the masses.'
    },
    imagePrompt: 'A grand, shadowy cathedral library, a stern inquisitor locking a heavy iron clasp on a large, controversial book, dramatic chiaroscuro lighting.'
  }
];

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
      serf: "The empire falls. You seek protection from local strongmen, binding yourself to the land. You now work the fields in exchange for safety from marauding bands, losing your freedom but gaining a chance to survive the chaotic transition.",
      priest: "Central authority collapses, leaving the Church as the main unifying force in Europe. You step into the power vacuum, offering spiritual guidance and administrative order to a fractured society, preserving literacy and Roman traditions.",
      knight: "With no imperial army, local lords rely on mounted warriors like you to maintain order. You swear loyalty to a chieftain, defending his territory and enforcing his rule over the local peasantry in exchange for food and shelter.",
      lord: "You seize the opportunity to claim land and power in the absence of Roman governance. You build fortifications and gather a retinue of loyal warriors, establishing yourself as the absolute ruler of your newly claimed domain."
    }
  },
  4: { 
    title: "1088 AD: Universities", 
    text: {
      serf: "Universities are founded, but as a serf, you remain tied to the fields, far from education. Your daily life is unaffected by the scholarly debates in Bologna or Paris, focusing entirely on the harvest and survival.",
      priest: "You travel to Bologna to study theology and law, expanding the Church's intellectual power. You engage in rigorous debates, mastering Latin texts and returning to your diocese with the knowledge to navigate complex ecclesiastical politics.",
      knight: "You have little use for books, preferring the martial arts, though some nobles begin to study. You view scholars with suspicion, believing true nobility is forged in battle, not in the lecture halls of the new universities.",
      lord: "You sponsor scholars and clerks to help administer your growing, complex estates. Recognizing the value of literacy and legal knowledge, you employ university graduates to draft treaties, manage finances, and legitimize your rule."
    }
  },
  6: { 
    title: "Dark Ages", 
    text: {
      serf: "Progress is slow. You toil endlessly in the fields just to survive the harsh winters. Famine and disease are constant threats, and your world is limited to the few miles surrounding your village.",
      priest: "You preserve ancient knowledge by painstakingly copying manuscripts in your monastery. In the quiet scriptorium, you keep the light of classical learning alive, creating beautiful illuminated texts that will survive the centuries.",
      knight: "You engage in constant, brutal skirmishes with rival factions to secure territory. The lack of central authority means your sword is the only law, and you spend your days raiding neighboring lands and defending your lord's borders.",
      lord: "You struggle to maintain control over your fiefdom amidst constant raids and poor harvests. You must constantly balance the demands of your vassals with the need to protect your peasants, all while fending off ambitious rivals."
    }
  },
  8: { 
    title: "1095 AD: The Crusades", 
    text: {
      serf: "You are drafted as a foot soldier, hoping for salvation and an escape from poverty. You march thousands of miles to a strange land, facing unimaginable hardships, driven by the promise that your sins will be forgiven.",
      priest: "You preach the Pope's call to arms, promising remission of sins for those who fight. You inspire the masses with fiery sermons, organizing the logistics of the holy war and providing spiritual comfort to the departing crusaders.",
      knight: "You sew a red cross to your tunic and ride to the Holy Land in search of glory and wealth. You view the crusade as the ultimate test of your martial skill and piety, hoping to carve out a new kingdom in the East.",
      lord: "You mortgage your lands to finance an expedition, hoping to conquer new territories in the East. You lead a contingent of knights and foot soldiers, risking your entire fortune for the chance to win eternal fame and lucrative eastern trade routes."
    }
  },
  9: { 
    title: "Feudalism", 
    text: {
      serf: "You are legally bound to the land, owing labor and taxes to your lord. You cannot marry or leave the manor without permission, living a life of strict obedience in exchange for a small plot of land to feed your family.",
      priest: "The Church integrates into the feudal system, holding vast lands and wielding immense power. You manage church estates, collecting tithes from the peasants and advising the local lord, blurring the lines between spiritual and temporal authority.",
      knight: "You swear fealty to a lord, receiving a fief in exchange for your military service. You are the enforcer of the feudal order, bound by a strict code of loyalty to fight whenever your lord calls upon you.",
      lord: "You sit at the top of the local hierarchy, extracting wealth from the peasants who work your land. You dispense justice in your manorial court and demand absolute loyalty from your vassals, ruling as a king in your own domain."
    }
  },
  11: { 
    title: "1450 AD: Printing Press", 
    text: {
      serf: "Pamphlets begin to circulate. Though you cannot read, you hear radical new ideas spoken aloud. The spread of information sparks whispers of rebellion and religious reform, challenging the traditional authority you've always known.",
      priest: "You worry as cheap, printed Bibles threaten the Church's monopoly on interpreting scripture. You struggle to control the flow of information as laypeople begin to read and debate theological concepts without your guidance.",
      knight: "Chivalric romances are printed, romanticizing your fading way of life. As gunpowder makes your armor obsolete, you find solace in printed tales of King Arthur, clinging to an idealized version of knighthood.",
      lord: "You purchase printed books to build a library, showcasing your wealth and Renaissance learning. You embrace the new technology to spread your political propaganda and stay informed about the rapidly changing world."
    }
  },
  14: { 
    title: "1347 AD: Black Death", 
    text: {
      serf: "The plague ravages your village. With labor scarce, you might finally demand wages. Surviving the horrors of the epidemic, you realize your labor is now highly valuable, giving you the leverage to challenge the feudal system.",
      priest: "You minister to the dying, risking your own life. Many question why God allows such suffering. You face a crisis of faith as your prayers fail to stop the pestilence, and the Church's authority is severely undermined by its inability to explain the tragedy.",
      knight: "Your armor cannot protect you from the plague. The old social order begins to collapse. You watch helplessly as your peasants die, realizing that your martial prowess is useless against this invisible enemy.",
      lord: "Your serfs are dying, leaving fields unharvested. Your wealth and power are severely threatened. You desperately try to enforce old wage laws to maintain your profits, but the sheer demographic collapse forces you to make concessions to the surviving workers."
    }
  },
  15: { 
    title: "Scholasticism", 
    text: {
      serf: "The debates of scholars mean nothing to you; the harvest is all that matters. You remain entirely disconnected from the intellectual awakening happening in the cities, focused solely on the daily struggle for survival.",
      priest: "You debate the works of Aristotle and Thomas Aquinas, reconciling faith with reason. You participate in the vibrant intellectual life of the universities, applying rigorous logic to theological questions and expanding the boundaries of medieval thought.",
      knight: "You leave the thinking to the monks, focusing instead on tournaments and warfare. You view the new intellectualism with disdain, believing that action and bravery are the only true virtues of a nobleman.",
      lord: "You employ university-educated advisors to help navigate complex political treaties. You recognize that the world is becoming more complex, and you rely on scholars to manage your administration and outmaneuver your rivals diplomatically."
    }
  },
  18: { 
    title: "Rise of Merchants", 
    text: {
      serf: "You flee to a growing town. 'City air makes you free,' they say, escaping your feudal bonds. You abandon the fields to seek a new life as an artisan or laborer in the bustling urban centers, breaking the chains of serfdom.",
      priest: "You condemn the sin of usury (charging interest), yet the Church relies on merchant bankers. You struggle to reconcile traditional religious teachings with the realities of the new, dynamic commercial economy.",
      knight: "You resent the wealthy merchants who buy their way into the nobility you earned by blood. You watch with dismay as commoners with newfound wealth purchase estates and titles, threatening your exclusive social status.",
      lord: "You tax the lucrative trade routes passing through your lands, growing incredibly wealthy. You shift your focus from agriculture to commerce, patronizing the new merchant class and using their wealth to finance your political ambitions."
    }
  },
  20: { 
    title: "Renaissance Dawn", 
    text: {
      serf: "Life improves slightly as the economy shifts, but you are still at the bottom of society. You may have more freedom and better wages, but the grand artistic and cultural achievements of the era remain largely out of your reach.",
      priest: "The Church sponsors magnificent art and architecture, though some criticize the extravagance. You are surrounded by breathtaking new masterpieces, but you must also defend the Church against accusations of corruption and worldly excess.",
      knight: "Gunpowder makes your armor obsolete. You transition into a courtier or military officer. You trade your lance for a rapier, learning the arts of diplomacy and courtly manners to maintain your relevance in the new era.",
      lord: "You become a patron of the arts, commissioning portraits and grand palaces. You embrace the humanist ideals of the Renaissance, using your wealth to support geniuses like Leonardo and Michelangelo, securing your legacy in stone and paint."
    }
  },
  21: { 
    title: "Censorship", 
    text: {
      serf: "You are warned against listening to heretical preachers who challenge the social order. You are caught in the crossfire of religious conflict, forced to conform to the official doctrines or face severe punishment.",
      priest: "You help compile lists of banned books to protect the faithful from dangerous ideas. You act as an inquisitor, actively suppressing the spread of Protestantism and scientific theories that contradict Church teachings.",
      knight: "You are tasked with enforcing the Church's bans, arresting those who possess forbidden texts. You become an instrument of religious persecution, using your military skills to crush dissent and maintain orthodoxy.",
      lord: "You carefully hide your collection of controversial philosophical treatises. You publicly support the official censorship while privately engaging with the dangerous new ideas that are reshaping the intellectual landscape."
    }
  },
  24: { 
    title: "Viking Raids", 
    text: {
      serf: "Fierce warriors from the north attack! You flee to the lord's castle for protection. Your village is burned, and you must rely entirely on the local lord's fortifications to survive the terrifying onslaught.",
      priest: "Monasteries are prime targets for their wealth. You hide the sacred relics. You watch in horror as your brothers are slaughtered and the holy treasures are plundered by the pagan invaders.",
      knight: "You ride out to defend the realm, facing terrifying berserkers in battle. You are the first line of defense, engaging in desperate, bloody combat to protect your lord's lands from the relentless raiders.",
      lord: "You build massive stone fortifications to protect your lands from the relentless raiders. You invest heavily in castle building and military organization, consolidating your power in response to the external threat."
    }
  },
  25: { 
    title: "The Modern Era", 
    text: {
      serf: "The feudal system crumbles. You step into a new world as a free laborer. The chains of the Middle Ages are finally broken, and you face the uncertain but hopeful prospect of shaping your own destiny.",
      priest: "The Reformation challenges your authority, forever changing the religious landscape. You must adapt to a world where the Catholic Church is no longer the sole spiritual power, facing new theological and political realities.",
      knight: "The era of the armored knight is over, replaced by professional standing armies. Your class is absorbed into the modern officer corps or the landed gentry, leaving behind the romantic ideals of chivalry.",
      lord: "Your absolute power wanes as centralized nation-states begin to form. You must navigate a new political landscape where monarchs hold supreme authority, transitioning from an independent warlord to a loyal aristocrat."
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

// --- Main Application Component ---

export default function App() {
  const [view, setView] = useState<'home' | 'timeline' | 'roles'>('home');
  
  return (
    <div className="min-h-screen text-ink-900 font-sans selection:bg-gold-500/30">
      {/* Header */}
      <header className="border-b-4 border-double border-gold-500 bg-ink-900 text-parchment-100 sticky top-0 z-50 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('home')}>
            <Scroll className="w-6 h-6 text-gold-500 group-hover:text-gold-400 transition-colors" />
            <h1 className="text-xl font-display font-bold tracking-widest text-gold-500 group-hover:text-gold-400 transition-colors">Medieval Chronicles</h1>
          </div>
          <nav className="flex gap-2 md:gap-4 font-display text-sm md:text-base tracking-wider">
            <button 
              onClick={() => setView('timeline')}
              className={`px-3 py-2 rounded-sm transition-colors uppercase ${view === 'timeline' ? 'text-gold-400 border-b-2 border-gold-400' : 'text-parchment-300 hover:text-gold-400'}`}
            >
              The Timeline
            </button>
            <button 
              onClick={() => setView('roles')}
              className={`px-3 py-2 rounded-sm transition-colors uppercase ${view === 'roles' ? 'text-gold-400 border-b-2 border-gold-400' : 'text-parchment-300 hover:text-gold-400'}`}
            >
              Crowns & Calamities
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {view === 'home' && <HomeView setView={setView} />}
        {view === 'timeline' && <TimelineView />}
        {view === 'roles' && <RolesView />}
      </main>
    </div>
  );
}

// --- Views ---

function HomeView({ setView }: { setView: (view: 'timeline' | 'roles') => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12 animate-in fade-in duration-700">
      <div className="space-y-6 max-w-3xl relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
          <Shield className="w-32 h-32 text-ink-900" />
        </div>
        <h2 className="text-5xl md:text-7xl font-display font-black tracking-tight text-ink-900 drop-shadow-sm relative z-10">
          Step Into the <span className="text-crimson-700">Dark Ages</span>
        </h2>
        <p className="text-xl md:text-2xl font-serif text-ink-800 leading-relaxed relative z-10">
          Explore the structural shifts, technological impacts, and the delicate balance of power that shaped the medieval world.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mt-12">
        <button 
          onClick={() => setView('timeline')}
          className="illuminated-border group relative overflow-hidden p-8 text-left transition-transform duration-300 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-parchment-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <BookOpen className="w-12 h-12 text-crimson-700 mb-6 relative z-10" />
          <h3 className="text-3xl font-display font-bold mb-3 text-ink-900 relative z-10">The Timeline</h3>
          <p className="text-lg font-serif text-ink-800 relative z-10">Journey through 8 pivotal eras, from the Fall of Rome to the Printing Press.</p>
        </button>

        <button 
          onClick={() => setView('roles')}
          className="illuminated-border group relative overflow-hidden p-8 text-left transition-transform duration-300 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-parchment-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Shield className="w-12 h-12 text-crimson-700 mb-6 relative z-10" />
          <h3 className="text-3xl font-display font-bold mb-3 text-ink-900 relative z-10">Crowns & Calamities</h3>
          <p className="text-lg font-serif text-ink-800 relative z-10">Embark on an epic quest to climb the social and spiritual ladder of the Middle Ages.</p>
        </button>
      </div>
    </div>
  );
}

function TimelineView() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const era = ERAS[currentIndex];

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset states when era changes
  useEffect(() => {
    setImageUrl(null);
    setErrorMsg(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < ERAS.length - 1) setCurrentIndex(c => c + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
  };

  const generateImage = async () => {
    setErrorMsg(null);
    if (!process.env.GEMINI_API_KEY) {
      setErrorMsg("Gemini API Key is missing. Please configure it in the Secrets panel.");
      return;
    }
    
    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: era.imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
      });
      
      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64EncodeString = response.generatedImages[0].image.imageBytes;
        setImageUrl(`data:image/jpeg;base64,${base64EncodeString}`);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setErrorMsg("Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const toggleAudio = async () => {
    setErrorMsg(null);
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play();
      setIsPlayingAudio(true);
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      setErrorMsg("Gemini API Key is missing. Please configure it in the Secrets panel.");
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Say in a wise, authoritative, yet accessible historical storyteller voice: ${era.hook} ${era.context} ${era.soWhat}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Zephyr sounds wise/authoritative
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioSrc = `data:audio/wav;base64,${base64Audio}`;
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        
        audio.onended = () => setIsPlayingAudio(false);
        
        await audio.play();
        setIsPlayingAudio(true);
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      setErrorMsg("Failed to generate audio. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-ink-800 mb-2 font-display font-bold uppercase tracking-wider">
          <span>{ERAS[0].year}</span>
          <span>Era {currentIndex + 1} of {ERAS.length}</span>
          <span>{ERAS[ERAS.length - 1].year}</span>
        </div>
        <div className="h-3 w-full bg-parchment-300 border border-ink-900 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-crimson-600 transition-all duration-500 ease-out relative"
            style={{ width: `${((currentIndex + 1) / ERAS.length) * 100}%` }}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-30"></div>
          </div>
        </div>
      </div>

      <div className="illuminated-border">
        {/* Image Area */}
        <div className="relative aspect-video bg-ink-900 flex items-center justify-center overflow-hidden border-b-4 border-double border-ink-900">
          {imageUrl ? (
            <img src={imageUrl} alt={era.title} className="w-full h-full object-cover animate-in fade-in duration-1000" referrerPolicy="no-referrer" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-parchment-300">
              {isGeneratingImage ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
                  <span className="font-display font-bold text-sm uppercase tracking-widest text-gold-400">Conjuring Vision...</span>
                </div>
              ) : (
                <button 
                  onClick={generateImage}
                  className="flex flex-col items-center gap-4 hover:text-gold-400 transition-colors group"
                >
                  <div className="p-6 rounded-full bg-ink-800 border-2 border-gold-600 group-hover:border-gold-400 transition-colors shadow-lg">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                  <span className="font-display font-bold text-sm uppercase tracking-widest">Reveal Historical Scene</span>
                </button>
              )}
            </div>
          )}
          
          {/* Year Badge */}
          <div className="absolute top-4 right-4 bg-ink-900/90 backdrop-blur-sm border-2 border-gold-500 px-4 py-1 font-display font-bold text-sm text-gold-400 shadow-lg">
            {era.year}
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-crimson-800 border-y-2 border-crimson-600 p-4 text-center">
            <p className="text-parchment-100 font-serif font-bold text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Content Area */}
        <div className="p-8 md:p-12 bg-parchment-100">
          <div className="flex items-start justify-between gap-4 mb-8 border-b-2 border-ink-900/20 pb-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-ink-900 mb-3">{era.title}</h2>
              <p className="text-2xl font-serif italic text-crimson-700 leading-relaxed">"{era.hook}"</p>
            </div>
            
            <button 
              onClick={toggleAudio}
              disabled={isGeneratingAudio}
              className="flex-shrink-0 p-4 rounded-full bg-ink-900 hover:bg-ink-800 text-gold-500 border-2 border-gold-500 transition-colors disabled:opacity-50 shadow-md"
              title="Listen to Narration"
            >
              {isGeneratingAudio ? <Loader2 className="w-8 h-8 animate-spin" /> : isPlayingAudio ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </button>
          </div>

          <div className="space-y-8 text-ink-900 font-serif leading-relaxed">
            <div>
              <h3 className="text-sm font-display font-bold uppercase tracking-widest text-ink-600 mb-3 flex items-center gap-2">
                <Scroll className="w-4 h-4" /> The Context
              </h3>
              <p className="text-xl">{era.context}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-display font-bold uppercase tracking-widest text-ink-600 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> The 'So What?'
              </h3>
              <p className="text-xl">{era.soWhat}</p>
            </div>

            <div className="mt-10 p-8 bg-parchment-200 border border-ink-900 border-l-8 border-l-crimson-700 shadow-md relative">
              <div className="absolute -left-[20px] top-1/2 -translate-y-1/2 w-8 h-8 wax-seal rounded-full flex items-center justify-center text-[10px] font-bold">IB</div>
              <h3 className="text-sm font-display font-bold uppercase tracking-widest text-crimson-800 mb-3 pl-2">IB Connection: {era.ibConnection.concept}</h3>
              <p className="text-xl text-ink-900 italic pl-2">{era.ibConnection.description}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 bg-parchment-200 border-t-4 border-double border-ink-900">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="medieval-button px-6 py-3 flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous Era</span>
          </button>
          
          <button 
            onClick={handleNext}
            disabled={currentIndex === ERAS.length - 1}
            className="medieval-button px-8 py-3 flex items-center gap-2"
          >
            <span>Next Era</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function RolesView() {
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing'>('setup');
  const [numPlayers, setNumPlayers] = useState(1);
  const [playerRoles, setPlayerRoles] = useState<RoleType[]>(['serf', 'priest', 'knight', 'lord']);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  
  const [message, setMessage] = useState("Roll the dice to begin your journey!");
  const [fact, setFact] = useState<{title: string, text: string} | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(1);

  const handleRoleChange = (playerIndex: number, newRole: RoleType) => {
    const newRoles = [...playerRoles];
    const existingIndex = newRoles.indexOf(newRole);
    if (existingIndex !== -1) {
      newRoles[existingIndex] = newRoles[playerIndex];
    }
    newRoles[playerIndex] = newRole;
    setPlayerRoles(newRoles);
  };

  const startGame = () => {
    const initialPlayers: Player[] = Array.from({ length: numPlayers }).map((_, i) => ({
      id: i,
      role: playerRoles[i],
      position: 1
    }));
    setPlayers(initialPlayers);
    setCurrentPlayerIndex(0);
    setGamePhase('playing');
    setMessage(`Player 1 (${ROLE_DETAILS[initialPlayers[0].role].name}), it's your turn!`);
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
      
      let msg = `${ROLE_DETAILS[currentPlayer.role].name} rolled a ${roll}. `;
      let finalPos = newPos;

      if (SNAKES[newPos]) {
        msg += `Calamity strikes! A Kraken's tentacle drags you down to ${SNAKES[newPos]}.`;
        finalPos = SNAKES[newPos];
      } else if (LADDERS[newPos]) {
        msg += `Huzzah! A beam of light lifts you to ${LADDERS[newPos]}.`;
        finalPos = LADDERS[newPos];
      } else {
        msg += `Moved to square ${newPos}.`;
      }

      const newPlayers = [...players];
      newPlayers[currentPlayerIndex].position = finalPos;
      setPlayers(newPlayers);
      
      const nextPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
      
      if (finalPos >= BOARD_SIZE) {
        setMessage(`${ROLE_DETAILS[currentPlayer.role].name} has reached the Modern Era and won the game!`);
      } else {
        setTimeout(() => {
          setCurrentPlayerIndex(nextPlayerIndex);
          setMessage(`${ROLE_DETAILS[players[nextPlayerIndex].role].name}'s turn. ${msg}`);
        }, 1500);
      }

      const factData = BOARD_FACTS[finalPos];
      if (factData) {
        setFact({ title: factData.title, text: factData.text[currentPlayer.role] });
      } else {
        setFact({ 
          title: `Year ${400 + finalPos * 40}`, 
          text: `As a ${ROLE_DETAILS[currentPlayer.role].name}, life continues in its medieval rhythm.` 
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
        <h2 className="text-5xl md:text-6xl font-display font-black text-ink-900 mb-6 drop-shadow-sm">Crowns & Calamities</h2>
        <p className="text-xl font-serif text-ink-800 mb-12">Choose the number of players to begin your epic quest through the Middle Ages.</p>
        
        <div className="illuminated-border p-8 bg-parchment-200 inline-block">
          <div className="flex items-center justify-center gap-6 mb-8">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setNumPlayers(num)}
                className={`w-16 h-16 rounded-full text-2xl font-display font-bold border-2 transition-all ${numPlayers === num ? 'bg-crimson-700 text-parchment-100 border-gold-500 shadow-lg scale-110' : 'bg-parchment-100 text-ink-900 border-ink-900/20 hover:bg-parchment-300'}`}
              >
                {num}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 text-left">
            {Array.from({ length: numPlayers }).map((_, i) => {
              const currentRole = playerRoles[i];
              const role = ROLE_DETAILS[currentRole];
              const Icon = role.icon;
              return (
                <div key={i} className="flex flex-col gap-2 p-4 bg-parchment-100 rounded border border-ink-900/10">
                  <span className="font-display font-bold text-ink-900">Player {i + 1}</span>
                  <div className="flex gap-2 justify-center">
                    {(['serf', 'priest', 'knight', 'lord'] as RoleType[]).map(r => {
                      const rDetails = ROLE_DETAILS[r];
                      const RIcon = rDetails.icon;
                      const isSelected = currentRole === r;
                      const isTaken = playerRoles.slice(0, numPlayers).includes(r) && !isSelected;
                      
                      return (
                        <button
                          key={r}
                          onClick={() => handleRoleChange(i, r)}
                          disabled={isTaken}
                          className={`flex flex-col items-center p-2 rounded transition-all ${isSelected ? 'bg-gold-400/20 border-2 border-gold-500' : isTaken ? 'opacity-30 cursor-not-allowed' : 'hover:bg-parchment-200 border-2 border-transparent'}`}
                          title={isTaken ? 'Role already chosen' : `Choose ${rDetails.name}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${rDetails.color}`}>
                            <RIcon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] uppercase font-bold mt-1">{rDetails.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-ink-600 mb-6 italic">Allow each player to choose a role. Each role can only be chosen once.</p>

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
        <h2 className="text-4xl md:text-5xl font-display font-black text-ink-900 mb-2 drop-shadow-sm">Crowns & Calamities</h2>
        <p className="text-lg font-serif text-ink-800">Climb the social and spiritual ladder. Beware the Kraken's tentacles, and seek the beams of light!</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Game Board */}
        <div className="lg:col-span-2 relative">
          {/* Castle Battlements */}
          <div className="flex justify-around px-4 -mb-1 relative z-10">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-12 h-8 bg-stone-400 border-t-4 border-x-4 border-stone-600 rounded-t-sm shadow-sm"></div>
            ))}
          </div>
          
          <div className="illuminated-border p-4 bg-stone-500 border-4 border-stone-700 rounded-b-xl shadow-2xl relative">
          
          {/* Cloud Source for Beams of Light */}
          <div className="absolute -top-16 left-8 w-48 h-32 opacity-100 z-20 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 60 C15 60 10 50 15 40 C15 30 25 20 40 25 C50 10 75 15 80 35 C90 35 95 45 85 55 C90 65 75 70 65 65 C55 75 35 70 25 60 Z" fill="#fef08a" opacity="0.6" filter="blur(8px)" />
              <path d="M25 60 C15 60 10 50 15 40 C15 30 25 20 40 25 C50 10 75 15 80 35 C90 35 95 45 85 55 C90 65 75 70 65 65 C55 75 35 70 25 60 Z" fill="#ffffff" opacity="0.9" filter="blur(2px)" />
            </svg>
          </div>

          {/* Octopus Source for Tentacles */}
          <div className="absolute -bottom-20 left-1/4 -translate-x-1/2 w-64 h-48 opacity-100 z-20 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Octopus Head */}
              <path d="M30 60 C30 30 70 30 70 60 C75 70 65 80 50 80 C35 80 25 70 30 60 Z" fill="#4c1d95" />
              {/* Eyes */}
              <circle cx="40" cy="55" r="4" fill="#fef08a" />
              <circle cx="60" cy="55" r="4" fill="#fef08a" />
              <circle cx="40" cy="55" r="1.5" fill="#000000" />
              <circle cx="60" cy="55" r="1.5" fill="#000000" />
              {/* Base Tentacles (4 visible at base) */}
              <path d="M35 75 Q25 90 15 85" fill="none" stroke="#4c1d95" strokeWidth="6" strokeLinecap="round" />
              <path d="M45 78 Q45 95 35 100" fill="none" stroke="#4c1d95" strokeWidth="6" strokeLinecap="round" />
              <path d="M55 78 Q55 95 65 100" fill="none" stroke="#4c1d95" strokeWidth="6" strokeLinecap="round" />
              <path d="M65 75 Q75 90 85 85" fill="none" stroke="#4c1d95" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>

          {/* Real SVG overlay using 100x100 viewBox for percentage mapping */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-30 p-4 drop-shadow-md" preserveAspectRatio="none">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
             {Object.entries(LADDERS).map(([start, end]) => {
              const s = getCellCenter(parseInt(start));
              const e = getCellCenter(end);
              return (
                <g key={`ladder-svg-${start}`}>
                  {/* Outer glow */}
                  <line x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="#fef08a" strokeWidth="6" strokeLinecap="round" opacity="0.4" filter="url(#glow)" />
                  {/* Inner glow */}
                  <line x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" filter="url(#glow)" />
                  {/* Core beam */}
                  <line x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="1" />
                </g>
              );
            })}
            {Object.entries(SNAKES).map(([start, end]) => {
              const s = getCellCenter(parseInt(start));
              const e = getCellCenter(end);
              const cx = (s.x + e.x) / 2 + 15;
              const cy = (s.y + e.y) / 2 - 15;
              return (
                <g key={`snake-svg-${start}`}>
                  <path 
                    d={`M ${s.x} ${s.y} Q ${cx} ${cy} ${e.x} ${e.y}`}
                    fill="none"
                    stroke="#4c1d95"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  <path 
                    d={`M ${s.x} ${s.y} Q ${cx} ${cy} ${e.x} ${e.y}`}
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="0.5"
                    strokeDasharray="1 2"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </g>
              );
            })}
          </svg>

          <div className="grid grid-cols-5 gap-2 relative z-20">
            {cells.map(cell => {
              const playersHere = players.filter(p => p.position === cell);
              
              return (
                <div 
                  key={cell} 
                  className={`relative aspect-square flex flex-col items-center justify-center border-2 ${playersHere.length > 0 ? 'border-gold-500 bg-stone-300 shadow-inner' : 'border-stone-600 bg-stone-400'} rounded-lg transition-all`}
                >
                  <span className="absolute top-1 left-1 text-[10px] md:text-xs font-display font-bold text-stone-700 opacity-70">{cell}</span>
                  
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {playersHere.map(p => {
                      const role = ROLE_DETAILS[p.role];
                      const Icon = role.icon;
                      return (
                        <div key={p.id} className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-white shadow-md border border-white/50 ${role.color} animate-in zoom-in`}>
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
        </div>

        {/* Controls & Info */}
        <div className="space-y-6 flex flex-col">
          <div className="illuminated-border p-6 bg-parchment-100 text-center flex-shrink-0">
            <div className="flex justify-center gap-2 mb-4">
              {players.map((p, i) => {
                const role = ROLE_DETAILS[p.role];
                const isCurrent = i === currentPlayerIndex;
                return (
                  <div key={p.id} className={`flex flex-col items-center p-2 rounded ${isCurrent ? 'bg-gold-400/20 border border-gold-500' : 'opacity-50'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${role.color}`}>
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
                {players.some(p => p.position >= BOARD_SIZE) ? 'Game Over' : `Roll Dice (${ROLE_DETAILS[players[currentPlayerIndex].role].name})`}
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

