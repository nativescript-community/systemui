import { Color, View, ViewBase } from '@nativescript/core';
import { androidStatusBarBackgroundProperty, statusBarStyleProperty } from '@nativescript/core/ui/page';
import lazy from '@nativescript/core/utils/lazy';
import { applyMixins, cssNavigationBarColorProperty, cssNavigationBarStyleProperty, cssProperty, cssStatusBarColorProperty, keepScreenAwakeProperty } from './systemui-common';

const isPostLollipop = lazy(() => android.os.Build.VERSION.SDK_INT >= 21);

const SYSTEM_UI_FLAG_LIGHT_STATUS_BAR = 0x00002000;
const SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR = 0x00000010;
const FLAG_TRANSLUCENT_NAVIGATION = 0x08000000;
const FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS = 0x80000000;
const SYSTEM_UI_FLAG_LAYOUT_STABLE = 0x00000100;
const SYSTEM_UI_FLAG_VISIBLE = 0x00000000;
const SYSTEM_UI_FLAG_FULLSCREEN = 0x00000004;

function contrastingColor(color: Color)
{
    return (luma(color) >= 165) ? '000' : 'fff';
}
function luma(color: Color) // color can be a hx string or an array of RGB values 0-255
{
    return (0.2126 * color.r) + (0.7152 * color.g) + (0.0722 * color.b); // SMPTE C, Rec. 709 weightings
}

declare module '@nativescript/core/ui/core/view' {
    interface View {
        _getFragmentManager(): androidx.fragment.app.FragmentManager;
    }
}
declare module '@nativescript/core/ui/core/view-base' {
    interface ViewBase {
        _dialogFragment: androidx.fragment.app.DialogFragment;
    }
}

async function getPageWindow(view: View): Promise<android.view.Window> {
    let topView: ViewBase = view.page;
    while (topView.parent) {
        topView = topView.parent;
    }
    if (topView && topView._dialogFragment) {
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
    return topView._context.getWindow();
}

class PageExtended {
    @cssProperty navigationBarColor: Color;
    @cssProperty statusBarColor: Color;
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
        if (isPostLollipop()) {
            const window = await getPageWindow(this as any);
            window.setStatusBarColor(color ? color.android : 0);
        }
    }
    async [cssNavigationBarColorProperty.setNative](color) {
        if (isPostLollipop()) {
            const window = await getPageWindow(this as any);
            if (color) {
                window.addFlags(FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.setNavigationBarColor(color.android);
            }
            else {
                window.clearFlags(FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.setNavigationBarColor(0);
            }
        }
    }
    async [cssNavigationBarStyleProperty.setNative](value) {
        if (isPostLollipop()) {
            const window = await getPageWindow(this as any);
            const decorView = window.getDecorView();
            let uiOptions = decorView.getSystemUiVisibility();
            if (value === 'light') {
                window.addFlags(FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.clearFlags(FLAG_TRANSLUCENT_NAVIGATION);
                decorView.setSystemUiVisibility(uiOptions | SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
                uiOptions = decorView.getSystemUiVisibility();
            }
            else if (value === 'dark') {
                decorView.setSystemUiVisibility(uiOptions & ~SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
            }
            else if (value === 'transparent') {
                window.addFlags(FLAG_TRANSLUCENT_NAVIGATION);
                decorView.setSystemUiVisibility(uiOptions & ~SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
            }
        }
    }
    async [statusBarStyleProperty.setNative](value) {
        if (isPostLollipop()) {
            const window = await getPageWindow(this as any);
            const decorView = window.getDecorView();
            const uiOptions = decorView.getSystemUiVisibility();
            if (value === 'light') {
                decorView.setSystemUiVisibility(uiOptions | SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            }
            else if (value === 'dark') {
                decorView.setSystemUiVisibility(uiOptions & ~SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            }
            else if (value === 'transparent') {
                decorView.setSystemUiVisibility(uiOptions | SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | SYSTEM_UI_FLAG_VISIBLE);
            }
            else {
                decorView.setSystemUiVisibility(uiOptions  | value);
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
}
class PageExtended2 {
    navigationBarColor: Color;
    statusBarColor: Color;
    statusBarStyle;
    navigationBarStyle;
    keepScreenAwake: boolean;
    public onNavigatingTo(context: any, isBackNavigation: boolean, bindingContext?: any) {
        if (isBackNavigation) {
            if (this.navigationBarColor) {
                this[cssNavigationBarColorProperty.setNative](this.navigationBarColor);
            }
            if (this.navigationBarStyle) {
                this[cssNavigationBarStyleProperty.setNative](this.navigationBarStyle);
            }
            if (this.statusBarStyle) {
                this[statusBarStyleProperty.setNative](this.statusBarStyle);
            }
            if (this.statusBarColor) {
                this[cssStatusBarColorProperty.setNative](this.statusBarColor);
            }
            if (this.keepScreenAwake) {
                this[keepScreenAwakeProperty.setNative](this.keepScreenAwake);
            }
        }
    }
    onNavigatingFrom(context, isBackNavigation, bindingContext) {
        // this wont get called for modals but not a big deal as the window is closed
        if (this.keepScreenAwake) {
            this[keepScreenAwakeProperty.setNative](false);
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
