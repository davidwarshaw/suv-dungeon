import properties from "../properties";

import speechesDefinition from "../definitions/speechesDefinition.json";

import Font from "./Font";

export default class CharacterSpeech {
  constructor(scene, speechId, finishCallBack) {
    this.scene = scene;
    this.speechId = speechId;
    this.finishCallBack = finishCallBack;

    this.definition = JSON.parse(JSON.stringify(speechesDefinition[speechId]));

    this.font = new Font(scene);

    this.centerX = properties.width / 2;
    this.centerY = properties.height / 2;
    const portraitGutter = 62;
    const portraitYShift = 76;
    this.panelYShift = 40;
    this.panelWidth = 200;
    this.panelHeight = 80;
    this.textPadding = 8;

    this.leftPortrait = scene.add.sprite(
      portraitGutter,
      portraitYShift,
      `portrait-${this.definition.left}`
    );
    this.leftPortrait.visible = false;

    this.rightPortrait = scene.add.sprite(
      properties.width - portraitGutter,
      portraitYShift,
      `portrait-${this.definition.right}`
    );
    this.rightPortrait.flipX = true;
    this.rightPortrait.visible = false;

    this.speechPanel = scene.add.ninePatch(
      this.centerX,
      this.centerY + this.panelYShift,
      this.panelWidth,
      this.panelHeight,
      "speech-nine-patch",
      null,
      properties.ninePatchDimension
    );
    this.speechPanel.visible = false;

    const panelBounds = this.speechPanel.getBounds();
    this.text = this.font.render(
      panelBounds.left + this.textPadding,
      panelBounds.top + this.textPadding,
      ""
    );
    this.text.setOrigin(0, 0);

    this.speechPointer = -1;
    this.letterPointer = -1;
    this.speechChangeTimer = null;
    this.speechIntervalId = null;

    this.getCurrentSpeech = this.getCurrentSpeech.bind(this);
    this.getCurrentText = this.getCurrentText.bind(this);
    this.showNextLetter = this.showNextLetter.bind(this);
    this.showNextSpeech = this.showNextSpeech.bind(this);
    this.speechOver = this.speechOver.bind(this);
  }

  getCurrentSpeech() {
    return this.definition.speech[this.speechPointer];
  }

  getCurrentText() {
    const speech = this.getCurrentSpeech();
    const text = speech.text
      .split("")
      .slice(0, this.letterPointer + 1)
      .join("");
    return text;
  }

  showNextLetter() {
    this.letterPointer++;
    if (this.letterPointer >= this.getCurrentSpeech().text.length) {
      clearInterval(this.speechIntervalId);
      this.speechIntervalId = null;

      this.speechChangeTimer = this.scene.time.delayedCall(
        properties.speechWaitMillis,
        this.showNextSpeech
      );
      return;
    }

    const text = this.getCurrentText();
    this.text.setText(text);
  }

  showNextSpeech() {
    this.letterPointer = -1;
    this.speechPointer++;
    if (this.speechPointer >= this.definition.speech.length) {
      this.speechPointer = 0;
      this.speechOver();
      return;
    }

    const speech = this.getCurrentSpeech();
    this.text.setText("");

    this.leftPortrait.visible = speech.speaker === "left";
    this.rightPortrait.visible = speech.speaker !== "left";
    this.speechPanel.visible = true;

    this.speechIntervalId = setInterval(this.showNextLetter, properties.letterRateMillis);
  }

  speechOver() {
    this.finishCallBack();
  }
}
