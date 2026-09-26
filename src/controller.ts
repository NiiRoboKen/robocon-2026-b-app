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
// フィールドやロボットの物理寸法 UI表示用のスケール変換
class Setting {
  fieldSize = { width: 5700, height: 10500 };
  robotSize = { width: 1000, height: 1000 };
  // ロボットの初期位置・初期角度
  get defaultRobotPosition() {
    return {
      x: 0,
      y: 0,
      theta: 0,
    };
  }
  // ウィンドウの高さ(90%)基準
  // 実寸のアスペクト比を維持したフィールドのスクリーン描画サイズ算出
  get fieldSizeScale() {
    return {
      width:
        (window.innerHeight * 0.9 * this.fieldSize.width) /
        this.fieldSize.height,
      height: window.innerHeight * 0.9,
    };
  }
  // フィールドの描画スケールに合わせてロボットのスクリーン描画サイズ算出
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
