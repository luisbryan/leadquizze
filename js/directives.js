/* global _, angular, i18n, Ladda, Odometer */
'use strict';

angular.module('acs.directives', [])
.directive('menu', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var $this = jQuery(element);
            $this.find('li').has('ul').children('ul').addClass('collapse');
            $this.find('li').has('ul').children('a').on('click', function(e) {
                e.preventDefault();
                $(this).parent('li').toggleClass('active').children('ul').collapse('toggle');
                $(this).parent('li').siblings().removeClass('active').children('ul.in').collapse('hide');
            });
        }
    };
}])
.directive('i18n', [function() {
    return {
        restrict: 'A',
        priority: -1000,
        link: function(scope, element, attrs) {
            scope.$watch(function() {
                return attrs.i18n;
            }, function(newValue) {
                element.html(i18n.t(attrs.i18n));
            });
        }
    };
}])
.directive('i18nPlaceholder', [function() {
    return {
        restrict: 'A',
        priority: -1000,
        link: function(scope, element, attrs) {
            scope.$watch(function() {
                return attrs.i18nPlaceholder;
            }, function(newValue) {
                element.attr('placeholder', i18n.t(newValue));
            });
        }
    };
}])
.directive('loading', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs, ngModel) {
            var loaders = ['loaded'].concat(scope.$eval(attrs.loading));
            var watch = function(newValue) {
                if (_.every(loaders, function(loader) {
                    return ((loader == '') || (_.isUndefined(loader))) ? true : scope.$eval(loader);
                })) {
                    jQuery(element).removeClass('loading');
                    jQuery(element).css('opacity', 1);
                } else {
                    jQuery(element).css('opacity', 0.4);
                    jQuery(element).addClass('loading');
                }
            };
            _.forEach(loaders, function(loader) {
                scope.$watch(loader, watch);
            });
        }
    };
}])
.directive('selectpicker', [function() {
    return {
        require: 'ngModel',
        restrict: 'A',
        priority: 10,
        link: function(scope, element, attrs, ngModel) {
            jQuery(element).selectpicker();
            scope.$watch(function() {
                return ngModel.$modelValue;
            }, function(newValue) {
                jQuery(element).selectpicker('refresh');
            });
            scope.$watch(function() {
                return scope.$eval(attrs.options);
            }, function(newVal) {
                jQuery(element).selectpicker('refresh');
            });
        }
    };
}])
.directive('ladda', [function() {
    return {
        restrict: 'A',
        priority: -1,
        link: function(scope, element, attrs) {
            if (!_.isEmpty(attrs.i18nLadda)) {
                element.html(i18n.t(attrs.i18nLadda));
            }
            var ladda = Ladda.create(element[0]);
            element.addClass('ladda-button');
            element.attr('data-style', 'expand-right');
            element.attr('data-size', 1);
            scope.$watch(function() {
                return scope.$eval(attrs.ladda);
            }, function(newValue) {
                if (newValue) {
                    ladda.start();
                } else {
                    ladda.stop();                    
                }
            });
        }
    };
}])
.directive('confirm', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function(event) {
                if (window.confirm(i18n.t('are_you_sure'))) {
                    scope.$eval(attrs.confirm);
                }
            });
        }
    };
}]).directive('dropzone', function () {
  return function (scope, element, attrs) {
    var config, dropzone;

    config = scope[attrs.dropzone];

    // create a Dropzone for the element with the given options
    dropzone = new Dropzone(element[0], config.options);

    // bind the given event handlers
    angular.forEach(config.eventHandlers, function (handler, event) {
      dropzone.on(event, handler);
    });
  };
}).directive('fancybox', function ($compile, $http) {
    return {
        restrict: 'A',

        controller: function($scope) {
            $scope.openFancybox = function (url) {

                $http.get(url).then(function(response) {
                    if (response.status == 200) {

                        var template = angular.element(response.data);
                        var compiledTemplate = $compile(template);
                        compiledTemplate($scope);

                        $.fancybox.open({ content: template, type: 'html' });
                    }
                });
            };

            $scope.openIntegrationFancybox = function (vendorReferenceName) {
                var url = 'partials/integration/' + vendorReferenceName + '.html';
                $scope.openFancybox(url);
            };
        }
    };
}).directive('odometer', [function() {
    return {
        restrict: 'A',
        priority: -1,
        link: function(scope, element, attrs) {
            var odometer = new Odometer({el: element[0]});
            scope.$watch(attrs.odometer, function(newVal) {
              odometer.update(newVal);
            });
        }
    };
}]);