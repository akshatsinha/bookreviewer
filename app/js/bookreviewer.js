var app = angular.module('BookReviewer', ['ngRoute', 'ngSanitize']);
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
                $scope.totalItems = searchResults.totalItems;
                BookReviewerSvc.addSearchResultObject(searchResults).then(function(response) {
                    if (response) {
                        $location.path( "/searchresults" );
                    }
                });
            });
    };
});

app.controller('BookListDisplayController', function($scope, $q, $http, $location, $anchorScroll, BookReviewerSvc) {

    $scope.init = function() {
        $scope.searchResultsObj = BookReviewerSvc.getSearchResultObject();
        $scope.search_term = BookReviewerSvc.getSearchQuery();

        // Chitika Ad JS injection
        if (window.CHITIKA === undefined) {
            window.CHITIKA = { 'units' : [] };
        };
        var unit = {"calltype":"async[2]","publisher":"akshatsinha","width":120,"height":600,"sid":"Chitika Default"};
        var placement_id = window.CHITIKA.units.length;
        window.CHITIKA.units.push(unit);
        $scope.clicked_book(0);
        $location.hash('bookcard_blank');
        $anchorScroll();
    }

    $scope.searchAgainBook = function() {
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
                $scope.totalItems = searchResults.totalItems;
                BookReviewerSvc.addSearchResultObject(searchResults).then(function(response) {
                    if (response) {
                        $scope.init();
                    }
                });
            });
    }

    reset_vars = function() {
        var deferred = $q.defer();
        $scope.book_title = '';
        $scope.book_publisher = '';
        $scope.book_avg_rating = '';
        $scope.book_description = '';
        $scope.book_published_date = '';
        $scope.book_img_link = '';
        $scope.book_author_list = [];
        $scope.book_identifier_list = [];
        $scope.book_category_list = [];
        deferred.resolve(true);
        return deferred.promise;
    }

    $scope.clicked_book = function(index) {
        reset_vars().then(function(response) {
            if (response) {
                //console.log(index);
                //console.log($scope.searchResultsObj.items[index]);
                $scope.book_title = $scope.searchResultsObj.items[index].volumeInfo.title;
                $scope.book_publisher = $scope.searchResultsObj.items[index].volumeInfo.publisher;
                $scope.book_avg_rating = $scope.searchResultsObj.items[index].volumeInfo.averageRating;
                $scope.book_description = $scope.searchResultsObj.items[index].volumeInfo.description;
                $scope.book_published_date = $scope.searchResultsObj.items[index].volumeInfo.publishedDate;
                $scope.book_img_link = $scope.searchResultsObj.items[index].volumeInfo.imageLinks.thumbnail;
                $scope.book_author_list = $scope.searchResultsObj.items[index].volumeInfo.authors;
                $scope.book_identifier_list = $scope.searchResultsObj.items[index].volumeInfo.industryIdentifiers;
                $scope.book_category_list = $scope.searchResultsObj.items[index].volumeInfo.categories;
            }
        });
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
        // link: function(scope, elem, attrs) {
        //     elem.bind('click', function() {
        //         elem.css('border','2px solid yellow');
        //     });
        // }
    }
});

app.directive('bookcardblank', function() {
    return {
        restrict: 'AE',
        replace: true,
        templateUrl: 'bookcardblank.html',
    }
});
