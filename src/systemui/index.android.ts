import { Application, Color, Frame, View, ViewBase } from '@nativescript/core';
import { SDK_VERSION } from '@nativescript/core/utils';
import { statusBarStyleProperty } from '@nativescript/core/ui/page';
import {
    applyMixins,
    cssNavigationBarColorProperty,
    cssNavigationBarStyleProperty,
    cssProperty,
    cssStatusBarColorProperty,
    keepScreenAwakeProperty,
    screenBrightnessProperty,
    screenOrientationProperty
} from './index-common';

const isPostLollipop = SDK_VERSION >= 21;

const SYSTEM_UI_FLAG_LIGHT_STATUS_BAR = 0x00002000;
const SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR = 0x00000010;
const FLAG_TRANSLUCENT_NAVIGATION = 0x08000000;
const FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS = 0x80000000;
const SYSTEM_UI_FLAG_LAYOUT_STABLE = 0x00000100;
const SYSTEM_UI_FLAG_VISIBLE = 0x00000000;
// const SYSTEM_UI_FLAG_FULLSCREEN = 0x00000004;

// function contrastingColor(color: Color)
// {
//     return (luma(color) >= 165) ? '000' : 'fff';
// }
// function luma(color: Color) // color can be a hx string or an array of RGB values 0-255
// {
//     return (0.2126 * color.r) + (0.7152 * color.g) + (0.0722 * color.b); // SMPTE C, Rec. 709 weightings
// }

declare module '@nativescript/core/ui/core/view-base' {
    interface ViewBase {
        _dialogFragment: androidx.fragment.app.DialogFragment;
    }
}
const orientationConstants = {
    landscape: 6,
    portrait: 7,
    all: 10
};

let defaultOrientationValue;
let overridenScreenOrientation;

export async function setScreenOrientation(type) {
    const activity = Application.android.startActivity;
    if (!activity) {
        return;
    }
    if (defaultOrientationValue === undefined) {
        defaultOrientationValue = activity.getRequestedOrientation();
    }
    type = type?.toLowerCase();
    let requestedOrientationConstant = defaultOrientationValue;
    if (type && orientationConstants[type]) {
        requestedOrientationConstant = orientationConstants[type];
        overridenScreenOrientation = requestedOrientationConstant;
    }
    activity.setRequestedOrientation(requestedOrientationConstant);
}

async function getPageWindow(view: View): Promise<android.view.Window> {
    let topView: ViewBase = view.page;
    while (topView.parent || topView._dialogFragment) {
        if (topView._dialogFragment) {
            const dialog = topView._dialogFragment.getDialog();
            if (dialog) {
                return dialog.getWindow();
            } else {
                return new Promise((resolve) => {
                    topView.once(View.shownModallyEvent, () => {
                        resolve(topView._dialogFragment.getDialog().getWindow());
                    });
                });
            }
        }
        topView = topView.parent;
    }

    return topView._context.getWindow();
}

