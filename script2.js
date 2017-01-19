/**
 * Project Name: Movies in a Snap!
 * File Name: script.js
 * Author: Collette Tamez, Daniel Lee, Dave Weizenegger, Kyle Marx
 * Date: 09/21/2016
 * Objective: Hackathon project involving the combination of different data sources into an application or game
 * Prompt: https://github.com/Learning-Fuze/c10_api_hackathon/
 * Special thanks to youTube, google, iTunes, Apple, The Movie Database, and andruxnet for the use of their APIs in this project
 * @name script.js
 * @version 1.0
 */

/**
 * Listen for the document to load and calls addEventHandlers function
 */
$(document).ready(function () {
    addEventHandlers();
});

/**
 * Adds click handler functions to button to the movie search (#movieInfo) and random movie (#random) buttons in DOM
 * Also adds a keyup handler for the enter key to activate the same function that handles the movie search function
 * @function addEventHandlers
 */
function addEventHandlers() {
    $("#movieInfo").click(searchForMovie);
    $('#search').keyup(function(e) {
        if (e.which === 13) {
            searchForMovie();
            $('#divForMusicPlayer').show().css({ display: 'inline-block' });
            $("input").val('');
        }
    });
    $("#random").click(generateQuoteAndMovieInfo);
    $("button").click(showHiddenElements);
    $("#hideThis").mouseover(hideMovieInfo);
    $("#hideThis").mouseout(displayMovieInfo);
}

/**
 * Handler for the AJAX calls to the different APIs based on a user input
 * Function will take the user-generated value in the text input (#search) and store the value. This stored value will
 * be used to call three functions that themselves make AJAX calls to retrieve more information on the movie input
 * @function searchForMovie
 */
function searchForMovie () {
    var search = $('#search').val();
    $("#divForQuote").empty();
    if(search === ''){
        generateQuoteAndMovieInfo();
    }else{
        retrieveDetailedMovieInfoFromTMDB(search);
        retrieveMovieTrailerFromYouTube(search);
        retrieveMusicFromITunes(search);
    }
    $("input").val('');
}

/**
 * Makes an AJAX call to famous quotes API to retrieve a random movie quote and the movie it is from.
 * This then calls the retrieveDetailedMovieInfoFromTMDB, retrieveMovieTrailerFromYouTube, and retrieveMusicFromITunes functions
 * on success to retrieve more information on the movie
 * @function generateQuoteAndMovieInfo
 */
function generateQuoteAndMovieInfo() {
    $.ajax({
        type: "POST",
        headers: {
            "X-Mashape-Key": "OivH71yd3tmshl9YKzFH7BTzBVRQp1RaKLajsnafgL2aPsfP9V"
        },
        dataType: 'json',
        url: 'https://andruxnet-random-famous-quotes.p.mashape.com/?cat=movies'
    }).then(function(res) {
        var quote = res.quote;  //local variable that holds value of the key "quote" in the response object
        var movie = res.author; //local variable that holds value of the key "author" (which happens to be the movie the quote is from) in the response object
        $('#search').val('');
        $("#divForQuote").empty();
        $("<h2>").text('"' + quote + '"').appendTo("#divForQuote");
        retrieveDetailedMovieInfoFromTMDB(movie);
        retrieveMovieTrailerFromYouTube(movie);
        retrieveMusicFromITunes(movie);
    })
}

/**
 * Makes a request to The Movie Db to return search results via AJAX
 * @function retrieveDetailedMovieInfoFromTMDB
 * @param movie - the name of the movie we are trying to get more information about
 */
