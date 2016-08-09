// variables //
// global returned values to be persisted to db //
var subscribers;
var avgViews;
var avgComments;
var videosPerWeek;

// global variables needed to calculate
var dump = require('utils').dump;
var functions = require('./functions.js');
var links = [];;
var views = [];
var comments = [];
var youtubeUrl = "https://www.youtube.com"; 

// functions \\
function getSubscribers() {
	var subscribersSpan = $("span[class*='subscriber-count']");
    return subscribersSpan.html();
}

function getLinks() {
    var posts = $("a[href*='watch']").has("img");
    return Array.prototype.map.call(posts, function (link) {
        return link.getAttribute('href');
    });
}

function getViews() {
	var viewsDiv = $("div:contains('views'):not(:has(*))");
	var views = viewsDiv.html();
	var viewIndex = views.indexOf("views");
	return views.substring(0, viewIndex);
}

function getComments() {
	var commentsInner = $("b:contains('Comments')");
	var commentsExp = commentsInner.parent().text();
	var commentsNum = commentsExp.match(/\d/g);
	return commentsNum.join();
}

function getDate() {
	var dateEl = $("*:contains('Published on'):not(:has(*))");
	var dateString = dateEl.html();
	var i = "Published on".length;
	var date = dateString.substring(i);
	var milliDif = new Date() - new Date(date);
	return Math.round(((milliDif/1000)/3600)/24);
}


// casper //
var casper = require('casper').create({
	clientScripts: ["/Users/lainekendall/jquery/jquery-3.0.0.min.js"]
});
casper.options.waitTimeout = 20000;

var youtubeUsername = casper.cli.get(0);
casper.start(youtubeUrl + "/user/" + youtubeUsername + "/videos");
var videoIndex = 0;
casper.then(function() {
	subscribers = this.evaluate(getSubscribers);
	links = this.evaluate(getLinks);
	this.eachThen(links, function() {
		this.thenOpen(youtubeUrl + links[videoIndex], function() {
			this.page.scrollPosition = { top: this.page.scrollPosition["top"] + document.body.scrollHeight, left: 0 };
			views.push(this.evaluate(getViews));
			var x = require('casper').selectXPath;
			casper.waitForSelector(x("//*[text()='Comments']"), function() {
				comments.push(this.evaluate(getComments));
			});
		});
		videoIndex++;
	});
});

casper.then(function() {
	totalDays = this.evaluate(getDate);
	totalWeeks = totalDays / 7;
	videosPerWeek = videoIndex / totalWeeks;
});

// test //

casper.run(function () {
	subscribers = functions.convertIntoNumber(subscribers);
	var viewsNum = [];
	viewsNum = views.map(functions.convertIntoNumber);
	avgViews = functions.avgArray(viewsNum);
	var commentsNum = [];
	commentsNum = comments.map(functions.convertIntoNumber);
	avgComments = functions.avgArray(commentsNum);

	var JSONObj = {"youtube": 
		{"username": youtubeUsername, 
		 "subscribers": subscribers,
		 "avgViews": avgViews,
		 "avgComments": avgComments,
		 "videosPerWeek": videosPerWeek}};
	dump(JSONObj);
	
	this.done();
});






