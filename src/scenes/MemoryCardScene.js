import React, { useState, useEffect } from 'react';

// Card and circle assets
const CHARACTERS = [
  {
    name: 'puss',
    card: '/assets/card_char1_puss.png',
    circle: '/assets/Characters/circle_char1_puss.png',
    circleReveal: '/assets/Characters/circle_char1_puss_reveal.png',
  },
  {
    name: 'kitty',
    card: '/assets/card_char2_kitty.png',
    circle: '/assets/Characters/circle_char2_kitty.png',
    circleReveal: '/assets/Characters/circle_char2_kitty_reveal.png',
  },
  {
    name: 'perro',
    card: '/assets/card_char3_perro.png',
    circle: '/assets/Characters/circle_char3_perro.png',
    circleReveal: '/assets/Characters/circle_char3_perro_reveal.png',
  },
  {
    name: 'goldilocks',
    card: '/assets/card_char4_goldilocks.png',
    circle: '/assets/Characters/circle_char4_goldilocks.png',
    circleReveal: '/assets/Characters/circle_char4_goldilocks_reveal.png',
  },
  {
    name: 'bear',
    card: '/assets/card_char5_bear.png',
    circle: '/assets/Characters/circle_char5_bear.png',
    circleReveal: '/assets/Characters/circle_char5_bear_reveal.png',
  },
  {
    name: 'wolf',
    card: '/assets/card_char6_wolf.png',
    circle: '/assets/Characters/circle_char6_wolf.png',
    circleReveal: '/assets/Characters/circle_char6_wolf_reveal.png',
  },
];

const CARD_BACK = '/assets/cardback.png';
const BG_IMAGE = '/assets/bg_2.png';
const TUTORIAL_IMAGE = '/assets/game2_tutorial.png';
const START_BTN = '/assets/btn_start.png';
const TIMEPLATE = '/assets/timeplate.png';

function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const initialCards = () => {
  // 6 pairs, 12 cards
  let cards = [];
  CHARACTERS.forEach((char, idx) => {
    cards.push({ id: idx * 2, charIdx: idx, name: char.name });
    cards.push({ id: idx * 2 + 1, charIdx: idx, name: char.name });
  });
  return shuffle(cards);
};

