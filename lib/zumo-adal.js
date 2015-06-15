(function() {
	'use strict';
	
	angular.module('ZumoAdal')
	.provider('ZUMOAuthentication', function () {

        var _config = null;

        this.init = function (config, httpProvider) {

            _config = config || {};

            if (httpProvider && httpProvider.interceptors) {
                httpProvider.interceptors.push('ZUMOAuthInterceptor');
            }
        };

        this.$get = ['$injector', '$q', 'adalAuthenticationService', function ($injector, $q, adalAuthenticationServiceProvider) {
            return {
                getResourceForUrl: function (url) {
                    var endpoint = this.getEndpointForUrl(url);
                    return _config.endpoints[endpoint];
                },
                getEndpointForUrl: function(url) {
                    if (_config && _config.endpoints) {
                        for (var currentEndpoint in _config.endpoints) {
                            if (url.indexOf(currentEndpoint) > -1) {
                                return currentEndpoint;
                            }
                        }
                    }
                },
                getAADToken: function (url) {
                    var resource = this.getResourceForUrl(url);
                    return adalAuthenticationServiceProvider.acquireToken(resource);
                },
                getConfig: function () {
                    return _config;
                },
                acquireToken: function (url) {
                    var $http = $injector.get('$http');
                    var defer = $q.defer();
                    var endpointUrl = this.getEndpointForUrl(url);
                    var loginUrl = endpointUrl + 'login/aad';

                    var token = this.getAADToken(url).then(function (token) {

                        $http.post(loginUrl,
                            JSON.stringify({
                                "access_token": token
                            })
                        ).
                        success(function (data, status, headers, config) {
                            defer.resolve(data.authenticationToken);
                        }).
                        error(function (data, status, headers, config) {
                            alert(data);
                        });
                    });

                    return defer.promise;
                }
            };
        }
        ];

    }).

    .factory('ZUMOAuthInterceptor', ['$q', 'ZUMOAuthentication', function ($q, ZUMOAuthentication) {
        return {
            request: function (config) {
                var defer = $q.defer();
                var endpointUrl = ZUMOAuthentication.getEndpointForUrl(config.url);

                var isZUMOEndpoint = (endpointUrl != undefined) ? true: false;

                if (isZUMOEndpoint && config.url.indexOf('/login/aad') == -1) {
                    ZUMOAuthentication.acquireToken(config.url).then(function (token) {
                        config.headers['X-ZUMO-AUTH'] = token;

                        defer.resolve(config);
                    });
                    return defer.promise;
                } else {
                    return config;
                }
            }
        }
    }])
})();