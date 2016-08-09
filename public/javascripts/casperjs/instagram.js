
// variables //
// global returned values to be persisted to db //
var followers;
var avgLikes; // for photos
var photoIndex = 0; 
var avgViews; // for videos
var videoIndex = 0;
var avgComments;
var totalNumPosts;
var postsPerDay;
var postIndex = 0; // for this many posts

// variables that have to be global to calculate other values //
var likes = [];
var views = [];
var comments = [];
var dump = require('utils').dump;
var functions = require('./functions.js');
var instagramUrl = 'https://www.instagram.com';


// functions //
function getFollowers() {
	var followersSpan = $("span:contains('followers'):not(:has(section))");
	var followers = $(":first-child", followersSpan);
    return followers.attr("title");
}

function getTotalNumPosts() {
	var postsSpan = $("span:contains('posts'):not(:has(section))");
	var posts = $(":first-child", postsSpan);
    return posts.html();
}

function getLinks() {
// Scrape the links from top-right nav of the website
    var posts = $("a:not('header a'):not('nav a')").has("*");
    return Array.prototype.map.call(posts, function (link) {
        return link.getAttribute('href');
    });
}

function getLikes() {
	var likesSpan = $( "span:contains('likes'):not(:has(section))" );
	if (likesSpan.length > 0) {
		var likes = $(":first-child", likesSpan);
		var likesString = likes.html();
		return likesString;
	}
}

function getViews() {
	var viewsSpan = $( "span:contains('views'):not(:has(section))" );
	if (viewsSpan.length > 0) {
		var views = $(":first-child", viewsSpan);
		var viewsString = views.html();
		return viewsString;
	}
}

function getComments() {
	var commentsButton = $("button:contains('view all')");
	if (commentsButton.length > 0) {
		var commentSpan = $(":first-child", commentsButton);
		return commentSpan.html();
	} else {
		var commentSection = $('ul').first();
		var comments = commentSection.children("li");
		return comments.length - 1;
	}
}

function getDate() {
	var time = $('time');
	if (time.length > 0) {
  	var totalDays;
  	var today = new Date();
		var datetime = time.attr("datetime");
		var i = datetime.indexOf("T");
    datetime = datetime.substring(0,i);
    var datePosted = new Date(datetime);
    var milliDif = today - datePosted;
    return Math.round(((milliDif/1000)/3600)/24);
	}
}

// casper //
var casper = require('casper').create({
	clientScripts: ["/Users/lainekendall/jquery/jquery-3.0.0.min.js"]
});
casper.options.waitTimeout = 2000000;
var instagramUsername = casper.cli.get(0);

casper.start(instagramUrl + '/' + instagramUsername);

// if there are more than 12 posts total, click the load more button
casper.then(function () {
	var x = require('casper').selectXPath;
	if (this.exists(x("//a[text()='Load more']"))) {
    	this.clickLabel('Load more', 'a');
	}
});

casper.then(function() {
	followers = this.evaluate(getFollowers);
	totalNumPosts = this.evaluate(getTotalNumPosts);
    links = this.evaluate(getLinks);
    this.eachThen(links, function() {
		this.thenOpen(instagramUrl + links[postIndex], function() {
			comments.push(this.evaluate(getComments));
			if (this.exists("video")) {
				videoIndex++;
				views.push(this.evaluate(getViews));
			} else {
				photoIndex++;
				likes.push(this.evaluate(getLikes));
			}
		});
		postIndex++;
	});
});

casper.then(function() {
	var totalDays = this.evaluate(getDate);
	postsPerDay = postIndex / totalDays;
});

casper.run(function () {
	followers = functions.convertIntoNumber(followers);
	totalNumPosts = functions.convertIntoNumber(totalNumPosts);
	var likesNum = [];
	var commentsNum = [];
	var viewsNum = [];
	commentsNum = comments.map(functions.convertIntoNumber);
	likesNum = likes.map(functions.convertIntoNumber);
	viewsNum = views.map(functions.convertIntoNumber);

	avgComments = functions.avgArray(commentsNum);
	avgLikes = functions.avgArray(likesNum);
	avgViews = functions.avgArray(viewsNum);

	var JSONObj = {"instagram":
		{"username": instagramUsername,
		 "followers": followers,
		 "totalPosts": totalNumPosts,
		 "postsPerDay": postsPerDay,
		 "avgLikes": avgLikes,
		 "avgViews": avgViews,
		 "avgComments": avgComments
			}};
	dump(JSONObj);

    casper.done();
});