const MemoryCardScene = ({ onEnd }) => {
  const [showTutorial, setShowTutorial] = useState(true);
  const [cards, setCards] = useState(initialCards());
  const [flipped, setFlipped] = useState([]); // indices of flipped cards
  const [matched, setMatched] = useState([]); // indices of matched cards
  const [wrongPair, setWrongPair] = useState([]); // indices of wrong pair
  const [progress, setProgress] = useState(Array(6).fill(false));
  const [timer, setTimer] = useState(30);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [fadeOutTutorial, setFadeOutTutorial] = useState(false);

  // Timer logic
  useEffect(() => {
    if (showTutorial || showTimeUp) return;
    if (matched.length === 12) return;
    if (timer === 0) {
      setShowTimeUp(true);
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 2000);
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [showTutorial, timer, matched, showTimeUp, onEnd]);

  // Card click handler
  const handleCardClick = idx => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx) || showTimeUp) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      const [i1, i2] = newFlipped;
      if (cards[i1].charIdx === cards[i2].charIdx) {
        // Match
        setTimeout(() => {
          setMatched(m => [...m, i1, i2]);
          setProgress(p => {
            const np = [...p];
            np[cards[i1].charIdx] = true;
            return np;
          });
          setFlipped([]);
        }, 600);
      } else {
        // Not match
        setWrongPair([i1, i2]);
        setTimeout(() => {
          setFlipped([]);
          setWrongPair([]);
        }, 900);
      }
    }
  };

  // Start game (hide tutorial)
  const handleStart = () => {
    setFadeOutTutorial(true);
    setTimeout(() => {
      setShowTutorial(false);
    }, 400);
  };

  // Reset game if needed (not required by prompt, but useful for dev)
  // const handleReset = () => {
  //   setCards(initialCards());
  //   setFlipped([]);
  //   setMatched([]);
  //   setProgress(Array(6).fill(false));
  //   setTimer(30);
  //   setShowTimeUp(false);
  //   setShowTutorial(true);
  //   setFadeOutTutorial(false);
  // };

  // Render
  return (
    <div style={styles.bg}>
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div style={{
          ...styles.tutorialOverlay,
          opacity: fadeOutTutorial ? 0 : 1,
          pointerEvents: fadeOutTutorial ? 'none' : 'auto',
          transition: 'opacity 0.4s',
        }}>
          <img src={TUTORIAL_IMAGE} alt="tutorial" style={styles.tutorialImg} />
          <button style={styles.startBtn} onClick={handleStart}>
            <img src={START_BTN} alt="start" style={{ width: '100%', height: '100%' }} />
          </button>
        </div>
      )}

      {/* Main Game UI */}
      {!showTutorial && (
        <>
          {/* Timer */}
          <div style={styles.timerWrap}>
            <img src={TIMEPLATE} alt="timer" style={styles.timeplate} />
            <span style={styles.timerText}>{timer}</span>
          </div>

          {/* Card Grid */}
          <div style={styles.gridWrap}>
            {cards.map((card, idx) => {
              const isFlipped = flipped.includes(idx) || matched.includes(idx);
              const isWrong = wrongPair.includes(idx);
              return (
                <div
                  key={card.id}
                  style={{
                    ...styles.card,
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    boxShadow: isFlipped ? '0 4px 24px #0008' : '0 2px 8px #0006',
                    border: isWrong ? '3px solid #e74c3c' : '3px solid transparent',
                    animation: isWrong ? 'shake 0.3s' : 'none',
                    cursor: isFlipped || matched.includes(idx) ? 'default' : 'pointer',
                  }}
                  onClick={() => handleCardClick(idx)}
                >
                  {/* Card Back */}
                  <div style={{
                    ...styles.cardFace,
                    ...styles.cardBack,
                    opacity: isFlipped ? 0 : 1,
                  }}>
                    <img src={CARD_BACK} alt="back" style={{ width: '100%', height: '100%' }} />
                  </div>
                  {/* Card Front */}
                  <div style={{
                    ...styles.cardFace,
                    ...styles.cardFront,
                    opacity: isFlipped ? 1 : 0,
                  }}>
                    <img src={CHARACTERS[card.charIdx].card} alt={card.name} style={{ width: '100%', height: '100%' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Circles */}
          <div style={styles.progressWrap}>
            {CHARACTERS.map((char, idx) => (
              <div key={char.name} style={styles.progressCircle}>
                <img
                  src={progress[idx] ? char.circleReveal : char.circle}
                  alt={char.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    filter: progress[idx] ? 'drop-shadow(0 0 12px #fff8)' : 'none',
                    transition: 'filter 0.4s',
                  }}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Time Up Overlay */}
      {showTimeUp && (
        <div style={styles.timeUpOverlay}>
          <div style={styles.timeUpBlur} />
          <div style={styles.timeUpText}>Time Up!</div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes shake {
          0% { transform: rotateY(0deg) translateX(0); }
          20% { transform: rotateY(0deg) translateX(-8px); }
          40% { transform: rotateY(0deg) translateX(8px); }
          60% { transform: rotateY(0deg) translateX(-8px); }
          80% { transform: rotateY(0deg) translateX(8px); }
          100% { transform: rotateY(0deg) translateX(0); }
        }
      `}</style>
    </div>
  );
};

// CSS-in-JS styles
const styles = {
  bg: {
    minHeight: '100vh',
    minWidth: '100vw',
    background: `url(${BG_IMAGE}) center/cover no-repeat`,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'serif',
  },
  tutorialOverlay: {
    position: 'fixed',
    zIndex: 20,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.4s',
  },
  tutorialImg: {
    width: 'min(90vw, 600px)',
    maxWidth: 600,
    borderRadius: 24,
    boxShadow: '0 8px 48px #000a',
    marginBottom: 32,
  },
  startBtn: {
    width: 180,
    height: 64,
    background: 'none',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    marginTop: 12,
    transition: 'transform 0.2s',
  },
  timerWrap: {
    position: 'absolute',
    top: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 80,
  },
  timeplate: {
    width: 120,
    height: 80,
    objectFit: 'contain',
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  timerText: {
    position: 'relative',
    zIndex: 2,
    color: '#fff',
    fontSize: 36,
    fontWeight: 700,
    textShadow: '0 2px 8px #000a',
    letterSpacing: 2,
    width: '100%',
    textAlign: 'center',
  },
  gridWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(70px, 1fr))',
    gridTemplateRows: 'repeat(3, minmax(90px, 1fr))',
    gap: 18,
    maxWidth: 520,
    width: '90vw',
    margin: '120px auto 0',
    justifyContent: 'center',
    alignItems: 'center',
    perspective: 1200,
    zIndex: 1,
  },
  card: {
    width: '100%',
    aspectRatio: '0.78',
    minWidth: 70,
    minHeight: 90,
    maxWidth: 120,
    maxHeight: 160,
    background: 'none',
    borderRadius: 16,
    boxShadow: '0 2px 8px #0006',
    position: 'relative',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.5s cubic-bezier(.4,2,.3,1)',
    cursor: 'pointer',
    overflow: 'visible',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    backfaceVisibility: 'hidden',
    borderRadius: 16,
    transition: 'opacity 0.3s',
  },
  cardBack: {
    zIndex: 2,
    background: 'rgba(0,0,0,0.1)',
  },
  cardFront: {
    zIndex: 3,
    transform: 'rotateY(180deg)',
    background: 'rgba(255,255,255,0.05)',
  },
  progressWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    margin: '40px auto 0',
    maxWidth: 520,
    width: '90vw',
    minHeight: 70,
    zIndex: 2,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.25)',
    boxShadow: '0 2px 8px #0006',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.3s',
  },
  timeUpOverlay: {
    position: 'fixed',
    zIndex: 30,
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
  },
  timeUpBlur: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    zIndex: 1,
  },
  timeUpText: {
    position: 'relative',
    zIndex: 2,
    color: '#fff',
    fontSize: 64,
    fontWeight: 900,
    textShadow: '0 4px 24px #000a',
    letterSpacing: 4,
    animation: 'fadeIn 0.7s',
  },
};

export default MemoryCardScene;
