import React from 'react';
import { PulseLoader } from 'react-spinners';


class Canvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			imgLoaded: false,
		};
	}

	componentDidMount = () => {
		this.parseImgSrc();
	}

	componentWillReceiveProps = (nextProps) => {
		if (this.props.imgSrc !== nextProps.imgSrc) {
			if (typeof nextProps.imgSrc === 'string') {
				this.setState({ 
					ctx: undefined,
					img: undefined,
					width: undefined,
					height: undefined
				}, () => {
					this.parseImgSrc();
				})
			} else {
				this.parseImgSrc();
			}
		}
	}

	parseImgSrc = () => {
		let { imgSrc } = this.props;

		// if we're getting an object, it should be an ImageData object ready to work with.
		if (typeof imgSrc === 'object') {
			this.setImageData(imgSrc);
		} else {
			this.buildImageData(imgSrc);
		}
	}

	setImageData = (imgData) => {
		this.setState({
			imgLoaded: true,
			img: imgData,
			width: imgData.width,
			height: imgData.height
		}, () => {
			let ctx = this.state.ctx || this.refs[this.props.id].getContext('2d');
			
			if (this.state.ctx === undefined) {
				this.setState({ ctx: this.refs[this.props.id].getContext('2d') })
			};

			this.drawImage(ctx);
		})
	}

	buildImageData = (imgSrc) => {
		let img = new Image();
		img.src = imgSrc;
		
		img.onload = () => {
			let ratio = img.naturalHeight / img.naturalWidth;
			let windowWidth = window.innerWidth;

			let width = (windowWidth < 900) ? windowWidth * .9 : 850;
			let height = width * ratio;

			let canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;

			let ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, width, height);

			let imgData = ctx.getImageData(0, 0, width, height);

			canvas.remove();

			this.setImageData(imgData);
		}
	}

	drawImage = (ctx) => {
		let { img } = this.state;

		ctx.putImageData(img, 0, 0);
	}

	render = () => this.state.imgLoaded
		? <canvas id={this.props.id} 
							ref={this.props.id}
							width={this.state.width}
							height={this.state.height}/>
		: <div className="spinner">
				<PulseLoader loading={!this.state.imgLoaded} color="#ccc"/>
			</div>
}


export default Canvas;