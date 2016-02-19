<!DOCTYPE html>
<html lang="en" ng-app="acs">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

        <title>Lead Quizzes</title>

        <link href="//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.0/css/smoothness/jquery-ui-1.10.0.custom.min.css" rel="stylesheet">
        <!--link href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet"-->
        <link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css" rel="stylesheet">
        <link href="//cdnjs.cloudflare.com/ajax/libs/ng-table/0.3.3/ng-table.min.css" rel="stylesheet">
        <link href="//cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.6.3/css/bootstrap-select.min.css" rel="stylesheet">
        <link href="//cdnjs.cloudflare.com/ajax/libs/ladda-bootstrap/0.9.4/ladda-themeless.min.css" rel="stylesheet">

        <link media="all" rel="stylesheet" href="/css/dndlist.css">
        <link media="all" rel="stylesheet" href="/css/jquery.fancybox-plus.css">
        <link media="all" rel="stylesheet" href="/css/style.css">

        <link rel="icon" type="image/png" href="/images/favicon.ico">
    </head>

    <body class="{{$root.bodyClass}}" ng-class="{'in-frame': $root.inFrame}">
        <div id="wrapper" ng-view ng-controller="root" ng-init="init()" autoscroll="true"></div>

        <script src="//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.1.0/lodash.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.0/jquery-ui.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/js/bootstrap.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/store.js/1.3.14/store.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.6/odometer.min.js"></script>

        <script src="/js/datatables.min.js"></script>

        <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.16/angular.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.16/angular-animate.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.16/angular-route.min.js"></script>        
        <script src="//cdnjs.cloudflare.com/ajax/libs/angular-ui/0.4.0/angular-ui.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.10.0/ui-bootstrap-tpls.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/ng-table/0.3.3/ng-table.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.6.3/js/bootstrap-select.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/ladda-bootstrap/0.9.4/spin.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/ladda-bootstrap/0.9.4/ladda.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>
        
        <script src="/js/angular-easyfb.min.js"></script>
        <script src="//cdn.jsdelivr.net/satellizer/0.12.5/satellizer.min.js"></script>

        <script src="/locales/en-US.js"></script>

        <script src="/js/angular-dropzone.js"></script>
        <script src="/js/angular-drag-and-drop-lists.js"></script>
        <script src="/js/angular-sanitize.min.js"></script>
        <script src="/js/ng-file-upload-shim.js"></script>
        <script src="/js/ng-file-upload.js"></script>

        <script src="/js/jquery.fancybox-plus.js"></script>
        <script src="/js/angular-fancybox-plus.js"></script>

        <script src="/js/jcf/jcf.js"></script>
        <script src="/js/jcf/jcf.file.js"></script>
        <script src="/js/jcf/jcf.radio.js"></script>
        <script src="/js/jcf/jcf.range.js"></script>
        <script src="/js/jcf/jcf.button.js"></script>
        <script src="/js/jcf/jcf.number.js"></script>
        <script src="/js/jcf/jcf.select.js"></script>
        <script src="/js/jcf/jcf.checkbox.js"></script>
        <script src="/js/jcf/jcf.textarea.js"></script>
        <script src="/js/jcf/jcf.scrollable.js"></script>

        <script src="/js/jcf/jcf.angular.js"></script>
        <script src="/js/dropzone.min.js"></script>
        <script src="/js/jquery.main.js"></script>

        <script src="/js/angular-datatables.min.js"></script>

        <script src="/js/application.js"></script>
        <script src="/js/services.js"></script>
        <script src="/js/controllers.js"></script>
        <script src="/js/filters.js"></script>
        <script src="/js/directives.js"></script>

        <script>
            // Load the SDK Asynchronously
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&appId=443980995726708&version=v2.5";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        </script>
    </body>
</html>