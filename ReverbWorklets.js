registerProcessor('lowpass-comb-filter', class extends AudioWorkletProcessor {
  static get parameterDescriptors() { return [
    {name:'n',defaultValue:4196},
    {name:'damping',defaultValue:0.2},
    {name:'size',defaultValue:0.84} //not used for first order lowpass
  ]}
  constructor() {
    super();
    // Assumes maximum of 8 channels, so [8][2] arrays for inputs x and outputs y
    // Initialises two values (current and previous) for each array
    this.x = Array(8).fill().map(() => Array(192000).fill(0));
    this.y = Array(8).fill().map(() => Array(192000).fill(0));
    this.prev = Array(8).fill().map(() => Array(2).fill(0))
    this.readPointer = 0;
    this.lowpass= Array(8).fill().map(() => Array(2).fill(0))
  }
  process(inputs, outputs,parameters) {
    const input=inputs[0],output=outputs[0];// output[channel][sample],input[channel][sample]
    let nChannels=input.length;
    for (let c=0; c<nChannels; ++c) {
      const inputChannel = input[c],outputChannel = output[c];
      for (let n=0; n<outputChannel.length; ++n) { //over 128 samples
        // Now update the values
        this.x[c][this.readPointer] = inputChannel[n]
        this.y[c][this.readPointer]  = parameters.size[0]*(this.x[c][(((this.readPointer - parameters.n[0])%192000)+192000)%192000] + (this.lowpass[c][0])*this.y[c][(((this.readPointer - parameters.n[0])%192000)+192000)%192000]);//0.94*(this.x[c][this.readPointer]*(1 - 0.9) + 0.9*this.y[c][(((this.readPointer-1)%4800)+4800)%4800]);
        this.lowpass[c][0] = (1 - parameters.damping[0])*this.y[c][this.readPointer] + parameters.damping[0]*this.prev[c][0];
        this.prev[c][0] = this.lowpass[c][0];
        outputChannel[n] = this.y[c][this.readPointer] //this.y[c][this.readPointer]; //this.y[c][this.readPointer];
        this.readPointer++;
        if(this.readPointer>= 192000)
        {
          this.readPointer = 0;
        }

      }
    }
    return true;
  }
});


registerProcessor('allpass-filter', class extends AudioWorkletProcessor {
  static get parameterDescriptors() { return [
    {name:'n',defaultValue:4196},
    {name:'x',defaultValue:0.618} //not used for first order lowpass
  ]}
  constructor() {
    super();
    // Assumes maximum of 8 channels, so [8][2] arrays for inputs x and outputs y
    // Initialises two values (current and previous) for each array
    this.x = Array(8).fill().map(() => Array(192000).fill(0));
    this.y = Array(8).fill().map(() => Array(192000).fill(0));
    this.readPointer = 0;
  }
  process(inputs, outputs,parameters) {
    const input=inputs[0],output=outputs[0];// output[channel][sample],input[channel][sample]
    let nChannels=input.length;
    for (let c=0; c<nChannels; ++c) {
      const inputChannel = input[c],outputChannel = output[c];
      for (let n=0; n<outputChannel.length; ++n) { //over 128 samples
        // Now update the values
        this.x[c][this.readPointer] = inputChannel[n]
        this.y[c][this.readPointer] = -1*this.x[c][this.readPointer] + this.x[c][(((this.readPointer  - parameters.n[0])%192000)+192000)%192000]*(1 + parameters.x[0]) + parameters.x[0]*this.y[c][(((this.readPointer-parameters.n[0])%192000)+192000)%192000]
        outputChannel[n] = this.y[c][this.readPointer];
        this.readPointer++
        if(this.readPointer>=192000)
        {
          this.readPointer = 0;
        }
      }
    }
    return true;
  }
});


registerProcessor('feedback-delay-network', class extends AudioWorkletProcessor {
  static get parameterDescriptors() { return [
    {name:'n',defaultValue:4196},
    {name:'x',defaultValue:0.618} //not used for first order lowpass
  ]}
  constructor() {
    super();
    // Assumes maximum of 8 channels, so [8][2] arrays for inputs x and outputs y
    // Initialises two values (current and previous) for each array
    this.x = Array(8).fill().map(() => Array(192000).fill(0));
    this.y = Array(8).fill().map(() => Array(192000).fill(0));
    this.readPointer = 0;
  }
  process(inputs, outputs,parameters) {
    const input=inputs[0],output=outputs[0];// output[channel][sample],input[channel][sample]
    let nChannels=input.length;
    for (let c=0; c<nChannels; ++c) {
      const inputChannel = input[c],outputChannel = output[c];
      for (let n=0; n<outputChannel.length; ++n) { //over 128 samples
        // Now update the values
        this.x[c][this.readPointer] = inputChannel[n]
        this.y[c][this.readPointer] = -1*this.x[c][this.readPointer] + this.x[c][(((this.readPointer  - parameters.n[0])%192000)+192000)%192000]*(1 + parameters.x[0]) + parameters.x[0]*this.y[c][(((this.readPointer-parameters.n[0])%192000)+192000)%192000]
        outputChannel[n] = this.y[c][this.readPointer];
        this.readPointer++
        if(this.readPointer>=192000)
        {
          this.readPointer = 0;
        }
      }
    }
    return true;
  }
});



