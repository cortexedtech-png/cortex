"use client";

import { createContext, useContext, useState } from "react";
import { type AppTheme, type ThemeId, THEMES, DEFAULT_THEME } from "../lib/themes";

interface ThemeContextValue {
    theme: AppTheme;
    themeId: ThemeId;
    setTheme: (id: ThemeId) => void;
    resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: THEMES[DEFAULT_THEME],
    themeId: DEFAULT_THEME,
    setTheme: () => { },
    resetTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);

    const setTheme = (id: ThemeId) => {
        setThemeId(id);
    };

    const resetTheme = () => {
        setThemeId(DEFAULT_THEME);
    };

    const theme = THEMES[themeId];

    return (
        <ThemeContext.Provider value={{ theme, themeId, setTheme, resetTheme }}>
            <div
                className={`theme-${themeId} min-h-full flex flex-col`}
                style={{ background: theme.colors.bg, color: theme.colors.text }}
            >
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
