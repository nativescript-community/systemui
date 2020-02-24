import * as app from "@nativescript/core/application";
import { Color } from "@nativescript/core/color";
import { View } from "@nativescript/core/ui/core/view";
import {
    statusBarStyleProperty,
    androidStatusBarBackgroundProperty,
} from "@nativescript/core/ui/page";
import lazy from "@nativescript/core/utils/lazy";
import {
    applyMixins,
    cssProperty,
    cssNavigationBarColorProperty,
    cssStatusBarColorProperty,
} from "./systemui-common";

const isPostLollipop = lazy(() => android.os.Build.VERSION.SDK_INT >= 21);

const SYSTEM_UI_FLAG_LIGHT_STATUS_BAR = 0x00002000;
const STATUS_BAR_LIGHT_BCKG = -657931;
const STATUS_BAR_DARK_BCKG = 1711276032;

declare module "@nativescript/core/ui/core/view" {
    interface View {
        _getFragmentManager(): androidx.fragment.app.FragmentManager;
        _dialogFragment: androidx.fragment.app.DialogFragment;
    }
}


async function getPageWindow(view: View): Promise<android.view.Window> {
    const topView = view.page;
    if (topView && topView._dialogFragment) {
        const dialog = topView._dialogFragment.getDialog();
        if (dialog) {
            return dialog.getWindow();
        } else {
            return new Promise(resolve => {
                topView.once(View.shownModallyEvent, () => {
                    resolve(topView._dialogFragment.getDialog().getWindow());
                });
            });
        }
    }
    return (<androidx.appcompat.app.AppCompatActivity>this._context).getWindow();
}

class PageExtended {
    @cssProperty navigationBarColor: Color;
    @cssProperty statusBarColor: Color;
    // @common.cssProperty statusBarStyle: string;
    async showStatusBar(animated?: boolean) {
        const window = await getPageWindow(this as any);
        window
            .getDecorView()
            .setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_VISIBLE);
    }
    async hideStatusBar(animated?: boolean) {
        const window = await getPageWindow(this as any);
        window
            .getDecorView()
            .setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_FULLSCREEN);
    }

    async [cssStatusBarColorProperty.setNative](color: Color) {
        if (isPostLollipop()) {
            const window = await getPageWindow(this as any);
            window.setStatusBarColor(color ? color.android : 0);
        }
    }
    async [cssNavigationBarColorProperty.setNative](color: Color) {
        if (isPostLollipop()) {
            const window = await getPageWindow(this as any);
            window.setNavigationBarColor(color ? color.android : 0);
        }
    }

    async [statusBarStyleProperty.setNative](
        value: "dark" | "light" | { color: number; systemUiVisibility: number }
    ) {
        if (isPostLollipop()) {
            const window = await getPageWindow(this as any);
            const decorView = window.getDecorView();

            if (value === "light") {
                window.setStatusBarColor(STATUS_BAR_LIGHT_BCKG);
                decorView.setSystemUiVisibility(
                    SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                );
            } else if (value === "dark") {
                window.setStatusBarColor(STATUS_BAR_DARK_BCKG);
                decorView.setSystemUiVisibility(0);
            } else {
                window.setStatusBarColor(value.color);
                decorView.setSystemUiVisibility(value.systemUiVisibility);
            }
        }
    }
    async [androidStatusBarBackgroundProperty.setNative](
        value: number | Color
    ) {
        if (isPostLollipop()) {
            const window = await getPageWindow(this as any);
            const color = value instanceof Color ? value.android : value;
            (<any>window).setStatusBarColor(color);
        }
    }
}

let mixinInstalled = false;
export function overridePageBase() {
    const NSPage = require("@nativescript/core/ui/page").Page;
    applyMixins(NSPage, [PageExtended]);
}

export function installMixins() {
    if (!mixinInstalled) {
        mixinInstalled = true;
        overridePageBase();
    }
}
