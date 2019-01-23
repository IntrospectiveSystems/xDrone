class Servo {

	Start(com, fun) {
		this.send({Cmd: "SetWidth"})
		fun(null, com);
	}

	SetWidth(com, fun) {
		if (com.Width < this.Par.MIN_PULSEWIDTH || com.Width > this.Par.MAX_PULSEWIDTH) {
			return fun(`Servo::SetWidth error GPIO:${this.Par.Pin}, Width ${com.Width} out of Range`, com);
		}

		this.Vlt.Width = com.Width;
		this.Vlt.Servo.servoWrite(com.Width);
		fun(null, com);
	}

	async Slide(com, fun) {
		if (com.Width < this.Par.MIN_PULSEWIDTH || com.Width > this.Par.MAX_PULSEWIDTH) {
			return fun(`Servo::Slide error GPIO:${this.Par.Pin}, Width ${com.Width} out of Range`, com);
		}

		let startWidth = this.Vlt.Width;
		let stepSize = 0;

		if ('Steps' in com) {
			stepSize = Math.round((com.Width - startWidth) / com.Steps);
		}

		if ('Wait' in com) {
			if (com.Wait < 100) stepSize = com.Width - startWidth;
			else {
				let minsteptime = 100;
				let nSteps = com.Wait / minsteptime;
				stepSize = Math.round((com.Width - startWidth) / nSteps);
			}
		}

		for (let width = startWidth; Math.abs(width - startWidth > stepSize); width += stepSize) {
			if (width < this.Par.MIN_PULSEWIDTH || width > this.Par.MAX_PULSEWIDTH) {
				return fun(`Servo::Slide error GPIO:${this.Par.Pin}, Width ${com.Width} out of Range`, com);
			}
			this.Vlt.Width = Math.round(width);
			this.Vlt.Servo.servoWrite(this.Vlt.Width);
			await new Promise((res) => setTimeout(res, Math.round(com.StepWait) || 100));
		}

		this.Vlt.Width = Math.round(com.Width);
		this.Vlt.Servo.servoWrite(this.Vlt.Width);

		fun(null, com);
	}

	SetMax(com, fun) {
		this.Par.MAX_PULSEWIDTH = com.Value;
		fun(null, com);
	}

	SetMin(com, fun) {
		this.Par.MIN_PULSEWIDTH = com.Value;
		fun(null, com);
	}
}