(function() {
  try{
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext() 
  }catch(e){
    alert('Web audio does not work with your browser');
  }
  // TODO understand why these arbitrary values work so well
  const STARTFREQ = 800;
  var mean = STARTFREQ/2;
  var sigma = mean / 10;

  // Patching of web audio nodes
  var mainGain = context.createGain();
  mainGain.gain.value = 0.25;
  mainGain.connect(context.destination);
  var oscillators = populateOscillators();
  window.setInterval(playShepard, 2);
  

  function populateOscillators() {
    var arr = new Array(STARTFREQ/100);
   
    for(var i = 0; i < arr.length; i++) {
      var tmpOsc = context.createOscillator();
      var tmpGain = context.createGain();
      tmpOsc.frequency.value = (i + 1) * 100;
      tmpOsc.type = "sine";
      tmpOsc.start(1);
      tmpOsc.connect(tmpGain);
      tmpGain.connect(mainGain);
      arr[i] = {"osc": tmpOsc,
                "gain": tmpGain};
    };
  
    return arr;
  }

  function playShepard(){
    oscillators.forEach(function(oscObj, index){
      if(oscObj.osc.frequency.value > 40){
        oscObj.osc.frequency.value -= 0.05;
      }else{
        oscObj.osc.frequency.value = STARTFREQ;
      }
      oscObj.gain.gain.value = freqToVolume(oscObj.osc.frequency.value) * 100;
    });
  }

  // Gaussian bell curve
  function freqToVolume(freq) {
    return (1/(sigma * Math.sqrt(2 * Math.PI))) * Math.pow(Math.E, -(Math.pow(freq - mean, 2)/(2*Math.pow(sigma, 2))));
  }


}).call(this);