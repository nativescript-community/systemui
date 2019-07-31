const Plugin = {
    install(Vue) {
        Vue.registerElement('StatusBar', () => require('../systemui').StatusBar, {});
        Vue.registerElement('NavigationBar', () => require('../systemui').NavigationBar, {});
    }
};

export default Plugin;
