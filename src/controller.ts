export type Position = {
  x: number;
  y: number;
};

export type Status = Position & {
  theta: number;
};

export type ToFStatus = {
  distance: number;
  degree: number;
};

class Setting {
  fieldSize = { width: 5250, height: 10500 };
  robotSize = { width: 1000, height: 1000 };

  get defaultRobotPosition() {
    return {
      x: this.fieldSize.width / 2 - this.robotSize.width / 2,
      y: this.fieldSize.height - this.robotSize.height,
      theta: 0,
    };
  }
  get fieldSizeScale() {
    return {
      width:
        (window.innerHeight * 0.9 * this.fieldSize.width) /
        this.fieldSize.height,
      height: window.innerHeight * 0.9,
    };
  }
  get robotSizeScale() {
    return {
      width:
        (this.fieldSizeScale.width * this.robotSize.width) /
        this.fieldSize.width,
      height:
        (this.fieldSizeScale.height * this.robotSize.height) /
        this.fieldSize.height,
    };
  }
}

export const setting = new Setting();

class modeTheme {
  blue = {
    colors: {
      backGround: "#87CEFA",
      workingArea: "#6495ED",
      other: "#1E90FF",
      robotColor: "#FF0000",
    },
    fieldImageSrc: "/fieldBlueImage.png",
  };
  red = {
    colors: {
      backGround: "#FFC0CB",
      workingArea: " 	#FF69B4",
      other: "#FF0000",
      robotColor: "#1E90FF",
    },
    fieldImageSrc: "/fieldRedImage.png",
  };
}

export const ModeTheme = new modeTheme();
