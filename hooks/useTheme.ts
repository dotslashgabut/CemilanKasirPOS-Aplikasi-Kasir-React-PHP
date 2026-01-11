import { useState, useEffect } from 'react';

const DEFAULT_HUE = 348;
const DEFAULT_SATURATION = 90;
const DEFAULT_LIGHTNESS = 56;

export const useTheme = () => {
    const [hue, setHue] = useState(() => {
        const saved = localStorage.getItem('pos_theme_hue');
        return saved ? parseInt(saved, 10) : DEFAULT_HUE;
    });

    const [saturation, setSaturation] = useState(() => {
        const saved = localStorage.getItem('pos_theme_saturation');
        return saved ? parseInt(saved, 10) : DEFAULT_SATURATION;
    });

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary-h', hue.toString());
        root.style.setProperty('--primary-s', `${saturation}%`);
        // Lightness is kept constant for now to ensure text readability, 
        // but could be adjustable if needed.
        root.style.setProperty('--primary-l', `${DEFAULT_LIGHTNESS}%`);
        root.style.setProperty('--primary-l-hover', `${DEFAULT_LIGHTNESS - 10}%`);
        root.style.setProperty('--primary-l-active', `${DEFAULT_LIGHTNESS - 16}%`);

        localStorage.setItem('pos_theme_hue', hue.toString());
        localStorage.setItem('pos_theme_saturation', saturation.toString());
    }, [hue, saturation]);

    const resetTheme = () => {
        setHue(DEFAULT_HUE);
        setSaturation(DEFAULT_SATURATION);
    };

    return {
        hue,
        setHue,
        saturation,
        setSaturation,
        resetTheme
    };
};
