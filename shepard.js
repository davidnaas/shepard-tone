(function() {
  try{
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext() 
  }catch(e){
    alert('Web audio does not work with your browser');
  }
  const STARTFREQ = 5000;
  var mean = STARTFREQ/2;
  // All freuencies equally likely
  var sigma = mean / 10;
  var mainGain = context.createGain();
  mainGain.gain.value = 0.1;
  mainGain.connect(context.destination);
  var oscillators = populateOscillators();
  window.setInterval(playShepard, 1);
  

  function populateOscillators() {
    var arr = new Array(STARTFREQ/1000);
   
    for(var i = 0; i < arr.length; i++) {
       var tmpOsc = context.createOscillator();
       var tmpGain = context.createGain();
       tmpOsc.frequency.value = (i + 1) * 1000;
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
        oscObj.osc.frequency.value -= 0.2;
      }else{
        oscObj.osc.frequency.value = STARTFREQ;
      }
      if(index === 1)
        console.log(oscObj.osc.frequency.value);

      oscObj.gain.gain.value = freqToVolume(oscObj.osc.frequency.value) * 1000;
      //console.log(oscObj.gain.gain.value);
    });
  }

  // Gaussian bell curve
  function freqToVolume(freq) {
    return (1/(sigma * Math.sqrt(2 * Math.PI))) * Math.pow(Math.E, -(Math.pow(freq - mean, 2)/(2*Math.pow(sigma, 2))));
  }


}).call(this);