import { Application, Color, Frame, Page, View } from '@nativescript/core';
import { statusBarStyleProperty } from '@nativescript/core/ui/page';
import { SDK_VERSION } from '@nativescript/core/utils';
import {
    applyMixins,
    cssProperty,
    cssStatusBarColorProperty,
    cssWindowBgColorProperty,
    findTopView,
    keepScreenAwakeProperty,
    screenBrightnessProperty,
    screenOrientationProperty,
    statusBarHiddenProperty
} from './index-common';

const STATUSBAR_VIEW_TAG = 3245411;

/**
 * find the exact object by which the property is owned in the prototype chain
 * @param object
 * @param property
 * @returns {*}
 */

function findPrototypeForProperty(object, property) {
    while (false === object.hasOwnProperty(property)) {
        object = Object.getPrototypeOf(object);
    }
    return object;
}
function setShouldAutoRotate(page: Page, value) {
    const prototypeForNavController = findPrototypeForProperty(page.viewController, 'shouldAutorotate');
    Object.defineProperty(prototypeForNavController, 'shouldAutorotate', {
        configurable: true,
        enumerable: false,
        get() {
            return value;
        }
    });
}
function setSupportedInterfaceOrientations(page, value) {
    const prototypeForNavController = findPrototypeForProperty(page.viewController, 'supportedInterfaceOrientations');
    Object.defineProperty(prototypeForNavController, 'supportedInterfaceOrientations', {
        configurable: true,
        enumerable: false,
        get() {
            return value;
        }
    });
}
export async function setScreenOrientation(page: Page, type: string) {
    if (SDK_VERSION >= 16) {
        let mask: UIInterfaceOrientationMask;
        switch (type?.toLowerCase()) {
            case 'landscape':
                mask = UIInterfaceOrientationMask.Landscape;
                break;
            case 'portrait':
                mask = UIInterfaceOrientationMask.Portrait;

                break;
            default:
                mask = UIInterfaceOrientationMask.All;
                break;
        }
        setSupportedInterfaceOrientations(page, mask);
        const viewController = page.viewController;
        const windowScene: UIWindowScene = page.nativeViewProtected?.window?.windowScene ?? UIApplication.sharedApplication.connectedScenes.anyObject();
        windowScene?.requestGeometryUpdateWithPreferencesErrorHandler(UIWindowSceneGeometryPreferencesIOS.alloc().initWithInterfaceOrientations(mask), (error) => {
            console.error(error);
        });
        if (viewController && viewController.setNeedsUpdateOfSupportedInterfaceOrientations) {
            viewController.setNeedsUpdateOfSupportedInterfaceOrientations();
        } else {
            UIViewController.attemptRotationToDeviceOrientation();
        }
    } else {
        switch (type?.toLowerCase()) {
            case 'landscape':
                UIDevice.currentDevice.setValueForKey(UIInterfaceOrientation.LandscapeLeft, 'orientation');
                setShouldAutoRotate(page, false);
                break;
            case 'portrait':
                UIDevice.currentDevice.setValueForKey(UIInterfaceOrientation.Portrait, 'orientation');
                setShouldAutoRotate(page, false);
                break;
            default:
                setShouldAutoRotate(page, true);
                break;
        }
    }
}

let defaultStatusBarHidden: boolean;
function updatePagewSystemUI(page: PageExtended) {
    if (!page) {
        return;
    }
    // if (this.navigationBarColor) {
    //     this[cssNavigationBarColorProperty.setNative](this.navigationBarColor);
    // }
    page.checkStatusBarVisibility();
    if (page.statusBarStyle) {
        page.updateStatusBar();
    }
    if (page.statusBarColor) {
        page.setStatusBarColor(page.statusBarColor);
    }
    if (page.windowBgColor) {
        page.setWindowBgColor(page.windowBgColor);
    }
    if (page.keepScreenAwake) {
        page[keepScreenAwakeProperty.setNative](page.keepScreenAwake);
    }
    if (page.screenBrightness > 0) {
        page.applyCustomBrightness();
    }
    if (page.screenOrientation) {
        setScreenOrientation(page as any as Page, page.screenOrientation);
    } else {
        setScreenOrientation(page as any as Page, null);
    }
}

let UIViewControllerBasedStatusBarAppearance: boolean;
class PageExtended {
    @cssProperty navigationBarColor: Color;
    @cssProperty statusBarColor: Color;
    @cssProperty statusBarHidden: boolean;
    @cssProperty windowBgColor: Color;
    @cssProperty keepScreenAwake: boolean;
    @cssProperty screenBrightness: number;
    @cssProperty screenOrientation: string;

