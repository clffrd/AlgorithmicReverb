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
        this.y[c][this.readPointer]  = this.x[c][(((this.readPointer - parameters.n[0])%192000)+192000)%192000] + (this.lowpass[c][0])*this.y[c][(((this.readPointer - parameters.n[0])%192000)+192000)%192000]//0.94*(this.x[c][this.readPointer]*(1 - 0.9) + 0.9*this.y[c][(((this.readPointer-1)%4800)+4800)%4800]);
        this.lowpass[c][0] = parameters.size[0]*(1 - parameters.damping[0])*this.y[c][this.readPointer] - parameters.damping[0]*this.prev[c][0];
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
