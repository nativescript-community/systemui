import * as definition from './systemui';
import { Property, View } from 'tns-core-modules/ui/core/view';
import { Color } from 'tns-core-modules/color';

enum BarStyle {
    default,
    light,
    dark,
    opaque
}

const onBarStylePropertyChanged = (view, oldValue, newValue) => {
    try {
        const statusbar = view as StatusBar;
        const value = newValue;
        setTimeout(() => {
            statusbar.updateBarStyle(BarStyle[value]);
        });
    } catch (err) {
        console.log(err);
    }
};

const onBarColorPropertyChanged = (view, oldValue, newValue) => {
    try {
        const statusbar = view as StatusBar | NavigationBar;
        const value = newValue;
        setTimeout(() => {
            statusbar.updateBarColor(value);
        });
    } catch (err) {
        console.log(err);
    }
};

export abstract class StatusBar extends View implements definition.StatusBar {
    abstract updateBarColor(value: Color);
    abstract updateBarStyle(value: string);
    abstract show();

    abstract hide();
}
export const barStyleProperty = new Property<StatusBar, string>({
    name: 'barStyle',
    valueChanged: onBarStylePropertyChanged
});

export const barColorProperty = new Property<StatusBar, Color>({
    name: 'barColor',
    equalityComparer: Color.equals,
    valueChanged: onBarColorPropertyChanged,
    valueConverter: v => new Color(v)
});
barStyleProperty.register(StatusBar);
barColorProperty.register(StatusBar);

export abstract class NavigationBar extends View implements definition.NavigationBar {
    abstract updateBarColor(value: Color);
}

export const navigationBarColorProperty = new Property<NavigationBar, Color>({
    name: 'barColor',
    equalityComparer: Color.equals,
    valueChanged: onBarColorPropertyChanged,
    valueConverter: v => new Color(v)
});
navigationBarColorProperty.register(NavigationBar);
