"use strict";

$(document).ready(function () {
	readlang.setup({
		baseURL: "https://readlang.com",
		APIKey: "a12345"
	});

	var logout = function () {
		readlang.logout(function () {
			window.location.reload();
		});
	};

	var user,
		userWords,
		
		fragments = [],
		
		letterIndex = 0,
		letters = [],
		
		fragmentsByWord = {};

	readlang.user(function (data) {
		user = data;

		readlang.fetchWords(10, function (data) {
			userWords = data;

			if (userWords.length === 0) {
				alert('No words left to test in ' + selectedLanguageName +
					' right now, go to readlang.com and translate some more words.');
			}

			_.each(userWords, function (userWord) {
				_.each(userWord.contexts, function (context) {
					var frag = {
							userWord: userWord,
							$el: $('<span class="frag">').html(
								context.text.replace(new RegExp(userWord.word.toLowerCase(), 'i'),
									_.map(userWord.word, function (letter) {
										console.log('letter in: ', letterIndex);
										letterIndex++;
										return '<span data-l="' + letterIndex + '">' + letter + '</span>';
									}).join(''))),
							opacity: 0,
							opacityVel: 0.04
						};
					var fontFamilies = ["Times New Roman", "Georgia", "Helvetica", "Open Sans", "Courier"];
					frag.$el.css({
						'margin-left': Math.random() * 300 + "px",
						'margin-right': Math.random() * 300 + "px",
						'margin-top': 10 + Math.random() * 10 + "px",
						'font-size': 16 + Math.round(Math.random() * 10) + "px",
						'font-family': fontFamilies[Math.round(5 * Math.random())]
					});
					fragments.push(frag);
					$('body').append(frag.$el);
					console.log('push ', frag.$el);
				});
			});

			letters = $('[data-l]');

			setInterval(tick, 50);
		});
	});

	var tick = function () {
		for (var i=0; i<2; i++) {
			letterIndex = Math.round(Math.random() * letters.length) % letters.length;
			var luminosity = Math.round(Math.max(0, -2 + 3 * Math.random()) * 255);
			var rgb = 'rgb(' + [luminosity, luminosity, luminosity].join(', ') + ')';
			console.log('lum: ', rgb);
			letters.eq(letterIndex).css({
				color: 'rgb(' + [luminosity, luminosity, luminosity].join(', ') + ')'
			});
		}
		
		/*
		_.each(fragments, function (frag) {
			frag.opacityVel *= 0.5;
			frag.opacityVel += -0.01 + Math.random() * 0.02;
			frag.opacity += frag.opacityVel;

			if (frag.opacity > 0.95) {
				frag.opacityVel = -0.02;
			} else if (frag.opacity < 0.05) {
				frag.opacityVel = +0.02;
			}
			frag.$el.css({opacity: frag.opacity});
		});
		*/
	};
});
