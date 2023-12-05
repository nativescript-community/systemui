<!-- ⚠️ This README has been generated from the file(s) "blueprint.md" ⚠️-->
[](#nativescript-system-ui)

# NativeScript System UI

A NativeScript plugin to change System UI.


[](#ios)

## IOS

To show/hide the statusBar you need to have ```UIViewControllerBasedStatusBarAppearance``` set to ```false``` in your ```Info.plist```


[](#usage)

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

* ```statusBarColor``` (css property ```status-bar-color```)
* ```navigationBarColor``` (css property ```navigation-bar-color```)



[](#for-versions--100)

## For versions < 1.0.0


Then in your NativeScript project .xml file, add the namespace for the plugin. I'm calling it "x" here, but you can name it anything you want.

iOS only supports a list of settings (default, light, dark, opaque), not a specific color. Android will support any hex background color, but you cannot change the text color on the status bar. 

```` XML
<Page xmlns="http://schemas.nativescript.org/tns.xsd"
      xmlns:x="@nativescript-community/systemui"> 
      
      <!-- Use the tag with StatusBar to style it 
           Available ios settings:
           default 
           light 
           dark
           opaque
      -->
      <x:StatusBar ios:barStyle="light" barColor="#00A7DC" />
      <x:NavigationBar barColor="#00A7DC" />
</Page>
````

Those settings, combined with an ActionBar that has `background-color: #00C0F5` will give you...

![status-bar-light](https://cdn.rawgit.com/nativescript-community/systemui/master/images/status-bar-ios-android.png)

**Note** The SystemUI plugin will not set the color of the StatusBar on iOS if you don't have an ActionBar as well. If you want to set the color of the StatusBar in NativeScript without having an ActionBar, you can set it to the page background color by setting `backgroundSpanUnderStatusBar="true"`. Otherwise you will have a white StatusBar no matter what you do. 


[](#with-vuejs)

## With Vue.js

In your root `app.js`:

```
import StatusBarPlugin from '@nativescript-community/systemui/vue';
Vue.use(StatusBarPlugin);
```

In your component:
```html
<Page class="page" actionBarHidden="true" backgroundSpanUnderStatusBar="true">
      <StatusBar barColor="#32475b" />
      <NavigationBar barColor="#32475b" />
<Page/>
```

That's is.



[](#development-workflow)

## Development workflow

If you would like to contribute to this plugin in order to enabled the repositories code for development follow this steps:

- Fork the repository locally
- Open the repository in your favorite terminal
- Navigate to the src code that contains the plugin's code `cd /src`
- Execute the npm script `nmp run build.wrappers` or `npm run build.wrappers.watch`
- When running the Vanila NativeScript demo app execute: `npm run demo.android` or `npm run demo.ios`
- When running the Angular NativeScript demo app execute: `npm run demo.angular.android` or `npm run demo.angular.ios`


[](#demos-and-development)

## Demos and Development


### Repo Setup

The repo uses submodules. If you did not clone with ` --recursive` then you need to call
```
git submodule update --init
```

The package manager used to install and link dependencies must be `pnpm` or `yarn`. `npm` wont work.

To develop and test:
if you use `yarn` then run `yarn`
if you use `pnpm` then run `pnpm i`

**Interactive Menu:**

To start the interactive menu, run `npm start` (or `yarn start` or `pnpm start`). This will list all of the commonly used scripts.

### Build

```bash
npm run build.all
```
WARNING: it seems `yarn build.all` wont always work (not finding binaries in `node_modules/.bin`) which is why the doc explicitly uses `npm run`

### Demos

```bash
npm run demo.[ng|react|svelte|vue].[ios|android]

npm run demo.svelte.ios # Example
```

Demo setup is a bit special in the sense that if you want to modify/add demos you dont work directly in `demo-[ng|react|svelte|vue]`
Instead you work in `demo-snippets/[ng|react|svelte|vue]`
You can start from the `install.ts` of each flavor to see how to register new demos 


[](#contributing)

## Contributing

### Update repo 

You can update the repo files quite easily

First update the submodules

```bash
npm run update
```

Then commit the changes
Then update common files

```bash
npm run sync
```
Then you can run `yarn|pnpm`, commit changed files if any

### Update readme 
```bash
npm run readme
```

### Update doc 
```bash
npm run doc
```

### Publish

The publishing is completely handled by `lerna` (you can add `-- --bump major` to force a major release)
Simply run 
```shell
npm run publish
```

### modifying submodules

The repo uses https:// for submodules which means you won't be able to push directly into the submodules.
One easy solution is t modify `~/.gitconfig` and add
```
[url "ssh://git@github.com/"]
	pushInsteadOf = https://github.com/
```

[](#questions)

## Questions

If you have any questions/issues/comments please feel free to create an issue or start a conversation in the [NativeScript Community Discord](https://nativescript.org/discord).