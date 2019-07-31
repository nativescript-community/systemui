import * as common from './systemui-common';
import { Color } from 'tns-core-modules/color';
import * as app from 'tns-core-modules/application';
import { device } from 'tns-core-modules/platform';
import lazy from 'tns-core-modules/utils/lazy';

const isPostLollipop = lazy(() => parseInt(device.sdkVersion, 10) >= 21);

function getWindow() {
    return app.android.foregroundActivity.getWindow() as android.view.Window;
}

export class StatusBar extends common.StatusBar {
    updateBarColor(value: Color) {
        if (isPostLollipop) {
            const window = getWindow();
            window.setStatusBarColor(value ? value.android : null);
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

export class NavigationBar extends common.NavigationBar {
    updateBarColor(value: Color) {
        if (isPostLollipop) {
            const window = app.android.foregroundActivity.getWindow() as android.view.Window;
            window.setNavigationBarColor(value ? value.android : null);
        }
    }
}
