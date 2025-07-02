import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import StartScene from "./scenes/StartScene";
// Import other scenes as you build them

const PhaserGame = ({ sceneKey }) => {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 1200,
      parent: "phaser-container",
      transparent: true,
      scene: [StartScene], // Add other scenes here
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div id="phaser-container" style={{ width: "100%", height: "100vh" }} />;
};

export default PhaserGame;