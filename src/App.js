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
      hasMinSeam: false,
      targetWidth: 400
    }
  }

  generateMagnitudeGradient = () => {
    let ctx = document.getElementById('active-image').getContext('2d');
    let gradient = new MagGradient(ctx);

    this.setState({ gradient, hasMagGradient: true, activeCtx: ctx });
  }

  renderMagnitudeGradient = () => {
    return <Canvas id="mag-gradient" imgSrc={this.state.gradient.asImageData} />
  }

  generateMinSeam = () => {
    let seams = new Seams(this.state.gradient);
    this.setState({ hasMinSeam: true, minSeam: seams.minSeam }, this.renderMinSeam);
  }

  renderMinSeam = (minSeam = this.state.minSeam) => {
    let { activeCtx } = this.state;
    activeCtx.fillStyle = 'red';

    minSeam.forEach(point => {
      let [x, y] = point;

      activeCtx.fillRect(x, y, 1, 1);
    })
  }

  carveActiveImage = () => {
    let { activeCtx: ctx } = this.state;
    let { clientWidth: width, clientHeight: height } = ctx.canvas;
    let imageData = ctx.getImageData(0, 0, width, height);

    // generate a new gradient
    let gradient = new MagGradient(ctx);

    // generate a seam
    let seam = new Seams(gradient);

    // draw the seam on the image
    this.renderMinSeam(seam.minSeam);

    // carve seam from image data
    imageData = this.carveSeamFromImageData(seam.minSeam, imageData);

    // after delay, carve seam from image and call again if not at target width
    setTimeout(() => {
      this.setState({ activeImage: imageData }, () => {
        if (this.state.activeImage.width > this.state.targetWidth) this.carveActiveImage();
      });
    }, 5)
  }

  carveSeamFromImageData = (seam, imageData) => { 
    let { width, height } = imageData;
    let newImageData = Array.from(imageData.data);

    seam.forEach(([x, y]) => {
      let i = (y * width + x) * 4;
      
      newImageData.splice(i, 4);
    });

    return new ImageData(Uint8ClampedArray.from(newImageData), width - 1, height);
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
