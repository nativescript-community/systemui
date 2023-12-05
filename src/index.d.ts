import { Color } from '@nativescript/core';

export function installMixins();

declare module '@nativescript/core/ui/page' {
    interface Page {
        navigationBarColor: Color;
        navigationBarStyle: 'light' | 'dark' | 'transparent'; // Android only
        statusBarStyle: 'light' | 'dark'; // transparent added for Android
        statusBarColor: Color;
        windowBgColor: Color; // iOS only
        keepScreenAwake: boolean;
        screenBrightness: number;
        showStatusBar(animated?: boolean);
        hideStatusBar(animated?: boolean);
    }
}
