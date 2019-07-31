import { Component, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { NavigationBar, StatusBar } from '../systemui';

@Component({
    selector: 'StatusBar',
    template: ``
})
@Component({
    selector: 'NavigationBar',
    template: ``
})
export class StatusBarComponent {}
export const STATUSBAR_DIRECTIVES = [StatusBarComponent];

registerElement('StatusBar', () => StatusBar as any);
registerElement('NavigationBar', () => NavigationBar as any);

@NgModule({
    declarations: [STATUSBAR_DIRECTIVES],
    exports: [STATUSBAR_DIRECTIVES],
    schemas: [NO_ERRORS_SCHEMA]
})
export class NativeScriptStatusBarModule {}
