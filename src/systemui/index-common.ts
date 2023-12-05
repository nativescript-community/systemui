import { Color, CssProperty, Style, View, booleanConverter } from '@nativescript/core';

export function applyMixins(
    derivedCtor: any,
    baseCtors: any[],
    options?: {
        after?: boolean;
        override?: boolean;
        omit?: (string | symbol)[];
    }
) {
    const omits = options && options.omit ? options.omit : [];
    baseCtors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            if (omits.indexOf(name) !== -1) {
                return;
            }
            const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);

            if (name === 'constructor') return;
            if (descriptor && (descriptor.get || descriptor.set)) {
                Object.defineProperty(derivedCtor.prototype, name, descriptor);
            } else {
                const oldImpl = derivedCtor.prototype[name];
                if (!oldImpl) {
                    derivedCtor.prototype[name] = baseCtor.prototype[name];
                } else {
                    derivedCtor.prototype[name] = function (...args) {
                        if (options) {
                            if (!!options.override) {
                                return baseCtor.prototype[name].apply(this, args);
                            } else if (!!options.after) {
                                oldImpl.apply(this, args);
                                return baseCtor.prototype[name].apply(this, args);
                            } else {
                                baseCtor.prototype[name].apply(this, args);
                                return oldImpl.apply(this, args);
                            }
                        } else {
                            baseCtor.prototype[name].apply(this, args);
                            return oldImpl.apply(this, args);
                        }
                    };
                }
            }
        });
        Object.getOwnPropertySymbols(baseCtor.prototype).forEach((symbol) => {
            if (omits.indexOf(symbol) !== -1) {
                return;
            }
            const oldImpl: Function = derivedCtor.prototype[symbol];
            if (!oldImpl) {
                derivedCtor.prototype[symbol] = baseCtor.prototype[symbol];
            } else {
                derivedCtor.prototype[symbol] = function (...args) {
                    if (options) {
                        if (!!options.override) {
                            return baseCtor.prototype[symbol].apply(this, args);
                        } else if (!!options.after) {
                            oldImpl.apply(this, args);
                            return baseCtor.prototype[symbol].apply(this, args);
                        } else {
                            baseCtor.prototype[symbol].apply(this, args);
                            return oldImpl.apply(this, args);
                        }
                    } else {
                        baseCtor.prototype[symbol].apply(this, args);
                        return oldImpl.apply(this, args);
                    }
                };
            }
        });
    });
}
function createGetter(key) {
    return function () {
        return this.style[key];
    };
}
function createSetter(key) {
    return function (newVal) {
        this.style[key] = newVal;
    };
}

export const cssProperty = (target: Object, key: string | symbol) => {
    Object.defineProperty(target, key, {
        get: createGetter(key),
        set: createSetter(key),
        enumerable: true,
        configurable: true
    });
};
export const cssNavigationBarColorProperty = new CssProperty<Style, Color>({
    name: 'navigationBarColor',
    cssName: 'navigation-bar-color',
    equalityComparer: Color.equals,
    valueConverter: (v) => new Color(v)
});
cssNavigationBarColorProperty.register(Style);
export const cssNavigationBarStyleProperty = new CssProperty({
    name: 'navigationBarStyle',
    cssName: 'navigation-bar-style'
});
cssNavigationBarStyleProperty.register(Style);
export const cssStatusBarColorProperty = new CssProperty<Style, Color>({
    name: 'statusBarColor',
    cssName: 'status-bar-color',
    equalityComparer: Color.equals,
    valueConverter: (v) => new Color(v)
});
cssStatusBarColorProperty.register(Style);
export const cssWindowBgColorProperty = new CssProperty<Style, Color>({
    name: 'windowBgColor',
    cssName: 'window-bg-color',
    equalityComparer: Color.equals,
    valueConverter: (v) => new Color(v)
});
cssWindowBgColorProperty.register(Style);
export const keepScreenAwakeProperty = new CssProperty<Style, boolean>({
    name: 'keepScreenAwake',
    cssName: 'keep-screen-awake',
    valueConverter: booleanConverter
});
keepScreenAwakeProperty.register(Style);
export const screenBrightnessProperty = new CssProperty<Style, number>({
    name: 'screenBrightness',
    cssName: 'screen-brightness',
    valueConverter: parseFloat
});
screenBrightnessProperty.register(Style);

export function findTopView(view: View) {
    while (view.parent) {
        view = view.parent as View;
    }
    return view;
}
