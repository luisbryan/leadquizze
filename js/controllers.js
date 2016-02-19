/* global _, angular, i18n */
'use strict';

var controllers = angular.module('acs.controllers', []);

controllers.controller('root', ['$scope', '$rootScope', '$location', '$q', 'user', function($scope, $rootScope, $location, $q, user) {
    $rootScope.baseUrl = "https://quiz.leadquizzes.com/";

    $scope.loaded = false;
    $scope.user = user;
    $scope.permissions = {};
    $rootScope.userEmail = user.getEmail();
    $rootScope.loggedIn = $scope.user.loggedIn() || false;
    $rootScope.deployed = false;
    $scope.waiting = false;

    $rootScope.$on("$routeChangeSuccess", function() {
        window.scrollTo(0,0);
    });

    $scope.init = function() {
        if (!$scope.user.loggedIn()) {
            $scope.loaded = true;

            if( !$scope.active('/login') && !$scope.active('/register') && !$scope.active('/forgot') && !$scope.active('/recover') && !$scope.active('/q/') && !$scope.active('/error') ) {
                $location.path('/login');
                //window.location.reload();
            }
            return;
        } else if( $scope.active('/login') || $scope.active('/register') ) {
            $location.path('/home');
            window.location.reload();
        }

        /* 
        var promises = [];

        promises.push(user.permissions('administrator')
        .then(function(permissions) {
            $scope.permissions.administrator = permissions;
        }));
    
        promises.push(user.permissions('user')
        .then(function(permissions) {
            $scope.permissions.users = permissions;
        }));
    
        promises.push(user.permissions('role')
        .then(function(permissions) {
            $scope.permissions.roles = permissions;
        }));
        
        $q.all(promises)
        .then(function() {
            $scope.loaded = true;
        }, function() {
            $scope.loaded = true;
        });
        */
    };

    $scope.active = function(path) {
        return $location.path().match(new RegExp(path + '.*', 'i')) != null;
    };

    $scope.isLoggedIn = function() {
        if (!$scope.user.loggedIn()) {
            if( !$scope.active('/login') && !$scope.active('/register') && !$scope.active('/forgot') && !$scope.active('/recover') ) {
                $location.path('/login');
                window.location.reload();
            }
            return;
        } else if( $scope.active('/login') || $scope.active('/register') || $scope.active('/forgot') || $scope.active('/recover') ) {
            $location.path('/home');
            window.location.reload();
        }
    }

    $scope.logout = function() {
        $scope.userEmail = '';
        $scope.user.clear();
        $rootScope.loggedIn = false;
        $location.path('/login');
        //window.location.reload();
    };
}]);

controllers.controller('navigation', ['$scope', '$location', 'user', function($scope, $location, user) {

    $scope.user = user;

    $scope.navigation = function() {
        if ( ( $scope.active('/home') || $scope.active('/dashboard') || $scope.active('/templates') || $scope.active('/account') || $scope.active('/integration') || $scope.active('/users') || $scope.active('/templates') ) && user.loggedIn()) {
            return user.getRoleId() == 1 ? 'partials/navigation-admin.html' : 'partials/navigation.html';
        } else {
            return user.getRoleId() == 1 ? 'partials/navigation-admin-quiz.html' : 'partials/navigation-quiz.html';
        }
    };
    
}]);

controllers.controller('footer', ['$scope', '$location', 'user', function($scope, $location, user) {

    $scope.user = user;

    $scope.footer = function() {
        return 'partials/footer.html';
    };
    
}]);

