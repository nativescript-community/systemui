# NativeScript System UI

A NativeScript plugin to change System UI.

## IOS

To show/hide the statusBar you need to have ```UIViewControllerBasedStatusBarAppearance``` set to ```false``` in your ```Info.plist```

## Usage

````
npm install @nativescript-community/systemui --save
````

If you are using version ^1.0.0 then we now use mixins
```ts
import { installMixins } from '@nativescript-community/systemui';
installMixins();
```

Then new properties are added to the ```Page``` class
See typings for properties types. (they are added to ```Page``` type)

* ```statusBarColor``` (css property ```status-bar-color```)
* ```statusBarStyle``` (css property ```status-bar-style```)
* ```statusBarHidden``` (css property ```status-bar-hidden```)
* ```navigationBarColor``` (css property ```navigation-bar-color```)
* ```navigationBarStyle```ANDROID (css property ```navigation-bar-style```)
* ```windowBgColor```IOS (css property ```window-bg-color```)
* ```keepScreenAwake``` (css property ```keep-screen-awake```)
* ```screenOrientation``` (css property ```screen-orientation```)
* ```screenBrightness``` (css property ```screen-brightness```)


## Development workflow

If you would like to contribute to this plugin in order to enabled the repositories code for development follow this steps:

- Fork the repository locally
- Open the repository in your favorite terminal
- Navigate to the src code that contains the plugin's code `cd /src`
- Execute the npm script `nmp run build.wrappers` or `npm run build.wrappers.watch`
- When running the Vanila NativeScript demo app execute: `npm run demo.android` or `npm run demo.ios`
- When running the Angular NativeScript demo app execute: `npm run demo.angular.android` or `npm run demo.angular.ios`
