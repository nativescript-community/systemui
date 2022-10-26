import { Application, Color, Frame, View } from '@nativescript/core';
import { statusBarStyleProperty } from '@nativescript/core/ui/page';
import * as common from './systemui-common';

const STATUSBAR_VIEW_TAG = 3245411;

let UIViewControllerBasedStatusBarAppearance: boolean;
class PageExtended {
    @common.cssProperty navigationBarColor: Color;
    @common.cssProperty statusBarColor: Color;
    @common.cssProperty windowBgColor: Color;
    @common.cssProperty keepScreenAwake: boolean;
    @common.cssProperty screenBrightness: number;

    savedBrightness;
    didBecomeActiveListener;

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
    hideStatusBarColor() {
        const topParent = common.findTopView(this as any);
        const viewController = topParent.viewController;
        const topView = viewController && viewController.view.superview;
        if (topView) {
            const statusBarView = topView.viewWithTag(STATUSBAR_VIEW_TAG);
            if (statusBarView) {
                statusBarView.hidden = true;
            }
        }
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
                statusBarView.hidden = false;
                statusBarView.backgroundColor = color ? color.ios : null;
            }
        }
    }

    setWindowBgColor(color: Color) {
        const nativeApp = UIApplication.sharedApplication;
        const firstWindow = nativeApp.keyWindow || (nativeApp.windows.count > 0 && nativeApp.windows[0]);
        if (firstWindow && firstWindow.rootViewController) {
            firstWindow.rootViewController.view.backgroundColor = color ? color.ios : null;
            return;
        }
        if (firstWindow) {
            firstWindow.backgroundColor = color ? color.ios : null;
        }
    }
    [common.cssStatusBarColorProperty.setNative](color: Color) {
        this.setStatusBarColor(color);
    }
    public _updateStatusBarStyle(value?: string) {
        const frame = this.frame;
        if (UIViewControllerBasedStatusBarAppearance === undefined) {
            UIViewControllerBasedStatusBarAppearance = NSBundle.mainBundle.infoDictionary.objectForKey('UIViewControllerBasedStatusBarAppearance');
        }
        if (value) {
            if (this.frame) {
                const navigationController: UINavigationController = frame.ios.controller;
                const navigationBar = navigationController.navigationBar;
                if (value === 'dark') {
                    navigationBar.barStyle = UIBarStyle.Black;
                } else {
                    navigationBar.barStyle = UIBarStyle.Default;
                }
            }
            if (!UIViewControllerBasedStatusBarAppearance) {
                if (value === 'dark') {
                    UIApplication.sharedApplication.setStatusBarStyleAnimated(UIStatusBarStyle.LightContent, true);
                } else {
                    UIApplication.sharedApplication.setStatusBarStyleAnimated(UIStatusBarStyle.DarkContent, true);
                }
            }
        }
    }
    [statusBarStyleProperty.setNative](value) {
        this._updateStatusBarStyle(value);

    }
    [common.cssWindowBgColorProperty.setNative](value) {
        this.setWindowBgColor(value);
    }
    [common.keepScreenAwakeProperty.setNative](value) {
        if (value) {
            const app = UIApplication.sharedApplication;
            if (!app.idleTimerDisabled) {
                app.idleTimerDisabled = true;
            }
        } else {
            const app = UIApplication.sharedApplication;
            if (app.idleTimerDisabled) {
                app.idleTimerDisabled = false;
            }
        }
    }
    didBecomeActive() {
        console.log('didBecomeActive', this.screenBrightness);
        if (this.screenBrightness) {
            this.applyCustomBrightness();
        }
    }
    applyCustomBrightness() {
        if (!this.didBecomeActiveListener) {
            this.didBecomeActiveListener = this.didBecomeActive.bind(this);
            addApplicationDidBecomeActiveListener(this.didBecomeActiveListener);
        }
        if (!this.savedBrightness) {
            this.savedBrightness = UIScreen.mainScreen.brightness;
        }
        console.log('applyCustomBrightness', this.savedBrightness, this.screenBrightness);
        UIScreen.mainScreen.brightness = this.screenBrightness;
    }
    resetCustomBrightness() {
        if (this.savedBrightness) {
            UIScreen.mainScreen.brightness = this.savedBrightness;
            this.savedBrightness = null;
        }
    }
    [common.screenBrightnessProperty.setNative](value) {
        this.applyCustomBrightness();
    }
    statusBarStyle;
    frame: Frame;
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
            if (this.windowBgColor) {
                this.setWindowBgColor(this.windowBgColor);
            }
            if (this.windowBgColor) {
                this.setWindowBgColor(this.windowBgColor);
            }
            if (this.keepScreenAwake) {
                this[common.keepScreenAwakeProperty.setNative](this.keepScreenAwake);
            }
            if (this.screenBrightness) {
                this.applyCustomBrightness();
            }
        }
    }
    updateWithWillAppear() {
        console.log('updateWithWillAppear', this);

        if (this.screenBrightness) {
            this.applyCustomBrightness();
        }
    }

    updateWithWillDisappear() {
        console.log('updateWithWillDisappear', this);
        if (this.savedBrightness) {
            this.resetCustomBrightness();
        }
    }
    disposeNativeView() {
        console.log('disposeNativeView', !!this.didBecomeActiveListener);
        if (this.didBecomeActiveListener) {
            removeApplicationDidBecomeActiveListener(this.didBecomeActiveListener);
            this.didBecomeActiveListener = null;
        }
    }
}

let mixinInstalled = false;
export function overridePageBase() {
    const NSPage = require('@nativescript/core/ui/page').Page;
    common.applyMixins(NSPage, [PageExtended]);
}

function getAppDelegate() {
    // Play nice with other plugins by not completely ignoring anything already added to the appdelegate
    if (Application.ios.delegate === undefined) {
        @NativeClass
        class UIApplicationDelegateImpl extends UIResponder implements UIApplicationDelegate {
            public static ObjCProtocols = [UIApplicationDelegate];
        }

        Application.ios.delegate = UIApplicationDelegateImpl;
    }
    return Application.ios.delegate;
}
const applicationDidBecomeActiveListeners = [];
function addApplicationDidBecomeActiveListener(l) {
    applicationDidBecomeActiveListeners.push(l);
}
function removeApplicationDidBecomeActiveListener(l) {
    const index = applicationDidBecomeActiveListeners.indexOf(l);
    if (index  !== -1) {
        applicationDidBecomeActiveListeners.splice(index, 1);
    }
}
function addAppDelegateMethods(appDelegate) {
    // we need the launchOptions for this one so it's a bit hard to use the UIApplicationDidFinishLaunchingNotification pattern we're using for other things
    // however, let's not override 'applicationDidFinishLaunchingWithOptions' if we don't really need it:
    const oldMethod = appDelegate.prototype.applicationDidBecomeActive;
    appDelegate.prototype.applicationDidBecomeActive = function (application) {
        if (oldMethod) {
            oldMethod.call(this, application);
        }
        applicationDidBecomeActiveListeners.forEach(l=>l());


        return true;
    };
}
export function installMixins() {
    if (!mixinInstalled) {
        mixinInstalled = true;
        overridePageBase();

        const delegate = getAppDelegate();
        addAppDelegateMethods(delegate);
    }
}
