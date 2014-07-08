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
    var searchQuery = null;

    var addSearchResultObject = function(newObj) {
        var deferred = $q.defer();
        searchResultObject = newObj;
        deferred.resolve(true);
        return deferred.promise;
    }

    var getSearchResultObject = function() {
        return searchResultObject;
    }

    var setSearchQuery = function(newObj) {
        searchQuery = newObj;
    }

    var getSearchQuery = function() {
        return searchQuery;
    }

    return {
        addSearchResultObject: addSearchResultObject,
        getSearchResultObject: getSearchResultObject,
        setSearchQuery: setSearchQuery,
        getSearchQuery: getSearchQuery
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
        BookReviewerSvc.setSearchQuery($scope.searchedText);
        console.log('Searching for: ' + $scope.searchedText);
        urlForTitleSearch = 'https://www.googleapis.com/books/v1/volumes?q=' + $scope.searchedText + '&key=' + googleAppKey + '&callback=JSON_CALLBACK&maxResults=20';
        console.log('making call' + urlForTitleSearch);
        $http.jsonp(urlForTitleSearch)
            .success(function(searchResults) {
                console.log('success');
                $scope.totalItems = searchResults.totalItems;
                BookReviewerSvc.addSearchResultObject(searchResults).then(function(response) {
                    if (response) {
                        $location.path( "/searchresults" );
                    }
                });
            });
    };
});

app.controller('BookListDisplayController', function($scope, $http, BookReviewerSvc) {

    $scope.init = function() {
        $scope.searchResultsObj = BookReviewerSvc.getSearchResultObject();
        $scope.search_term = BookReviewerSvc.getSearchQuery();
        console.log($scope.searchResultsObj);
    }

    $scope.clicked_book = function() {
        console.log($scope.bookindex);
    }
});

app.directive('bookcard', function() {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            bookthumbnail: '=',
            booktitle: '=',
            bookdesc: '=',
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
