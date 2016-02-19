/* global angular, i18n */
'use strict';

angular.module('acs', ['acs.filters', 'acs.services', 'acs.directives', 'acs.controllers', 'ngRoute', 'ui.bootstrap', 'ngTable', 'jcf', 'ngDropzone', 'dndLists', 'ngSanitize', 'ngFileUpload', 'ezfb', 'satellizer', 'datatables', 'fancyboxplus']).
config(['$routeProvider', '$httpProvider', '$locationProvider', '$authProvider', function($routeProvider, $httpProvider, $locationProvider, $authProvider) {

    $routeProvider.when('/home', {
        controller: 'home',
        templateUrl: '/partials/home.html'
    });

    $routeProvider.when('/administrator', {
        controller: 'administrator',
        templateUrl: '/partials/administrator.html'
    });

    $routeProvider.when('/administrator/users', {
        controller: 'users',
        templateUrl: '/partials/users.html'
    });

    $routeProvider.when('/administrator/user/:id', {
        controller: 'user',
        templateUrl: '/partials/user.html'
    });

    $routeProvider.when('/administrator/roles', {
        controller: 'roles',
        templateUrl: '/partials/roles.html'
    });
                
    $routeProvider.when('/administrator/role/:role', {
        controller: 'role',
        templateUrl: '/partials/role.html'
    });

    $routeProvider.when('/login', {
        controller: 'login',
        templateUrl: '/partials/login.html'
    });

    $routeProvider.when('/register', {
        controller: 'register',
        templateUrl: '/partials/register.html'
    });

    $routeProvider.when('/forgot', {
        controller: 'forgot',
        templateUrl: '/partials/forgot.html'
    });

    $routeProvider.when('/recover/:param1', {
        controller: 'recover',
        templateUrl: '/partials/recover.html'
    });

    $routeProvider.when('/quiz-create', {
        controller: 'quiz-create',
        templateUrl: '/partials/quiz-create.html'
    });

    $routeProvider.when('/quiz-title', {
        controller: 'quiz',
        templateUrl: '/partials/quiz-create.html'
    });

    $routeProvider.when('/quiz-outcomes', {
        controller: 'quiz-outcomes',
        templateUrl: '/partials/quiz-outcomes.html'
    });

    $routeProvider.when('/quiz-questions', {
        controller: 'quiz-questions',
        templateUrl: '/partials/quiz-questions.html'
    });

    $routeProvider.when('/quiz-capture', {
        controller: 'quiz-capture',
        templateUrl: '/partials/quiz-capture.html'
    });

    $routeProvider.when('/quiz-offer', {
        controller: 'quiz-offer',
        templateUrl: '/partials/quiz-offer.html'
    });

    $routeProvider.when('/quiz-review', {
        controller: 'quiz-review',
        templateUrl: '/partials/quiz-review.html'
    });

    $routeProvider.when('/q/:param1', {
        controller: 'quiz-deploy',
        templateUrl: '/partials/quiz.html'
    });

    $routeProvider.when('/dashboard', {
        controller: 'dashboard',
        templateUrl: '/partials/dashboard.html'
    });

    $routeProvider.when('/dashboard-tiles', {
        controller: 'dashboard',
        templateUrl: '/partials/dashboard-tiles.html'
    });

    $routeProvider.when('/dashboard-admin', {
        controller: 'dashboard',
        templateUrl: '/partials/dashboard-admin.html'
    });

    $routeProvider.when('/dashboard-tiles-admin', {
        controller: 'dashboard',
        templateUrl: '/partials/dashboard-tiles-admin.html'
    });

    $routeProvider.when('/integration', {
        controller: 'integration',
        templateUrl: '/partials/integration.html'
    });

    $routeProvider.when('/users', {
        controller: 'users',
        templateUrl: '/partials/users.html'
    });

    $routeProvider.when('/templates', {
        controller: 'templates',
        templateUrl: '/partials/templates.html'
    });

    $routeProvider.when('/account', {
        controller: 'account',
        templateUrl: '/partials/account.html'
    });

    $routeProvider.when('/error', {
        controller: 'error',
        templateUrl: '/partials/error.html'
    });

    $routeProvider.otherwise({
        redirectTo: '/home'
    });

    $authProvider.twitter({
        url: '/api/auth/twitter',
        authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
    });

    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    var param = function(obj) {
        var query = '',
            name, value, fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value !== undefined && value !== null) query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
    
}]);

Array.prototype.contains = function(obj) {
    return this.indexOf(obj) > -1;
};
