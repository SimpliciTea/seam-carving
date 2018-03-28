class MagnitudeGradient {
	constructor(imageData) {
		this.width = imageData.width;
		this.height = imageData.height;

		this.imageData = imageData;
		this.buf32 = new Uint32Array(imageData.data.buffer);

		this.luminance = [];

		this.magGradient = this.toMagGradient(imageData);
		this.normalized = this.toRGB(this.magGradient);
		this.asImageData = this.toImageData(this.normalized);
	}

	toMagGradient = () => {
		let mag = {
			min: Infinity,
			max: -Infinity,
			data: new Array(this.width * this.height)
		};

		// loop through array buffer and get luminance gradient from each pixel
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				let index = y * this.width + x;

				// get the horizontal and verical components
				let vertical = this.getPartialVerticalDiff(index);
				let horizontal = this.getPartialHorizontalDiff(index);

				// combine for gradient magnitude
				let localMag = Math.sqrt(Math.pow(vertical, 2) + Math.pow(horizontal, 2));

				mag.data[index] = localMag;
				if (mag.max < localMag) mag.max = localMag;
				if (mag.min > localMag) mag.min = localMag;
			}
		}

		return mag;
	}

	toLuminance32 = (pixel) => {
		return 0.2126 * (pixel >> 0 & 255) 
				 + 0.7152 * (pixel >> 8 & 255)
				 + 0.0722 * (pixel >> 16 & 255);
	}

	// this is called first, so we want to generate the luminance data on this pass
	getPartialVerticalDiff = (index) => {
		let prevIndex = index - this.width,
				nextIndex = index + this.width;

		let prevLumi, nextLumi;

		// if it's the first pixel, get it's luminance
		if (index === 0) this.luminance[0] = this.toLuminance32(this.buf32[0]);

		// otherwise, if it has a right neighbor, get it's luminance		
		if (index % this.width < this.width - 1) {
		  this.luminance[index + 1] = this.toLuminance32(this.buf32[index + 1]);
		}	
			
		if (prevIndex < 0) { // first row
			prevLumi = this.luminance[index];

			nextLumi = this.toLuminance32(this.buf32[nextIndex]);
			this.luminance[nextIndex] = nextLumi;
		} else if (nextIndex > this.width * this.height) { // last row
			prevLumi = this.luminance[prevIndex];
			nextLumi = this.luminance[index];
		} else { // middle rows
			prevLumi = this.luminance[prevIndex];

			nextLumi = this.toLuminance32(this.buf32[nextIndex]);
			this.luminance[nextIndex] = nextLumi;
		}

		return nextLumi - prevLumi;
	}

	// the luminance data here is all set frm our first pass to get vertical diff
	getPartialHorizontalDiff = (index) => {
		let prevIndex = (index % this.width === 0) ? index : index - 1;
		let nextIndex = (index % this.width === this.width - 1) ? index : index + 1; 

		return this.luminance[nextIndex] - this.luminance[prevIndex];
	}

	
	toRGB = ({ data, min, max }) => {
		return data.map(pixel => 255 * (pixel - min) / (max - min));
	}

	toImageData = (arr) => {
		let buf = new ArrayBuffer(this.imageData.data.length);
		let buf32 = new Uint32Array(buf);
		let buf8 = new Uint8ClampedArray(buf);
		
		arr.map((value, i) => {
			buf32[i] = 
				(255	 << 24) | // alpha
				(value << 16) | // blue
				(value <<  8) | // green
				(value);				// red
		})

		return new ImageData(buf8, this.width, this.height);
	}
}


export default MagnitudeGradient