function retrieveDetailedMovieInfoFromTMDB(movie) {
    /** local variable that holds the data to send to The Movie DB database API in the first AJAX call */
    var dataToSendServerForFirstCall = {
        api_key: "7e73e5037ed00682f5aae1e5b6d940a4",
        query: movie
    };
    /** local variable that holds the data to send to The Movie DB database in the second AJAX call */
    var dataToSendServerForSecondCall  = {
        api_key: "7e73e5037ed00682f5aae1e5b6d940a4"
    };
    $.ajax({
        data: dataToSendServerForFirstCall,
        dataType: "JSON",
        method: "GET",
        url: "https://api.themoviedb.org/3/search/movie?",
        /**
         * lets the user know their search was invalid
         * @param response
         */
        error: function (response) {
            $("<h1>").text("We couldn't find anything!").appendTo("#divForQuote");
        }
        /**
         * executes on success of first AJAX call
         * @param response
         */
    }).then(function (response) {
        var result = response.results[0];   //local variable that stores the object at index zero of the key "results" array in response object
        var movieID = result.id;        //local variable that stores the value of the key id in the results variable
        var urlForMovieData = 'https://api.themoviedb.org/3/movie/' + movieID + '?';    //stores the url to be sent to the data base that includes the necessary path parameter
        /** AJAX call to The Movie DB API to retrieve detailed movie information */
        $.ajax({
            data: dataToSendServerForSecondCall,
            dataType: "JSON",
            method: "GET",
            url: urlForMovieData,
            /**
             * lets the user know there was an error
             * @param response
             */
            error: function (response) {
                $("<h1>").text("We couldn't find anything!").appendTo("#divForQuote");
            },
            /**
             * Appends selected information to DOM on success of the AJAX call
             * @param response
             */
            success: function (response) {
                var movieData = response;   //local variable that stores the response object
                var moviePoster = "http://image.tmdb.org/t/p/original" + movieData.backdrop_path;  // local variable that concats URL needed to resolve a TMDB image and the backdrop_path image file path in response object
                $("#divForMovieTitle").empty();
                $("#divForSummary").empty();
                $("#divForTagline").empty();
                $("main").css('background-image', 'url(' + moviePoster + ')');
                $("<h1>").text(movieData.original_title).appendTo("#divForMovieTitle");
                $("<h2>").text(movieData.tagline).appendTo("#divForTagline");
                $("<h3>").text("Released: " + movieData.release_date).appendTo("#divForSummary");
                $("<p>").text(movieData.overview).appendTo("#divForSummary");
            }
        })
    })
}

/**
 * This function updates the movie trailer by searching for an video official movie trailer of the given movie on youTube.
 * The function will take a movie title (keyword) and appends the phrase ' official trailer' to the search term.
 * The video's ID is stored and then used in the appropriate attributes (href, data-videoid, and src) in the iframe video on the index to allow the movie to play.
 * Note that this sample limits the results to 1.
 * @function retrieveMovieTrailerFromYouTube
 * @param {string} movie - the name of the movie we are trying to retrieve a trailer for
 */
function retrieveMovieTrailerFromYouTube(movie) {
    movie += ' official trailer';
    var result = null;
    $.ajax({
        dataType: 'jsonp',
        url: 'https://www.googleapis.com/youtube/v3/search',
        method: 'get',
        data: {
            key: 'AIzaSyCJxCXv2qoUoEDzB7_GvxXJe_SqCJT_KJg',
            q: movie,
            part: 'snippet',
            maxResults: 1
        },
        /**
         * adds attributes for the youTube video on success of the AJAX call
         * @param response
         */
        success: function (response) {
            var videoId = response.items[0].id.videoId;     //video id for the movie trailer we found
            var hrefBeginning = '//www.youtube.com/watch?v=';       //start to the href attribute for the video
            var srcBeginning = 'https://www.youtube.com/embed/';         //start to the src attribute for the video
            var srcEnding = '?cc_load_policy=1&amp;controls=2&amp;rel=0&amp;hl=en&amp;enablejsapi=1&amp;origin=https%3A%2F%2Fsupport.google.com&amp;widgetid=1';    //ending to th esrc attribute for the video

            $('#youTubeVid').attr({'href': hrefBeginning + videoId, 'data-videoid': videoId, 'src': srcBeginning + videoId + srcEnding});   //adding of the gathered attributes to the video element
        }
    });
}

/**
 * Function to update the music player's attributes by making an AJAX call to iTunes
 * @function retrieveMusicFromITunes
 * @param {string} movie - the name of the movie we are trying to retrieve a trailer for
 */
function retrieveMusicFromITunes(movie) {
    var url = "https://itunes.apple.com/search?media=music&order=popular&term=" + movie + " soundtrack&callback=?";
    $.getJSON(url, function (data) {
        $('#musicSrc').attr('src', data.results[0].previewUrl);
        $('#musicImg').attr('src', data.results[0].artworkUrl100);
        $('#artistName').text(data.results[0].artistName);
        $('#music').attr('src', data.results[0].previewUrl);
    });
}
/**
 * Function to hide the movie info when the hover button is hovered
 * @function hideMovieInfo
 */
function hideMovieInfo() {
    $("#holdContent").css({
        opacity: 0,
        transition: "all 1s"
    });
}
/**
 * Function to show the movie info when the hover button is not hovered
 * @function displayMovieInfo
 */
function displayMovieInfo() {
    $("#holdContent").css({
        opacity: 1,
        transition: "all 1s"
    })
}
/**
 * Function to show elements hidden on initialization, namely the music player and the hide button, when the first movie's data is populated
 * @function showHiddenElements
 */
function showHiddenElements() {
    $("#hideThis").css({
        display: "initial"
    });
    $("#divForMusicPlayer").css({
        display: "inline-block"
    });
}