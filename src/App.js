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
      activeImageOrigin: falcon,
      hasMagGradient: false,
      targetWidth: null,
      originalWidth: null
    }
  }

  generateMagnitudeGradient = () => {
    let ctx = document.getElementById('active-image').getContext('2d');
    let width = this.state.originalWidth || ctx.canvas.clientWidth;
    let imageData = ctx.getImageData(0, 0, width, ctx.canvas.height);

    let gradient = new MagGradient(imageData);

    this.setState({ 
      gradient,
      originalWidth: gradient.width,
      activeImage: imageData, 
      hasMagGradient: true, 
      activeCtx: ctx,
      isCarving: false,
      targetWidth: Math.floor(width * 0.8)
    });
  }

  renderMagnitudeGradient = () => {
    return <div className="image-wrap"><Canvas id="mag-gradient" imgSrc={this.state.gradient.asImageData} /></div>
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
    if (this.state.activeImage.width <= this.state.targetWidth) {
      this.setState({ isCarving: false });
      return;
    }

    let { activeImage: imageData } = this.state;
    let gradient = this.state.gradient || new MagGradient(imageData);

    // generate a seam
    let seam = new Seams(gradient.magGradient);

    // draw the seam on the image
    this.renderMinSeam(seam.minSeam, gradient);

    // carve seam from image data and mag gradient
    imageData = this.carveSeamFromImageData(seam.minSeam, imageData);
    gradient = this.carveSeamFromMagGradient(seam.minSeam, gradient);

    this.renderMagnitudeGradient();
    
    // after delay, carve seam from image and call again if not at target width
    setTimeout(() => {
      this.setState({ activeImage: imageData, gradient, isCarving: true }, this.carveActiveImage);
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

  carveSeamFromMagGradient = (seam, gradient) => {
    seam.forEach(pixel => {
      gradient.magGradient.data.splice(pixel, 1);
    })

    return {
      ...gradient,
      width: gradient.width - 1,
      magGradient: {
        ...gradient.magGradient,
        width: gradient.width - 1
      }
    };
  }

  handleTargetWidthChange = (e) => {
    if (!isNaN(e.target.value)) {
      this.setState({ targetWidth: e.target.value });
    }
  }

  handleTargetWidthKeyup = (e) => {
    if (e.key === 'Enter' && !this.state.isCarving) {
      this.carveActiveImage();
    }
  }

  resetActiveImage = () => {
    this.setState({
      activeImage: this.state.activeImageOrigin,
      hasMagGradient: false,
      gradient: undefined,
      targetWidth: 500,
      activeCtx: undefined
    })
  }
  

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Seam Carving</h1>
          <div className="project-description">
            <p className="project-description">Hey there! This is a personal project exploring the use of a Seam-Carving algorithm for content-aware image resizing. I came across a link on <a href="https://news.ycombinator.com">HackerNews.com</a> to <a href="http://www.eng.tau.ac.il/~avidan/papers/imretFinal.pdf">this paper</a> detailing the motivation and algorithmic implementation of the process. I thought it looked pretty cool, and decided to give it a whirl. This my resulting JavaScript implementation, which turned out to be a great introduction to a few interesting concepts and JavaScript APIs (mostly Canvas pixel manipulation and the native ArrayBuffer Typed Array interfaces). I Hope you enjoy watching it work as much as I have!</p>
            <div className="project-details">
              <ul>
                <li>React</li>
                <li>Canvas API</li>
                <li>JavaScript Typed Arrays</li>
              </ul>
              <span className="project-links">
                <a href="https://github.com/SimpliciTea/seam-carving">GitHub repo</a>
                <a href="https://simplicitea.github.io">Portfolio</a>
              </span>
            </div>
          </div>
        </header>


        <div className="image-wrap">
          <Canvas id="active-image" 
                  imgSrc={this.state.activeImage} />
        </div>

        <div className="controls">
          {!this.state.hasMagGradient && <button className="generate" onClick={this.generateMagnitudeGradient}>Generate Magnitude Gradient</button>}
          {this.state.hasMagGradient && 
            <div>
              <span className="current-width">
                Current Width: {this.state.activeImage.width}px
              </span>
              <span className="target-width">
                Target Width:
                <input type="text" 
                       onChange={this.handleTargetWidthChange}
                       onKeyUp={this.handleTargetWidthKeyup}
                       value={this.state.targetWidth} />
                &nbsp;px
              </span>
            </div>
          }

          {this.state.hasMagGradient && <button onClick={this.generateMinSeam} disabled={this.state.isCarving}>Generate Single Seam</button>}
          {this.state.hasMagGradient && <button onClick={this.carveActiveImage} disabled={this.state.isCarving}>Carve to {this.state.targetWidth}px</button>}
          {this.state.hasMagGradient && <button onClick={this.resetActiveImage} disabled={this.state.isCarving}>Reset</button>}

          {this.state.hasMagGradient && this.renderMagnitudeGradient()}
        </div>
      </div>
    );
  }
}

export default App;
