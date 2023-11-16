const canvas = document.getElementById("omega");
canvas.height = canvas.width = 0;
const ctx = canvas.getContext("2d");
ctx.lineWidth = 3;
const points = [];
const PPKP = 1/10; // point per kilopixel
var DIST = 200;
var OVERFLOW = 40;
var boom = { x: 0, y: 0, r: 0 };
var id;

function interactive() {
    canvas.addEventListener("click", (event) => {
        boom.x = event.x;
        boom.y = event.y;
        boom.r = 0;
        for (var p of points) {
            p.boom = false;
        }
    });
}

function line(p1, p2, a) {
    ctx.strokeStyle = "rgba(0,127,255," + a.toString() + ")";
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function spawn(left, top, width, height) {
    var pointAmount = PPKP * width * height / 1024;
    if (Math.random() < pointAmount % 1) pointAmount += 1;
    for (var i = 1; i < pointAmount; i++) {
        var point = {
            vx: 0,
            vy: 0,
            x: 0,
            y: 0,
        };
        point.vx = (Math.random() - 0.5) * 3;
        point.vy = (Math.random() - 0.5) * 3;
        point.x = left + OVERFLOW + Math.random() * width;
        point.y = top + OVERFLOW + Math.random() * height;
        points.push(point);
    }
}

function move(p) {
    if (p.x > canvas.width + OVERFLOW || p.y > canvas.height + OVERFLOW) points.splice(points.indexOf(p), 1);
    p.x += p.vx;
    p.y += p.vy;
    if (p.x > canvas.width + OVERFLOW || p.x < -OVERFLOW) {
        p.vx = -p.vx;
        p.x += p.vx;
        p.y += p.vy;
    }
    if (p.y > canvas.height + OVERFLOW || p.y < -OVERFLOW) {
        p.vy = -p.vy;
        p.x += p.vx;
        p.y += p.vy;
    }
}

function blit(p) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,127,255,0.4)";
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
}

function updateSize() {
    var currentHeight = canvas.parentElement.clientHeight;
    if (currentHeight < window.innerHeight) currentHeight = window.innerHeight;
    var currentWidth = canvas.parentElement.clientWidth;
    if (canvas.height != currentHeight || canvas.width != currentWidth) {
        var heightDiff = currentHeight - canvas.height;
        var widthDiff = currentWidth - canvas.width;
        if (heightDiff > 0) spawn(0, canvas.height, canvas.width, heightDiff);
        if (widthDiff > 0) spawn(canvas.width, 0, widthDiff, currentHeight);
        canvas.height = currentHeight;
        canvas.width = currentWidth;
    }
}

function start() {
    id = setInterval(update, 15);
}

function update() {
    updateSize();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var p of points) {
        move(p);
        blit(p);
        if (Math.sqrt(Math.pow(p.vx, 2) + Math.pow(p.vy, 2)) > 2) {
            p.vx *= 999 / 1000;
            p.vy *= 999 / 1000;
        }
    }
    if (boom.x && boom.y) {
        boom.r += 5;
        ctx.beginPath();
        ctx.arc(boom.x, boom.y, boom.r, 0, Math.PI * 2);
        ctx.stroke();
        if (boom.r > Math.max(canvas.width, canvas.height) * (3 / 2)) {
            boom.x = 0;
            boom.y = 0;
            boom.r = 0;
        }
    }
    for (var p1 = 0; p1 < points.length; p1++) {
        var dist = Math.sqrt(Math.pow(points[p1].x - boom.x, 2) + Math.pow(points[p1].y - boom.y, 2));
        if (boom.x && boom.y && dist < boom.r && !points[p1].boom) {
            points[p1].vx -= (boom.x - points[p1].x) * (4 / boom.r);
            points[p1].vy -= (boom.y - points[p1].y) * (4 / boom.r);
            points[p1].boom = true;
        }
        for (var p2 = p1 + 1; p2 < points.length; p2++) {
            var dist = Math.sqrt(Math.pow(points[p1].x - points[p2].x, 2) + Math.pow(points[p2].y - points[p1].y, 2));
            if (dist < DIST)
                line(points[p1], points[p2], (Math.pow(1 - dist / DIST, 1.2)));
        }
    }
}

start(0, 0, canvas.height, canvas.width);