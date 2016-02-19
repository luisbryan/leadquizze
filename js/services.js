/* global _ angular store moment */
'use strict';

angular.module('acs.services', []).
factory('user', function($q, $http) {
    return {
        clear: function() {
            store.set('user', {});
        },
        permissions: function(resource) {
            var deferred = $q.defer();
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            $http.post('api/user/permissions', {
                token: user.token,
                resource: resource
            }).success(function(data) {
                if (data.status) {
                    deferred.resolve(data.permissions);
                    return;
                }
                deferred.reject();
            });
            return deferred.promise;
        },
        loggedIn: function() {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            return !_.isEmpty(user) && !_.isEmpty(user.token) && !_.isUndefined(user.token);
        },
        getId: function() {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            return user.id;
        },
        getRoleId: function() {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            return user.roleId;
        },
        getEmail: function() {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            return user.email;
        },
        getName: function() {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            return user.name;
        },
        getUserLogo: function() {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            return user.userLogo;
        },
        getWebsite: function() {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            return user.website;
        },
        getToken: function() {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            return user.token;
        },
        setId: function(id) {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            user.id = id;
            store.set('user', user);
        },
        setRoleId: function(roleId) {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            user.roleId = roleId;
            store.set('user', user);
        },
        setEmail: function(email) {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            user.email = email;
            store.set('user', user);
        },
        setName: function(name) {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            user.name = name;
            store.set('user', user);
        },
        setUserLogo: function(userLogo) {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            user.userLogo = userLogo;
            store.set('user', user);
        },
        setWebsite: function(website) {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            user.website = website;
            store.set('user', user);
        },
        setToken: function(token) {
            var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
            user.token = token;
            store.set('user', user);
        }
    };
}).
factory('alerts', function($interval) {
    var alerts = undefined;
    if (!window.alertsInterval) {
        window.alertsInterval = $interval(function() {
            var alive = [];
            _.forEach(alerts, function(alert) {
                if (!moment().isAfter(moment(alert.timestamp).add(5, 'seconds'))) {
                    alive.push(alert);
                }
            });
            alerts = alive;
            store.set('alerts', alerts);
        }, 1000);
    }
    return {
        clear: function() {
            alerts = [];
            store.set('alerts', []);
        },
        get: function() {
            if (_.isUndefined(alerts)) {
                alerts = store.get('alerts');
            }
            if (_.isEmpty(alerts)) {
                alerts = [];
            }
            return alerts;
        },
        set: function(val) {
            alerts = val;
            store.set('alerts', alerts);
        },
        success: function(msg) {
            alerts.push({id: Math.random().toString(16), success: msg, timestamp: new Date().getTime()});
            store.set('alerts', alerts);
        },
        fail: function(msg) {
            alerts = alerts || [];
            alerts.push({id: Math.random().toString(16), danger: msg, timestamp: new Date().getTime()});
            store.set('alerts', alerts);
        }
    };
}).
factory('quiz', function($q, $http) {
    return {
        clear: function() {
            store.set('quiz', {});
        },
        getId: function() {
            var quiz = _.isUndefined(store.get('quiz')) ? {} : store.get('quiz');
            return quiz.id;
        },
        getAttributes: function() {
            var quiz = _.isUndefined(store.get('quiz')) ? {} : store.get('quiz');
            return quiz.attributes;
        },
        getOutcomes: function() {
            var quiz = _.isUndefined(store.get('quiz')) ? {} : store.get('quiz');
            return quiz.outcomes;
        },
        getQuestions: function() {
            var quiz = _.isUndefined(store.get('quiz')) ? {} : store.get('quiz');
            return quiz.questions;
        },
        getCaptureSettings: function() {
            var quiz = _.isUndefined(store.get('quiz')) ? {} : store.get('quiz');
            return quiz.captureSettings;
        },
        setId: function(id) {
            var quiz = _.isUndefined(store.get('quiz')) ? {} : store.get('quiz');
            quiz.id = id;
            store.set('quiz', quiz);
        },
        setAttributes: function(attributes) {
            var quiz = _.isUndefined(store.get('quiz')) ? {} : store.get('quiz');
            quiz.attributes = attributes;
            store.set('quiz', quiz);
        },
        setOutcomes: function(outcomes) {
            var quiz = _.isUndefined(store.get('quiz')) ? {} : store.get('quiz');
            quiz.outcomes = outcomes;
            store.set('quiz', quiz);
        },
        addOutcome: function(outcome) {
            var quiz = _.isUndefined(store.get('quiz')) ? {} : store.get('quiz');
            quiz.outcomes =  _.isUndefined(quiz.outcomes) ? {} : quiz.outcomes;
            quiz.outcomes.push(outcome);
            store.set('quiz', quiz);
        },
        setQuestions: function(questions) {
            var quiz = _.isUndefined(store.get('quiz')) ? {} : store.get('quiz');
            quiz.questions = questions;
            store.set('quiz', quiz);
        },
        addQuestion: function(question) {
            var quiz = _.isUndefined(store.get('quiz')) ? {} : store.get('quiz');
            quiz.questions =  _.isUndefined(quiz.questions) ? {} : quiz.questions;
            quiz.questions.push(question);
            store.set('quiz', quiz);
        },
        setCaptureSettings: function(captureSettings) {
            var quiz = _.isUndefined(store.get('quiz')) ? {} : store.get('quiz');
            quiz.captureSettings = captureSettings;
            store.set('quiz', quiz);
        }
    };
}).
factory('jquery', function($q, $http) {
    return {
        init: function() {
            initSameHeight();
            initCustomForms();
            initBackgroundResize();
            initValidation();
            initDataModal();
            initMaxCharacter();
            initSelectAction();
            initAddClasses();
            initMobileNav();
            initDataLoad();
            initTabs();
            initLightbox();
            initCarousel();
            initOpenClose();
            jQuery('input, textarea').placeholder();
            initRowGridView();
            initOfferChangeForm();
            initChooseValue();
            initDatatable();
            initTiles();
        }
    };
});
