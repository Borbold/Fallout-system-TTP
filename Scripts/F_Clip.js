const { refObject, world } = require('@tabletop-playground/api');
const { UI } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let soundReloading = world.importSound("perezariadka-avtomata-y8578uy.mp3");
const zPosition = refObject.getExtent().z * 1.1;
const widgetWidth = refObject.getExtent().y * 200;
const offsetPlateY = 60;
const widgetHeight = refObject.getExtent().x * 200 + offsetPlateY;
const nameFont = UI.GetTextFont();
const textColor = UI.GetTextColor();
//-----------------------------------------------------------------
let currentAmmo = 10, maxAmmo = 10;
let textAmmo = "Ammo:" + currentAmmo + "/" + maxAmmo;
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  UI.SetHideShowPosition(0, zPosition);
})

refObject.onSnapped.add((obj, _2, snapPoint) => {
  let weapon = snapPoint.getParentObject();
  if (weapon.type && weapon.type == "Weapon") {
    if (obj.getTemplateMetadata().includes(weapon.getName())) {
      soundReloading.play();

      weapon.idClip = obj.getId();
      weapon.onSpendAmmo = SpendAmmo;
      obj.setScale(new Vector(0.01, 0.01, 0.01));
    }
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
    settings.onClicked.add(() => {
      UI.HideUI(t, parent);
      UI.ShowUI(settingsClip, parent);
    })
  }
}
let settingsButton = new SettingsButton(refObject, new Vector(0, 0, zPosition));

class SettingsClip {
  constructor(parent, position) {
    let t = this;
    this.parent = parent;
    //-------------------------
    this.nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(this.nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    let cross = new ImageButton().setImage("Icons/cross-icon.png");
    this.nC.addChild(cross, widgetWidth - 30, 0, 30, 30);
    cross.onClicked.add(() => {
      UI.HideUI(t, parent);
      UI.ShowUI(settingsButton, parent);
    })
    //-------------------------
    let borderMain = new Border();
    borderMain.setColor(new Color(0, 0, 0));
    this.nC.addChild(borderMain, 0, offsetPlateY / 2, widgetWidth, widgetHeight - offsetPlateY);
    //-------------------------
    this.currentAmmoT = new Text().setText(textAmmo).setFontSize(20).setTextColor(textColor).setFont(nameFont);
    this.nC.addChild(this.currentAmmoT, 0, offsetPlateY / 2, widgetWidth, 30);
    //-------------------------
    let changedButton = UI.CreateNumberButton([1, 2, 5, 10, 25, 50], 20);
    this.nC.addChild(changedButton, 40, 57.5, 45, 35);
    //-------------------------
    UI.CreatePlusMinusButton(this.nC,
      {
        func: () => {
          if (currentAmmo + parseInt(changedButton.getText()) <= maxAmmo) {
            currentAmmo += parseInt(changedButton.getText());
          }
          else {
            currentAmmo = maxAmmo;
          }
          ChangeAmmunitionText();
        }, x: 100, y: 60, tex: "plus.png"
      },
      {
        func: () => {
          if (currentAmmo - changedButton.getText() >= 0) {
            currentAmmo -= changedButton.getText();
          } else {
            currentAmmo = 0;
          }
          ChangeAmmunitionText();
        }, x: 0, y: 60, tex: "minus.png"
      }, 30);
  }
}
let settingsClip = new SettingsClip(refObject, new Vector(0, 0, 0));
//-----------------------------------------------------------------
function SpendAmmo() {
  currentAmmo--;
  if (currentAmmo > 0) {
    console.log("Shoot: current ammo " + currentAmmo);
    ChangeAmmunitionText();
  } else {
    console.log("Ammo is out");
  }
}

function ChangeAmmunitionText() {
  textAmmo = "Ammo:" + currentAmmo + "/" + maxAmmo;
  settingsClip.currentAmmoT.setText(textAmmo);
}
//-----------------------------------------------------------------
refObject.type = "Clip";