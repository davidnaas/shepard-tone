(function() {
  try{
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext() 
  }catch(e){
    alert('Web audio does not work with your browser');
  }
  // TODO understand why these arbitrary values work so well
  const STARTFREQ = 400;
  var mean = STARTFREQ/2;
  var sigma = mean / 10;

  var isDescending = true;

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
      tmpOsc.frequency.value = (i + 1) * STARTFREQ/arr.length;
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
  var chart = c3.generate({
    bindto: '#chart',
    data: {
      columns: [
        ['oscs', 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      types:{
        oscs: 'bar'
      }
    }
  });

  chart.axis.range({
    max: {
      y: 1
    },
    min: {
      y: 0
    }
  });

  var i = 0;
  function playShepard(){
    oscillators.forEach(function(oscObj, index){
      if(isDescending){
        if(oscObj.osc.frequency.value > 40){
          oscObj.osc.frequency.value -= 0.03;
        }else{
          oscObj.osc.frequency.value = STARTFREQ;
        }
      }else{
        if(oscObj.osc.frequency.value < STARTFREQ){
          oscObj.osc.frequency.value += 0.03;
        }else{
          oscObj.osc.frequency.value = 40;
        }
      }
      oscObj.gain.gain.value = freqToVolume(oscObj.osc.frequency.value) * 30;
    });
    // Debounce update rate of c3
    if(i%10 === 0)
      updateChart();
    i++;
  }

  // Gaussian bell curve
  function freqToVolume(freq) {
    return (1/(sigma * Math.sqrt(2 * Math.PI))) * Math.pow(Math.E, -(Math.pow(freq - mean, 2)/(2*Math.pow(sigma, 2))));
  }

  function updateChart () {
    chart.load({
      columns: [
        ['oscs',
          oscillators[0].gain.gain.value,
          oscillators[1].gain.gain.value,
          oscillators[2].gain.gain.value,
          oscillators[3].gain.gain.value,
          oscillators[4].gain.gain.value,
          oscillators[5].gain.gain.value,
          oscillators[6].gain.gain.value,
          oscillators[7].gain.gain.value

        ]
      ]
    });
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

})();