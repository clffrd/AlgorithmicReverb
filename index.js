const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
audioCtx.suspend();

let flg = true;
let gainL = audioCtx.createGain();
let gainR = audioCtx.createGain();
let dryGainL = audioCtx.createGain();
let dryGainR = audioCtx.createGain();
let tapGain1 = audioCtx.createGain();
let tapGain2 = audioCtx.createGain();
let combGainL1 = audioCtx.createGain();
let combGainR1 = audioCtx.createGain();
let combGainL2 = audioCtx.createGain();
let combGainR2 = audioCtx.createGain();
let wetGain1 = audioCtx.createGain();
let wetGain2 = audioCtx.createGain();
let outGainL = audioCtx.createGain();
let outGainR = audioCtx.createGain();
let comb = [];
let allpass = [];
let demo;
let playback;
let  music;
let scaling = 1
let splitter = audioCtx.createChannelSplitter(2);
let merger = audioCtx.createChannelMerger(2)
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

combGainL1.gain.value = 0.1;
combGainR1.gain.value = 0.1;
combGainL2.gain.value = 0.1;
combGainR2.gain.value = 0.1;
gainL.gain.value = 0.1;
gainR.gain.value = 0.1;
outGainL.gain.value = 1;
outGainR.gain.value = 1;
function buttonClicked()
{
var element =   document.getElementById('play')
if(flg)
{
  music = audioCtx.createBufferSource();
  music.buffer = playback.buffer;
  music.loop = true
  music.start();
  music.connect(splitter)
  element.innerHTML = "STOP";
  outGainL.gain.value = 1;
  outGainR.gain.value = 1;
  flg = false;
  audioCtx.resume();
}
else
{
  music.stop();
  music.disconnect(splitter)
  outGainL.gain.value = 0;
  outGainR.gain.value = 0;
  audioCtx.suspend();
  element.innerHTML = "PLAY";
  flg = true;
  }
}

var decay = document.getElementById('decay');
var reverb = document.getElementById('drywet');
var damping = document.getElementById('size');
var x = document.getElementById('x');
var ms = document.getElementById('ms');
decay.addEventListener('input', decayInput, false)
damping.addEventListener('input', setsize, false)
reverb.addEventListener('input',drywetInput, false)
x.addEventListener('input', setx, false)
ms.addEventListener('input', setms, false)
function decayInput()
{
  scaling = decay.value/5;
  setDelaysL();
  setDelaysR();
}

function setms()
{
  taps.parameters.get('ms').value= parseInt(ms.value*(Math.random()+0.5));
  taps2.parameters.get('ms').value= parseInt(ms.value*(Math.random()+0.5));
  taps.parameters.get('n').value= parseInt((341) * scaling);
  taps2.parameters.get('n').value=parseInt((341) * scaling);

}
function setDelaysL()
{
    comb[0].parameters.get('n').value= parseInt((1557 ) * scaling);
    comb[1].parameters.get('n').value= parseInt((1617) * scaling);
    comb[2].parameters.get('n').value= parseInt((1491) * scaling);
    comb[3].parameters.get('n').value= parseInt((1422) * scaling);
    comb[4].parameters.get('n').value= parseInt((1277) * scaling);
    comb[5].parameters.get('n').value= parseInt((1356) * scaling);
    comb[6].parameters.get('n').value= parseInt((1188) * scaling);
    comb[7].parameters.get('n').value= parseInt((1116) * scaling);
    allpass[0].parameters.get('n').value= parseInt((225) * scaling);
    allpass[1].parameters.get('n').value= parseInt((556) * scaling);
    allpass[2].parameters.get('n').value= parseInt((441) * scaling);
    allpass[3].parameters.get('n').value= parseInt((341) * scaling);
}

