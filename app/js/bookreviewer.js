var app = angular.module('BookReviewer', ['ngRoute']);
var googleAppKey = 'AIzaSyCjVcsszxwUZxF-ykzo91VmsB941OvHLwY';

app.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'search.html',
        controller: 'BookSearchCtrl'
    });

    $routeProvider.when('/searchresults', {
        templateUrl: 'searchresults.html',
        controller: 'BookListDisplayController'
    });

    $routeProvider.otherwise({redirectTo: '/'});
});


app.factory('BookReviewerSvc', function($q) {
    var searchResultObject = null;

    var addSearchResultObject = function(newObj) {
        var deferred = $q.defer();
        searchResultObject = newObj;
        deferred.resolve(true);
        return deferred.promise;
    }

    var getSearchResultObject = function() {
        return searchResultObject;
    }

    return {
        addSearchResultObject: addSearchResultObject,
        getSearchResultObject: getSearchResultObject
    };
});


app.controller('BookSearchCtrl', function($scope, $http, $location, BookReviewerSvc) {
    $scope.searchedText = '';
    $scope.totalItems = 0;

    $scope.searchBook = function() {
        if ($scope.searchedText == '') {
            console.log('empty string');
            return false;
        }
        console.log('Searching for: ' + $scope.searchedText);
        urlForTitleSearch = 'https://www.googleapis.com/books/v1/volumes?q=' + $scope.searchedText + '&key=' + googleAppKey + '&callback=JSON_CALLBACK';
        console.log('making call' + urlForTitleSearch);
        $http.jsonp(urlForTitleSearch)
            .success(function(searchResults) {
                console.log('success');
                $scope.totalItems = searchResults.totalItems;
                BookReviewerSvc.addSearchResultObject(searchResults).then(function(response) {
                    if (response)
                        $location.path( "/searchresults" );
                });
            });
    };
});


app.controller('BookListDisplayController', function($scope, $http, BookReviewerSvc) {

    $scope.init = function() {
        $scope.searchResultsObj = BookReviewerSvc.getSearchResultObject();
        console.log($scope.searchResultsObj);
    }

    $scope.clicked_book = function() {
        console.log($scope.index);
    }
});

app.directive('bookcard', function() {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            bookthumbnail: '=',
            booktitle: '=',
            bookdesc: '='
        },
        templateUrl: 'bookcard.html',
    }
});

app.directive('bookcardblank', function() {
    return {
        restrict: 'AE',
        replace: true,
        templateUrl: 'bookcardblank.html',
    }
});