registerProcessor('multi-tap-delayLine', class extends AudioWorkletProcessor {
  static get parameterDescriptors() { return [
    {name:'ms',defaultValue:48},
    {name:'n',defaultValue:4196},
    {name:'x',defaultValue:0.618}
  ]}
  constructor() {
    super();
    // Assumes maximum of 8 channels, so [8][2] arrays for inputs x and outputs y
    // Initialises two values (current and previous) for each array
    this.x = Array(8).fill().map(() => Array(192000).fill(0));
    this.y = Array(8).fill().map(() => Array(192000).fill(0));
    this.prev= Array(8).fill().map(() => Array(2).fill(0));
    this.lowpass= Array(8).fill().map(() => Array(2).fill(0));
    this.readPointer = 0;
  }
  process(inputs, outputs,parameters) {
    const input=inputs[0],output=outputs[0];// output[channel][sample],input[channel][sample]
    let nChannels=input.length;
    for (let c=0; c<nChannels; ++c) {
      const inputChannel = input[c],outputChannel = output[c];
      for (let n=0; n<outputChannel.length; ++n) { //over 128 samples
        // Now update the values
        this.x[c][this.readPointer] = inputChannel[n]

        this.y[c][this.readPointer] = (1 - 0.001)*this.x[c][this.readPointer] + 0.001*this.prev[c][0];
        this.prev[c][0] = this.y[c][this.readPointer];
        //this.y[c][this.readPointer] = -1*this.x[c][this.readPointer] + this.x[c][(((this.readPointer  - parameters.n[0])%192000)+192000)%192000]*(1 + parameters.x[0]) + parameters.x[0]*this.y[c][(((this.readPointer-parameters.n[0])%192000)+192000)%192000]
        outputChannel[n] = (40/60)*this.y[c][(((this.readPointer - 1*parameters.ms[0])%192000)+192000)%192000] + (37/60)*this.y[c][(((this.readPointer - 2*parameters.ms[0])%192000)+192000)%192000] +  (35/60)*this.y[c][(((this.readPointer - 3*parameters.ms[0])%192000)+192000)%192000] +  (34/60)*this.y[c][(((this.readPointer - 4*parameters.ms[0])%192000)+192000)%192000] +  (34/60)*this.y[c][(((this.readPointer - 5*parameters.ms[0])%192000)+192000)%192000]  +  (33/60)*this.y[c][(((this.readPointer - 6*parameters.ms[0])%192000)+192000)%192000]  +  (32/60)*this.y[c][(((this.readPointer - 7*parameters.ms[0])%192000)+192000)%192000] +  (31/60)*this.y[c][(((this.readPointer - 8*parameters.ms[0])%192000)+192000)%192000] +  (30/60)*this.y[c][(((this.readPointer - 9*parameters.ms[0])%192000)+192000)%192000] +  (29/60)*this.y[c][(((this.readPointer - 10*parameters.ms[0])%192000)+192000)%192000] +  (28/60)*this.y[c][(((this.readPointer - 11*parameters.ms[0])%192000)+192000)%192000] +  (27/60)*this.y[c][(((this.readPointer - 12*parameters.ms[0])%192000)+192000)%192000] +  (25/60)*this.y[c][(((this.readPointer - 13*parameters.ms[0])%192000)+192000)%192000] +  (24/60)*this.y[c][(((this.readPointer - 14*parameters.ms[0])%192000)+192000)%192000] +  (23/60)*this.y[c][(((this.readPointer - 15*parameters.ms[0])%192000)+192000)%192000] +(20/60)*this.y[c][(((this.readPointer - 18*parameters.ms[0])%192000)+192000)%192000] + (17/60)*this.y[c][(((this.readPointer - 19*parameters.ms[0])%192000)+192000)%192000] +  (15/60)*this.y[c][(((this.readPointer - 20*parameters.ms[0])%192000)+192000)%192000] +  (14/60)*this.y[c][(((this.readPointer - 21*parameters.ms[0])%192000)+192000)%192000] +  (14/60)*this.y[c][(((this.readPointer - 22*parameters.ms[0])%192000)+192000)%192000]  +  (13/60)*this.y[c][(((this.readPointer - 23*parameters.ms[0])%192000)+192000)%192000]  +  (12/60)*this.y[c][(((this.readPointer - 23*parameters.ms[0])%192000)+192000)%192000] +  (11/60)*this.y[c][(((this.readPointer - 23*parameters.ms[0])%192000)+192000)%192000] +  (10/60)*this.y[c][(((this.readPointer - 24*parameters.ms[0])%192000)+192000)%192000] +  (9/60)*this.y[c][(((this.readPointer - 25*parameters.ms[0])%192000)+192000)%192000] +  (8/60)*this.y[c][(((this.readPointer - 26*parameters.ms[0])%192000)+192000)%192000] +  (7/60)*this.y[c][(((this.readPointer - 27*parameters.ms[0])%192000)+192000)%192000] +  (5/60)*this.y[c][(((this.readPointer - 128*parameters.ms[0])%192000)+192000)%192000] +  (4/60)*this.y[c][(((this.readPointer - 29*parameters.ms[0])%192000)+192000)%192000] +  (3/60)*this.y[c][(((this.readPointer - 30*parameters.ms[0])%192000)+192000)%192000]
        this.readPointer++
        if(this.readPointer>=192000)
        {
          this.readPointer = 0;
        }
      }
    }
    return true;
  }
});
