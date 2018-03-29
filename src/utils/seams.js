/* 

	Calculates low-energy seams across a 2d array of gradient magnitude data

*/


class Seams {
	constructor(gradient) {
		this.data = gradient.data;
		this.width = gradient.width;
		this.height = gradient.height;

		this.minSeamMatrix = this.generateMinSeamMatrix();
		this.minSeam = this.pluckMinSeam();
	}


	generateMinSeamMatrix = () => {
		let minSeamMatrix = new Array(this.data.length);

		// fill the first row
		for (let i = 0; i < this.width; i++) {
			minSeamMatrix[i] = this.data[i];
		}
		
		for (let i = this.width; i < this.data.length; i++) {
			let p1 = (i % this.width > 0) ? minSeamMatrix[i - this.width - 1] : Infinity;
			let p2 = minSeamMatrix[i - this.width];
			let p3 = (i % this.width < this.width - 1) ? minSeamMatrix[i - this.width + 1] : Infinity;

			minSeamMatrix[i] = Math.min(p1, p2, p3) + this.data[i];
		}

		return minSeamMatrix;
	}


	/*
	Works backwards through our minSeamMatrix to pick out
	a set of [x] => y coordinate mappings which correspond
	with the seam through the image with the lowest total energy
	*/
	pluckMinSeam = () => {
		let min = Infinity;
		let minIndex;

		// get our starting pixel
		for (let i = this.data.length - this.width; i < this.data.length; i++) {
			if (this.minSeamMatrix[i] < min) {
				min = this.minSeamMatrix[i];
				minIndex = i;
			}
		}

		// start our seam from here and work backwards across the image
		// from bottom to top and store indices of the found seam's pixels
		let seam = [minIndex];
		let lastIndex = minIndex;

		while (lastIndex > this.width - 1) {
			min = Infinity;
			let nextIndex;

			// take care of edge pixels
			let n = (lastIndex % this.width > 0) ? -1 : 0;
			let m = (lastIndex % this.width < this.width - 1) ? 1 : 0;

			for (let i = n; i <= m; i++) {
				let curr = lastIndex - this.width + i;

				if (min > this.minSeamMatrix[curr]) {
					min = this.minSeamMatrix[curr];
					nextIndex = curr;
				}
			}

			lastIndex = nextIndex;
			seam.push(nextIndex);
		}

		return seam;
	}
}


export default Seams;