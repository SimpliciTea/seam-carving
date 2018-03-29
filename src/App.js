import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Canvas from './components/Canvas';
import falcon from './assets/falcon-heavy.jpg'
import MagGradient from './utils/magGradient';
import Seams from './utils/seams';

class App extends Component {
  constructor() {
    super();

    this.state = {
      activeImage: falcon,
      hasMagGradient: false,
      targetWidth: 500
    }
  }

  generateMagnitudeGradient = () => {
    let ctx = document.getElementById('active-image').getContext('2d');
    let imageData = ctx.getImageData(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    
    let gradient = new MagGradient(imageData);

    this.setState({ 
      gradient,
      activeImage: imageData, 
      hasMagGradient: true, 
      activeCtx: ctx, 
    });
  }

  renderMagnitudeGradient = () => {
    return <Canvas id="mag-gradient" imgSrc={this.state.gradient.asImageData} />
  }

  generateMinSeam = () => {
    let { activeImage } = this.state;
    let gradient = new MagGradient(activeImage);
    let seams = new Seams(gradient.magGradient);
    this.renderMinSeam(seams.minSeam, gradient);
  }

  renderMinSeam = (minSeam, gradient) => {
    let { activeCtx } = this.state;
    let { width } = gradient.magGradient;

    activeCtx.fillStyle = 'red';

    minSeam.forEach(pixel => {
      let x = pixel % width;
      let y = Math.floor(pixel / width);

      activeCtx.fillRect(x, y, 1, 1);
    })
  }

  carveActiveImage = () => {
    let { activeImage: imageData } = this.state;

    // generate a new gradient
    let gradient = new MagGradient(imageData);

    // generate a seam
    let seam = new Seams(gradient.magGradient);

    // draw the seam on the image
    this.renderMinSeam(seam.minSeam, gradient);

    // carve seam from image data
    imageData = this.carveSeamFromImageData(seam.minSeam, imageData);
    
    // after delay, carve seam from image and call again if not at target width
    setTimeout(() => {
      this.setState({ activeImage: imageData }, () => {
        if (this.state.activeImage.width > this.state.targetWidth) this.carveActiveImage();
      });
    }, 5);
  }

  carveSeamFromImageData = (seam, imageData) => { 
    let { width, height } = imageData;

    // I want to avoid this type of array duplication but it seems like the best
    // way to splice pixels from the ImageData ArrayBuffer, as Typed Arrays
    // do not have a native Splice method
    let nextImageData = Array.from(imageData.data);

    seam.forEach(pixel => {      
      nextImageData.splice(pixel * 4, 4);
    });

    return new ImageData(Uint8ClampedArray.from(nextImageData), width - 1, height);
  }
  

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Seam Carving</h1>
        </header>

        <div className="image-wrap">
          <Canvas id="active-image" 
                  imgSrc={this.state.activeImage} />
        </div>

        {!this.state.hasMagGradient && <button onClick={this.generateMagnitudeGradient}>Generate Magnitude Gradient</button>}
        {this.state.hasMagGradient  && <button onClick={this.generateMinSeam}>Generate Single Seam</button>}
        {this.state.hasMagGradient  && <button onClick={this.carveActiveImage}>Carve to 700px</button>}

        {this.state.hasMagGradient && this.renderMagnitudeGradient()}
      </div>
    );
  }
}

export default App;
