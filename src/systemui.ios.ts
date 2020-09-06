import { Color, View } from '@nativescript/core';
import * as common from './systemui-common';

const STATUSBAR_VIEW_TAG = 3245411;

class PageExtended {
    @common.cssProperty navigationBarColor: Color;
    @common.cssProperty statusBarColor: Color;

    showStatusBar(animated = true) {
        UIApplication.sharedApplication.setStatusBarHiddenWithAnimation(
            false,
            animated ? UIStatusBarAnimation.Slide : UIStatusBarAnimation.None
        );
        const statusBarView = this.getStatusBarView();
        if (statusBarView) {
            UIView.animateWithDurationAnimations(0.4, () => {
                statusBarView.alpha = 1;
            });
        } else {
            statusBarView.alpha = 1;
        }
    }
    hideStatusBar(animated = true) {
        UIApplication.sharedApplication.setStatusBarHiddenWithAnimation(
            true,
            animated ? UIStatusBarAnimation.Slide : UIStatusBarAnimation.None
        );
        const statusBarView = this.getStatusBarView();
        if (statusBarView) {
            UIView.animateWithDurationAnimations(0.2, () => {
                statusBarView.alpha = 0;
            });
        } else {
            statusBarView.alpha = 0;
        }
    }
    getStatusBarView(): UIView {
        const topParent = common.findTopView(this as any);
        const viewController = topParent.viewController as UIViewController;
        const topView = viewController.view.superview;
        if (topView) {
            return topView.viewWithTag(STATUSBAR_VIEW_TAG);
        }
        return null;
    }
    setStatusBarColor(color: Color) {
        const topParent = common.findTopView(this as any);
        const viewController = topParent.viewController as UIViewController;
        if (viewController.modalPresentationStyle === UIModalPresentationStyle.FormSheet) {
            return null;
        }
        const topView = viewController.view.superview;
        if (!topView && (topParent as any)._modalParent) {
            topParent.once(View.shownModallyEvent, () => {
                this.setStatusBarColor(color);
            });
            return;
        }
        if (topView) {
            let statusBarView = topView.viewWithTag(STATUSBAR_VIEW_TAG);
            if (!statusBarView) {
                const statusBarFrame = UIApplication.sharedApplication.statusBarFrame;
                statusBarView = UIView.alloc().initWithFrame(statusBarFrame);
                statusBarView.tag = STATUSBAR_VIEW_TAG;
                statusBarView.autoresizingMask = 2 /* FlexibleWidth */ | 32 /* FlexibleBottomMargin */;
                statusBarView.autoresizesSubviews = true;
                topView.addSubview(statusBarView);
            }
            if (statusBarView) {
                statusBarView.backgroundColor = color ? color.ios : null;
            }
        }
    }
    [common.cssStatusBarColorProperty.setNative](color: Color) {
        this.setStatusBarColor(color);
    }
    statusBarStyle;
    updateStatusBar: Function;
    public onNavigatingTo(context: any, isBackNavigation: boolean, bindingContext?: any) {
        if (isBackNavigation) {
            // if (this.navigationBarColor) {
            //     this[cssNavigationBarColorProperty.setNative](this.navigationBarColor);
            // }
            if (this.statusBarStyle) {
                this.updateStatusBar();
            }
            if (this.statusBarColor) {
                this.setStatusBarColor(this.statusBarColor);
            }
        }
    }
}

let mixinInstalled = false;
export function overridePageBase() {
    const NSPage = require('@nativescript/core/ui/page').Page;
    common.applyMixins(NSPage, [PageExtended]);
}

export function installMixins() {
    if (!mixinInstalled) {
        mixinInstalled = true;
        overridePageBase();
    }
}