    savedBrightness;
    didBecomeActiveListener;

    statusBarStyle;

    frame: Frame; // defined in View
    setStatusBarVisibility(value: boolean, animated = true, duration = 200) {
        UIApplication.sharedApplication.setStatusBarHiddenWithAnimation(!value, animated ? UIStatusBarAnimation.Slide : UIStatusBarAnimation.None);
        const statusBarView = this.getStatusBarView();
        if (statusBarView) {
            if (animated) {
                UIView.animateWithDurationAnimations(duration / 1000, () => {
                    statusBarView.alpha = value ? 1 : 0;
                });
            } else {
                statusBarView.alpha = value ? 1 : 0;
            }
        }
    }
    checkStatusBarVisibility() {
        if (defaultStatusBarHidden === undefined) {
            defaultStatusBarHidden = UIApplication.sharedApplication.statusBarHidden;
        }
        this.setStatusBarVisibility(!(this.statusBarHidden ?? UIApplication.sharedApplication.statusBarHidden));
    }
    showStatusBar(animated = true) {
        this.setStatusBarVisibility(true, animated);
    }
    hideStatusBar(animated = true) {
        this.setStatusBarVisibility(false, animated);
    }
    getStatusBarView(): UIView {
        const topParent = findTopView(this as any);
        const viewController = topParent.viewController as UIViewController;
        const topView = viewController.view.superview;
        if (topView) {
            return topView.viewWithTag(STATUSBAR_VIEW_TAG);
        }
        return null;
    }
    hideStatusBarColor() {
        const topParent = findTopView(this as any);
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
        const topParent = findTopView(this as any);
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
                statusBarView.userInteractionEnabled = false;
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
    [cssStatusBarColorProperty.setNative](color: Color) {
        this.setStatusBarColor(color);
    }
    [statusBarHiddenProperty.setNative](value: boolean) {
        this.setStatusBarVisibility(!value, true);
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
    [cssWindowBgColorProperty.setNative](value) {
        this.setWindowBgColor(value);
    }
    [keepScreenAwakeProperty.setNative](value) {
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
    [screenBrightnessProperty.setNative](value) {
        if (value < 0) {
            this.resetCustomBrightness();
        } else {
            this.applyCustomBrightness();
        }
    }
    [screenOrientationProperty.setNative](value) {
        setScreenOrientation(this as any as Page, value);
    }
    didBecomeActive() {
        if (this.screenBrightness > 0) {
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
        UIScreen.mainScreen.brightness = this.screenBrightness;
    }
    resetCustomBrightness() {
        if (this.savedBrightness) {
            UIScreen.mainScreen.brightness = this.savedBrightness;
            this.savedBrightness = null;
        }
    }
    updateStatusBar: Function;

    _raiseShowingModallyEvent() {
        updatePagewSystemUI(this);
    }
    _raiseShowingBottomSheetEvent() {
        updatePagewSystemUI(this);
    }
    _raiseClosingModallyEvent() {
        // if (this.keepScreenAwake) {
        //     this[keepScreenAwakeProperty.setNative](0);
        // }
        const currentPage = Frame.topmost()?.currentPage;
        if (currentPage) {
            updatePagewSystemUI(currentPage as any as PageExtended);
        }
    }
    _raiseClosedBottomSheetEvent() {
        // if (this.keepScreenAwake) {
        //     this[keepScreenAwakeProperty.setNative](0);
        // }
        const currentPage = Frame.topmost()?.currentPage;
        if (currentPage) {
            updatePagewSystemUI(currentPage as any as PageExtended);
        }
    }
    public onNavigatingTo(context: any, isBackNavigation: boolean, bindingContext?: any) {
        if (isBackNavigation) {
            updatePagewSystemUI(this);
        }
    }
    updateWithWillAppear() {
        if (this.screenBrightness > 0) {
            this.applyCustomBrightness();
        }
    }

    updateWithWillDisappear() {
        if (this.savedBrightness) {
            this.resetCustomBrightness();
        }
    }
    disposeNativeView() {
        if (this.didBecomeActiveListener) {
            removeApplicationDidBecomeActiveListener(this.didBecomeActiveListener);
            this.didBecomeActiveListener = null;
        }
    }
}

let mixinInstalled = false;
export function overridePageBase() {
    const NSPage = require('@nativescript/core/ui/page').Page;
    applyMixins(NSPage, [PageExtended]);
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
    if (index !== -1) {
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
        applicationDidBecomeActiveListeners.forEach((l) => l());

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
