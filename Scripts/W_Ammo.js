const { refObject } = require('@tabletop-playground/api');
const { UI } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let cartridge_in_clip = world.importSound("Weapon/cartridge_in_clip.mp3");
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z * 1.1;
const widgetWidth = refObject.getExtent().y * 200;
const widgetHeight = refObject.getExtent().x * 200;
const nameFont = UI.GetTextFont();
const textColor = UI.GetTextColor();
//-----------------------------------------------------------------
let numberRounds = 1;
refObject.onCreated.add(() => {
  ChangeDescription();
})

refObject.onSnapped.add((obj, _2, snapPoint) => {
  let clip = snapPoint.getParentObject();
  if (clip.type && clip.type == "Clip" && clip.CheckMaxAmmo()) {
    cartridge_in_clip.playAttached(clip);
    //-------------------------
    clip.onChangeAmmunition(numberRounds, obj.getName());
    obj.destroy();
  }
})
//-----------------------------------------------------------------
class SettingsAmmo{
  constructor(parent, position) {
    this.parent = parent;
    //-------------------------
    this.nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(this.nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    this.numberRoundsT = new TextBox().setText(numberRounds).setFontSize(15).setTextColor(textColor).setFont(nameFont).setInputType(4).setSelectTextOnFocus(true);
    this.nC.addChild(this.numberRoundsT, 0, widgetHeight - 20, widgetWidth, 20);
    this.numberRoundsT.onTextCommitted.add((_1, _2, nText) => {
      numberRounds = parseInt(nText);
      ChangeDescription();
    })
  }
}
let settingsAmmo = new SettingsAmmo(refObject, new Vector(0, 0, zPosition));
//-----------------------------------------------------------------
let ChangeDescription = () => {
  refObject.setDescription(`Number of rounds to be added: ${numberRounds}`);
}
//-----------------------------------------------------------------
refObject.type = "Ammo";