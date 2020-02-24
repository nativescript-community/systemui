import * as app from "tns-core-modules/application";
import { Color } from "tns-core-modules/color";
import { View } from "tns-core-modules/ui/core/view";
import {
    topmost,
    statusBarStyleProperty,
    androidStatusBarBackgroundProperty,
    Page,
} from "tns-core-modules/ui/frame";
import lazy from "tns-core-modules/utils/lazy";
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

declare module "tns-core-modules/ui/core/view" {
    interface View {
        _getFragmentManager(): androidx.fragment.app.FragmentManager;
        _dialogFragment: androidx.fragment.app.DialogFragment;
    }
}

function getWindow() {
    return app.android.foregroundActivity.getWindow() as android.view.Window;
}

async function getPageWindow(view: View) {
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
    return app.android.foregroundActivity.getWindow();
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
    const NSPage = require("tns-core-modules/ui/page").Page;
    applyMixins(NSPage, [PageExtended]);
}

export function installMixins() {
    if (!mixinInstalled) {
        mixinInstalled = true;
        overridePageBase();
    }
}
