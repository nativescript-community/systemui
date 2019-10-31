import * as common from './systemui-common';
import { Color } from 'tns-core-modules/color';
import * as app from 'tns-core-modules/application';
import lazy from 'tns-core-modules/utils/lazy';
import { View } from 'tns-core-modules/ui/core/view';
import { Frame, topmost } from 'tns-core-modules/ui/frame';

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

export class StatusBar extends common.StatusBar {
    updateBarColor(value: Color) {
        if (isPostLollipop) {
            const window = getWindow();
            window.setStatusBarColor(value ? value.android : 0);
        }
    }
    updateBarStyle(value) {}

    show() {
        getWindow()
            .getDecorView()
            .setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_VISIBLE);
    }

    hide() {
        getWindow()
            .getDecorView()
            .setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_FULLSCREEN);
    }
}
function findTopView(view: View) {
    while (view.parent) {
        view = view.parent as View;
    }
    return view;
}
export class NavigationBar extends common.NavigationBar {
    updateBarColor(value: Color) {
        if (isPostLollipop) {
            let window;
            const topFrame = topmost();
            const topView = findTopView(topFrame);
            if (topView && topView._dialogFragment) {
                const dialog = topView._dialogFragment.getDialog();
                if (dialog) {
                    window = dialog.getWindow();
                } else {
                    topView.once('shownModally', () => {
                        topView._dialogFragment
                            .getDialog()
                            .getWindow()
                            .setNavigationBarColor(value ? value.android : 0);
                    });
                    return;
                }
            }
            if (!window) {
                window = app.android.foregroundActivity.getWindow();
            }
            window.setNavigationBarColor(value ? value.android : 0);
        }
    }
}
