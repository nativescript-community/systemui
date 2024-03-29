import { Color } from '@nativescript/core';

export function installMixins();

declare module '@nativescript/core/ui/page' {
    interface Page {
        navigationBarColor: Color;
        navigationBarStyle: 'light' | 'dark' | 'transparent'; // Android only
        statusBarStyle: 'light' | 'dark'; // transparent added for Android
        statusBarColor: Color;
        statusBarHidden: boolean;
        windowBgColor: Color; // iOS only
        keepScreenAwake: boolean;
        screenOrientation: 'portrait' | 'landscape' | 'undefined';
        screenBrightness: number;
        showStatusBar(animated?: boolean);
        hideStatusBar(animated?: boolean);
        setStatusBarVisibility(value: boolean, animated?: boolean);
        checkStatusBarVisibility();
    }
}
