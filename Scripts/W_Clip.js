const { refObject, world } = require('@tabletop-playground/api');
const { UI, CheckPlayerColor } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let cage = world.importSound("Weapon/cage.mp3");
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z * 1.1;
const widgetWidth = refObject.getExtent().y * 200;
const widgetHeight = refObject.getExtent().x * 200;
const nameFont = UI.GetTextFont();
const textColor = UI.GetTextColor();
//-----------------------------------------------------------------
let currentAmmo = 0;
let textAmmo = "Ammo: ?";
let ammunitionsName = [], ammunitionsTID = [];
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  UI.SetHideShowPosition(0, zPosition);
  loadState();
  ChangeAmmunitionText();
})

refObject.onSnapped.add((obj, _2, snapPoint) => {
  let weapon = snapPoint.getParentObject();
  if (weapon.type && weapon.type == "Weapon" && weapon.idClip == null) {
    cage.playAttached(refObject);
    //-------------------------
    weapon.idClip = obj.getId();
    weapon.onSpendAmmo = SpendAmmo;
    obj.setScale(new Vector(0.01, 0.01, 0.01));
    ClipIn(weapon.getId());
  }
})
//-----------------------------------------------------------------
class SettingsButton {
  constructor(parent, position) {
    let t = this;
    this.parent = parent;
    //-------------------------
    this.nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(this.nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    let settings = new ImageButton().setImage("Icons/gear-icon.png");
    this.nC.addChild(settings, widgetWidth - 30, 0, 30, 30);
    settings.onClicked.add((_1, player) => {
      if (CheckPlayerColor(player.getPlayerColor(), new Color(0, 0, 0))) {
        UI.HideUI(t, parent);
        UI.ShowUI(settingsClip, parent);
      }
    })
    //-------------------------
    let ammoOut = new ImageButton().setImage("Icons/ammo-out-icon.png");
    this.nC.addChild(ammoOut, 0, 0, 30, 30);
    ammoOut.onClicked.add(() => {
      if (ammunitionsTID.length > 0) {
        let newAmmo = world.createObjectFromTemplate(ammunitionsTID.pop(), parent.getPosition().add(new Vector(3, 0, 0)));
        newAmmo.setName(ammunitionsName[ammunitionsName.length - 1]);
        SpendAmmo();
      }
    })
  }
}
let settingsButton = new SettingsButton(refObject, new Vector(0, 0, zPosition));

class SettingsClip {
  constructor(parent, position) {
    let t = this;
    this.parent = parent;
    this.maxAmmo = 10;
    //-------------------------
    this.nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(this.nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    this.maxAmmoTB = new TextBox().setText(this.maxAmmo).setFontSize(20).setTextColor(textColor).setFont(nameFont).setInputType(4).setSelectTextOnFocus(true);
    this.nC.addChild(this.maxAmmoTB, 0, 0, widgetWidth, widgetHeight);
    this.maxAmmoTB.onTextCommitted.add((_1, _2, nText) => {
      t.maxAmmo = parseInt(nText);
      ChangeAmmunitionText();
    })
    //-------------------------
    this.maxText = new Text().setText("Max").setFontSize(20).setTextColor(textColor).setFont(nameFont);
    this.nC.addChild(this.maxText, 0, 0, widgetWidth, 25);
    //-------------------------
    let cross = new ImageButton().setImage("Icons/cross-icon.png");
    this.nC.addChild(cross, widgetWidth - 30, 0, 30, 30);
    cross.onClicked.add(() => {
      UI.HideUI(t, parent);
      UI.ShowUI(settingsButton, parent);
    })
  }
}
let settingsClip = new SettingsClip(refObject, new Vector(0, 0, 0));
//-----------------------------------------------------------------
function SpendAmmo() {
  if (currentAmmo > 0) {
    world.broadcastChatMessage(ammunitionsName.pop());
    currentAmmo--;
    ChangeAmmunitionText();
    return true;
  }
}

function ChangeAmmunition(value, name, TID) {
  value = parseInt(value);
  if (currentAmmo + value > settingsClip.maxAmmo) {
    currentAmmo = settingsClip.maxAmmo;
  } else if (currentAmmo + value < 0) {
    currentAmmo = 0;
  } else {
    if (value > 0) {
      for (let i = 0; i < value; i++) {
        ammunitionsName.push(name);
        ammunitionsTID.push(TID);
      }
    }
    else {
      for (let i = 0; i < -value; i++) {
        ammunitionsName.pop();
        ammunitionsTID.pop();
      }
    }

    currentAmmo += value;
  }
  ChangeAmmunitionText();
}
function ChangeAmmunitionText() {
  textAmmo = "Ammo: " + currentAmmo + "/" + settingsClip.maxAmmo;
  refObject.setDescription(textAmmo);
  saveState();
}

function ClipIn(idWeapon) {
  saveState(idWeapon);
}
//-----------------------------------------------------------------
refObject.type = "Clip";
refObject.onChangeAmmunition = ChangeAmmunition;
refObject.CheckMaxAmmo = () => { return currentAmmo != settingsClip.maxAmmo; }
refObject.ClipOut = () => { ClipIn("0"); }
//-----------------------------------------------------------------
function saveState(idWeapon) {
  let state = {};
  
  state["sAmmo"] = [currentAmmo, settingsClip.maxAmmo];
  state["ammunitionsName"] = ammunitionsName;
  state["ammunitionsTID"] = ammunitionsTID;
  if (idWeapon)
    state["idWeapon"] = idWeapon;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());
  currentAmmo = state["sAmmo"][0];
  settingsClip.maxAmmo = state["sAmmo"][1];
  settingsClip.maxAmmoTB.setText(settingsClip.maxAmmo);
  ammunitionsName = state["ammunitionsName"] || [];
  ammunitionsTID = state["ammunitionsTID"] || [];
  if (state["idWeapon"] && state["idWeapon"] != "0") {
    let weapon = world.getObjectById(state["idWeapon"]);
    weapon.idClip = refObject.getId();
    weapon.onSpendAmmo = SpendAmmo;
  }
}