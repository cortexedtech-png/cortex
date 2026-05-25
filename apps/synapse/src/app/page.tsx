"use client";

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import ThemePicker from "../components/ThemePicker";
import LoreSelection from "../components/LoreSelection";
import { type ThemeId } from "../lib/themes";

export default function Home() {
  const { setTheme, resetTheme } = useTheme();
  const [screen, setScreen] = useState<"picker" | "lore">("picker");

  function handlePickTheme(id: ThemeId) {
    setTheme(id);
    setScreen("lore");
  }

  function handleBack() {
    resetTheme();
    setScreen("picker");
  }

  if (screen === "picker") {
    return <ThemePicker onPick={handlePickTheme} />;
  }

  return (
    <main className="flex-1 flex flex-col">
      <LoreSelection onBack={handleBack} />
    </main>
  );
}

