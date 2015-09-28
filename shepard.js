(function() {
  try{
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext() 
  }catch(e){
    alert('Web audio does not work with your browser');
  }
  // TODO understand why these arbitrary values work so well
  const STARTFREQ = 400;
  const STOPFREQ = 40;
  var mean = STARTFREQ/2;
  var sigma = mean / 10;

  var isDescending = true;
  var plot = false;

  // Patching of web audio nodes
  var mainGain = context.createGain();
  mainGain.gain.value = 0;
  oscillators = populateOscillators();
  window.setInterval(playShepard, 2);

  // Load and connect convolution reverb
  var convolver = context.createConvolver();
  mainGain.connect(convolver);
  convolver.connect(context.destination);
  var request = new XMLHttpRequest();
  request.open("GET", "IR.wav", true);
  request.responseType = "arraybuffer";

  request.onload = function () {
    context.decodeAudioData(request.response, function(buffer) {
        convolver.buffer = buffer;
     });
  }
  request.send();

  // Init the oscillator array based on const values
  function populateOscillators() {
    var arr = new Array(8);
   
    for(var i = 0; i < arr.length; i++) {
      var tmpOsc = context.createOscillator();
      var tmpGain = context.createGain();
      tmpOsc.frequency.value = (i + 1) * ((STARTFREQ-STOPFREQ)/arr.length);
      tmpOsc.type = "sine";
      tmpOsc.start(1);
      tmpOsc.connect(tmpGain);
      tmpGain.connect(mainGain);
      arr[i] = {"osc": tmpOsc,
                "gain": tmpGain};
    };
  
    return arr;
  }

  // c3 chart object used to visualize oscs
  var oscs = [['osc0', 0],['osc1', 0],['osc2', 0],['osc3', 0],['osc4', 0],['osc5', 0],['osc6', 0],['osc7', 0]]
  var chart = c3.generate({
    bindto: '#chart',
    data: {
      columns: oscs
    },
    point: {
      show: false
    }
  });

  var i = 0;
  function playShepard(){
    oscillators.forEach(function(oscObj, index){
      if(isDescending){
        if(oscObj.osc.frequency.value > STOPFREQ){
          oscObj.osc.frequency.value -= 0.03;
        }else{
          oscObj.osc.frequency.value = STARTFREQ;
        }
      }else{
        if(oscObj.osc.frequency.value < STARTFREQ){
          oscObj.osc.frequency.value += 0.03;
        }else{
          oscObj.osc.frequency.value = STOPFREQ;
        }
      }
      oscObj.gain.gain.value = freqToVolume(oscObj.osc.frequency.value) * 30;
    });
    // Debounce update rate of c3
    if(i%200 === 0)
      updateChart();
    i++;
  }

  // Gaussian bell curve
  function freqToVolume(freq) {
    return (1/(sigma * Math.sqrt(2 * Math.PI))) * Math.pow(Math.E, -(Math.pow(freq - mean, 2)/(2*Math.pow(sigma, 2))));
  }

  function updateChart () {
    if(plot){
      oscs.forEach(function (val, i) {
        val.push(oscillators[i].gain.gain.value)
      });
      chart.load({
        columns: oscs
      });
    }
  }

  window.togglePlay = function(){
    if(mainGain.gain.value === 0.25){
      mainGain.gain.value = 0;
    }else{
      mainGain.gain.value = 0.25;
    }
  }

  window.toggleDirection = function(){
    isDescending = !isDescending;
  }

  window.togglePlot = function() {
    plot = !plot;
  }

})();