controllers.controller('login', ['$scope', '$location', '$http', '$window', '$rootScope', 'alerts', 'user', function($scope, $location, $http, $window, $rootScope, alerts, user) {

    $scope.isLoggedIn();

    $rootScope.bodyClass = 'login-page front-page';
    $scope.alerts = alerts;
    $scope.input = {};

    var rememberMeCookie = $.cookie('remember-me');
    var userEmailCookie  = $.cookie('user-email');

    if( rememberMeCookie == 'true' ) {
        $scope.input.email = userEmailCookie;
        $scope.input.remember = true;
    } else {
        $.removeCookie('remember-me');
        $.removeCookie('user-email');
    }

    $scope.login = function() {
        $scope.waiting = true;
        $http.post('api/user/login', {
            email: $scope.input.email,
            password: $scope.input.password
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                if( data.statusId != 1 ) {
                    alerts.fail(i18n.t('login_restricted'));
                } else {
                    user.setId(data.id);
                    user.setRoleId(data.roleId);
                    user.setName(data.name);
                    user.setEmail(data.email);
                    user.setWebsite(data.website);
                    user.setToken(data.token);
                    user.setUserLogo(data.userLogo);
                    $.cookie('user-email', data.email);
                    $.cookie('remember-me', $scope.input.remember);
                    $location.path('home');
                    $rootScope.userEmail = user.getEmail();
                    $rootScope.userLogo = data.userLogo;
                    $rootScope.loggedIn = true;
                    //$window.location.reload();
                }
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    };

}]);

controllers.controller('forgot', ['$scope', '$location', '$http', '$window', '$rootScope', 'alerts', 'user', 'jquery', function($scope, $location, $http, $window, $rootScope, alerts, user, jquery) {

    $rootScope.bodyClass = 'login-page front-page';
    $scope.alerts = alerts;
    $scope.input = {};
    $scope.emailSent = false;

    $scope.forgot = function() {
        if( $scope.input.email ) {
            $scope.waiting = true;
            $http.post('api/user/forgot', {
                email: $scope.input.email
            }).success(function(data) {
                $scope.waiting = false;
                if( data.status ) {
                    $scope.emailSent = true;
                } else {
                    alerts.fail(i18n.t('failed_to_find_user'));
                }
            });
        }
    };

    setTimeout( function() {jquery.init();}, 3 );

}]);

controllers.controller('recover', ['$scope', '$routeParams', '$location', '$http', '$window', '$rootScope', 'alerts', 'user', 'jquery', function($scope, $routeParams, $location, $http, $window, $rootScope, alerts, user, jquery) {

    $rootScope.bodyClass = 'login-page front-page';
    $scope.alerts = alerts;
    $scope.input = {};

    var recoverLink = $routeParams.param1;

    jquery.init();

    $scope.recover = function() {
        $scope.waiting = true;
        $http.post('api/user/resetPassword', {
            newpass: $scope.input.newpass,
            recoverLink: recoverLink
        }).success(function(data) {
            $scope.waiting = false;
            if(data.status) {
                alerts.success(i18n.t('you_may_login'));
                $location.path('login');
            }
        });
    };

}]);

controllers.controller('register', ['$scope', '$location', '$http', '$rootScope', 'alerts', 'jquery', function($scope, $location, $http, $rootScope, alerts, jquery) {

    $scope.isLoggedIn();

    $rootScope.bodyClass = 'login-page front-page';
    $scope.alerts = alerts;
    $scope.input = {};

    jquery.init();

    $scope.register = function() {
        $scope.waiting = true;
        if( $('.form-input.has-error').length > 0 ) {
            return false;
        }
        if ($scope.input.password != $scope.input.confirmation) {
            alerts.fail(i18n.t('passwords_not_match'));
            $scope.waiting = false;
            return;
        }
        $http.post('api/user/register', {
            companyName: $scope.input.companyName,
            name:        $scope.input.name,
            email:       $scope.input.email,
            phone:       $scope.input.phone,
            website:     $scope.input.website,
            password:    $scope.input.password
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                alerts.success(i18n.t('you_may_login'));
                $location.path('login');
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = '';
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    };

}]);

controllers.controller('home', ['$scope', '$location', '$http', '$rootScope', 'user', function($scope, $location, $http, $rootScope, user) {

    $scope.isLoggedIn();

    $rootScope.bodyClass = 'interface-page inner responsive';
    $scope.user = user;

    $scope.isAdmin = user.getRoleId() == 1;

}]);

controllers.controller('quiz-create', ['$scope', '$location', '$http', '$rootScope', 'alerts', 'user', 'quiz', 'jquery', function($scope, $location, $http, $rootScope, alerts, user, quiz, jquery) {

    $scope.isLoggedIn();
    quiz.clear();
    $location.path('/quiz-title');

}]);

controllers.controller('quiz', ['$scope', '$location', '$http', '$rootScope', 'alerts', 'user', 'quiz', 'jquery', function($scope, $location, $http, $rootScope, alerts, user, quiz, jquery) {

    $scope.isLoggedIn();

    $rootScope.bodyClass = 'inner responsive';
    $rootScope.quizImageId = 'quiz-default.jpg';

    $scope.alerts = alerts;
    $scope.user = user;
    $scope.input = [];
    $rootScope.outcomes = [];
    $scope.activeVendors = [{'id':'','name':'No Integrations Available'}];
    $scope.integrationSegments = [{'id':'','name':'No Integrations Available'}];

    $scope.isAdmin = user.getRoleId() == 1;

    $scope.$on('$locationChangeStart', function( event ) {
        if( ( $scope.input.name || $scope.input.title ) && !quiz.getId() ) {
            if ( !confirm( 'You have not saved this quiz yet. Are you sure you want to leave this page?' ) ) {
                event.preventDefault();
            }
        }
    });

    $scope.$watch('input.name', function (newValue, oldValue) {
        $rootScope.quizNameLength = angular.isUndefined( newValue ) ? 0 : newValue.length;
        if( $rootScope.quizNameLength > 100 ) $scope.input.name = oldValue;
    });

    $scope.$watch('input.title', function (newValue, oldValue) {
        $rootScope.quizTitleLength = angular.isUndefined( newValue ) ? 0 : newValue.length;
        $rootScope.quizTitle = newValue;
        if( $rootScope.quizTitleLength > 100 ) $scope.input.title = oldValue;
    });

    $scope.$watch('input.description', function (newValue, oldValue) {
        $rootScope.quizDescriptionLength = angular.isUndefined( newValue ) ? 0 : newValue.length;
        $rootScope.quizDescription = newValue;
        if( $rootScope.quizDescriptionLength > 100 ) $scope.input.description = oldValue;
    });

    $scope.$watch('input.cta', function (newValue, oldValue) {
        $rootScope.quizCta = newValue;
    });

    $scope.init = function() {
        $scope.getIntegrationVendors();

        if( quiz.getId() ) {
            $scope.getQuiz();
            $scope.getOutcomes();
        }

        jquery.init();
    }

    $scope.clear = function() {
        $scope.input = [];
        quiz.clear();
    }

    $scope.dropzoneConfig = {
        'options': { // passed into the Dropzone constructor
            'url': 'api/quiz/uploadQuizImg',
            'uploadMultiple': false,
            'clickable': '#quiz-image-dropzone',
            'previewTemplate': document.querySelector('#template-container').innerHTML,
            'acceptedFiles': 'image/*',
            'maxFilesize': 2
        },
        'eventHandlers': {
            'addedfile': function (file, xhr, formData) {
                $('.dz-preview').remove();
            },
            'success': function (file, response) {
                if( file.width != 600 || file.height != 400 ) {
                    alerts.fail(i18n.t('image_wrong_size'));
                } else {
                    var data = angular.fromJson( response );
                    $rootScope.quizImageId = '/uploads/quiz/' + data.imageId;
                    $scope.input.imageId = '/uploads/quiz/' + data.imageId;
                }
            },
            'error': function () {
                alerts.fail(i18n.t('image_err'));
            }
        }
    };

    $scope.getQuiz = function() {
        $http.post('api/quiz/getQuiz', {
            quizId: quiz.getId()
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                data.quiz.hasSocialShare = ( data.quiz.hasSocialShare == 1 )  ? true : false;
                data.quiz.hasStartPage   = ( data.quiz.hasStartPage == 1 )  ? true : false;
                $scope.input = data.quiz;
                quiz.setAttributes( data.quiz );
                $rootScope.quizImageId = !angular.isUndefined( $scope.input.imageId ) && $scope.input.imageId && $scope.input.imageId != '0' ? $scope.input.imageId : 'quiz-default.jpg';

                if( $scope.isAdmin ) {
                    $scope.input.industry = data.quiz.segmentid;
                } else {
                    if( data.quiz.integrationId && data.quiz.integrationId != 0 ) $scope.getIntegrationSegments( data.quiz.integrationId );
                }
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.getOutcomes = function() {
        $http.post('api/quiz/getOutcomes', {
            quizId: quiz.getId()
        }).success(function(data) {
            if (data.status) {
                $rootScope.outcomes = data.outcomes;
                quiz.setOutcomes( data.outcomes );
                $scope.waiting = false;
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.getIntegrationVendors = function() {
        $scope.integrationSegments = [{'id':'','integrationId':'','name':'No Integration Selected'}];
        $scope.activeVendors = [{'id':'','integrationId':'','name':'No Integration Selected'}];

        $http.post('api/integration/getIntegrationVendors', {
            userId: user.getId()
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.input.segmentid = '';

                _.forEach(data.vendors, function(vendor) {
                    if (!_.isUndefined(vendor.integrationId) && vendor.integrationId != null) {
                        $scope.activeVendors.push(vendor);
                    }
                });

                jcf.replaceAll();
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('data_error');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.getIntegrationSegments = function(integrationId) {
        if( !$scope.input.integrationId ) {
            $('#integrationId').val('');
            jcf.replaceAll();
            return false;
        }

        $scope.waiting = true;
        $scope.integrationSegments = [{'id':'loading','integrationId':'','name':'loading...'}];
        $scope.input.segmentid = 'loading';

        var segmentidFound = false;

        $http.post('api/integration/getIntegrationSegments', {
            integrationId: $scope.input.integrationId
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                if( data.segments ) {
                    $scope.integrationSegments = [{'id':'','integrationId':'','name':'No Segment Selected'}];

                    if( data.segments && data.segments.length ) {
                        _.forEach(data.segments, function(segment) {
                            $scope.integrationSegments.push(segment);
                            if( quiz.getId() ) {
                                if( segment.id == quiz.getAttributes().segmentid ) segmentidFound = true;
                                $scope.input.segmentid = String( quiz.getAttributes().segmentid );
                            }
                        });
                    } else {
                        $scope.integrationSegments = [{'id':'','integrationId':'','name':'No Segments Found'}];
                    }

                    if( !segmentidFound ) $scope.input.segmentid = '';

                    jcf.replaceAll();
                    setTimeout( function() {
                        jcf.replaceAll();
                        $scope.$apply();
                    }, 2);
                }
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('data_error');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.createOrUpdate = function() {
        $scope.waiting = true;

        var postUrl = ( quiz.getId() ) ? 'api/quiz/update' : 'api/quiz/create';

        var segmentid = '';
        var integrationId = null;

        if( $('.form-input.has-error').length > 0 ) {
            return false;
        }

        if( $scope.input.segmentid ) {
            _.forEach($scope.integrationSegments, function(segment) {
                if( $scope.input.segmentid == segment.id ) {
                    integrationId = segment.integrationId;
                    segmentid = $scope.input.segmentid;
                }
            });
        }

        var data = {
            userId:         $scope.user.getId(),
            quizId:         quiz.getId(),
            name:           $scope.input.name,
            title:          $scope.input.title,
            imageId:        $scope.input.imageId,
            description:    $scope.input.description,
            cta:            $scope.input.cta,
            analyticsId:    $scope.input.analyticsId,
            integrationId:  integrationId,
            segmentid:      segmentid,
            hasSocialShare: $scope.input.hasSocialShare,
            hasStartPage:   $scope.input.hasStartPage
        }

        if( $scope.isAdmin ) {
            data.userId = 1;
            data.segmentid = $scope.input.industry;
        }

        $http.post(postUrl, data).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                quiz.setId(data.quizId);
                $scope.getQuiz();
                $location.path('quiz-outcomes');
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = '';
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    };
}]);

controllers.controller('quiz-outcomes', ['$scope', '$sce', '$location', '$http', '$rootScope', 'alerts', 'user', 'quiz', 'jquery', 'Upload', function($scope, $sce, $location, $http, $rootScope, alerts, user, quiz, jquery, Upload) {

    $scope.isLoggedIn();

    if( !quiz.getId() ) {
        alerts.clear();
        alerts.fail(i18n.t('no_quiz'));
        $location.path('quiz-create');
    }

    $rootScope.bodyClass = 'inner responsive';
    
    $scope.alerts = alerts;
    $scope.input = {};

    $scope.outcomes = [];
    $scope.bodyList = [];

    $scope.models = {
        selected: [],
        lastSelected: [],
        imgSelected: [],
        listSelected: [],
        templates: [
            { type: 'Headline', img: 'headline', 'fill': 'Click to edit headline' },
            { type: 'Paragraph', img: 'paragraph', 'fill': 'Click to edit paragraph text' },
            { type: 'Video', img: 'video', 'fill': 'Click to add a video URL' },
            { type: 'Image', img: 'image', 'fill': 'Click to upload an image' },
            { type: 'Divider', img: 'divider', 'fill': '', html: '<hr>' },
            { type: 'Spacer', img: 'spacer', 'fill': '', html: '' },
            { type: 'Item List', img: 'itemList', 'fill': 'Click to edit the item list' }
        ],
        dropzones: {'bodyList':{}}
    };

    jquery.init();

    $scope.$watch('input.outcomeTitle', function (newValue, oldValue) {
        $rootScope.outcomeTitleLength = angular.isUndefined( newValue ) ? 0 : newValue.length;
        $rootScope.outcomeTitle = newValue;
        if( $rootScope.outcomeTitleLength > 100 ) $scope.input.outcomeTitle = oldValue;
    });

    $scope.$watch('bodyList', function () { // this works??
        jcf.replaceAll();
        setTimeout( function() { // this works??
            $('.dnd-remove').unbind().bind('click', $scope.deleteBodyItem); // this works??
            $('.dynText').unbind().bind('blur', $scope.saveBodyItem); // this works??
            $('body').unbind().bind('click', function() {$scope.checkForBlur(this)}); // this works??
            $('.addListItem').unbind().bind('click', $scope.addListItem); // this works??
            $('.listItem').unbind().bind('click', function() {$scope.editListItem(this)}); // this works??
            $('.removeListItem').unbind().bind('click', function() {$scope.removeListItem(this)}); // this works??
        }, 10);
    });

    $scope.$watch('models.selected', function () {
        $scope.dndDraw();
    });

    $scope.checkForBlur = function(element) {
        if( $scope.models.listSelected.length > 0 && !$(element).hasClass('editList') ) {
            $scope.saveListItem();
            $scope.saveBodyItem();
        }
    }

    $scope.addListItem = function() {
        $scope.models.listSelected.push('Click to edit');
        $scope.dndDraw();
    };

    $scope.editListItem = function( listItemElement ) {
        if( $('.dynText').length < 1 ) {
            var itemContentElement = $(listItemElement).find('.itemContent');
            itemContentElement.html( '<input class="dynText value="' + itemContentElement.html() + '">' );
            $('.dynText').unbind().bind('blur', function() {
                $scope.saveListItem();
            });
            setTimeout( function() { $('.dynText').focus();}, 1 );
        }
    };

    $scope.saveListItem = function() {
        if( $('.dynText').length > 0 ) {
            var listItemIndex = $('.dynText').parent().parent().attr('id').split('lsid_')[1];
            $scope.models.listSelected[listItemIndex] = $('.dynText').val();
            $scope.dndDraw();
        }
    };

    $scope.removeListItem = function( listItemElement ) {
        $scope.saveListItem();

        var listItemIndex = $(listItemElement).parent().attr('id').split('lsid_')[1];

        $scope.models.listSelected.splice(listItemIndex,1);
        $scope.dndDraw();
    };

    $scope.dndDraw = function() {
        var newBodyList = [];

        _.forEach($scope.bodyList, function(item) {
            if(item) {
                if (item === $scope.models.selected) {
                    if( !item.html ) item.html = '';

                    if( item.type == 'Headline' ) {
                        item.htmlString = '<input class="dynText" value="' + item.html + '"></input>';
                    } else if( item.type == 'Video' ) {
                        item.htmlString = '<input class="dynText video" value="' + item.html + '"></input>';
                        var checked = item.autoplay != 1 ? '' : 'checked';
                        setTimeout( function() {jcf.replaceAll();}, 5);
                        item.htmlString += '<div class="switch-menu" style="display: inline-block; ">Enable Autoplay:</div><div style="display: inline-block;" class="switch-menu"> <input jcf ' + checked + ' type="checkbox" hidden="hidden" id="vis" class="autoplayEnabled"><label class="switch" for="vis"></label><span class="label enable" style="color: black;">On</span><span class="label disable" style="color: black;">Off</span></div>';
                        //setTimeout( function() { $scope.bodyList[i].autoplay });
                    } else if( item.type == 'Paragraph' ) {
                        item.htmlString = '<textarea class="dynText">' + item.html + '</textarea>';
                    } else if( item.type == 'Item List' ) {
                        var listItemsHtml = '';
                        var i = 0;
                        $scope.models.listSelected = item.itemList || $scope.models.listSelected;
                        _.forEach($scope.models.listSelected, function(listItem) {
                            listItemsHtml += '<li id="lsid_' + i + '" class="listItem"><div class="removeListItem">remove</div><div class="itemContent">' + listItem + '</div></li>';
                            i++;
                        });
                        item.htmlString = '<ol class="editList">' + listItemsHtml + '<li style="cursor: pointer;" class="addListItem">Add Item</li></ol>';
                    }

                    item.htmlString += '<a ng-click="deleteBodyItem(item)" ng-show="models.selected === item" class="dnd-remove" style="cursor: pointer;">Remove</a>';
                } else {
                    if( item.html ) {
                        if( item.type == 'Video' ) {
                            var url = item.html;
                            var autoplay = item.autoplay == 1 ? 1 : 0;

                            url = url.replace("watch?v=", "v/");
                            url = url.replace("//vimeo.com/", "//player.vimeo.com/video/");
                            if( url.indexOf('http') == -1 ) url = 'http://' + url;

                            if( !isUrlValid(url) || ( url.indexOf('youtube') == -1 && url.indexOf('vimeo') == -1 ) ) {
                                item.htmlString = 'Video URL not Valid';
                            } else {
                                if( url.indexOf('youtube') > -1 ) url += '?autoplay=' + autoplay + '&controls=0&modestbranding=1&rel=0&showinfo=0&nologo=1';
                                if( url.indexOf('vimeo') > -1 ) url += '?autoplay=' + autoplay + '&title=0&byline=0&portrait=0';

                                item.htmlString = '<iframe width="100%" height="320px" src="' + url + '"></iframe>';
                            }
                        } else if( item.type == 'Image' ) {
                            item.htmlString = '<img style="width: 100%; height: auto" src="' + item.html + '">';
                        } else {
                            item.htmlString = item.html;
                        }
                    } else {
                        if( item.type == 'Image' ) {
                            item.htmlString = '<div class="fileUpload"><span>Click to upload an image</span><input ng-model="photo" onchange="angular.element(this).scope().file_changed(this)" type="file" class="upload" accept="image/*" /></div>';
                        } else {
                            item.htmlString = item.fill;
                        }
                    }

                    if( item.type == 'Headline' ) item.htmlString = '<h4>' + item.htmlString + '</h4>';
                }
                item.htmlString = $sce.trustAsHtml(item.htmlString);

                newBodyList.push(item);
            }

            $scope.bodyList = newBodyList;

            setTimeout( function() { $('.dynText').focus();}, 1 );
        });
    };

    $scope.file_changed = function(element) {
        $scope.$apply( function(scope) {
            var photofile = element.files[0];

            Upload.upload({
                url: 'api/quiz/uploadOutcomeImg',
                data: {file: photofile}
            }).then(function (resp) {
                if( resp.data.status ) {
                    var i = 0;
                    _.forEach($scope.bodyList, function(item) {
                        if (item === $scope.models.imgSelected) {
                            $scope.bodyList[i].html = 'images/uploads/outcome/' + resp.data.imageId;
                            $scope.dndDraw();
                        } else {
                            i++;
                        }
                    });
                }
            }, function (resp) {
                //console.log('Error status: ' + resp.status);
            });
        });
    };

    $scope.dropCallback = function(event, index, item, external, type, allowedType) {
        $scope.models.selected = [];

        if( !item.index ) {
            item.index = $scope.bodyList.length + 1;
        } else {
            var i = 0;
            _.forEach($scope.bodyList, function(bodyListItem) {
                if (bodyListItem && bodyListItem.index == item.index) {
                    $scope.bodyList.splice( i, 1 );
                } else {
                    i++;
                }
            });
        }

        $scope.bodyList.splice( index, 0, item );

        $scope.dndDraw();
    };

    $scope.dropDoubleClick = function(item) {
        item.index = $scope.bodyList.length + 1;
        $scope.bodyList.push(angular.copy(item));
        $scope.dndDraw();
    }

    $scope.dragStart = function() {
        $scope.bodyListDragging = true;
    };

    $scope.dragStop = function() {
        $scope.bodyListDragging = false;
    };

    $scope.dropSelected = function(item, event) {
        if( $scope.models.listSelected.length > 0 && item.type != 'Item List' ) {
            $scope.saveBodyItem();
        }

        if( item.type == 'Image' && !item.html ) {
            $scope.models.imgSelected = item;
        } else if( !$(event.target).hasClass('dnd-remove') && !$(event.target).hasClass('addListItem') ) {
            if( $scope.models.selected === item ) {
                //$scope.models.selected = [];
            } else {
                $scope.models.selected = $scope.models.lastSelected = item;
                $scope.dndDraw();
            }
        }
    };

    $scope.saveBodyItem = function() {
        var i = 0;

        _.forEach($scope.bodyList, function(bodyListItem) {
            if (bodyListItem && bodyListItem == $scope.models.selected) {
                if( $scope.models.selected.type == 'Video' ) {
                    var autoplay = $('.autoplayEnabled').parent().parent().find('.enable').css('display') == 'none' ? 0 : 1;
                    $scope.bodyList[i].autoplay = autoplay;
                }

                if( $scope.models.listSelected.length > 0 ) {
                    var itemListHtml = '';
                    _.forEach( $scope.models.listSelected, function(listItem) {
                        itemListHtml += '<li>' + listItem + '</li>'
                    });
                    $scope.bodyList[i].html = '<ol>' + itemListHtml + '</ol>';
                    $scope.bodyList[i].itemList = $scope.models.listSelected;
                } else {
                    $scope.bodyList[i].html = $('.dynText').val();
                }
                $scope.models.selected = [];
                $scope.models.listSelected = [];
            } else {
                i++;
            }
        });
    }

    $scope.deleteBodyItem = function() {
        var i = 0;

        _.forEach($scope.bodyList, function(bodyListItem) {
            if (bodyListItem && bodyListItem == $scope.models.lastSelected) {
                $scope.bodyList.splice( i, 1 );
            } else {
                i++;
            }
        });

        $scope.models.selected = [];
        $scope.dndDraw();
    }

    $scope.getOutcomes = function() {
        $http.post('api/quiz/getOutcomes', {
            quizId: quiz.getId()
        }).success(function(data) {
            if (data.status) {
                $scope.outcomes = data.outcomes;
                quiz.setOutcomes( data.outcomes );
                $scope.currentOutcome = false;
                $scope.waiting = false;
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.loadOutcome = function(outcomeId) {
        _.forEach( quiz.getOutcomes(), function(outcome) {
            if( outcome.outcomeId == outcomeId ) {
                $scope.input.outcomeTitle = outcome.title;
                $scope.currentOutcome = outcomeId;
                $scope.bodyList = angular.fromJson(outcome.body) ? angular.fromJson(outcome.body) : [];
                $scope.dndDraw();
                $scope.models.selected = [];
                $scope.models.listSelected = [];
            }
        });
    };

    $scope.addOrUpdateOutcome = function( gotoQuestions ) {
        if( $scope.waiting ) return;

        $scope.waiting = true;

        var postUrl = ( $scope.currentOutcome && $scope.currentOutcome != 'new' ) ? 'api/quiz/updateOutcome' : 'api/quiz/addOutcome';

        if( $scope.currentOutcome || $scope.input.outcomeTitle ) {
            $http.post(postUrl, {
                quizId:         quiz.getId(),
                outcomeId:      $scope.currentOutcome,
                title:          $scope.input.outcomeTitle,
                body:           angular.toJson($scope.bodyList)
            }).success(function(data) {
                if (data.status) {
                    quiz.addOutcome({
                        outcomeId: data.outcomeId,
                        title:     $scope.input.outcomeTitle,
                        body:      angular.toJson($scope.bodyList) });
                    $scope.getOutcomes();
                    $scope.input = [];
                    $scope.bodyList = [];
                    if( gotoQuestions ) {
                        $location.path('quiz-questions');
                    }
                } else {
                    if (_.isEmpty(data.errors)) {
                        data.errors = '';
                    }
                    _.forEach(data.errors, function(error) {
                        if (error != null) {
                            alerts.fail(i18n.s(error.type, error.field));
                        }
                    });
                }

                $scope.waiting = false;
            });
        } else if( gotoQuestions ) {
            $location.path('quiz-questions');
        }
    };

    $scope.deleteOutcome = function(outcomeId) {
        $scope.waiting = true;

        $http.post('api/quiz/deleteOutcome', {
            outcomeId: outcomeId
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.getOutcomes();
                $scope.input = [];
                $scope.bodyList = [];
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = '';
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    };

    $scope.getOutcomes();

}]);

controllers.controller('quiz-questions', ['$scope', '$location', '$http', '$rootScope', 'alerts', 'user', 'quiz', 'jquery', function($scope, $location, $http, $rootScope, alerts, user, quiz, jquery) {

    $scope.isLoggedIn();

    if( !quiz.getId() ) {
        alerts.clear();
        alerts.fail(i18n.t('no_quiz'));
        $location.path('quiz-create');
    }

    $rootScope.bodyClass = 'inner responsive';
    
    $scope.alerts = alerts;
    $scope.input = {};

    $scope.questions = [];
    $scope.outcomes = [];
    $rootScope.answers = [{answerIndex:Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),answerText:'',answerOutcome:null,answerOutcomeIndex:null}];

    $scope.$watch('input.questionText', function (newValue, oldValue) {
        $rootScope.questionTextLength = angular.isUndefined( newValue ) ? 0 : newValue.length;
        $rootScope.questionText = newValue;
        if( $rootScope.questionTextLength > 150 ) $scope.input.questionText = oldValue;
    });

    $scope.checkAnswerLength = function(answer) {
        if( answer.answerText.length > 100 ) answer.answerText = answer.answerText.substr(0,100);
    }

    $scope.getQuestions = function() {
        $http.post('api/quiz/getQuestions', {
            quizId: quiz.getId()
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.questions = data.questions;
                $rootScope.currentQuestionIndex = $scope.questions.length + 1;
                $rootScope.currentQuestion = false;
                $rootScope.questionCount   = $scope.questions.length + 1;
                quiz.setQuestions( data.questions );
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.getOutcomes = function() {
        $http.post('api/quiz/getOutcomes', {
            quizId: quiz.getId()
        }).success(function(data) {
            if (data.status) {
                $scope.outcomes = data.outcomes;
                $rootScope.outcomes = data.outcomes;
                quiz.setOutcomes( data.outcomes );
                $scope.currentOutcome = false;
                $scope.waiting = false;
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.loadQuestion = function(questionId) {
        var index = 1;

        _.forEach( quiz.getQuestions(), function(question) {
            if( question.questionId == questionId ) {
                $rootScope.answers = [];

                $scope.input.questionText = question.questionText;
                if( question.answerStructA && question.answerStructA != "0" ) $rootScope.answers.push(angular.fromJson(question.answerStructA));
                if( question.answerStructB && question.answerStructB != "0" ) $rootScope.answers.push(angular.fromJson(question.answerStructB));
                if( question.answerStructC && question.answerStructC != "0" ) $rootScope.answers.push(angular.fromJson(question.answerStructC));
                if( question.answerStructD && question.answerStructD != "0" ) $rootScope.answers.push(angular.fromJson(question.answerStructD));
                if( question.answerStructE && question.answerStructE != "0" ) $rootScope.answers.push(angular.fromJson(question.answerStructE));

                $rootScope.currentQuestionIndex = index;
                $rootScope.currentQuestion = questionId;

                jquery.init();
            } else {
                index++;
            }
        });
    };

    $scope.addOrUpdateQuestion = function() {
        if( $scope.waiting ) return;

        $scope.waiting = true;

        var postUrl = ( $rootScope.currentQuestion ) ? 'api/quiz/updateQuestion' : 'api/quiz/addQuestion';

        if( !$scope.input.questionText || $scope.input.questionText.trim().length == 0 ) {
            $scope.input.questionText = '';
            setTimeout( function() {
                $('#qtitle').parent().removeClass('is-success').addClass('has-error');
                $('#qtitle').focus( function() { $('#qtitle').parent().removeClass('is-success').removeClass('has-error'); });
            }, 3 );
            $scope.waiting = false;
            return false;
        }

        var answersValid = true;
        _.forEach( $rootScope.answers, function(answer) {
            if( answer.answerText.trim().length == 0 ) {
                answersValid = false;
            }
        });

        if( !answersValid ) {
            setTimeout( function() {
                $('.answerText').each( function() {
                    var _this = $(this);
                    if( _this.val().trim.length == 0 ) {
                        _this.val('');
                        _this.parent().parent().css('border-color','#ea4570');
                        _this.focus( function() { _this.parent().parent().css('border-color','#a4a4a6'); });
                    }
                });
            }, 3 );
            $scope.waiting = false;
            return false;
        }

        $http.post(postUrl, {
            quizId:        quiz.getId(),
            questionId:    $rootScope.currentQuestion,
            questionText:  $scope.input.questionText,
            answerStructA: angular.toJson($rootScope.answers[0]),
            answerStructB: angular.toJson($rootScope.answers[1]),
            answerStructC: angular.toJson($rootScope.answers[2]),
            answerStructD: angular.toJson($rootScope.answers[3]),
            answerStructE: angular.toJson($rootScope.answers[4])
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.getQuestions();
                $scope.input = [];

                $rootScope.currentQuestionIndex = $scope.questions.length + 1;
                $rootScope.currentQuestion = false;
                $rootScope.questionCount = $scope.questions.length + 1;
                $rootScope.answers = [{answerIndex:Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),answerText:'',answerOutcome:null,answerOutcomeIndex:null}];
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = '';
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    };

    $scope.getOutcomeIndex = function(answerOutcome) {
        if( !answerOutcome ) {
            return null;
        }

        index = 1;
        _.forEach( quiz.getOutcomes(), function(outcome) {
            if( outcome.outcomeId == answerOutcome.outcomeId ) {
                return index;
            } else {
                index++;
            }
            return null;
        });
    };

    $scope.deleteQuestion = function(questionId) {
        if( $scope.questions.length <= 1 ) {
            alerts.fail(i18n.t('no_questions'));
            return false;
        }

        $scope.waiting = true;

        $http.post('api/quiz/deleteQuestion', {
            questionId: questionId
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.getQuestions();
                $rootScope.questionCount = $scope.questions.length + 1;
                $rootScope.currentQuestion = false;
                $scope.input = [];
                $rootScope.answers = [{answerIndex:Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),answerText:'',answerOutcome:null,answerOutcomeIndex:null}];
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = '';
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    };

    $scope.addAnswer = function(questionId) {
        $rootScope.answers.push({answerIndex:Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),answerText:'',answerOutcome:null,answerOutcomeIndex:null});
        initLightbox();
        setTimeout( function() {
            $('.answer-list').hide().delay(1).show();
        }, 2);
    };

    $scope.deleteAnswer = function(index) {
        $rootScope.answers.splice(index,1);
        setTimeout( function() {
            $('.answer-list').hide().delay(1).show();
        }, 2);
    };

    jquery.init();
    $scope.getOutcomes();
    $scope.getQuestions();

    setTimeout( function() {
        $('.answer-list').hide().delay(1).show();
    }, 2);
}]);


controllers.controller('select-outcome', ['$scope', '$rootScope', '$modal', 'quiz', function($scope, $rootScope, $modal, quiz) {

    $scope.outcomes = quiz.getOutcomes();

    $scope.selectOutcome = function(outcome) {
        _.forEach( $rootScope.answers, function(answer) {
            if( $rootScope.currentAnswer.answerIndex == answer.answerIndex ) {
                answer.answerOutcome = outcome.outcomeId;
                answer.answerOutcomeIndex = $scope.getOutcomeIndex(outcome);
            }
        });

        $.fancybox.close();
    }

    $scope.hoverOutcome = function(outcome) {
        $rootScope.hoverOutcomeTitle = outcome.title;
    }

    $scope.closeModal = function() {
        $rootScope.modalInstance.close();
    }

    $scope.getOutcomeIndex = function(answerOutcome) {
        if( !answerOutcome ) {
            return null;
        }

        var index = 1;
        var matchedIndex = null;
        _.forEach( quiz.getOutcomes(), function(outcome) {
            if( outcome.outcomeId == answerOutcome.outcomeId ) {
                matchedIndex = index;
            } else {
                index++;
            }
        });

        return matchedIndex;
    };

}]);

controllers.controller('quiz-capture', ['$scope', '$location', '$http', '$rootScope', 'alerts', 'user', 'quiz', 'jquery', function($scope, $location, $http, $rootScope, alerts, user, quiz, jquery) {

    $scope.isLoggedIn();

    if( !quiz.getId() ) {
        alerts.clear();
        alerts.fail(i18n.t('no_quiz'));
        $location.path('quiz-create');
    }

    jquery.init();

    $rootScope.bodyClass = 'inner responsive';

    $scope.alerts = alerts;
    $scope.user = user;
    $scope.input = {};

    $scope.$watch('input.socialCaptureHeadline', function (newValue, oldValue) {
        if( $scope.input.socialCaptureHeadline && $scope.input.socialCaptureHeadline.length > 100 ) $scope.input.socialCaptureHeadline = oldValue;
    });

    $scope.$watch('input.leadCaptureHeadline', function (newValue, oldValue) {
        if( $scope.input.leadCaptureHeadline && $scope.input.leadCaptureHeadline.length > 100 ) $scope.input.leadCaptureHeadline = oldValue;
    });

    $scope.$watch('input.socialCaptureDescription', function (newValue, oldValue) {
        if( $scope.input.socialCaptureDescription && $scope.input.socialCaptureDescription.length > 100 ) $scope.input.socialCaptureDescription = oldValue;
    });

    $scope.$watch('input.leadCaptureDescription', function (newValue, oldValue) {
        if( $scope.input.leadCaptureDescription && $scope.input.leadCaptureDescription.length > 100 ) $scope.input.leadCaptureDescription = oldValue;
    });

    $scope.$watch('input.socialCapturePrivacyPolicy', function (newValue, oldValue) {
        if( $scope.input.socialCapturePrivacyPolicy && $scope.input.socialCapturePrivacyPolicy.length > 30 ) $scope.input.socialCapturePrivacyPolicy = oldValue;
    });

    $scope.$watch('input.leadCapturePrivacyPolicy', function (newValue, oldValue) {
        if( $scope.input.leadCapturePrivacyPolicy && $scope.input.leadCapturePrivacyPolicy.length > 30 ) $scope.input.leadCapturePrivacyPolicy = oldValue;
    });

    $scope.$watch('input.captureEnabled', function (newValue, oldValue) {
        $rootScope.captureEnabled = true;
    });

    $scope.$watch('input.leadType', function (newValue, oldValue) {
        $rootScope.leadType = true;
    });

    $scope.saveCaptureSettings = function() {
        if( $scope.input.captureEnabled && ( $scope.input.leadType == '' || $scope.input.leadType == 0 || $scope.input.leadType == null ) ) {
            alerts.fail(i18n.t('leadType_not_selected'));
            return false;
        }
        $scope.waiting = true;

        var values = $scope.input;
        values['quizId'] = quiz.getId();
        values['leadType'] = ( values.leadType == 'tab1' ) ? 1 : ( values.leadType == 'tab2' ) ? 2 : 0;

        $http.post('api/quiz/saveCaptureSettings', values).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                quiz.setCaptureSettings(values);
                $scope.captureSettings = quiz.getCaptureSettings();
                $location.path('quiz-offer');
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = '';
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    };

    $scope.getCaptureSettings = function() {
        $http.post('api/quiz/getCaptureSettings', {
            quizId: quiz.getId()
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                if( data.captureSettings ) {
                    $scope.input = data.captureSettings;
                    $scope.input.captureEnabled           = ( data.captureSettings.captureEnabled == 1 ) ? true : false;
                    $scope.input.leadType                 = ( data.captureSettings.leadType == 1 ) ? 'tab1' : ( data.captureSettings.leadType == 2 ) ? 'tab2' : 0;

                    $scope.input.socialCaptureSkippable   = ( data.captureSettings.socialCaptureSkippable == 1 )  ? true : false;
                    $scope.input.leadCaptureFirstEnabled  = ( data.captureSettings.leadCaptureFirstEnabled == 1 ) ? true : false;
                    $scope.input.leadCaptureLastEnabled   = ( data.captureSettings.leadCaptureLastEnabled == 1 )  ? true : false;
                    $scope.input.leadCaptureEmailEnabled  = ( data.captureSettings.leadCaptureEmailEnabled == 1 ) ? true : false;
                    $scope.input.leadCapturePhoneEnabled  = ( data.captureSettings.leadCapturePhoneEnabled == 1 ) ? true : false;
                    $scope.input.leadCaptureSkippable     = ( data.captureSettings.leadCaptureSkippable == 1 )    ? true : false;
                    $scope.input.leadCapturePhoneEnabled  = ( data.captureSettings.leadCapturePhoneEnabled == 1 ) ? true : false;

                    $scope.input.socialCaptureDescription = ( data.captureSettings.socialCaptureDescription == '0' ) ? '' : data.captureSettings.socialCaptureDescription;
                    $scope.input.leadCaptureDescription   = ( data.captureSettings.leadCaptureDescription == '0' ) ? '' : data.captureSettings.leadCaptureDescription;
                } else {
                    var captureSettings = {
                        quizId:quiz.getId(),
                        captureEnabled:false,
                        leadType:"0",
                        socialCaptureHeadline:'Enter your info below to get your results',
                        socialCaptureDescription:'',
                        socialCapturePlacement:'after',
                        socialCaptureSkippable:true,
                        socialCapturePrivacyPolicy:'This is your Privacy Policy',
                        socialCaptureDisclaimerUrl:'',
                        leadCaptureHeadline:'Enter your info below to get your results',
                        leadCaptureDescription:'',
                        leadCapturePlacement:'after',
                        leadCaptureCta:'',
                        leadCaptureFirstEnabled:true,
                        leadCaptureLastEnabled:true,
                        leadCaptureEmailEnabled:true,
                        leadCapturePhoneEnabled:false,
                        leadCaptureSkippable:true,
                        leadCaptureConversionCode:'',
                        leadCapturePrivacyPolicy:'This is your Privacy Policy',
                        leadCaptureDisclaimerUrl:'' };
                    $scope.input = captureSettings;
                }
                quiz.setCaptureSettings( captureSettings );
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.getCaptureSettings();

}]);

controllers.controller('quiz-offer', ['$scope', '$location', '$http', '$rootScope', 'alerts', 'user', 'quiz', 'jquery', function($scope, $location, $http, $rootScope, alerts, user, quiz, jquery) {

    $scope.isLoggedIn();

    if( !quiz.getId() ) {
        alerts.clear();
        alerts.fail(i18n.t('no_quiz'));
        $location.path('quiz-create');
    }

    $rootScope.bodyClass = 'inner responsive';

    $scope.alerts = alerts;
    $scope.user = user;
    $scope.input = {};

    jquery.init();

    $rootScope.offerImage = 'quiz-default.jpg';

    $scope.dropzoneConfig = {
        'options': { // passed into the Dropzone constructor
            'url': 'api/quiz/uploadOfferImg',
            'uploadMultiple': false,
            'clickable': '#offer-image-dropzone',
            'previewTemplate': document.querySelector('#template-container').innerHTML,
            'acceptedFiles': 'image/*',
            'maxFilesize': 2
        },
        'eventHandlers': {
            'addedfile': function (file, xhr, formData) {
                $('.dz-preview').remove();
            },
            'success': function (file, response) {
                if( file.width != 600 || file.height != 400 ) {
                    alerts.fail(i18n.t('image_wrong_size'));
                } else {
                    var data = angular.fromJson( response );
                    $rootScope.offerImage = '/uploads/offer/' + data.offerImage;
                    $scope.input.offerImage = '/uploads/offer/' + data.offerImage;
                }
            },
            'error': function () {
                alerts.fail(i18n.t('image_err'));
            }
        }
    };

    $scope.dropzoneConfig2 = {
        'options': { // passed into the Dropzone constructor
            'url': 'api/quiz/uploadOfferImg',
            'uploadMultiple': false,
            'clickable': '#offer-image-dropzone2',
            'previewTemplate': document.querySelector('#template-container').innerHTML,
            'acceptedFiles': 'image/*',
            'maxFilesize': 2
        },
        'eventHandlers': {
            'addedfile': function (file, xhr, formData) {
                $('.dz-preview').remove();
            },
            'success': function (file, response) {
                if( file.width != 600 || file.height != 400 ) {
                    alerts.fail(i18n.t('image_wrong_size'));
                } else {
                    var data = angular.fromJson( response );
                    $rootScope.offerImage = '/uploads/offer/' + data.offerImage;
                    $scope.input.offerImage = '/uploads/offer/' + data.offerImage;
                }
            },
            'error': function () {
                alerts.fail(i18n.t('image_err'));
            }
        }
    };

    $scope.$watch('input.offerEnabled', function (newValue, oldValue) {
        // totally ghetto hack to make this work
        if( newValue ) {
            $('.live-section').show();
        } else {
            $('.live-section').hide();
        }
    });

    $scope.$watch('input.offerType', function (newValue, oldValue) {
        // totally ghetto hack to make this work
        $('.slide').hide();

        if( newValue == 'tab1' ) {
            $('.tab1show').show();
        } else if( newValue == 'tab2' ) {
            $('.tab2show').show();
        } else if( newValue == 'tab3' ) {
            $('.tab3show').show();
        }
    });

    $scope.$watch('input.offerHeadline', function (newValue, oldValue) {
        $rootScope.offerHeadlineLength = ( newValue == null || angular.isUndefined( newValue ) ) ? 0 : newValue.length;
        $rootScope.offerHeadline = newValue;
        if( $rootScope.offerHeadlineLength > 100 ) $scope.input.offerHeadline = oldValue;
    });

    $scope.$watch('input.offerDescription', function (newValue, oldValue) {
        $rootScope.offerDescriptionLength = ( newValue == null || angular.isUndefined( newValue ) ) ? 0 : newValue.length;
        $rootScope.offerDescription = newValue;
        if( $rootScope.offerDescriptionLength > 100 ) $scope.input.offerDescription = oldValue;
    });

    $scope.$watch('input.offerCta', function (newValue, oldValue) {
        $rootScope.offerCta = newValue;
    });

    $scope.getOutcomes = function() {
        $http.post('api/quiz/getOutcomes', {
            quizId: quiz.getId()
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.outcomes = data.outcomes;
                quiz.setOutcomes( data.outcomes );
                $scope.currentOutcome = false;
                $scope.input = {outcomeId:null,offerEnabled:false,offerType:1,offerHeadline:'',offerDescription:'',offerCta:'',offerUrl:''};
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.getOfferByOutcomeId = function(outcomeId) {
        $scope.currentOutcome = false;

        _.forEach($scope.outcomes, function(outcome) {
            if (outcome.outcomeId == outcomeId) {
                $scope.currentOutcome = outcomeId;
                $rootScope.currentOutcomeHeadline = outcome.outcomeTitle;
                $rootScope.currentOutcomeBody = outcome.outcomeBody;

                $scope.input = [];
                $scope.input = outcome;
                $scope.input.offerEnabled = outcome.offerEnabled == 1 ? true : false;
                $scope.input.offerUrl = outcome.offerUrl != 0 ? outcome.offerUrl : '';
                $scope.input.offerType = ( outcome.offerType == "1" ) ? 'tab1' : 
                   ( outcome.offerType == "2" ) ? 'tab2' : 
                    ( outcome.offerType == "3" ) ? 'tab3' : outcome.offerType;
            }
        });

        if( !$scope.currentOutcome ) $scope.input = {outcomeId:null,offerEnabled:false,offerType:1,offerHeadline:'',offerDescription:'',offerCta:'',offerUrl:''};

        $rootScope.offerImage = $scope.input.offerImage && $scope.input.offerImage != 0 ? $scope.input.offerImage : 'quiz-default.jpg';
    };

    $scope.saveOffer = function( applyAll ) {
        if( $scope.input.offerEnabled && !$scope.input.offerType ) {
            alerts.fail('You must select an offer type or disable offer.');
            return false;
        }

        if( $scope.input.offerEnabled && ( !$scope.input.offerUrl || !isUrlValid($scope.input.offerUrl) ) ) {
            alerts.fail('You must enter a valid Call-to-Action URL.');
            return false;
        }

        if( $scope.input.offerEnabled && ( $scope.input.offerType == 'tab1' || $scope.input.offerType == 'tab3' ) && !$scope.input.offerHeadline ) {
            alerts.fail('You must enter a headline.');
            return false;
        }

        if( $scope.input.offerEnabled && $scope.input.offerType == 'tab1' && !$scope.input.offerDescription ) {
            alerts.fail('You must enter a description.');
            return false;
        }

        if( $scope.input.offerEnabled && ( $scope.input.offerType == 'tab1' || $scope.input.offerType == 'tab3' ) && !$scope.input.offerCta ) {
            alerts.fail('You must select a Call-to-Action label.');
            return false;
        }

        $scope.waiting = true;

        var values = $scope.input;
        var offersToSave = [];

        delete values['$$hashKey'];
        
        values['offerType'] = ( values.offerType == 'tab1' ) ? 1 : 
                               ( values.offerType == 'tab2' ) ? 2 : 
                                ( values.offerType == 'tab3' ) ? 3 : 0;

        if( applyAll ) {
            _.forEach( quiz.getOutcomes(), function(outcome) {
                values['outcomeId'] = outcome.outcomeId;
                offersToSave.push(angular.copy(values));
            });
        } else {
            values['outcomeId'] = $scope.currentOutcome;
            offersToSave.push(values);
        }

        _.forEach( offersToSave, function(offerData) {
            $http.post('api/quiz/saveOffer', offerData).success(function(data) {
                $scope.waiting = false;
                if (data.status) {
                    $scope.getOutcomes();
                } else {
                    if (_.isEmpty(data.errors)) {
                        data.errors = '';
                    }
                    _.forEach(data.errors, function(error) {
                        if (error != null) {
                            alerts.fail(i18n.s(error.type, error.field));
                        }
                    });
                }
            });
        });
    };

    $scope.getOutcomes();
}]);

controllers.controller('quiz-review', ['$scope', '$location', '$http', '$rootScope', 'alerts', 'user', 'quiz', 'jquery', function($scope, $location, $http, $rootScope, alerts, user, quiz, jquery) {

    $scope.isLoggedIn();

    if( !quiz.getId() ) {
        alerts.clear();
        alerts.fail(i18n.t('no_quiz'));
        $location.path('quiz-create');
    }

    $rootScope.bodyClass = 'inner responsive';

    $scope.alerts = alerts;
    $scope.user = user;
    $scope.input = {};
    $scope.isAdmin = user.getRoleId() == 1;

    var quizAttributes = quiz.getAttributes();

    $rootScope.quizTitle       = quizAttributes.title;
    $rootScope.quizDescription = quizAttributes.description;
    $rootScope.quizImageId     = quizAttributes.imageId && quizAttributes.imageId != '0' ? quizAttributes.imageId : 'quiz-default.jpg';
    $rootScope.quizCta         = quizAttributes.cta;

    $scope.input.quizLinkUrl = $rootScope.baseUrl + "q/" + quizAttributes.quizLink;
    $scope.input.embedCode   = '<iframe width="480" height="640" src="' + $rootScope.baseUrl + 'q/' + quizAttributes.quizLink + '" frameborder="0" allowfullscreen></iframe>';

    $scope.publishQuiz = function () {
        if( $scope.validateQuiz() ) {
            $http.post('api/quiz/setQuizStatus', {
                quizId: quiz.getId(),
                status: 2
            }).success(function(data) {
                $scope.waiting = false;
                if (data.status) {
                    if( user.getRoleId() == 1 ) {
                        $location.path('/dashboard-tiles-admin');
                    } else {
                        $location.path('/dashboard-tiles');
                    }
                } else {
                    if (_.isEmpty(data.errors)) {
                        data.errors = '';
                    }
                    _.forEach(data.errors, function(error) {
                        if (error != null) {
                            alerts.fail(i18n.s(error.type, error.field));
                        }
                    });
                }
            });
        }
    };

    $scope.validateQuiz = function () {
        var isValid = true;

        if( _.isUndefined( quiz.getOutcomes() ) ) {
            $http.post('/api/quiz/getOutcomes', {
                quizId: quiz.getId()
            }).success(function(data) {
                $scope.waiting = false;
                if (data.status) {
                    quiz.setOutcomes( data.outcomes );
                }
            });
        };

        if( _.isUndefined( quiz.getQuestions() ) ) {
            $http.post('/api/quiz/getQuestions', {
                quizId: quiz.getId()
            }).success(function(data) {
                $scope.waiting = false;
                if (data.status) {
                    quiz.setQuestions( data.questions );
                }
            });
        };

        if( !_.isUndefined( quiz.getOutcomes() ) && !_.isUndefined( quiz.getQuestions() ) ) {
            if( quiz.getOutcomes().length == 0 ) {
                alerts.fail(i18n.t('publish_no_outcomes'));
                isValid = false;
            }

            if( quiz.getQuestions().length == 0 ) {
                alerts.fail(i18n.t('publish_no_questions'));
                isValid = false;
            }

            _.forEach( quiz.getQuestions(), function(question) {
                var hasOutcomeMapping = false;

                if( question.answerStructA && question.answerStructA != "0" && $scope.hasOutcomeMapping(question.answerStructA) ) hasOutcomeMapping = true;
                if( question.answerStructB && question.answerStructB != "0" && $scope.hasOutcomeMapping(question.answerStructB) ) hasOutcomeMapping = true;
                if( question.answerStructC && question.answerStructC != "0" && $scope.hasOutcomeMapping(question.answerStructC) ) hasOutcomeMapping = true;
                if( question.answerStructD && question.answerStructD != "0" && $scope.hasOutcomeMapping(question.answerStructD) ) hasOutcomeMapping = true;
                if( question.answerStructE && question.answerStructE != "0" && $scope.hasOutcomeMapping(question.answerStructE) ) hasOutcomeMapping = true;

                if( !hasOutcomeMapping ) {
                    alerts.fail(i18n.t('publish_question_no_mapping'));
                    isValid = false;
                }
            });

            return isValid;
        } else {
            setTimeout( function() {
                $scope.validateQuiz();
            }, 5 );
            return false;
        }
    }

    $scope.hasOutcomeMapping = function (answerStruct) {
        var answer = angular.fromJson(answerStruct);
        return answer.answerOutcome ? true : false;
    }

    $scope.validateQuiz();

    jquery.init();

}]);

controllers.controller('quiz-deploy', ['$scope', '$routeParams','$location', '$http', '$rootScope', 'alerts', 'user', 'quiz', 'jquery', '$sce', 'ezfb', '$auth', function($scope, $routeParams, $location, $http, $rootScope, alerts, user, quiz, jquery, $sce, ezfb, $auth) {

    var quizLink = $routeParams.param1;

    $rootScope.bodyClass = 'front-page deployed';
    $rootScope.inFrame = window.self !== window.top;
    $rootScope.deployed = true;
    
    $scope.alerts = alerts;
    $scope.input = {};
    $scope.answerOutcomes = {};
    $scope.answerSelected = {};

    $scope.leadData = {
        'fname':null,
        'lname':null,
        'email':null,
        'phone':null,
        'result':null
    };

    ezfb.init({
        appId: '443980995726708',
        version: 'v2.5'
    });

    $http.post('/api/quiz/getQuizByLink', {
        quizLink: quizLink
    }).success(function(data) {
        $scope.waiting = false;
        if (data.status) {
            if( !data.quiz ) {
                alerts.fail(i18n.t('quiz_not_found'));
                $location.path('error');
                //window.location.reload();
            }
            if( data.quiz.status != 2 && !$scope.user.loggedIn() ) {
                alerts.fail(i18n.t('quiz_not_available'));
                $location.path('error');
                //window.location.reload();
            }
            if( data.quiz.status == 3 || data.quiz.status == 4 ) {
                alerts.fail(i18n.t('quiz_not_available'));
                $location.path('error');
                //window.location.reload();
            }

            $rootScope.quizComplete = false;
            $rootScope.leadCaptured = false;
            $rootScope.quizImageId = 'quiz-default.jpg';
            $rootScope.quizUrl = $rootScope.baseUrl + $location.path();

            $scope.quiz = data.quiz;

            quiz.setAttributes( data.quiz );
            $rootScope.quizTitle = data.quiz.title;
            $rootScope.quizDescription = data.quiz.description;
            $rootScope.quizImageId = data.quiz.imageId && data.quiz.imageId != '0' ? data.quiz.imageId : 'quiz-default.jpg';
            $rootScope.quizCta = data.quiz.cta;
            $rootScope.logo = data.quiz.userLogo ? '/images/uploads/logos/' + data.quiz.userLogo : '/images/Logo5.png';
            $rootScope.companyUrl = data.quiz.website ? data.quiz.website : 'http://leadquizzes.com';

            $http.post('/api/activity/addNewActivityRecord', {
                quizId: $scope.quiz.quizId
            }).success(function(data) {
                if (data.activityId) {
                    $scope.activityId = data.activityId;
                }
            });

            $scope.getQuestions(data.quiz.quizId);
            $scope.getCaptureSettings(data.quiz.quizId);
            $scope.getOutcomes(data.quiz.quizId);
        } else {
            if (_.isEmpty(data.errors)) {
                data.errors = i18n.t('fill_out_login');
            }
            _.forEach(data.errors, function(error) {
                if (error != null) {
                    alerts.fail(i18n.s(error.type, error.field));
                }
            });
        }
    });

    $scope.scrollToTop = function() {
        window.scrollTo(0,0);
    }

    $scope.getQuestions = function(quizId) {
        window.scrollTo(0,0);

        $http.post('/api/quiz/getQuestions', {
            quizId: quizId
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.questions = data.questions;
                $rootScope.answers = [];
                $rootScope.currentQuestionIndex = 1;
                $rootScope.currentQuestion = data.questions[$rootScope.currentQuestionIndex-1];
                $rootScope.questionCount   = data.questions.length;

                if( $rootScope.currentQuestion.answerStructA && $rootScope.currentQuestion.answerStructA != "0" )
                    $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructA));

                if( $rootScope.currentQuestion.answerStructB && $rootScope.currentQuestion.answerStructB != "0" )
                    $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructB));

                if( $rootScope.currentQuestion.answerStructC && $rootScope.currentQuestion.answerStructC != "0" )
                    $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructC));

                if( $rootScope.currentQuestion.answerStructD && $rootScope.currentQuestion.answerStructD != "0" )
                    $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructD));

                if( $rootScope.currentQuestion.answerStructE && $rootScope.currentQuestion.answerStructE != "0" )
                    $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructE));

                quiz.setQuestions( data.questions );
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    };

    $scope.getCaptureSettings = function(quizId) {
        $http.post('/api/quiz/getCaptureSettings', {
            quizId: quizId
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                if( data.captureSettings ) {
                    $scope.captureSettings = data.captureSettings;

                    var prefix = 'http://';
                    if ($scope.captureSettings.socialCaptureDisclaimerUrl.substr(0, prefix.length) !== prefix) {
                        $scope.captureSettings.socialCaptureDisclaimerUrl = prefix + $scope.captureSettings.socialCaptureDisclaimerUrl;
                    }
                    if ($scope.captureSettings.leadCaptureDisclaimerUrl.substr(0, prefix.length) !== prefix) {
                        $scope.captureSettings.leadCaptureDisclaimerUrl = prefix + $scope.captureSettings.leadCaptureDisclaimerUrl;
                    }
                }
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    };

    $scope.getOutcomes = function(quizId) {
        $http.post('/api/quiz/getOutcomes', {
            quizId: quizId
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.outcomes = data.outcomes;
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.goBack = function() {
        window.scrollTo(0,0);

        $rootScope.currentQuestionIndex--;

        $rootScope.currentQuestion = $scope.questions[$rootScope.currentQuestionIndex-1];
        $rootScope.answers = [];

        if( $rootScope.currentQuestion.answerStructA && $rootScope.currentQuestion.answerStructA != "0" )
            $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructA));

        if( $rootScope.currentQuestion.answerStructB && $rootScope.currentQuestion.answerStructB != "0" )
            $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructB));

        if( $rootScope.currentQuestion.answerStructC && $rootScope.currentQuestion.answerStructC != "0" )
            $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructC));

        if( $rootScope.currentQuestion.answerStructD && $rootScope.currentQuestion.answerStructD != "0" )
            $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructD));

        if( $rootScope.currentQuestion.answerStructE && $rootScope.currentQuestion.answerStructE != "0" )
            $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructE));  
    }

    $scope.answerSelect = function(outcomeId) {
        window.scrollTo(0,0);

        if( outcomeId ) $scope.answerOutcomes[$rootScope.currentQuestionIndex] = outcomeId;

        $rootScope.currentQuestionIndex++;

        if( $rootScope.currentQuestionIndex > $rootScope.questionCount ) {
            $rootScope.quizComplete = true;
            var winningOutcomeId = $scope.getMode($scope.answerOutcomes);

            _.forEach($scope.outcomes, function(outcome) {
                if (outcome.outcomeId == winningOutcomeId) {
                    $scope.outcome = outcome;
                    $scope.leadData.result = outcome.title;

                    if( $scope.outcome.offerEnabled == null ) $scope.outcome.offerEnabled = 0;
                    $rootScope.offerImage = $scope.outcome.offerImage ? $scope.outcome.offerImage : 'quiz-default.jpg';
                    $rootScope.showResults = $scope.outcome.offerEnabled == 1 ? false : true;
                }
            });

            $scope.outcome.body = $scope.renderOutcomeBody( $scope.outcome.body );

            if( $scope.activityId ) {
                $http.post('/api/activity/updateActivityRecord', {
                    activityId: $scope.activityId,
                    quizCompleted: 1,
                    quizResult: $scope.leadData.result
                });
            }
        } else {
            $rootScope.currentQuestion = $scope.questions[$rootScope.currentQuestionIndex-1];
            $rootScope.answers = [];

            if( $rootScope.currentQuestion.answerStructA && $rootScope.currentQuestion.answerStructA != "0" )
                $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructA));

            if( $rootScope.currentQuestion.answerStructB && $rootScope.currentQuestion.answerStructB != "0" )
                $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructB));

            if( $rootScope.currentQuestion.answerStructC && $rootScope.currentQuestion.answerStructC != "0" )
                $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructC));

            if( $rootScope.currentQuestion.answerStructD && $rootScope.currentQuestion.answerStructD != "0" )
                $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructD));

            if( $rootScope.currentQuestion.answerStructE && $rootScope.currentQuestion.answerStructE != "0" )
                $rootScope.answers.push(angular.fromJson($rootScope.currentQuestion.answerStructE));  
        }
    };

    $scope.renderOutcomeBody = function( body ) {
        var bodyList = [];

        _.forEach(angular.fromJson( body ), function(item) {
            if( item ) {
                if( item.html ) {
                    if( item.type == 'Video' ) {
                        var url = item.html;
                        var autoplay = item.autoplay;

                        url = url.replace("watch?v=", "v/");
                        url = url.replace("//vimeo.com/", "//player.vimeo.com/video/");

                        if( url.indexOf('youtube') > -1 ) url += '?autoplay=' + autoplay + '&controls=0&modestbranding=1&rel=0&showinfo=0&nologo=1';
                        if( url.indexOf('vimeo') > -1 ) url += '?autoplay=' + autoplay + '&title=0&byline=0&portrait=0';

                        item.htmlString = '<iframe width="100%" height="320px" src="' + url + '"></iframe>';
                    } else if( item.type == 'Image' ) {
                        item.htmlString = '<img style="width: 100%; height: auto" src="' + item.html + '">';
                    } else {
                        item.htmlString = item.html;
                    }
                } else {
                    item.htmlString = item.fill;
                }

                if( item.type == 'Headline' ) item.htmlString = '<h4>' + item.htmlString + '</h4>';

                item.htmlString = $sce.trustAsHtml(item.htmlString);

                bodyList.push(item);
            }
        });

        return bodyList;
    };

    $scope.captureLead = function() {
        var incomplete = false;

        if( $scope.captureSettings.leadType == 2 ) {
            if( $scope.captureSettings.leadCaptureFirstEnabled == 1 ) {
                if( $('#fname').val().trim() == '' ) {
                    $('#fname').parent().parent().find('.error-message').css('display','block');
                    incomplete = true;
                } else {
                    $scope.leadData.fname = $('#fname').val().trim();
                }
            }

            if( $scope.captureSettings.leadCaptureLastEnabled == 1 ) {
                if( $('#lname').val().trim() == '' ) {
                    $('#lname').parent().parent().find('.error-message').css('display','block');
                    incomplete = true;
                } else {
                    $scope.leadData.lname = $('#lname').val().trim();
                }
            }
            
            if( $scope.captureSettings.leadCaptureEmailEnabled == 1 ) {
                if( $('#email').val().trim() == '' ) {
                    $('#email').parent().parent().find('.error-message').css('display','block');
                    incomplete = true;
                } else {
                    $scope.waiting = true;
                    $http.post('/api/quiz/verifyEmail', {
                        email: $('#email').val().trim()
                    }).success(function(data) {
                        if( !( data.mx_found == true || data.smtp_check == true ) && data.disposable == false  ) {
                            $('#email').parent().parent().find('.error-message').css('display','block');
                            incomplete = true;
                        }
                        $scope.waiting = false;
                    }).
                    error(function(data, status, headers, config) {
                        $scope.waiting = false;
                    });
                    $scope.leadData.email = $('#email').val().trim();
                }
            }

            if( $scope.captureSettings.leadCapturePhoneEnabled == 1 ) {
                if( $('#phone').val().trim() == '' ) {
                    $('#phone').parent().parent().find('.error-message').css('display','block');
                    incomplete = true;
                } else {
                    $scope.leadData.phone = $('#phone').val().trim();
                }
            }
        }

        var waitingInterval = setInterval( function() { 
            if( !$scope.waiting ) {
                clearInterval(waitingInterval);

                if( incomplete ) {
                    setTimeout( function() {
                        $('.error-message').css('display', 'none');
                    }, 5000);
                    return false;
                } else {
                    $scope.updateActivityRecord();
                    $scope.saveToVendor();
                }
            }
        }, 3 );
    };

    $scope.ctaClicked = function() {
        if( $scope.activityId ) {
            $http.post('/api/activity/updateActivityRecord', {
                activityId: $scope.activityId,
                ctaClicked: 1
            });
        }
    }

    $scope.updateActivityRecord = function() {
        if( $scope.activityId ) {
            $http.post('/api/activity/updateActivityRecord', {
                activityId:    $scope.activityId,
                leadCaptured:  1,
                firstName:     $scope.leadData.fname,
                lastName:      $scope.leadData.lname,
                email:         $scope.leadData.email,
                phone:         $scope.leadData.phone
            });
        }
            
        $rootScope.leadCaptured = true;
    }

    $scope.facebookCapture = function() {
        ezfb.getLoginStatus( function (res) {
            if( res.status != 'connected' ) {
                ezfb.login( function (res) {
                    if (res.authResponse) {
                        ezfb.api('/me?fields=first_name,last_name,email', function (res) {
                            $scope.leadData.fname = res.first_name;
                            $scope.leadData.lname = res.last_name;
                            $scope.leadData.email = res.email;

                            $scope.updateActivityRecord();
                            $scope.saveToVendor();
                        });
                    } else {
                        console.log(res);
                        // Something went wrong.
                    }
                }, {scope: 'email,public_profile'});
            } else {
                ezfb.api('/me?fields=first_name,last_name,email', function (res) {
                    $scope.leadData.fname = res.first_name;
                    $scope.leadData.lname = res.last_name;
                    $scope.leadData.email = res.email;

                    $scope.updateActivityRecord();
                    $scope.saveToVendor();
                });
            }
        });
    }

    $scope.twitterCapture = function() {
        $auth.authenticate('twitter')
        .then( function (res) {
            // I guess we can't get email from twitter, so nothing happens here
        })
        .catch( function (res) {
            console.log(res);
            // Something went wrong.
        });
    }

    $scope.facebookShare = function() {
        FB.ui({
            method: 'feed',
            name: $scope.quiz.title,
            link: $rootScope.quizUrl,
            picture: $rootScope.baseUrl + 'images/' + $rootScope.quizImageId,
            caption: $scope.quiz.title,
            description: $scope.quiz.description,
            message: $scope.outcome.title
        });

        if( $scope.activityId ) {
            $http.post('/api/activity/incrementShareCount', {
                activityId: $scope.activityId
            });
        }
    };

    $scope.twitterShare = function() {
        if( $scope.activityId ) {
            $http.post('/api/activity/incrementShareCount', {
                activityId: $scope.activityId
            });
        }
    }

    $scope.saveToVendor = function() {
        $http.post('/api/integration/saveContact', {
            integrationId: $scope.quiz.integrationId,
            segmentid:     $scope.quiz.segmentid,
            firstName:     $scope.leadData.fname,
            lastName:      $scope.leadData.lname,
            email:         $scope.leadData.email,
            phone:         $scope.leadData.phone,
            result:        $scope.leadData.result
        });
    }

    $scope.getMode = function(arr) {
        var numMapping = {};
        var greatestFreq = 0;
        var mode;
        _.forEach( arr, function(number) {
            numMapping[number] = (numMapping[number] || 0) + 1;

            if (greatestFreq < numMapping[number]) {
                greatestFreq = numMapping[number];
                mode = number;
            }
        });
        return mode;
    }

}]);

controllers.controller('dashboard', ['$scope', '$location', '$http', '$rootScope', 'alerts', 'quiz', 'user', 'jquery', 'DTOptionsBuilder', 'DTColumnDefBuilder', function($scope, $location, $http, $rootScope, alerts, quiz, user, jquery, DTOptionsBuilder, DTColumnDefBuilder) {

    $scope.isLoggedIn();

    $rootScope.bodyClass = 'inner responsive';
    $scope.user = user;

    if( $scope.active('/dashboard-admin') ) {
        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('full_numbers')
            .withDisplayLength(100)
            .withOption('order', [1, 'asc'])
            .withDOM('trpi'); // pitrfl

        $scope.dtColumnDefs = [ 
            DTColumnDefBuilder.newColumnDef(0).notSortable(),
            DTColumnDefBuilder.newColumnDef(2).withOption('sWidth','150px'),
            DTColumnDefBuilder.newColumnDef(3).withOption('sWidth','120px'),
            DTColumnDefBuilder.newColumnDef(4).withOption('sWidth','150px'), ];
    } else {
        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('full_numbers')
            .withDisplayLength(25)
            .withOption('order', [4, 'desc'])
            .withDOM('trpi'); // pitrfl

        $scope.dtColumnDefs = [ 
            DTColumnDefBuilder.newColumnDef(0).notSortable(),
            DTColumnDefBuilder.newColumnDef(4).withOption('sWidth','120px'),
            DTColumnDefBuilder.newColumnDef(9).withOption('sWidth','120px'), ];
    }

    $('#datatable').on( 'page.dt', function () {
        window.scrollTo(0,0);
    } );

    $scope.getQuizzes = function() {
        $scope.unpublishedCount = 0;
        $scope.publishedCount   = 0;
        $scope.archivedCount    = 0;

        $http.post('api/quiz/getQuizzesByUserId', {
            userId: user.getRoleId() == 1 ? 1 : user.getId()
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.quizzes = data.quizzes;

                _.forEach($scope.quizzes, function(quiz) {
                    quiz.name = ( quiz.name && quiz.name.length >= 21 ) ? quiz.name.substring(0, 18) + '...' : quiz.name;
                    quiz.imageId = quiz.imageId != 0 && quiz.imageId != null ? quiz.imageId : 'quiz-default.jpg';
                    quiz.created = new Date(quiz.created.replace(/-/g, '/'));

                    if( quiz.status == 1 ) $scope.unpublishedCount++;
                    if( quiz.status == 2 ) $scope.publishedCount++;
                    if( quiz.status == 3 ) $scope.archivedCount++;
                });
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.editQuiz = function( quizId ) {
        quiz.clear();
        quiz.setId(quizId);
        $location.path('quiz-title');
    }

    $scope.exportLeads = function( quizId ) {
        var form = document.createElement('form');
        form.action = '/api/activity/generateCsv';
        form.method = 'POST';
        form.target = '_lead';

        var input = document.createElement('textarea');
        input.name = 'quizId';
        input.value = quizId;
        form.appendChild(input);

        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    }

    $scope.editSelected = function() {
        $scope.editQuiz( $('tr.selected').data('quizid') );
    }

    $scope.exportSelected = function() {
        var quizIds = [];

        $('tr.selected').each( function() {
            quizIds.push( $(this).data('quizid') );
        });

        $scope.exportLeads( quizIds );
    }

    $scope.setQuizStatus = function( quizId, status, updateTable ) {
        $http.post('api/quiz/setQuizStatus', {
            quizId: quizId,
            status: status
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                if(updateTable) $scope.getQuizzes();
            } else {
                if(updateTable) $scope.getQuizzes();
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.unpublishSelected = function() {
        var rowCount = $('tr.selected').length;
        var curRow = 1;

        $('tr.selected').each( function() {
            $scope.setQuizStatus( $(this).data('quizid'), 1, rowCount == curRow );
            curRow++;
        });
    }

    $scope.publishSelected = function() {
        var rowCount = $('tr.selected').length;
        var curRow = 1;

        $('tr.selected').each( function() {
            $scope.setQuizStatus( $(this).data('quizid'), 2, rowCount == curRow );
            curRow++;
        });
    }

    $scope.archiveSelected = function() {
        var rowCount = $('tr.selected').length;
        var curRow = 1;

        $('tr.selected').each( function() {
            $scope.setQuizStatus( $(this).data('quizid'), 3, rowCount == curRow );
            curRow++;
        });
    }

    $scope.deleteSelected = function() {
        var rowCount = $('tr.selected').length;
        var curRow = 1;

        if( confirm( 'Are you sure you want to delete the selected quizzes? This action cannot be undone' ) ) {
            $('tr.selected').each( function() {
                $scope.setQuizStatus( $(this).data('quizid'), 4, rowCount == curRow );
                curRow++;
            });
        }
    }

    $scope.editSelectedTile = function() {
        var quizId = $('input:checked').parent().parent().parent().parent().parent().data('quizid');
        $scope.editQuiz( quizId );
    }

    $scope.viewSelectedTile = function() {
        var quizLink = $('input:checked').parent().parent().parent().parent().parent().data('quizlink');
        window.open('https://quiz.leadquizzes.com/q/' + quizLink, '_blank');
    }

    $scope.exportSelectedTiles = function() {
        var quizIds = [];

        $('input:checked').each( function() {
            var quizId = $(this).parent().parent().parent().parent().parent().data('quizid');
            quizIds.push( quizId );
        });
        
        $scope.exportLeads( quizIds );
    }

    $scope.unpublishSelectedTiles = function() {
        var rowCount = $('input:checked').length;
        var curRow = 1;

        $('input:checked').each( function() {
            var quizId = $(this).parent().parent().parent().parent().parent().data('quizid');
            $scope.setQuizStatus( quizId, 1, rowCount == curRow );
            curRow++;
        });
    }

    $scope.publishSelectedTiles = function() {
        var rowCount = $('input:checked').length;
        var curRow = 1;

        $('input:checked').each( function() {
            var quizId = $(this).parent().parent().parent().parent().parent().data('quizid');
            $scope.setQuizStatus( quizId, 2, rowCount == curRow );
            curRow++;
        });
    }

    $scope.archiveSelectedTiles = function() {
        var rowCount = $('input:checked').length;
        var curRow = 1;

        $('input:checked').each( function() {
            var quizId = $(this).parent().parent().parent().parent().parent().data('quizid');
            $scope.setQuizStatus( quizId, 3, rowCount == curRow );
            curRow++;
        });
    }

    $scope.deleteSelectedTiles = function() {
        var rowCount = $('input:checked').length;
        var curRow = 1;

        if( confirm( 'Are you sure you want to delete the selected quizzes? This action cannot be undone' ) ) {
            $('input:checked').each( function() {
                var quizId = $(this).parent().parent().parent().parent().parent().data('quizid');
                $scope.setQuizStatus( quizId, 4, rowCount == curRow );
                curRow++;
            });
        }
    }

    $scope.getQuizzes();

    jquery.init();

}]);

controllers.controller('account', ['$scope', '$location', '$http', '$rootScope', 'user', 'jquery', 'alerts', function($scope, $location, $http, $rootScope, user, jquery, alerts) {

    $scope.isLoggedIn();

    $rootScope.bodyClass = 'inner responsive';
    $scope.user = user;
    $scope.input = [];
    $scope.alerts = alerts;

    $rootScope.userLogo  = user.getUserLogo();
    $scope.input.name    = user.getName();
    $scope.input.email   = user.getEmail();
    $scope.input.website = user.getWebsite();

    $scope.isAdmin = user.getRoleId() == 1;

    $scope.dropzoneConfig = {
        'options': { // passed into the Dropzone constructor
            'url': 'api/user/uploadUserLogo',
            'uploadMultiple': false,
            'clickable': '.uploadLogo',
            'previewTemplate': document.querySelector('#template-container').innerHTML,
            'acceptedFiles': 'image/*',
            'maxFilesize': 2
        },
        'eventHandlers': {
            'addedfile': function (file, xhr, formData) {
                $('.dz-preview').remove();
            },
            'success': function (file, response) {
                if( file.width != 251 || file.height != 28 ) {
                    alerts.fail(i18n.t('image_wrong_size'));
                } else {
                    var data = angular.fromJson( response );
                    $http.post('api/user/updateUserLogo', {
                        userId: user.getId(),
                        userLogo: data.userLogo
                    }).success(function(data) {
                        $scope.waiting = false;
                        if (data.status) {
                            $rootScope.userLogo = data.userLogo;
                            user.setUserLogo( data.userLogo );
                            $scope.logoSaveSuccess = true;
                        } else {
                            if (_.isEmpty(data.errors)) {
                                data.errors = i18n.t('fill_out_login');
                            }
                            _.forEach(data.errors, function(error) {
                                if (error != null) {
                                    alerts.fail(i18n.s(error.type, error.field));
                                }
                            });
                        }
                    });
                }
            },
            'error': function () {
                alerts.fail(i18n.t('image_err'));
            }
        }
    };

    $scope.updateUser = function() {
        $('.input[type=password]').parent().removeClass('is-success').removeClass('has-error');

        $http.post('api/user/updateUserInfo', {
            userId: user.getId(),
            name: $scope.input.name,
            email: $scope.input.email,
            website: $scope.input.website
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                user.setName($scope.input.name);
                user.setEmail($scope.input.email);
                user.setWebsite($scope.input.website);
                $scope.infoSaveSuccess = true;
            } else {
                $('.input.required-email').parent().addClass('has-error');
            }
        });
    }

    $scope.updatePassword = function() {
        var isValid = true;

        if( !$scope.input.oldpass ) {
            isValid = false;
            alerts.fail(i18n.t('no_orig_pass'));
            $('#opass').focus( function() { $('#opass').parent().removeClass('has-error'); }).parent().addClass('has-error');
        }

        if( !$scope.input.newpass ) {
            isValid = false;
            alerts.fail(i18n.t('no_new_pass'));
            $('#newpass').focus( function() { $('#newpass').parent().removeClass('has-error'); }).parent().addClass('has-error');
        }

        if( !$scope.input.newpass2 ) {
            isValid = false;
            alerts.fail(i18n.t('no_repeat_pass'));
            $('#newpass2').focus( function() { $('#newpass2').parent().removeClass('has-error'); }).parent().addClass('has-error');
        }

        if( isValid && $scope.input.newpass != $scope.input.newpass2 ) {
            isValid = false;
            alerts.fail(i18n.t('no_pass_match'));
            $('#newpass').focus( function() { $('#newpass').parent().removeClass('has-error'); }).parent().addClass('has-error');
            $('#newpass2').focus( function() { $('#newpass2').parent().removeClass('has-error'); }).parent().addClass('has-error');
        }

        if( !isValid ) return false;

        $http.post('api/user/updatePassword', {
            userId: user.getId(),
            oldpass: $scope.input.oldpass,
            newpass: $scope.input.newpass,
            newpass2: $scope.input.newpass2
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $('.has-error').removeClass('has-error');
                $('.input[type=password]').parent().addClass('is-success');
            } else {
                $('.input[type=password]').parent().addClass('has-error');
                if (_.isEmpty(data.errors)) {
                    alerts.fail(i18n.t('invalid_orig_pass'));
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    jquery.init();

}]);

controllers.controller('integration', ['$scope', '$location', '$http', '$rootScope', 'user', 'jquery', 'alerts', function($scope, $location, $http, $rootScope, user, jquery, alerts) {

    $scope.isLoggedIn();

    $rootScope.bodyClass = 'inner responsive';
    $scope.user = user;
    $scope.input = [];

    if( user.getRoleId() == 1 ) {
        $location.path('#/home');
    }

    jquery.init();

    $scope.getIntegrationVendors = function() {
        $http.post('api/integration/getIntegrationVendors', {
            userId: user.getId()
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.vendors = data.vendors;
                $scope.activeVendors = [];
                $scope.availableVendors = [];

                _.forEach($scope.vendors, function(vendor) {
                    if (!_.isUndefined(vendor.integrationId) && vendor.integrationId != null) {
                        $scope.activeVendors.push(vendor);
                    } else {
                        if( vendor.oauthKey ) {
                            $scope.getAuthorizationUrl(vendor);
                        } else {
                            $scope.availableVendors.push(vendor);
                        }
                    }
                });
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('data_error');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.getAuthorizationUrl = function(vendor) {
        $http.post('api/integration/getAuthorizationUrl', {
            userId: user.getId(),
            vendorReferenceName: vendor.vendorReferenceName,
            oauthKey: vendor.oauthKey,
            oauthSecret: vendor.oauthSecret
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                vendor.authorizationUrl = data.url;
                $scope.availableVendors.push(vendor);
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('data_error');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.connectVendor = function() {
        var url = ( $scope.input.integrationId ) ? 'api/integration/updateIntegration' : 'api/integration/connectVendor';

        $http.post(url, {
            userId:               user.getId(),
            integrationId:        $scope.input.integrationId,
            vendorReferenceName:  $('#vendorReferenceName').val(),
            apiKey:               $('#apiKey').val(),
            username:             $('#username').val(),
            password:             $('#password').val(),
            token:                $('#token').val()
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.closeIntegrationWindow();
            } else {
               $('.integration-error').html(i18n.t('connect_vendor_error'));
            }
        });
    }

    $scope.closeIntegrationWindow = function() {
        $scope.getIntegrationVendors();
        $.fancybox.close();
    }

    $scope.deleteIntegration = function(integrationId) {
        if( confirm( 'Are you sure you want to delete this integration? This action cannot be undone' ) ) {
            $http.post('api/integration/deleteIntegration', {
                integrationId: integrationId
            }).success(function(data) {
                $scope.waiting = false;
                if (data.status) {
                    $scope.getIntegrationVendors();
                } else {
                    if (_.isEmpty(data.errors)) {
                        data.errors = i18n.t('data_error');
                    }
                    _.forEach(data.errors, function(error) {
                        if (error != null) {
                            alerts.fail(i18n.s(error.type, error.field));
                        }
                    });
                }
            });
        }
    }

    $scope.getIntegration = function(integrationId) {
        $http.post('api/integration/getIntegration', {
            integrationId: integrationId
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.input = data.integration[0];
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('data_error');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.getIntegrationVendors();

}]);

controllers.controller('error', ['$scope', '$location', '$http', '$rootScope', 'user', 'alerts', function($scope, $location, $http, $rootScope, user, alerts) {

    $rootScope.bodyClass = 'login-page front-page';
    $scope.alerts = alerts;

}]);

controllers.controller('templates', ['$scope', '$location', '$http', '$rootScope', 'user', 'quiz', function($scope, $location, $http, $rootScope, user, quiz) {

    $scope.isLoggedIn();

    $rootScope.bodyClass = 'inner responsive';
    $scope.user = user;


    $scope.$watch('input.industry', function (newValue, oldValue) {
        if( _.isUndefined(newValue) || newValue == null || newValue.industry == 'All') {
            $('[data-quizIndustry]').show();
        } else {
            $('[data-quizIndustry]').hide().filter('[data-quizIndustry="' + newValue.industry + '"]').show();
        }
    });

    $scope.getIndustryList = function() {
        $http.post('api/quiz/getIndustryList', {

        }).success(function(data) {
            if (data.status) {
                $scope.industries = data.industries;
            } else {

            }
        });
    };

    $scope.getQuizzes = function() {
        $http.post('api/quiz/getQuizzesByUserId', {
            userId: 1
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.quizzes = data.quizzes;

                _.forEach($scope.quizzes, function(quiz) {
                    quiz.imageId = quiz.imageId != 0 && quiz.imageId != null ? quiz.imageId : 'quiz-default.jpg';
                });
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.useTemplate = function(quizId) {
        $http.post('api/quiz/duplicateQuiz', {
            userId: user.getId(),
            quizId: quizId
        }).success(function(data) {
            $scope.waiting = false;

            if (data.status) {
                quiz.clear();
                quiz.setId(data.quizId);
                $location.path('quiz-title');
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.getIndustryList();
    $scope.getQuizzes();

}]);

controllers.controller('administrator', ['$scope', '$location', '$http', 'user', function($scope, $location, $http, user) {

    $scope.user = user;
    
    $scope.information = function() {
        $http.post('api/user/information', {
            token: $scope.user.token
        }).success(function(data) {
            if (data.status) {
                alert(data.message);
            } else {

            }
        });
    };

}]);

controllers.controller('users', ['$scope', '$location', '$http', 'user', 'alerts', '$rootScope', 'jquery', 'DTOptionsBuilder', 'DTColumnDefBuilder', function($scope, $location, $http, user, alerts, $rootScope, jquery, DTOptionsBuilder, DTColumnDefBuilder) {

    $scope.isLoggedIn();

    $rootScope.bodyClass = 'inner responsive';
    $scope.user = user;

    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withPaginationType('full_numbers')
        .withDisplayLength(100)
        .withOption('order', [1, 'asc'])
        .withDOM('trpi'); // pitrfl

    $scope.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0).notSortable().withOption('sWidth','20px'),
        DTColumnDefBuilder.newColumnDef(1).withOption('sWidth','50px'),
        DTColumnDefBuilder.newColumnDef(2).withOption('sWidth','150px'),
        DTColumnDefBuilder.newColumnDef(3).withOption('sWidth','110px'),
        DTColumnDefBuilder.newColumnDef(4).withOption('sWidth','280px'),
        DTColumnDefBuilder.newColumnDef(5).withOption('sWidth','120px'),
        DTColumnDefBuilder.newColumnDef(6).withOption('sWidth','150px'),
        DTColumnDefBuilder.newColumnDef(8).withOption('sWidth','130px'),
        DTColumnDefBuilder.newColumnDef(9).withOption('sWidth','120px'),
        DTColumnDefBuilder.newColumnDef(10).withOption('sWidth','120px') ];

    $scope.getUsers = function() {
        $http.post('api/user/getUsers', {

        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.users = data.users;

                _.forEach($scope.users, function(user) {
                    user.created = new Date(user.created);
                });

                $('#actions li').hide();
                $('#action-no-quiz').show();
                $('#new-admin').show();
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.setUserStatus = function( rowCount, curRow, userId, status ) {
        $http.post('api/user/setUserStatus', {
            userId: userId,
            status: status
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                curRow++;
                if( rowCount == curRow) $scope.getUsers();
            } else {
                curRow++;
                if( rowCount == curRow) $scope.getUsers();
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('fill_out_login');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.suspendSelected = function() {
        var rowCount = $('tr.selected').length;
        var curRow = 0;

        $('tr.selected').each( function() {
            $scope.setUserStatus( rowCount, curRow, $(this).data('userid'), 2 );
        });
    }

    $scope.activateSelected = function() {
        var rowCount = $('tr.selected').length;
        var curRow = 0;

        $('tr.selected').each( function() {
            $scope.setUserStatus( rowCount, curRow, $(this).data('userid'), 1 );
        });
    }

    $scope.createAdmin = function() {
        $http.post('api/user/registerAdmin', {
            username: $('#username').val(),
            password: $('#password').val()
        }).success(function(data) {
            $scope.waiting = false;
            if (data.status) {
                $scope.getUsers();
                $.fancybox.close();
            } else {
                if (_.isEmpty(data.errors)) {
                    data.errors = i18n.t('create_admin');
                }
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        $('.integration-error').html(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    }

    $scope.getUsers();

    jquery.init();

}]);

controllers.controller('user', ['$scope', '$timeout', '$location', '$http', '$routeParams', 'user', 'alerts', 'ngTableParams', function($scope, $timeout, $location, $http, $routeParams, user, alerts, ngTableParams) {

    $scope.user = user;
    $scope.alerts = alerts;
    $scope.input = {user: {roles: []}};

    $scope.user = function() {
        return 'partials/user.html';
    };

    $scope.read = function() {
        $http.post('api/user/read', {
            token: $scope.user.getToken(),
            id: $routeParams.id
        }).success(function(data) {
            if (data.status) {
                $scope.input = {user: data.user};
                $scope.tableParams.reload();
            }
        });
    };

    $scope.update = function(close) {
        $http.post('api/user/update', {
            token: $scope.user.getToken(),
            user: JSON.stringify($scope.input.user)
        }).success(function(data) {
            if (data.status) {
                if (_.isUndefined(close)) {
                    $scope.input = {user: data.user};
                    $scope.tableParams.reload();
                } else {
                    $location.path('administrator/users');
                }
                $scope.alerts.success(i18n.t('user_updated'));
            } else {
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    };

    $scope.getRoles = function() {
        $http.post('api/role/table', {
            token: $scope.user.getToken(),
            params: '{}'
        }).success(function(data) {
            if (data.status) {
                $scope.roles = data.roles;
            }
        });
    };

    $scope.addRole = function(role) {
        if (_.isEmpty(role)) {
            alerts.fail(i18n.t('enter_role_name'));
            return;
        }
        role = JSON.stringify(role.toLowerCase()).replace(/\W/g, '').trim();
        if (_.isEmpty(role)) {
            alerts.fail(i18n.t('enter_role_name'));
            return;
        }
        $scope.input.user.roles.push(role);
        $scope.tableParams.reload();
    };

    $scope.deleteRole = function(role) {
        $scope.input.user.roles = _.without($scope.input.user.roles, role);
        $scope.tableParams.reload();
    };
    
    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            role: 'asc'
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            params.total($scope.input.user.roles.length);
            $defer.resolve($scope.input.user.roles);
        }
    });

    $scope.cancel = function() {
        $location.path('administrator/users');
    };
    
}]);

controllers.controller('roles', ['$scope', '$location', '$http', 'user', 'alerts', 'ngTableParams', function($scope, $location, $http, user, alerts, ngTableParams) {

    $scope.user = user;
    $scope.alerts = alerts;
    $scope.input = {};
    $scope.tableLoaded = false;

    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            role: 'asc'
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            $http.post('api/role/table', {
                token: $scope.user.getToken(),
                params: JSON.stringify(params.$params)
            }).success(function(data) {
                params.total(data.total);
                $defer.resolve(data.roles);
                $scope.tableLoaded = true;
            });
        }
    });

    $scope.addRole = function(role) {
        if (_.isEmpty(role)) {
            alerts.fail(i18n.t('enter_role_name'));
            return;
        }
        role = JSON.stringify(role.toLowerCase()).replace(/\W/g, '').trim();
        if (_.isEmpty(role)) {
            alerts.fail(i18n.t('enter_role_name'));
            return;
        }
        $http.post('api/role/create', {
            token: $scope.user.getToken(),
            role: role
        }).success(function(data) {
            if (data.status) {
                $scope.tableParams.reload();
                $scope.alerts.success(i18n.t('role_added'));
            } else {
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    };

    $scope.deleteRole = function(role) {
        $http.post('api/role/delete', {
            token: $scope.user.getToken(),
            role: role
        }).success(function(data) {
            if (data.status) {
                $scope.tableParams.reload();
                $scope.alerts.success(i18n.t('role_deleted'));
            } else {
                _.forEach(data.errors, function(error) {
                    if (error != null) {
                        alerts.fail(i18n.s(error.type, error.field));
                    }
                });
            }
        });
    };

}]);

controllers.controller('role', ['$scope', '$location', '$http', '$routeParams', 'user', 'alerts', 'ngTableParams', function($scope, $location, $http, $routeParams, user, alerts, ngTableParams) {

    $scope.user = user;
    $scope.alerts = alerts;
    $scope.input = {resources: []};
    $scope.updateCount = 0;

    $scope.update = function(close) {
        $scope.failCount = 0;
        _.forEach($scope.input.resources, function(resource) {
            $scope.updateCount += 1;
            $http.post('api/role/update', {
                token: $scope.user.getToken(),
                role: $routeParams.role,
                resource: resource.name,
                permissions: JSON.stringify(resource.permissions)
            }).success(function(data) {
                if (!data.status) {
                    $scope.failCount += 1;
                    $scope.errors = data.errors;
                }
                $scope.updateCount -= 1;
                if ($scope.updateCount == 0) {
                    if (_.isUndefined(close)) {
                        $scope.tableParams.reload();
                    } else {
                        $location.path('administrator/roles');
                    }
                    if ($scope.failCount) {
                        _.forEach($scope.errors, function(error) {
                            if (error != null) {
                                alerts.fail(i18n.s(error.type, error.field));
                            }
                        });
                    } else {
                        alerts.success(i18n.t('role_updated'));
                    }
                }
            });
        });
    };

    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            resource: 'asc'
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            $http.post('api/resource/table', {
                token: $scope.user.getToken(),
                params: JSON.stringify(params.$params),
                role: $routeParams.role
            }).success(function(data) {
                $scope.input.resources = data.resources;
                params.total(data.total);
                $defer.resolve(data.resources);
            });
        }
    });

    $scope.cancel = function() {
        $location.path('administrator/roles');
    };

}]);