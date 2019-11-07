<template>
    <Frame>
        <Page id="page" ref="page" class="page":statusBarColor="statusBarColor" :navigationBarColor="navigationBarColor">
            <!-- <StatusBar ref="statusBar" :barColor="statusBarColor" /> -->
            <!-- <NavigationBar ref="navigationBar" :barColor="navigationBarColor" /> -->
            <ActionBar title="StatusBar Demo" />
            <StackLayout>
                <Button text="hide/show statusBar" @tap="hideShowStatusBar" />
                <Button text="animate statusBar color" @tap="animateStatusBarColor" />
                <Button text="animate navigationBar color" @tap="animateNavigationBarColor" />
                <Button text="modal test" @tap="modalExample" />
                <Button text="modal fullscren test" @tap="modalFullScreenExample" />
            </StackLayout>
        </Page>
    </Frame>
</template>

<script lang="ts">
import Vue from "nativescript-vue";
import { Component } from "vue-property-decorator";
import { StatusBar } from "nativescript-systemui";
import { Color } from "tns-core-modules/color";
import TWEEN from "nativescript-tween";
import { Page } from "tns-core-modules/ui/page";

@Component
export default class Home extends Vue {
    statusBarColor = new Color("red");
    navigationBarColor = new Color("red");
    statusBarVisible = true;

    get page() {
        return (this.$refs.page as any).nativeView as Page;
    }

    hideShowStatusBar() {
        console.log('hideShowStatusBar', this.statusBarVisible);
        if (this.statusBarVisible) {
            this.statusBarVisible = false;
            this.page.hideStatusBar();
        } else {
            this.statusBarVisible = true;
            this.page.showStatusBar();
        }
    }

    modalExample() {
        this.$showModal(Home);
    }
    modalFullScreenExample() {
        this.$showModal(Home, { fullscreen: true });
    }
    animateStatusBarColor() {
        const destColor = new Color(
            this.statusBarColor.toString() === "#FF0000" ? "green" : "red"
        );
        new TWEEN.Tween({
            a: this.statusBarColor.a,
            r: this.statusBarColor.r,
            g: this.statusBarColor.g,
            b: this.statusBarColor.b
        })
            .to(
                {
                    a: destColor.a,
                    r: destColor.r,
                    g: destColor.g,
                    b: destColor.b
                },
                500
            )
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(obj => {
                this.statusBarColor = new Color(obj.a, obj.r, obj.g, obj.b);
                // this.log('onUpdate', this.viewHeight, obj.value);
            })
            .start();
    }
    animateNavigationBarColor() {
        const destColor = new Color(
            this.navigationBarColor.toString() === "#FF0000" ? "green" : "red"
        );
        new TWEEN.Tween({
            a: this.navigationBarColor.a,
            r: this.navigationBarColor.r,
            g: this.navigationBarColor.g,
            b: this.navigationBarColor.b
        })
            .to(
                {
                    a: destColor.a,
                    r: destColor.r,
                    g: destColor.g,
                    b: destColor.b
                },
                500
            )
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(obj => {
                this.navigationBarColor = new Color(obj.a, obj.r, obj.g, obj.b);
                // this.log('onUpdate', this.viewHeight, obj.value);
            })
            .start();
    }
}
</script>