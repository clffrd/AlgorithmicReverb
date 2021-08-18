const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
audioCtx.suspend();

let flg = true;
let oscillator;
let gain = audioCtx.createGain();
let oscGain = audioCtx.createGain();
let combGain = audioCtx.createGain();
let comb = [];
let allpass = [];
let loopgains = [0.773,0.802,0.753,0.733]
let combdelaytimes = [1687, 1601, 2053, 2251]
let aploopgain = 0.7
let demo;
let playback;
let  music;
demo  = "../assets/audio.mp3"

function defaultfileloader(file)
{
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file);
  rawFile.responseType = "arraybuffer";
  rawFile.onload = function()
  {
      var undecodedAudio = rawFile.response;
      audioCtx.decodeAudioData(undecodedAudio,function(buffer)
      {
        playback = audioCtx.createBufferSource();
        playback.buffer = buffer;
      })
  };
  rawFile.send();
}

defaultfileloader(demo);

let apdelaytimes = [347,113,37]
combGain.gain.value = 1;
oscGain.gain.value = 1;
function buttonClicked()
{
var element =   document.getElementById('play')
if(flg)
{
  music = audioCtx.createBufferSource();
  music.buffer = playback.buffer;
  music.start();
  music.connect(gain)
  element.innerHTML = "STOP";
  gain.gain.value = 0.1;
  flg = false;
  audioCtx.resume();
}
else
{
  music.stop();
  music.disconnect(gain)
  gain.gain.value = 1;
  audioCtx.suspend();
  element.innerHTML = "PLAY";
  flg = true;
  }
}

var decay = document.getElementById('decay');
var reverb = document.getElementById('drywet');
decay.addEventListener('input', decayInput, false)
reverb.addEventListener('input', drywetInput, false)
function decayInput()
{
  setAllpassDelay();
}
function setAllpassDelay()
{
  for(var i = 0; i<3; i++)
  {
    allpass[i].parameters.get('n').value= parseInt((decay.value/Math.pow(3,i))/48);
  }
    combdelaytimes[1] = (decay.value/10)
    combdelaytimes[0] = 1.04996876952*(decay.value/10)
    combdelaytimes[2] = 1.28232354778*(decay.value/10)
    combdelaytimes[3] = 1.40599625234*(decay.value/10)
    comb[0].parameters.get('n').value= parseInt(combdelaytimes[0]);
    comb[1].parameters.get('n').value= parseInt(combdelaytimes[1]);
    comb[2].parameters.get('n').value= parseInt(combdelaytimes[2]);
    comb[3].parameters.get('n').value= parseInt(combdelaytimes[3]);
}

function drywetInput()
{
  combGain.gain.value = reverb.value/100
  oscGain.gain.value = 1 - reverb.value/100
}

Promise.all([audioCtx.audioWorklet.addModule('../ReverbWorklets.js')]).then(() => {
  for (var i = 0; i<4; i++)
  {
    comb[i] = new AudioWorkletNode(audioCtx, 'comb-filter', {parameterData:{loopgain:loopgains[i], n:(combdelaytimes[i])}});
  }
  for (var i = 0; i<3; i++)
  {
    allpass[i] = new AudioWorkletNode(audioCtx, 'allpass-filter', {parameterData:{loopgain:aploopgain, n:(apdelaytimes[i])}});
  }

  gain.connect(oscGain)
  gain.connect(allpass[0])
      .connect(allpass[1])
      .connect(allpass[2])
  allpass[2].connect(comb[0])
  allpass[2].connect(comb[1])
  allpass[2].connect(comb[2])
  allpass[2].connect(comb[3])
  comb[0].connect(combGain)
  comb[1].connect(combGain)
  comb[2].connect(combGain)
  comb[3].connect(combGain)
  combGain.connect(audioCtx.destination)
  oscGain.connect(audioCtx.destination)
})
