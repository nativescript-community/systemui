const Plugin = {
    install(Vue) {
        Vue.registerElement('StatusBar', () => require('../statusbar').StatusBar, {});
        Vue.registerElement('NavigationBar', () => require('../statusbar').NavigationBar, {});
    }
};

export default Plugin;
