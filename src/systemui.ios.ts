import * as common from './systemui-common';
import * as frame from 'tns-core-modules/ui/frame';
import { Color } from 'tns-core-modules/color';

let StatusBarView: UIView;

export class StatusBar extends common.StatusBar {
    private getStatusBarView() {
        if (!StatusBarView) {
            const statusBarFrame = UIApplication.sharedApplication.statusBarFrame;
            StatusBarView = UIView.alloc().initWithFrame(statusBarFrame);
            StatusBarView.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleBottomMargin;
            StatusBarView.autoresizesSubviews = true;
            frame.topmost().ios.controller.view.superview.addSubview(StatusBarView);
        }
        return StatusBarView;
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
