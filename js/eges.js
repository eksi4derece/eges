const words = new Map();
const topiclist = new Map();
const input = document.getElementById("wordinput");
const questions = document.getElementById("questions");
const body = document.getElementsByTagName("body")[0];
const def = document.getElementById("definition");
const topics = document.getElementById("topics");
const counter = document.getElementById("counter");
const cancel = document.getElementById("cancel");
const next = document.getElementById("next");
const skip = document.getElementById("skip");
var corrects = 0;
var total = 0;
const endAnimation = new Animation(new KeyframeEffect(
	questions,
	[
		{
			opacity: 0, offset: 0.9
		},
		{
			opacity: 0, offset: 1
		}
	],
	{ duration: 500 }
));
const startAnimation = new Animation(new KeyframeEffect(
	questions,
	[
		{
			opacity: 0, offset: 0
		},
		{
			opacity: 1, offset: 0.9
		},
		{
			opacity: 1, offset: 1
		}
	],
	{ duration: 500 }
));

const wrongAnimation = new Animation(new KeyframeEffect(
	def,
	[
		{
			borderColor: "red", offset: 0.2, easing: "ease-in"
		},
		{
			boxShadow: "0 0 10em 1em red", offset: 0.2
		},
		{
			boxShadow: "0 0 1em 5em transparent", borderColor: "dodgerBlue", offset: 1, easing: "ease-out"
		}
	],
	{ duration: 1000 }

));
const correctAnimation = new Animation(new KeyframeEffect(
	def,
	[
		{
			borderColor: "greenyellow", offset: 0.2, easing: "ease-in"
		},
		{
			boxShadow: "0 0 5em green", offset: 0.2
		},
		{
			borderColor: "dodgerBlue", offset: 1, easing: "ease-out"
		}
	],
	{ duration: 800 }
));

async function getWords(file) {
	if (topiclist.has(file)) {
		return;
	}
	var promise = new Promise(function (resolve) {
		const xhttp = new XMLHttpRequest();
		xhttp.open("GET", "./assets/" + file);
		xhttp.onload = function () {
			if (xhttp.status != 200) resolve("ERRORR");
			else resolve(xhttp.responseText);
		}
		xhttp.send();
	});
	wordlist = await promise;
	topiclist.set(file, parseWords(wordlist));
}

function getTopics() {
	const topiclist = [];
	for (var child of topics.childNodes) {
		if (child.nodeName === "#text") continue;
		if (!child.classList.contains("checkbox")) continue;
		if (child.children.item(0).checked) topiclist.push(child.attributes.name.nodeValue);
	}
	return topiclist;
}

function parseWords(wordlist) {
	const words = new Map();
	for (var dict of wordlist.trim().split("\n")){ 
		dict = dict.split("|");
		dict.forEach((cur,ind,arr) => {arr[ind]=cur.trim();});
		words.set(dict[0],dict.slice(1));
	}
	return words;
}

function check() {
	input.focus()
	if (!input.value) return;
	if (words.get(def.innerHTML).includes(input.value)) {
		correct();
		words.delete(def.innerHTML);
		ask();
		return;
	}
	wrong();
}

function choice() {
	index = (Math.random() * 10000).toFixed() % words.size;
	ind = 0;
	for (var a of words) {
		if (index == ind) return a[0];
		ind++;
	}
}

function end() {
	setTimeout(() => { questions.style.display = "none"; topics.style.display = "flex" }, endAnimation.effect.getTiming().duration*(9/10));
	endAnimation.play();
}

function ask() {
	input.focus();
	next.style.display = "none";
	skip.style.display = "block";
	counter.innerHTML = corrects + "/" + total;
	input.value = "";
	if (words.size == 0) {
		end();
		return;
	}
	def.innerHTML = choice();
}

function wrong() {
	correctAnimation.cancel();
	wrongAnimation.play();
}

function correct() {
	corrects++;
	wrongAnimation.cancel();
	correctAnimation.play();
}

function skipf(){
	input.focus();
	next.style.display = "block";
	skip.style.display = "none";
	def.innerHTML = "Answer : " + words.get(def.innerHTML);
}

async function start() {
	var selectedTopics = getTopics();
	words.clear();
	if (!selectedTopics.length) return;
	for (var top of selectedTopics) {
		await getWords(top);
		topiclist.get(top).forEach((value, key) => {words.set(key, value)});
	}
	corrects = 0;
	total = words.size;
	next.style.display = "none";
	topics.style.display = "none";
	questions.style.display = "flex";
	startAnimation.play();
	ask();
}
