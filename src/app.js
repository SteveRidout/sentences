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
		fragments,
		letterIndex,
		letters,
		fragmentsByWord,
		easiness;

	var fetchWords = function (numberOfWords) {
		fragments = [],
		letterIndex = 0,
		letters = [],
		fragmentsByWord = {};

		$('.mainContainer').hide();

		readlang.fetchWords(numberOfWords, function (data) {
			userWords = data;

			easiness = 0;

			if (userWords.length === 0) {
				alert('No words left to test in ' + selectedLanguageName +
					' right now, go to readlang.com and translate some more words.');
			}

			_.each(userWords, function (userWord) {
				if (userWord.contexts && userWord.contexts.length > 0) {
					var context = userWord.contexts[
						Math.floor(Math.random() * userWord.contexts.length)];
					var frag = {
							userWord: userWord,
							$el: $('<span class="frag">').html(
								context.text.replace(new RegExp(userWord.word.toLowerCase(), 'i'),
									_.map(userWord.word, function (letter) {
										letterIndex++;
										return '<span data-l="' + letterIndex + '">' +
											letter + '</span>';
									}).join(''))),
							opacity: 0,
							opacityVel: 0.04
						};

					var fontFamilies = [
							"Times New Roman",
							"Georgia",
							"Helvetica",
							"Open Sans",
							"Courier"
						];

					frag.$el.css({
						'margin-left': 5 + Math.random() * 35 + "%",
						'margin-right': 5 + Math.random() * 35 + "%",
						'margin-top': 10 + Math.random() * 10 + "px",
						'font-size': 15 + Math.round(Math.random() * 8) + "px",
						'font-family': fontFamilies[Math.round(5 * Math.random())]
					});
					fragments.push(frag);
					fragmentsByWord[userWord.word.toLowerCase()] = frag;
					$('.mainContainer').append(frag.$el);
				}
			});
			letters = $('[data-l]');
			$('.mainContainer').fadeIn(4000);
		});
	};

	$('.inputContainer .textInput').keyup(function (event) {
		console.log('keyup');
		if (event.which === 13) {
			var inputElement = $(event.target);
			var input = inputElement.val().toLowerCase();
			console.log('input:', input);

			var fragment = fragmentsByWord[input];
			if (fragment) {
				console.log('removing');
				fragment.$el.find('span[data-l]').css({
					color: '#fff',
					'border-bottom': 'none'
				});
				fragment.$el.addClass('correct').fadeOut(4000);
				delete fragmentsByWord[input];
				if (_.keys(fragmentsByWord).length === 0) {
					setTimeout(function () {
						fetchWords(10);
					}, 3000);
				}
				readlang.recallWord(fragment.userWord._id, 4, 0.3);
			} else {
				$('.wholeScreenOverlay').show().fadeOut(1000);
			}

			inputElement.val('');
		}
	}).focus();

	var TICK_PERIOD = 50;
	readlang.user(function (data) {
		user = data;

		fetchWords(10);

		setInterval(tick, TICK_PERIOD);
	});

	var luminosityMin = function (easiness) {
		return -2 + easiness * 1.5;
	};

	var luminosityMax = function (easiness) {
		return 0.7 + easiness * 0.3;
	};

	var uniformDistribution = function (from, to) {
		return from + (to - from) * Math.random();
	};

	var tick = function () {
		if (fragments.length === 0) {
			return;
		}

		// take 2 min to reach higher easiness of 1
		easiness = Math.min(1, easiness + 1 / (2 * 60 * 1000 / TICK_PERIOD));

		console.log('lum from %s to %s', luminosityMin(easiness), luminosityMax(easiness));

		for (var i=0; i<2; i++) {
			letterIndex = Math.round(Math.random() * letters.length) % letters.length;
			var luminosity = Math.round(Math.max(0,
					uniformDistribution(luminosityMin(easiness), luminosityMax(easiness)) * 255));
			var rgb = 'rgb(' + [luminosity, luminosity, luminosity].join(', ') + ')';

			if (!letters.eq(letterIndex).parent().hasClass('correct')) {
				letters.eq(letterIndex).css({
					color: 'rgb(' + [luminosity, luminosity, luminosity].join(', ') + ')'
				});
			}
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
