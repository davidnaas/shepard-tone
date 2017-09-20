(function() {
  try{
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext() 
  }catch(e){
    alert('Web audio does not work with your browser');
  }
  // TODO understand why these arbitrary values work so well
  const NUMBER_OF_OSCS = 10;
  const STARTFREQ = 800;
  const STOPFREQ = 40;
  var mean = (STARTFREQ - STOPFREQ)/2;
  var sigma = mean / NUMBER_OF_OSCS;

  var isDescending = true;
  var plot = false;

  // Patching of web audio nodes
  var mainGain = context.createGain();
  mainGain.connect(context.destination)
  mainGain.gain.value = 0;
  oscillators = populateOscillators();
  window.setInterval(playShepard, 2);

  // Init the oscillator array based on const values
  function populateOscillators() {
    var arr = new Array(NUMBER_OF_OSCS);
   
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
  var oscs = [['osc0', freqToVolume(oscillators[0]['osc'].frequency.value)],
              ['osc1', freqToVolume(oscillators[1]['osc'].frequency.value)],
              ['osc2', freqToVolume(oscillators[2]['osc'].frequency.value)],
              ['osc3', freqToVolume(oscillators[3]['osc'].frequency.value)],
              ['osc4', freqToVolume(oscillators[4]['osc'].frequency.value)],
              ['osc5', freqToVolume(oscillators[5]['osc'].frequency.value)],
              ['osc6', freqToVolume(oscillators[6]['osc'].frequency.value)],
              ['osc7', freqToVolume(oscillators[7]['osc'].frequency.value)]
            ];

  var chart = c3.generate({
    bindto: '#chart',
    data: {
      columns: oscs
    },
    point: {
      show: false
    }
  });

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

  var i = 0;
  function playShepard(){
    oscillators.forEach(function(oscObj, index){
      if(isDescending){
        if(oscObj.osc.frequency.value > STOPFREQ){
          oscObj.osc.frequency.value -= 0.04;
        }else{
          oscObj.osc.frequency.value = STARTFREQ;
        }
      }else{
        if(oscObj.osc.frequency.value < STARTFREQ){
          oscObj.osc.frequency.value += 0.04;
        }else{
          oscObj.osc.frequency.value = STOPFREQ;
        }
      }
      oscObj.gain.gain.value = freqToVolume(oscObj.osc.frequency.value) * 50;
    });
    // Debounce update rate of c3
    if(i%100 === 0)
      window.requestAnimationFrame(updateChart);
    i++;
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