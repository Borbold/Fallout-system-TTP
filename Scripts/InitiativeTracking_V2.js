const { refObject, world } = require('@tabletop-playground/api');
const { CreateCanvasElement, GetTextFont, GetTextColor } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  loadState();
})
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z * 1.15;
const widgetWidth = refObject.getExtent().x * 200;
const offsetPlateY = 200;
const widgetHeight = refObject.getExtent().y * 200 + offsetPlateY;
const nameFont = GetTextFont();
const textColor = GetTextColor();
//-----------------------------------------------------------------
let whoseMove = 0;
let characterNames = ["Kel", "Mur", "Kar"], countCharacter = 3, initiativeBonus = [0, 0, 0];
let vecT = textColor.toVector(), characterColor = [];
//-----------------------------------------------------------------
for (let i = 0; i < countCharacter; i++)
  characterColor[i] = [vecT.x + " " + Math.round(vecT.y * 100) / 100 + " " + vecT.z];
//-----------------------------------------------------------------
class InitiativeTracker {
  constructor(parent, position) {
    let t = this;
    this.startPosition = position;
    this.hidePosition = new Vector();
    this.parent = parent;
    //-------------------------
    let nC = new Canvas();
    this.nCUI = CreateCanvasElement(nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 90, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    this.initiative = new VerticalBox();
    nC.addChild(this.initiative, 0, offsetPlateY / 2, widgetWidth, widgetHeight - offsetPlateY - 200);
    this.SetVerticalWidget();
    //-------------------------
    let buttonRoll = new Button().setText("Roll").setTextColor(textColor).setFont(nameFont);
    buttonRoll.setFontSize(60);
    nC.addChild(buttonRoll, widgetWidth / 2 - 80, widgetHeight - offsetPlateY / 2 - 125, 160, 100);
    buttonRoll.onClicked.add(() => {
      let initiativeRoll = [];
      for (let i = 0; i < countCharacter; i++) {
        initiativeRoll.push(Math.floor((Math.random() * 20 + parseInt(initiativeBonus[i]))));
      }
      for (let i = 0; i < countCharacter; i++) {
        for (let j = 0; j < countCharacter - i; j++) {
          if (initiativeRoll[j] < initiativeRoll[j + 1]) {
            let value = initiativeRoll[j];
            initiativeRoll[j] = initiativeRoll[j + 1];
            initiativeRoll[j + 1] = value;

            value = characterNames[j];
            characterNames[j] = characterNames[j + 1];
            characterNames[j + 1] = value;
          }
        }
      }

      whoseMove = 0;
      this.UpdateVerticalWidget();
    })
    //-------------------------
    let prevInitiative = new Button().setText("Prev").setTextColor(textColor).setFont(nameFont);
    prevInitiative.setFontSize(60);
    nC.addChild(prevInitiative, 25, widgetHeight - offsetPlateY / 2 - 125, 160, 100);
    prevInitiative.onClicked.add(() => {
      if (whoseMove - 1 >= 0) {
        whoseMove -= 1;
      } else {
        whoseMove = countCharacter - 1;
      }
      this.PassOn(whoseMove + 1 < countCharacter && whoseMove + 1 || "0");
    })
    //-------------------------
    let nextInitiative = new Button().setText("Next").setTextColor(textColor).setFont(nameFont);
    nextInitiative.setFontSize(60);
    nC.addChild(nextInitiative, widgetWidth - 185, widgetHeight - offsetPlateY / 2 - 125, 160, 100);
    nextInitiative.onClicked.add(() => {
      if (whoseMove + 1 < countCharacter) {
        whoseMove += 1;
      } else {
        whoseMove = 0;
      }
      this.PassOn(whoseMove - 1 >= 0 && String(whoseMove - 1) || countCharacter - 1);
    })
    //--Setting-----------------------
    let gear = new ImageButton().setImage("gear-icon.png");
    nC.addChild(gear, widgetWidth - 100, 0, 100, 100);
    gear.onClicked.add(() => {
      settings.ShowUI();
      t.HideUI();
    })
  }

  SetVerticalWidget() {
    for (let i = 0; i < countCharacter; i++) {
      let newColor = String(characterColor[i]).split(" ");
      let newText = new Text().setText(characterNames[i]).setTextColor(new Color(newColor[0], newColor[1], newColor[2])).setFontSize(70);
      this.initiative.addChild(newText);
    }
    this.initiative.getChildAt(whoseMove).setTextColor(new Color(1, 1, 1));
  }

  UpdateVerticalWidget() {
    for (let i = 0; i < countCharacter; i++)
      this.initiative.removeChildAt(0);
    this.SetVerticalWidget();
    settings.UpdateVerticalWidget();
    saveState();
  }

  PassOn(prev) {
    let newColor = String(characterColor[prev]).split(" ");
    this.initiative.getChildAt(prev).setTextColor(new Color(newColor[0], newColor[1], newColor[2]));
    this.initiative.getChildAt(whoseMove).setTextColor(new Color(1, 1, 1));
    saveState();
  }

  HideUI() {
    this.nCUI.scale = 0.01;
    this.nCUI.position = this.hidePosition;
    this.parent.updateUI(this.nCUI);
  }
  ShowUI() {
    this.nCUI.scale = 0.1;
    this.nCUI.position = this.startPosition;
    this.parent.updateUI(this.nCUI);
  }
}
let IT = new InitiativeTracker(refObject, new Vector(0, 0, zPosition));

class Settings {
  constructor(parent, position) {
    let t = this;
    this.startPosition = new Vector(0, 0, zPosition);
    this.hidePosition = position;
    this.parent = parent;
    //-------------------------
    let nC = new Canvas();
    this.nCUI = CreateCanvasElement(nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 90, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    this.verticalBox = new VerticalBox();
    nC.addChild(this.verticalBox, 0, offsetPlateY / 2, widgetWidth, widgetHeight - offsetPlateY - 200);
    this.SetVerticalWidget();
    //-------------------------
    let newHorizontalBox = new Button().setText("New").setTextColor(textColor).setFont(nameFont);
    newHorizontalBox.setFontSize(60);
    nC.addChild(newHorizontalBox, widgetWidth / 2 - 80, widgetHeight - offsetPlateY / 2 - 125, 160, 100);
    newHorizontalBox.onClicked.add(() => {
      characterNames.push("New"); characterColor.push(vecT.x + " " + Math.round(vecT.y * 100) / 100 + " " + vecT.z); initiativeBonus.push(0);
      countCharacter = characterNames.length;
      IT.UpdateVerticalWidget();
    })
    //-------------------------
    let cross = new ImageButton().setImage("cross-icon.png");
    nC.addChild(cross, widgetWidth - 100, 0, 100, 100);
    cross.onClicked.add(() => {
      IT.ShowUI();
      t.HideUI();
    })
  }

  SetVerticalWidget() {
    for (let i = 0; i < countCharacter; i++) {
      let newTColor = String(characterColor[i]).split(" ");
      let newText = new TextBox().setText(characterNames[i]).setFontSize(70).setTextColor(new Color(newTColor[0], newTColor[1], newTColor[2]));
      newText.onTextCommitted.add((_1, _2, text) => {
        characterNames[i] = text;
        IT.UpdateVerticalWidget();
      })

      let newColor = new TextBox().setText(characterColor[i]).setFontSize(70);
      newColor.onTextCommitted.add((_1, _2, text) => {
        characterColor[i] = text;
        let newColor = characterColor[i].split(" ");
        IT.initiative.getChildAt(i).setTextColor(new Color(newColor[0], newColor[1], newColor[2]));
        newText.setTextColor(new Color(newColor[0], newColor[1], newColor[2]));
      })

      let newBonus = new TextBox().setText(initiativeBonus[i]).setFontSize(70).setInputType(3).setTextColor(new Color(0.14, 1, 0.59));
      newBonus.onTextCommitted.add((_1, _2, text) => {
        initiativeBonus[i] = text;
      })

      let crossButton = new Button().setText("X").setTextColor(textColor).setFontSize(60);
      crossButton.onClicked.add(() => {
        IT.initiative.removeChildAt(i);
        this.verticalBox.removeChildAt(i);
        countCharacter -= 1;
        characterColor.splice(i, 1);
        initiativeBonus.splice(i, 1); characterNames.splice(i, 1);
      })

      let horizontalBox = new HorizontalBox().setChildDistance(50);
      horizontalBox.addChild(newText); horizontalBox.addChild(newColor);
      horizontalBox.addChild(newBonus); horizontalBox.addChild(crossButton);

      this.verticalBox.addChild(horizontalBox);
    }
  }

  UpdateVerticalWidget() {
    for (let i = 0; i < countCharacter; i++)
      this.verticalBox.removeChildAt(0);
    this.SetVerticalWidget();
    saveState();
  }

  HideUI() {
    this.nCUI.scale = 0.01;
    this.nCUI.position = this.hidePosition;
    this.parent.updateUI(this.nCUI);
  }
  ShowUI() {
    this.nCUI.scale = 0.1;
    this.nCUI.position = this.startPosition;
    this.parent.updateUI(this.nCUI);
  }
}
let settings = new Settings(refObject, new Vector(0, 0, -zPosition));
//-----------------------------------------------------------------
function saveState() {
  //let state = {};

  //state["characterNames"] = characterNames;
  //state["whoseMove"] = whoseMove;

  //refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  //if (refObject.getSavedData() === "") {
  //  saveState();
  //  return;
  //}

  //let state = JSON.parse(refObject.getSavedData());

  //IT.initiative.setText(state["characterNames"]);
  //whoseMove = state["whoseMove"];
  //IT.PassOn();
}