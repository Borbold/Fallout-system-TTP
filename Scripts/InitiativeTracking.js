const { refObject, world } = require('@tabletop-playground/api');
const { UI } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  loadState();
})
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z * 1.15;
const widgetWidth = refObject.getExtent().x * 200;
const offsetPlateY = 200;
const widgetHeight = refObject.getExtent().y * 200 + offsetPlateY;
const nameFont = UI.GetTextFont();
const textColor = UI.GetTextColor();
//-----------------------------------------------------------------
let whoseMove = 0;
let characterNames = "Kel\nMur\nKar\nKar1\nKar2\nKar3\nKar4", countCharacter = 7;
class InitiativeTracker {
  constructor(parent, position) {
    let t = this;
    this.parent = parent;
    //-------------------------
    let nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 90, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    this.initiative = new MultilineTextBox().setText(characterNames).setTextColor(textColor).setFont(nameFont);
    this.initiative.setFontSize(70).setBackgroundTransparent(false);
    nC.addChild(this.initiative, 0, offsetPlateY / 2, widgetWidth / 1.5, widgetHeight - offsetPlateY - 200);
    this.initiative.onTextCommitted.add((_1, _2, text) => {
      characterNames = text;
      countCharacter = text.split(/\s?\n/).length;
      saveState();
    })
    //-------------------------
    this.tracker = new MultilineTextBox().setText("<----").setFont(nameFont).setEnabled(false);
    this.tracker.setFontSize(70).setBackgroundTransparent(true);
    nC.addChild(this.tracker, widgetWidth / 1.5, offsetPlateY / 2, widgetWidth / 3, widgetHeight - offsetPlateY - 200);
    //-------------------------
    let buttonRoll = new Button().setText("Roll").setTextColor(textColor).setFont(nameFont);
    buttonRoll.setFontSize(60);
    nC.addChild(buttonRoll, widgetWidth / 2 - 80, widgetHeight - offsetPlateY / 2 - 125, 160, 100);
    buttonRoll.onClicked.add(() => {
      let breakText = characterNames.split(/\s?\n/);
      let initiativeRoll = [], locInitiative = [];
      for (let i = 0; i < breakText.length; i++) {
        initiativeRoll.push(Math.floor((Math.random() * 20 + parseInt(breakText[i].split(" ")[1] || "0"))));
        locInitiative.push(i);
      }
      for (let i = 0; i < countCharacter; i++) {
        for (let j = 0; j < countCharacter - i; j++) {
          if (initiativeRoll[j] < initiativeRoll[j + 1]) {
            let value = initiativeRoll[j];
            initiativeRoll[j] = initiativeRoll[j + 1];
            initiativeRoll[j + 1] = value;

            value = locInitiative[j];
            locInitiative[j] = locInitiative[j + 1];
            locInitiative[j + 1] = value;
          }
        }
      }
      
      let newLayount = breakText[locInitiative[0]];
      for (let i = 1; i < countCharacter; i++) {
        newLayount += "\n" + breakText[locInitiative[i]];
      }
      t.initiative.setText(newLayount);

      t.tracker.setText("<----"); whoseMove = 0;
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
      this.PassOn();
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
      this.PassOn();
    })
  }

  PassOn() {
    let locTracker = "";
    for (let i = 0; i < whoseMove; i++) {
      locTracker += "\n";
    }
    this.tracker.setText(locTracker + "<----");
    saveState();
  }
}
let IT = new InitiativeTracker(refObject, new Vector(0, 0, zPosition));
//-----------------------------------------------------------------
function saveState() {
  let state = {};

  state["characterNames"] = characterNames;
  state["whoseMove"] = whoseMove;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());

  IT.initiative.setText(state["characterNames"]);
  whoseMove = state["whoseMove"];
  IT.PassOn();
}