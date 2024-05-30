let song, fft, innerRadius, randomImage, bgVideo;
var bgImages = [], bgVideos = [];
var particles = [];
let playButtonSize = 100;

/*function preload() {
	for (var i = 1; i <= 15; i++) {
		var imageName = `images/bg/bg${i}.jpg`; // Формирование имени файла изображения
		bgImages.push(imageName);
	}

	// Выбор случайного изображения из массива
	var randomIndex = floor(random(0, bgImages.length));
	randomImage = loadImage(bgImages[randomIndex]);
}*/ //фото

// ВИДЕО
function preload() {
	for (var i = 1; i <= 4; i++) {
		var videoName = `images/bg/vid${i}.mp4`; // Формирование имени файла видео
		bgVideos.push(videoName);
	}
	selectRandomVideo();
}

// Функция выбора случайного ВИДЕО
function selectRandomVideo() {
	if (bgVideo) {
		bgVideo.remove(); // Удаление текущего видео, если оно существует
	}
	var randomIndex = floor(random(0, bgVideos.length));
	bgVideo = createVideo(bgVideos[randomIndex]);
	bgVideo.hide();
}

function setup() {
	var canvas = createCanvas(windowWidth, windowHeight);
	canvas.position(0, 0);
	canvas.style('z-index', '-1');
	angleMode(DEGREES);
	imageMode(CENTER);
	rectMode(CENTER);
	fft = new p5.FFT(0.3);

	//randomImage.filter(BLUR, 10); для фото

	const loadButton = document.getElementById('loadButton');
	loadButton.addEventListener('click', handleLoadButtonClick);

	const playButtonContainer = document.getElementById('playButtonContainer');

	// Исчезновение кнопки play после её нажатия и появление при наведении курсора
	playButtonContainer.addEventListener('click', () => {
		playButtonContainer.classList.add('hide');

		playButtonContainer.addEventListener('mouseenter', () => {
			playButtonContainer.classList.add('hover');
		});

		playButtonContainer.addEventListener('mouseleave', () => {
			playButtonContainer.classList.remove('hover');
		});

		// ВИДЕО
		bgVideo.loop(); // Зациклить видео
		bgVideo.volume(0); // Отключить звук видео
	});

	// Свертка и развертка поля для ссылки
	const collapseButton = document.getElementById('pointerButton');

	collapseButton.addEventListener('click', () => {
		const sketchContainer = document.getElementById('sketch-container');
		sketchContainer.classList.toggle('collapsed');
	});

	const inputContainer = document.querySelector('.input-container');
	inputContainer.appendChild(collapseButton);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function handleLoadButtonClick() {
	const videoUrlInput = document.getElementById('videoUrlInput');
	const videoUrl = videoUrlInput.value;

	if (videoUrl) {
		const sketchContainer = document.getElementById('sketch-container');
		sketchContainer.classList.add('collapsed');
		const strokeSolid = document.querySelector('.stroke-solid');
		strokeSolid.classList.add('loading');

		const playButtonContainer = document.getElementById('playButtonContainer');
		playButtonContainer.classList.remove('hidden');
		playButtonContainer.classList.add('disabled');
		const icon = playButtonContainer.querySelector('.icon');
		icon.style.display = 'none';


		fetchAudioAndPlay(videoUrl).then(() => {
			// Задержка в 2 сек. для подгрузки буфера с аудио
			setTimeout(() => {
				strokeSolid.classList.remove('loading');
				playButtonContainer.classList.remove('disabled');
				icon.style.display = 'block';
			}, 2000);
		});
	} else {
		console.log('Введите ссылку на YouTube видео');
	}
}


function stopSong() {
	if (song) {
		song.stop(); // Остановка текущего трека
		noLoop(); // Сброс анимации
	}
}

async function fetchAudioAndPlay(videoUrl) {
	stopSong();

	const response = await fetch(`/audio?url=${encodeURIComponent(videoUrl)}`);
	const data = await response.json();

	if (data.success) {
		const audioFilePath = decodeURIComponent(data.audioUrl);
		const playButtonContainer = document.getElementById('playButtonContainer');
		song = loadSound(audioFilePath, () => {
			console.log('Аудио загружено и готово к воспроизведению.');
			// Появление кнопки Play, когда Аудио загружено и готово к воспроизведению
			playButtonContainer.classList.add('hover');
		});

		//ВИДЕО
		selectRandomVideo(); // Выбор нового видео
		bgVideo.loop(); // Зациклить новое видео
		bgVideo.volume(0); // Отключить звук

	} else {
		const errorMessage = 'Ошибка при получении ссылки на YouTube: ' + data.error;
		alert(errorMessage);
		console.error('Ошибка при получении URL аудио:', data.error);
	}
}

function draw() {
	background(0);

	translate(width / 2, height / 2);

	fft.analyze();
	let amp = fft.getEnergy(20, 200);

	push()
	if(amp > 230) {
		rotate(random(-0.9, 0.9));
	}

	//image(randomImage, 0, 0, width + 100, height + 100); //фон-фото
	image(bgVideo, 0, 0, width + 100, height + 100); //теперь фон ВИДЕО
	pop()

	let alpha = map(amp, 0, 255, 100, 150);
	fill(0, alpha);
	noStroke();
	rect(0, 0, width, height);

	stroke(255);
	strokeWeight(3); // толщина границы окружности
	noFill();

	// Рисуем внешнюю окружность
	var outerWave = fft.waveform()
	var outerRadius = 350; // радиус внешней окружности
	var outerAmp = 150; // амплитуда колебания для внешней окружности

	for (t = -1; t <= 1; t += 2) {
		beginShape();
		for (i = 0; i<= 180; i+=0.5) {
			var index = floor(map(i, 0, 180, 0, outerWave.length - 1));

			var r = map(outerWave[index], -1, 1, outerAmp, outerRadius);

			var x = r * sin(i) * t;
			var y = r * cos(i);

			var c = color('#f2f3f4');

			stroke(c);
			vertex(x, y);
		}
		endShape();
	}

	// Рисуем внутреннюю окружность
	var innerWave = fft.waveform()
	innerRadius = 300; // радиус внутренней окружности
	var innerAmp = 100; // амплитуда колебания для внутренней окружности

	for (t = - 1; t <= 1; t +=2) {
		beginShape();
		for (i = 0; i<= 180; i+=0.5) {
			var index = floor(map(i, 0, 180, 0, innerWave.length - 1));

			var r = map(innerWave[index], -1, 1, innerAmp, innerRadius);

			var x = r * sin(i) * t;
			var y = r * cos(i);

			var c = color('#f2f3f4');

			stroke(c);
			vertex(x, y);
		}
		endShape();
	}

	let numNewParticles = 2; // объем(кол-во) частиц

	for (let i = 0; i < numNewParticles; i++) {
		let p = new Particle();
		particles.push(p);
	}

	for (let i = 0; i < particles.length; i++) {
		if (!particles[i].edges()) {
			particles[i].update(amp > 230);
			particles[i].show();
		} else {
			particles.splice(i, 1);
		}
	}
}

class Particle {
	constructor() {
		this.pos = p5.Vector.random2D().mult(250)
		this.vel = createVector(0, 0);
		this.acc = this.pos.copy().mult(random(0.0005, 0.0001)); //скорость движения

		this.w = random(3,5);
		this.color = [random(200,255), random(200,255), random(200,255),]
	}
	update(cond) {
		this.vel.add(this.acc);
		this.pos.add(this.vel);
		if (cond) {
			for (var i = 0; i < 8; i++) {
				this.pos.add(this.vel);
			}
		}
	}
	edges() {
		return this.pos.x < -width / 2 || this.pos.x > width / 2 ||
			this.pos.y < -height / 2 || this.pos.y > height / 2;
	}
	show() {
		noStroke();
		fill(this.color);
		ellipse(this.pos.x, this.pos.y, this.w);
	}
}

function mouseClicked() {
	if (!song) {
		return;
	}
// Проверка клика внутри области кнопки плэй
	var buttonX = width / 2;
	var buttonY = height / 2;
	var buttonRadius = playButtonSize / 2;

	var distance = dist(mouseX, mouseY, buttonX, buttonY);

	if (distance <= buttonRadius) {
		if (song.isPlaying()) {
			song.pause();
			noLoop();
		} else {
			song.play();
			loop();
		}
	}
}

var fullscreenButton = document.getElementById("fullscreen-button");

fullscreenButton.addEventListener("click", function() {
	if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
		exitFullscreen();
	} else {
		enterFullscreen();
	}
});

function enterFullscreen() {
	var elem = document.documentElement;
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) {
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) {
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) {
		elem.msRequestFullscreen();
	}
}

function exitFullscreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	}
}

document.addEventListener("fullscreenchange", function() {
	if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
		document.documentElement.style.backgroundColor = "";
	}
});

///////////////

function isMobileDevice() {
	return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

///////////////////////
// Отображение предупреждения, если устройство мобильное
if (isMobileDevice()) {
	const mobileWarning = document.getElementById('mobile-warning');
	if (mobileWarning) {
		mobileWarning.style.display = 'block';
		setTimeout(function() {
			mobileWarning.style.display = 'none';
		}, 5000);
	}
}

///////////////////////
