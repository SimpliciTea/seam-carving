import React from 'react';


class Canvas extends React.Component {
	constructor(props) {
		super(props);

		let srcType = typeof props.imgSrc;
		let imgData = this.getImageDataFromProps(props);

		this.state = { 
			...imgData 
		};
	}

	getImageDataFromProps = (props) => {
		let imgData;

		// img URI passed as a string vs. ImageData interface as object
		if (typeof props.imgSrc === 'string') {
			let img = new Image();
			img.src = props.imgSrc;

			let imgWidth = img.naturalWidth;
			let imgHeight = img.naturalHeight;
			let ratio = imgHeight / imgWidth;

			let windowWidth = window.innerWidth;

			imgData = {
				srcType: 'string', 
				width: windowWidth * .9,
				height: windowWidth * .9 * ratio,
				img
			}
		} else {
			imgData = {
				srcType: 'object',
				width: props.imgSrc.width,
				height: props.imgSrc.height,
				img: props.imgSrc
			}
		}

		return imgData;
	}

	componentDidMount() {
		let ctx = this.refs[this.props.id].getContext('2d');

		this.setState({ ctx }, () => this.drawImage(this.state.imgSrc));
	}

	componentWillReceiveProps(nextProps) {
		if (this.state.img !== nextProps.imgSrc) {
			let imgData = this.getImageDataFromProps(nextProps);

			this.setState({	...imgData }, () => this.drawImage());
		}
	}

	drawImage = () => {
		let { srcType, img, ctx, height, width } = this.state;

		console.log(this.state);

		if (srcType === 'string') ctx.drawImage(img, 0, 0, width, height);
		else {
			ctx.putImageData(img, 0, 0);
		}
	}

	render = () => 
		<canvas id={this.props.id} 
						ref={this.props.id}
						width={this.state.width}
						height={this.state.height}/>
}


export default Canvas;