function setDelaysR()
{
    comb[8].parameters.get('n').value=parseInt((1557) * scaling);
    comb[9].parameters.get('n').value= parseInt((1617) * scaling);
    comb[10].parameters.get('n').value= parseInt((1491) * scaling);
    comb[11].parameters.get('n').value= parseInt((1422) * scaling);
    comb[12].parameters.get('n').value= parseInt((1277) * scaling);
    comb[13].parameters.get('n').value= parseInt((1356) * scaling);
    comb[14].parameters.get('n').value= parseInt((1188) * scaling);
    comb[15].parameters.get('n').value= parseInt((1116) * scaling);
    allpass[4].parameters.get('n').value= parseInt((225) * scaling);
    allpass[5].parameters.get('n').value= parseInt((556) * scaling);
    allpass[6].parameters.get('n').value= parseInt((441) * scaling);
    allpass[7].parameters.get('n').value= parseInt((341) * scaling);
}
function setx()
{
  for(var i= 0; i<8; i++)
  {
    allpass[i].parameters.get('x').value= x.value/100;
    taps.parameters.get('x').value=  x.value/100;
    taps2.parameters.get('x').value= x.value/100;
  }
}
function setDamping()
{
  for(var i= 0; i<16; i++)
  {
  comb[i].parameters.get('damping').value=damping.value/100;
  }
}

function setsize()
{
  for(var i= 0; i<16; i++)
  {
  comb[i].parameters.get('size').value=size.value/100;
  }
}




function drywetInput()
{
  wetGain1.gain.value = reverb.value/100
  wetGain2.gain.value = reverb.value/100
  dryGainL.gain.value = 1 - reverb.value/100
  dryGainR.gain.value = 1 - reverb.value/100
}

Promise.all([audioCtx.audioWorklet.addModule('../ReverbWorklets.js')]).then(() => {
  for (var i = 0; i<16; i++)
  {
    comb[i] = new AudioWorkletNode(audioCtx, 'lowpass-comb-filter');
  }
  for (var i = 0; i<8; i++)
  {
    allpass[i] = new AudioWorkletNode(audioCtx, 'allpass-filter');
  }
  taps = new AudioWorkletNode(audioCtx, 'multi-tap-delayLine');
  taps2 = new AudioWorkletNode(audioCtx, 'multi-tap-delayLine');


  setDelaysL();
  setDelaysR();
  splitter.connect(gainL, 0, 0)
  gainL.connect(dryGainL)
  splitter.connect(gainR, 1, 0)
  gainR.connect(dryGainR)
  tapGain1.connect(comb[0])
  gainL.connect(comb[0])
    gainL.connect(comb[1])
      gainL.connect(comb[2])
        gainL.connect(comb[3])
        gainL.connect(comb[4])
          gainL.connect(comb[5])
            gainL.connect(comb[6])
              gainL.connect(comb[7])
  comb[0].connect(combGainL1)
    comb[1].connect(combGainL1)
      comb[2].connect(combGainL1)
        comb[3].connect(combGainL1)
        comb[4].connect(combGainL2)
          comb[5].connect(combGainL2)
            comb[6].connect(combGainL2)
              comb[7].connect(combGainL2)
        combGainL1.connect(allpass[0])
        combGainL2.connect(allpass[0])
        allpass[0].connect(allpass[1])
        allpass[1].connect(allpass[2])
        allpass[2].connect(allpass[3])
        allpass[3].connect(wetGain1)
        tapGain2.connect(comb[8])
        gainR.connect(comb[8])
          gainR.connect(comb[9])
            gainR.connect(comb[10])
              gainR.connect(comb[11])
              gainR.connect(comb[12])
                gainR.connect(comb[13])
                  gainR.connect(comb[14])
                    gainR.connect(comb[15])
        comb[8].connect(combGainR1)
          comb[9].connect(combGainR1)
            comb[10].connect(combGainR1)
              comb[11].connect(combGainR1)
              comb[12].connect(combGainR2)
                comb[13].connect(combGainR2)
                  comb[14].connect(combGainR2)
                    comb[15].connect(combGainR2)
              combGainR1.connect(allpass[4])
              combGainR2.connect(allpass[4])
              allpass[4].connect(allpass[5])
              allpass[5].connect(allpass[6])
              allpass[6].connect(allpass[7])
              allpass[7].connect(wetGain2)
              wetGain1.connect(outGainL)
              wetGain2.connect(outGainR)
              dryGainL.connect(outGainL)
              dryGainR.connect(outGainR)
              outGainL.connect(merger, 0, 0);
              outGainR.connect(merger, 0, 1);
              merger.connect(audioCtx.destination)
              splitter.connect(gainL, 0, 0)
              splitter.connect(gainR, 1, 0)
              gainL.connect(taps);
              gainR.connect(taps2);
              taps.connect(tapGain1);
              taps2.connect(tapGain2);
})
