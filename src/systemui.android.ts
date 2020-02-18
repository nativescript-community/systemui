import * as app from 'tns-core-modules/application';
import { Color } from 'tns-core-modules/color';
import { View } from 'tns-core-modules/ui/core/view';
import { topmost } from 'tns-core-modules/ui/frame';
import lazy from 'tns-core-modules/utils/lazy';
import * as common from './systemui-common';

const isPostLollipop = lazy(() => android.os.Build.VERSION.SDK_INT >= 21);

declare module 'tns-core-modules/ui/core/view' {
    interface View {
        _getFragmentManager(): androidx.fragment.app.FragmentManager;
        _dialogFragment: androidx.fragment.app.DialogFragment;
    }
}

function getWindow() {
    return app.android.foregroundActivity.getWindow() as android.view.Window;
}

class PageExtended {
    @common.cssProperty navigationBarColor: Color;
    @common.cssProperty statusBarColor: Color;
    // @common.cssProperty statusBarStyle: string;
    showStatusBar(animated?: boolean) {
        getWindow()
            .getDecorView()
            .setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_VISIBLE);
    }
    hideStatusBar(animated?: boolean) {
        getWindow()
            .getDecorView()
            .setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_FULLSCREEN);
    }

    [common.cssStatusBarColorProperty.setNative](color: Color) {
        if (isPostLollipop()) {
            let window;
            // const topFrame = topmost();
            // const topView = common.findTopView(topFrame);
            const topView =(this as any).page;
            if (topView && topView._dialogFragment) {
                const dialog = topView._dialogFragment.getDialog();
                if (dialog) {
                    window = dialog.getWindow();
                } else {
                    topView.once(View.shownModallyEvent, () => {
                        topView._dialogFragment
                            .getDialog()
                            .getWindow()
                            .setStatusBarColor(color ? color.android : 0);
                    });
                    return;
                }
            }
            if (!window) {
                window = app.android.foregroundActivity.getWindow();
            }
            window.setStatusBarColor(color ? color.android : 0);
        }
    }
    [common.cssNavigationBarColorProperty.setNative](color: Color) {
        if (isPostLollipop()) {
            let window;
            // const topFrame = topmost();
            const topView =(this as any).page;
            if (topView && topView._dialogFragment) {
                const dialog = topView._dialogFragment.getDialog();
                if (dialog) {
                    window = dialog.getWindow();
                } else {
                    topView.once(View.shownModallyEvent, () => {
                        topView._dialogFragment
                            .getDialog()
                            .getWindow()
                            .setNavigationBarColor(color ? color.android : 0);
                    });
                    return;
                }
            }
            if (!window) {
                window = app.android.foregroundActivity.getWindow();
            }
            window.setNavigationBarColor(color ? color.android : 0);
        }
    }
}

let mixinInstalled = false;
export function overridePageBase() {
    const NSPage = require('tns-core-modules/ui/page').Page;
    common.applyMixins(NSPage, [PageExtended]);
}

export function installMixins() {
    if (!mixinInstalled) {
        mixinInstalled = true;
        overridePageBase();
    }
}
