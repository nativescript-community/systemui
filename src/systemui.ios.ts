import * as common from './systemui-common';
import * as frame from 'tns-core-modules/ui/frame';
import { Color } from 'tns-core-modules/color';

const STATUSBAR_VIEW_TAG = 3245411;

export class StatusBar extends common.StatusBar {
    private getStatusBarView() {
        const topView = frame.topmost().ios.controller.view.superview;
        let statusBarView = topView.viewWithTag(STATUSBAR_VIEW_TAG);
        if (!statusBarView) {
            var statusBarFrame = UIApplication.sharedApplication.statusBarFrame;
            statusBarView = UIView.alloc().initWithFrame(statusBarFrame);
            statusBarView.tag = STATUSBAR_VIEW_TAG;
            statusBarView.autoresizingMask = 2 /* FlexibleWidth */ | 32 /* FlexibleBottomMargin */;
            statusBarView.autoresizesSubviews = true;
            topView.addSubview(statusBarView);
        }
        return statusBarView;
    }

    updateBarColor(value: Color) {
        if (value) {
            this.getStatusBarView().backgroundColor = value ? value.ios : null;
        }
    }

    updateBarStyle(value: string) {
        const navController = frame.topmost().ios.controller;
        const navigationBar = navController.navigationBar;
        navigationBar.barStyle = value;
    }

    show() {
        UIApplication.sharedApplication.setStatusBarHiddenWithAnimation(false, UIStatusBarAnimation.Slide);
    }

    hide() {
        UIApplication.sharedApplication.setStatusBarHiddenWithAnimation(true, UIStatusBarAnimation.Slide);
    }
}

export class NavigationBar extends common.NavigationBar {
    updateBarColor(value: Color) {}
}
