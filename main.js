// ----- Setup PixiJS -----
const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x100012,
});
document.getElementById("game-container").appendChild(app.view);

const WIDTH = app.screen.width;
const HEIGHT = app.screen.height;

// ----- Colores -----
const RED = 0xFF0050;
const PINK = 0xFFB6C1;
const WHITE = 0xFFFFFF;

// ----- Heart -----
const heart = new PIXI.Graphics();
app.stage.addChild(heart);

let fillProgress = 0;
let stage = "outline";

// Crear puntos del corazón
function generateHeartPoints(scale=180){
    let points = [];
    for(let theta=0; theta<360; theta+=2){
        let rad = theta * Math.PI / 180;
        let x = 16*Math.pow(Math.sin(rad),3);
        let y = 13*Math.cos(rad)-5*Math.cos(2*rad)-2*Math.cos(3*rad)-Math.cos(4*rad);
        let px = WIDTH/2 + x*scale/16;
        let py = HEIGHT/2 - y*scale/16;
        points.push({x:px,y:py});
    }
    return points;
}
const heartPoints = generateHeartPoints();

// ----- Letter M -----
const mText = new PIXI.Text("M", {
    fontFamily: "Arial",
    fontSize: 180,
    fontWeight: "bold",
    fill: [0xFFB6C1, 0xFFFFFF],
});
mText.anchor.set(0.5);
mText.x = WIDTH/2;
mText.y = HEIGHT/2;
mText.alpha = 0;
app.stage.addChild(mText);

// ----- Particles -----
const particles = [];
const particleContainer = new PIXI.ParticleContainer(500, {alpha:true, scale:true});
app.stage.addChild(particleContainer);

for(let i=0;i<80;i++){
    const p = new PIXI.Sprite.from('spark.png');
    p.anchor.set(0.5);
    resetParticle(p);
    particleContainer.addChild(p);
    particles.push(p);
}

function resetParticle(p){
    let angle = Math.random()*2*Math.PI;
    let radius = 50 + Math.random()*150;
    p.x = WIDTH/2 + radius*Math.cos(angle);
    p.y = HEIGHT/2 + radius*Math.sin(angle);
    p.vx = -0.5 + Math.random();
    p.vy = -0.5 + Math.random();
    p.scale.set(0.02 + Math.random()*0.03);
}

// ----- Lyrics -----
let lyricObjects = [];
let lyrics = [];
let delay = 9; // segundos
const songText = `Put your head on my shoulder Hold me in your arms, baby Squeeze me oh, so tight, show me That you love me too
Put your lips next to mine, dear Won't you kiss me once, baby Just a kiss good night, maybe You and I will fall in love
People say that love's a game A game you just can't win If there's a way I'll find it someday And then this fool will rush in
Put your head on my shoulder Whisper in my ear, baby Words I want to hear, tell me Tell me that you love me too
Put your head on my shoulder Whisper in my ear, baby Words I want to hear, baby Put your head on my shoulder`;

const words = songText.split(' ');
const totalDuration = 155; // total aprox en segundos
const interval = (totalDuration - delay)/words.length;

words.forEach((w,i)=>{
    lyrics.push({word:w,startTime:delay + i*interval});
});

// ----- Audio -----
const audio = new Audio('jajajajja.mp3');
audio.play();

// ----- Animation Loop -----
let pulseAngle = 0;
app.ticker.add((delta)=>{
    pulseAngle += 0.02;

    // ---- Heart ----
    heart.clear();
    heart.lineStyle(3, RED, 1);
    if(stage=="outline"){
        stage="fill";
    } else if(stage=="fill"){
        fillProgress += 0.002;
        heart.beginFill(RED, fillProgress);
        heart.moveTo(heartPoints[0].x,heartPoints[0].y);
        heartPoints.forEach(p=>heart.lineTo(p.x,p.y));
        heart.endFill();
        if(fillProgress>=1){ stage="rain"; }
    } else if(stage=="rain"){
        heart.beginFill(RED,1);
        heart.moveTo(heartPoints[0].x,heartPoints[0].y);
        heartPoints.forEach(p=>heart.lineTo(p.x,p.y));
        heart.endFill();
    }

    // ---- M pulsante ----
    if(stage=="rain" && mText.alpha<1){
        mText.alpha += 0.003;
        mText.scale.set(1 + 0.02*Math.sin(pulseAngle));
    }

    // ---- Particles ----
    particles.forEach(p=>{
        p.x += p.vx;
        p.y += p.vy;
        if(p.x<0 || p.x>WIDTH || p.y<0 || p.y>HEIGHT) resetParticle(p);
    });

    // ---- Lyrics ----
    if(stage=="rain"){
        const currentTime = audio.currentTime;
        while(lyrics.length && currentTime>=lyrics[0].startTime){
            const l = lyrics.shift();
            const txt = new PIXI.Text(l.word.toUpperCase(), {fontFamily:"Arial",fontSize:60,fill:WHITE,fontWeight:"bold"});
            txt.anchor.set(0.5);
            txt.x = 50 + Math.random()*(WIDTH-100);
            txt.y = 50 + Math.random()*(HEIGHT-100);
            txt.alpha = 0;
            app.stage.addChild(txt);
            lyricObjects.push({node:txt,addedTime:currentTime});
        }

        lyricObjects.forEach((ly)=>{
            let t = currentTime - ly.addedTime;
            if(t<0.6){ ly.node.alpha = t/0.6; }
            else if(t<1.6){ ly.node.alpha = 1; }
            else if(t<2){ ly.node.alpha = 1-(t-1.6)/0.4; }
            else{ ly.node.alpha=0; }
        });
    }
});
