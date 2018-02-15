/*

Converts a one-dimensional array of 

	[r,g,b,a [,r,g,b,a], ...]

pixel data from a canvas element into a two-dimensional

	[x][y]

magnitude gradient array

*/

class MagnitudeGradient {
	constructor(ctx) {
		this.width = ctx.canvas.clientWidth;
		this.height = ctx.canvas.clientHeight;

		this.imageData = ctx.getImageData(0,0, this.width, this.height);
		this.dimensional = this.toDimensional(this.imageData);
		this.dimensionalByY = this.toDimensionalByY(this.dimensional);
		
		this.luminance = this.toLuminance(this.dimensional);

		this.vertical = this.toVerticalGradient(this.luminance);
		this.horizontal = this.toHorizontalGradient(this.luminance);

		this.magnitude = this.toMagnitudeGradient(this.vertical, this.horizontal);
		this.normalized = this.toNormalizedMagnitude(this.magnitude);
		
		this.asImageData = this.toImageData(this.normalized);
	}

	log = () => {
	}


	/*	
	Maps a one-dimensional ImageData array
	to a three(two?)-dimensional pixel-mapped array
	to represent the image data by x-y coords
		
	from [r,g,b,a [,r,g,b,a], ...]
	to   [x][y] -> [r,g,b,a] 
	*/

	toDimensional = (arr) => {
		let converted = [];

		for (let i = 0; i < this.width; i++) {
			let col = [];

			for (let j = 0; j < this.height; j++) {
				let pixelIndex = (j * this.width + i) * 4;
				let pixel = this.imageData.data.slice(pixelIndex, pixelIndex + 4);

				col[j] = pixel;
			}

			converted.push(col);
		}

		return converted;
	}

	toDimensionalByY = (arr) => {
		let converted = [];

		for (let x = 0; x < arr.length; x++) {
			for (let y = 0; y < arr[0].length; y++) {
				if (converted.length === y) converted.push([arr[x][y]]);
				else converted[y].push(arr[x][y]);
			}
		}

		return converted;
	}


	/*
	Maps two-dimensional array of RGBA pixel data
	to two-dimensional array of Luminance

	Luminance formula: 0.2126*R + 0.7152*G + 0.0722*B
	src: https://en.wikipedia.org/wiki/Relative_luminance
	*/

	toLuminance = arr => arr.map((x) => x.map((y) => {
		let [r, g, b] = y;
		return 0.2126*r + 0.7152*g + 0.0722*b;
	}));


	/*
	Maps two-dimensional array of Luminance pixel data
	to two-dimensial array of vertical luminance gradient
	in each pixel's 1x3 neighborhood
	*/

	toVerticalGradient = (arr) => arr.map((x, i) => x.map((y, j) => {
		// if pixel is a top-edge pixel, use itself instead of it's predecessor
		let y1 = (j > 0) ? x[j - 1] : y;

		// if pixel is a bottom-edge pixel, use itself instead of it's successor
		let y2 = (j < x.length - 2) ? x[j + 1] : y;

		// return the partial differential
		return y2 - y1; 
	}));

	
	/*
	Maps two-dimensional array of Luminance pixel data
	to two-dimensial array of vertical luminance gradient
	in each pixel's 3x1 neighborhood
	*/

	toHorizontalGradient = (arr) => arr.map((x, i) => x.map((y, j) => {
		// if pixel is a left-edge pixel, use itself instead of it's predecessor
		let x1 = (i > 0) ? arr[i - 1][j] : x[j];

		// if pixel is a right-edge pixel, use itself instead of it's successor
		let x2 = (i < arr.length - 1) ? arr[i + 1][j] : x[j];

		// return the partial differential
		return x2 - x1;
	}));


	/*
	Zips two two-dimensional luminance gradient arrays
	into a two-dimensional gradient magnitude array
	*/

	toMagnitudeGradient = (arr1, arr2) => arr1.map((x, i) => x.map((y, j) => {
		return Math.sqrt(Math.pow(y, 2) + Math.pow(arr2[i][j], 2));
	}))
	

	/*
	Normalizes a two-dimensional gradient magnitude array
	to rounded values between 0-255
	*/

	toNormalizedMagnitude = (arr) => {
		// first find the min and max values
		let min = Infinity;
		let max = -Infinity;

		// crude but effective
		arr.map(x => {
			let colMin = Math.min(...x);
			let colMax = Math.max(...x);

			if (colMin < min) min = colMin;
			if (colMax > max) max = colMax;
		});

		return arr.map(x => x.map(y => 255 * (y - min) / (max - min)));
	}


	/*
	Converts two-dimensional array of 255-normalized gradient magnitude
	to one-dimensional array of

		[r,g,b,a [,r,g,b,a], ...]

	to be used as ImageData type for canvas
	*/

	toImageData = (arr) => {
		let imageData = new Uint8ClampedArray(this.width * this.height * 4);

		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				let pixelIndex = (j * this.width + i) * 4;
				let pixelValue = arr[i][j];
				
				imageData[pixelIndex] = pixelValue;
				imageData[pixelIndex + 1] = pixelValue;
				imageData[pixelIndex + 2] = pixelValue; 
				imageData[pixelIndex + 3] = 255;
			}
		}

		return new ImageData(imageData, this.width, this.height);
	}
}


export default MagnitudeGradient