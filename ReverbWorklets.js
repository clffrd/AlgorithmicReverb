registerProcessor('comb-filter', class extends AudioWorkletProcessor {
  static get parameterDescriptors() { return [
    {name:'n',defaultValue:4196},
    {name:'loopgain',defaultValue:1} //not used for first order lowpass
  ]}
  constructor() {
    super();
    // Assumes maximum of 8 channels, so [8][2] arrays for inputs x and outputs y
    // Initialises two values (current and previous) for each array
    this.x = Array(8).fill().map(() => Array(192000).fill(0));
    this.y = Array(8).fill().map(() => Array(192000).fill(0));
    this.readPointer = 0;
    this.k = 192000;
  }
  process(inputs, outputs,parameters) {
    const input=inputs[0],output=outputs[0];// output[channel][sample],input[channel][sample]
    let nChannels=input.length;
    for (let c=0; c<nChannels; ++c) {
      const inputChannel = input[c],outputChannel = output[c];
      for (let n=0; n<outputChannel.length; ++n) { //over 128 samples
        // Now update the values
        this.x[c][this.readPointer] = inputChannel[n]
        this.y[c][this.readPointer] = this.x[c][this.readPointer]  - this.y[c][(((this.readPointer - parameters.n[0])%this.k)+this.k)%this.k]*parameters.loopgain[0]
        //set output
        outputChannel[n]= this.y[c][this.readPointer];
        this.readPointer++
        if(this.readPointer>= this.k)
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
    {name:'loopgain',defaultValue:1} //not used for first order lowpass
  ]}
  constructor() {
    super();
    // Assumes maximum of 8 channels, so [8][2] arrays for inputs x and outputs y
    // Initialises two values (current and previous) for each array
    this.x = Array(8).fill().map(() => Array(192000).fill(0));
    this.y = Array(8).fill().map(() => Array(192000).fill(0));
    this.readPointer = 0;
    this.k = 192000;
  }
  process(inputs, outputs,parameters) {
    const input=inputs[0],output=outputs[0];// output[channel][sample],input[channel][sample]
    let nChannels=input.length;
    for (let c=0; c<nChannels; ++c) {
      const inputChannel = input[c],outputChannel = output[c];
      for (let n=0; n<outputChannel.length; ++n) { //over 128 samples
        // Now update the values
        this.x[c][this.readPointer] = inputChannel[n]
        this.y[c][this.readPointer] = this.x[c][this.readPointer] + this.x[c][(((this.readPointer-parameters.n[0])%this.k)+this.k)%this.k] - parameters.loopgain[0]*this.y[c][(((this.readPointer-parameters.n[0])%this.k)+this.k)%this.k];
        outputChannel[n] = this.y[c][this.readPointer];
//        this.y[c][this.readPointer] = (-1*parameters.loopgain[0]*inputChannel[n])+this.x[c][(((this.readPointer-parameters.n[0])%this.k)+this.k)%this.k]+parameters.loopgain[0]*this.y[c][(((this.readPointer-parameters.n[0])%this.k)+this.k)%this.k];
        //set output
        //outputChannel[n]= this.y[c][this.readPointer];
        this.readPointer++
        if(this.readPointer>=this.k)
        {
          this.readPointer = 0;
        }
        //set output
      }
    }
    return true;
  }
});
