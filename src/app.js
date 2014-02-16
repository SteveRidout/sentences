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
		easiness,

		level = 1,
		countdown,
	
		WORDS_PER_SCREEN = 2;

	var fetchWords = function (numberOfWords) {
		fragments = [],
		letterIndex = 0,
		letters = [],
		fragmentsByWord = {};
		countdown = 60 * 1000;

		$('.mainContainer').empty();
		$('.mainContainer').hide();

		$('.level').text(level);

		readlang.fetchWords(numberOfWords, function (data) {
			userWords = data;

			easiness = 0;

			if (userWords.length === 0) {
				alert('No words left to test in ' + selectedLanguageName +
					' right now, go to readlang.com and translate some more words.');
			}

			_.each(userWords, function (userWord) {
				if (fragmentsByWord[userWord.word.toLowerCase()]) {
					return;
				}

				var context;
				if (userWord.contexts && userWord.contexts.length > 0) {
					context = userWord.contexts[
						Math.floor(Math.random() * userWord.contexts.length)];
				} else {
					context = {text: userWord.word};
				}

				var frag = {
						userWord: userWord,
						$el: $('<div class="frag">').html('</span><span class="translation">' +
							userWord.translation + '</span>' + '<span class="context">' +
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

				fragments.push(frag);
				$('.mainContainer').append(frag.$el);
				frag.$el.css({
					'margin-top': 20 + Math.random() * 15 + "px",
				});
				frag.$el.find('.context').css({
					'margin-left': 5 + Math.random() * 35 + "%",
					'margin-right': 27 + Math.random() * 13 + "%",
					'font-size': 15 + Math.round(Math.random() * 8) + "px",
					'font-family': fontFamilies[Math.round(5 * Math.random())]
				});
				fragmentsByWord[userWord.word.toLowerCase()] = frag;
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

				console.log('letters: ', letters.length);
				letters = letters.not(fragment.$el.find('[data-l]'));
				console.log('letters: ', letters.length);
				
				if (_.keys(fragmentsByWord).length === 0) {
					setTimeout(function () {
						level++;
						fetchWords(WORDS_PER_SCREEN + level);
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

		fetchWords(WORDS_PER_SCREEN + level);

		setInterval(tick, TICK_PERIOD);
	});

	var luminosityMin = function (easiness) {
		return -1.5 + easiness * 1.2;
	};

	var luminosityMax = function (easiness) {
		return 0.8 + easiness * 0.2;
	};

	var uniformDistribution = function (from, to) {
		return from + (to - from) * Math.random();
	};

	var gameOver = function () {
		setTimeout(function () {
			level = 1;
			fetchWords(WORDS_PER_SCREEN + level);
		}, 1000);
	};

	var tick = function () {
		if (fragments.length === 0) {
			return;
		}

		countdown -= TICK_PERIOD;

		if (countdown % 1000 === 0) {
			var seconds = countdown / 1000;
			$('.countdown').text(seconds);
		}

		if (countdown <= 0) {
			gameOver();
		}

		// take 2 min to reach higher easiness of 1
		easiness = Math.min(1, easiness + 1 / (60 * 1000 / TICK_PERIOD));

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
	};
});