class PageExtended {
    @cssProperty navigationBarColor: Color;
    @cssProperty statusBarColor: Color;
    @cssProperty keepScreenAwake: boolean;
    @cssProperty screenBrightness: number;
    @cssProperty screenOrientation: string;
    async showStatusBar(animated) {
        const window = await getPageWindow(this as any);
        const decorView = window.getDecorView();
        const uiOptions = decorView.getSystemUiVisibility();
        window.getDecorView().setSystemUiVisibility(uiOptions | SYSTEM_UI_FLAG_VISIBLE);
    }
    async hideStatusBar(animated) {
        const window = await getPageWindow(this as any);
        const decorView = window.getDecorView();
        const uiOptions = decorView.getSystemUiVisibility();
        window.getDecorView().setSystemUiVisibility((uiOptions | 0x00000004) & ~SYSTEM_UI_FLAG_VISIBLE);
    }
    async [cssStatusBarColorProperty.setNative](color: Color) {
        if (isPostLollipop) {
            const window = await getPageWindow(this as any);
            window.setStatusBarColor(color ? color.android : 0);
        }
    }
    async [cssNavigationBarColorProperty.setNative](color) {
        if (isPostLollipop) {
            const window = await getPageWindow(this as any);
            if (color) {
                window.addFlags(FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.setNavigationBarColor(color.android);
            } else {
                window.clearFlags(FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.setNavigationBarColor(0);
            }
        }
    }
    async [cssNavigationBarStyleProperty.setNative](value) {
        if (isPostLollipop) {
            const window = await getPageWindow(this as any);
            const decorView = window.getDecorView();
            let uiOptions = decorView.getSystemUiVisibility();
            if (value === 'light') {
                window.addFlags(FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.clearFlags(FLAG_TRANSLUCENT_NAVIGATION);
                decorView.setSystemUiVisibility(uiOptions | SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
                uiOptions = decorView.getSystemUiVisibility();
            } else if (value === 'dark') {
                decorView.setSystemUiVisibility(uiOptions & ~SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
            } else if (value === 'transparent') {
                window.addFlags(FLAG_TRANSLUCENT_NAVIGATION);
                decorView.setSystemUiVisibility(uiOptions & ~SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
            }
        }
    }
    async [statusBarStyleProperty.setNative](value) {
        if (isPostLollipop) {
            const window = await getPageWindow(this as any);
            const decorView = window.getDecorView();
            const uiOptions = decorView.getSystemUiVisibility();
            if (value === 'light') {
                decorView.setSystemUiVisibility(uiOptions | SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            } else if (value === 'dark') {
                decorView.setSystemUiVisibility(uiOptions & ~SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            } else if (value === 'transparent') {
                decorView.setSystemUiVisibility(uiOptions | SYSTEM_UI_FLAG_LAYOUT_STABLE | SYSTEM_UI_FLAG_VISIBLE);
            } else {
                decorView.setSystemUiVisibility(uiOptions | value);
            }
        }
    }

    async [keepScreenAwakeProperty.setNative](value) {
        const window = await getPageWindow(this as any);
        if (value) {
            window.addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        } else {
            window.clearFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
    }
    async [screenBrightnessProperty.setNative](value) {
        const window = await getPageWindow(this as any);
        const params = window.getAttributes();
        params.screenBrightness = value;
        window.setAttributes(params);
    }
    async [screenOrientationProperty.setNative](value) {
        setScreenOrientation(value);
    }
}

function updatePagewSystemUI(page: PageExtended2) {
    if (page.navigationBarColor) {
        page[cssNavigationBarColorProperty.setNative](page.navigationBarColor);
    }
    if (page.navigationBarStyle) {
        page[cssNavigationBarStyleProperty.setNative](page.navigationBarStyle);
    }
    if (page.statusBarStyle) {
        page[statusBarStyleProperty.setNative](page.statusBarStyle);
    }
    if (page.statusBarColor) {
        page[cssStatusBarColorProperty.setNative](page.statusBarColor);
    }
    if (page.keepScreenAwake) {
        page[keepScreenAwakeProperty.setNative](page.keepScreenAwake);
    }
    if (page.screenBrightness) {
        page[screenBrightnessProperty.setNative](page.screenBrightness);
    }
    if (page.screenOrientation) {
        setScreenOrientation(page.screenOrientation);
    } else if (overridenScreenOrientation) {
        setScreenOrientation(null);
    }
}
class PageExtended2 {
    navigationBarColor: Color;
    statusBarColor: Color;
    statusBarStyle;
    navigationBarStyle;
    keepScreenAwake: boolean;
    screenBrightness: number;
    screenOrientation: string;

    _raiseShowingModallyEvent() {
        updatePagewSystemUI(this);
    }
    _raiseShowingBottomSheetEvent() {
        updatePagewSystemUI(this);
    }
    _raiseClosingModallyEvent() {
        // if (this.keepScreenAwake) {
        //     this[keepScreenAwakeProperty.setNative](0);
        // }
        const currentPage = Frame.topmost()?.currentPage;
        if (currentPage) {
            updatePagewSystemUI(currentPage as any as PageExtended2);
        }
    }
    _raiseClosedBottomSheetEvent() {
        // if (this.keepScreenAwake) {
        //     this[keepScreenAwakeProperty.setNative](0);
        // }
        const currentPage = Frame.topmost()?.currentPage;
        if (currentPage) {
            updatePagewSystemUI(currentPage as any as PageExtended2);
        }
    }
    public onNavigatingTo(context: any, isBackNavigation: boolean, bindingContext?: any) {
        if (isBackNavigation) {
            updatePagewSystemUI(this);
        }
    }
    onNavigatingFrom(context, isBackNavigation, bindingContext) {
        // this wont get called for modals but not a big deal as the window is closed
        if (this.keepScreenAwake) {
            this[keepScreenAwakeProperty.setNative](0);
        }
    }
}

let mixinInstalled = false;
export function overridePageBase() {
    const NSPage = require('@nativescript/core/ui/page').Page;
    applyMixins(NSPage, [PageExtended], { override: true });
    applyMixins(NSPage, [PageExtended2], { after: true });
}

export function installMixins() {
    if (!mixinInstalled) {
        mixinInstalled = true;
        overridePageBase();
    }
}
