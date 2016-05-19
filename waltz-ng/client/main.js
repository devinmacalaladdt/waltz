/*
 *  Waltz
 * Copyright (c) David Watkins. All rights reserved.
 * The use and distribution terms for this software are covered by the
 * Eclipse Public License 1.0 (http://opensource.org/licenses/eclipse-1.0.php)
 * which can be found in the file epl-v10.html at the root of this distribution.
 * By using this software in any fashion, you are agreeing to be bound by
 * the terms of this license.
 * You must not remove this notice, or any other, from this software.
 *
 */

import "../style/style.scss";
import _ from "lodash";
import angular from "angular";
import "angular-ui-notification";
import "angular-ui-grid/ui-grid";
import "angular-ui-router";
import "angular-ui-bootstrap";
import "angular-tree-control";
import "ui-select";
import "satellizer";
import "angular-animate";
import "angular-sanitize";
import "ng-tags-input";
import "babel-core/polyfill";
import "angular-local-storage";
import "ng-redux";
import thunk from "redux-thunk";
import rootReducer from "./reports/reducers";
import namedSettings from "./settings/named-settings";  // provides Object.assign etc.


const dependencies = [
    'ui.bootstrap',
    'ui.router',
    'ui.select',
    'ui.grid',
    'ui.grid.exporter',
    'ui-notification',
    'ngAnimate',
    'ngSanitize',
    'ngTagsInput',
    'satellizer',
    'LocalStorageModule',
    'ngRedux',
    require('angular-formly'),
    require('angular-formly-templates-bootstrap'),
    'treeControl'
];


const waltzApp = angular.module('waltz-app', dependencies);


const registrationFns = [
    require('./common/directives'),
    require('./common/filters'),
    require('./common/services'),
    require('./access-log'),
    require('./applications'),
    require('./app-capabilities'),
    require('./app-groups'),
    require('./app-view'),
    require('./asset-cost'),
    require('./auth-sources'),
    require('./bookmarks'),
    require('./capabilities'),
    require('./complexity'),
    require('./change-log'),
    require('./databases'),
    require('./data-flow'),
    require('./data-types'),
    require('./end-user-apps'),
    require('./examples'),
    require('./history'),
    require('./involvement'),
    require('./navbar'),
    require('./org-units'),
    require('./perspectives'),
    require('./person'),
    require('./playpen'),
    require('./ratings'),
    require('./server-info'),
    require('./settings'),
    require('./sidebar'),
    require('./software-catalog'),
    require('./source-data-rating'),
    require('./static-panel'),
    require('./svg-diagram'),
    require('./technology'),
    require('./traits'),
    require('./user'),
    require('./formly'),
    require('./widgets'),
    require('./reports')
];


_.each(registrationFns, (registrationFn, idx) => {
    if (!_.isFunction(registrationFn)) {
        console.error('cannot register: ', registrationFn, 'at idx', idx);
    }
    registrationFn(waltzApp);
});


waltzApp.config([
    '$stateProvider',
    ($stateProvider) => {
        $stateProvider
            .state('main', {
                url: '/',
                views: {
                    'header': { template: '<waltz-navbar></waltz-navbar>'},
                    'sidebar': { template: '<waltz-sidebar></waltz-sidebar>' },
                    'content': require('./welcome/welcome.js'),
                    'footer': { template: require('./footer/footer.html') }
                }
            })
            .state('main.home', {
                url: 'home',
                views: {
                    'content': { template: require('./welcome/welcome.html') }
                }
            });
    }
]);


const baseUrl =
    __ENV__ === 'prod'
    ? './'
    : __ENV__ === 'test'
        ? 'http://192.168.1.147:8443/'
        : 'http://localhost:8443/';

waltzApp.constant('BaseApiUrl', baseUrl + 'api');
waltzApp.constant('BaseUrl', baseUrl);
waltzApp.constant('BaseExtractUrl', baseUrl + 'data-extract');


waltzApp.config([
    'uiSelectConfig',
    (uiSelectConfig) => {
        uiSelectConfig.theme = 'bootstrap';
        uiSelectConfig.resetSearchInput = true;
        uiSelectConfig.appendToBody = true;
    }
]);


waltzApp.config( [
    '$compileProvider',
    $compileProvider => {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(mailto|https?|sip|chrome-extension):/);
    }
]);

waltzApp.config([
    '$authProvider',
    'BaseUrl',
    function($authProvider, BaseUrl) {
        $authProvider.baseUrl = BaseUrl;
        $authProvider.withCredentials = false;

        $authProvider.google({
            clientId: 'Google account'
        });

        $authProvider.github({
            clientId: 'GitHub Client ID'
        });

        $authProvider.linkedin({
            clientId: 'LinkedIn Client ID'
        });

    }
]);


waltzApp.config([
    '$httpProvider',
    function($httpProvider) {
        $httpProvider.defaults.cache = false;
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        // disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
    }
]);

waltzApp.run(['$rootScope', '$document', ($rootScope, $doc) => {
    $rootScope.$on('$stateChangeSuccess', () => {
        $doc[0].body.scrollTop = 0;
        $doc[0].documentElement.scrollTop = 0;
    });
}]);


waltzApp.config(['$ngReduxProvider', ($ngReduxProvider) => {
    $ngReduxProvider.createStoreWith(rootReducer, [thunk], []);
}]);


waltzApp.config(['$httpProvider', ($httpProvider) => {
    // using apply async should improve performance
    $httpProvider.useApplyAsync(true);
}]);


waltzApp.run(['$http', 'SettingsStore', ($http, settingsStore) => {
    settingsStore.findAll()
        .then(settings => {
            if (settingsStore.isDevModeEnabled(settings)) {
                console.log('Dev Extensions enabled');
                _.chain(settings)
                    .filter(s => s.name.startsWith(namedSettings.httpHeaderPrefix))
                    .each(s => {
                        const headerName = s.name.replace(namedSettings.httpHeaderPrefix, '');
                        $http.defaults.headers.common[headerName] = s.value;
                    })
                    .value()
            }
        });
}]);
