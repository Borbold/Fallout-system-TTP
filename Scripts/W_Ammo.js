const { refObject } = require('@tabletop-playground/api');
const { UI, CheckPlayerColor } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let cartridge_in_clip = world.importSound("Weapon/cartridge_in_clip.mp3");
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z * 1.1 || 0.02;
const widgetWidth = refObject.getSize().y * 100 || 60;
const widgetHeight = refObject.getSize().x * 100 || 80;
const nameFont = UI.GetTextFont();
const textColor = UI.GetTextColor();
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  loadState();
  ChangeDescription();
})

refObject.onSnapped.add((obj, _2, snapPoint) => {
  let clip = snapPoint.getParentObject();
  if (clip.type && clip.type == "Clip" && clip.CheckMaxAmmo()) {
    cartridge_in_clip.playAttached(clip);
    //-------------------------
    clip.onChangeAmmunition(settingsAmmo.numberRounds, obj.getName(), obj.getTemplateId());
    obj.destroy();
  }
})
//-----------------------------------------------------------------
class SettingsAmmo{
  constructor(parent, position) {
    let t = this;
    this.parent = parent;
    this.numberRounds = 1;
    //-------------------------
    this.nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(this.nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    this.numberRoundsT = new TextBox().setText(this.numberRounds).setFontSize(15).setTextColor(textColor).setFont(nameFont).setInputType(4).setSelectTextOnFocus(true);
    this.nC.addChild(this.numberRoundsT, 0, widgetHeight - 20, widgetWidth, 20);
    this.numberRoundsT.onTextCommitted.add((_1, player, nText) => {
      if (player && CheckPlayerColor(player.getPlayerColor(), new Color(0, 0, 0))) {
        t.numberRounds = parseInt(nText);
        ChangeDescription();
        saveState();
      }
    })
  }

  set SetNumberRounds(value) {
    this.numberRounds = value;
    this.numberRoundsT.setText(value);
  }
}
let settingsAmmo = new SettingsAmmo(refObject, new Vector(0, 0, zPosition));
refObject.refSettingsAmmo = settingsAmmo;
//-----------------------------------------------------------------
let ChangeDescription = () => {
  refObject.setDescription(`Number of rounds to be added: ${settingsAmmo.numberRounds}`);
}
//-----------------------------------------------------------------
refObject.type = "Ammo";
//-----------------------------------------------------------------
function saveState() {
  let state = {};

  state["numberRounds"] = settingsAmmo.numberRounds;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());
  settingsAmmo.SetNumberRounds = state["numberRounds"];
}