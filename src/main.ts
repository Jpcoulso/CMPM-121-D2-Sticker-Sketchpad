import "./style.css";

//----------------------------------------------------INITIAL GAME SETUP----------------
//--------------CREATE TITLE-------------------
const title = document.createElement("h1");
title.textContent = "D2 Sketchpad";
document.body.appendChild(title);

//--------------CREATE CANVAS------------------
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.classList.add("sketchpad");
document.body.appendChild(canvas);

//--------------CREATE CTX----------------------
const ctx = canvas.getContext("2d");
ctx!.strokeStyle = "black";
ctx!.lineWidth = 2;
//--------------CREATE COMMAND INTERFACE----------
interface DisplayCommand {
  display(ctx: CanvasRenderingContext2D): void;
  drag(x: number, y: number): void;
}

//-------------CREATE LINE ARRAYS---------------
const lines: DisplayCommand[] = [];
const redoLines: DisplayCommand[] = [];
let currentLine: DisplayCommand | null = null;
let lineWidth: number = 2;

//-------------CREATE CURSOR-------------------
const cursor = { active: false, x: 0, y: 0 };

//----------------------------------------------------CREATE UI BUTTONS-------------------
// CLEAR
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
document.body.append(clearButton);
// UNDO
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
document.body.append(undoButton);
// REDO
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
document.body.append(redoButton);
// THIN
const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
document.body.append(thinButton);
// THICK
const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
document.body.append(thickButton);
//----------------------------------------------------MOUSE LISTENERS FOR DRAWING----------------
//----WHEN MOUSE DOWN ACTIVATE CURSOR--------------
canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  currentLine = createMarkerLine(cursor.x, cursor.y, lineWidth);
  lines.push(currentLine);
});
//----AS MOUSE MOVES DRAW ON CANVAS--------------
canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    if (currentLine) {
      currentLine.drag(cursor.x, cursor.y);
    }
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});
//----WHEN CURSOR IS RELEASED DEACTIVATE IT (DRAWING STOPS)---------------------------
canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;
});
// wWHEN USER IS DRAWING, REDRAW THE CANVAS TO DISPLAY USER'S LINES
canvas.addEventListener("drawing-changed", redraw);
//----------------------------------------------------------BUTTON LISTENERS----------------
//-------------CLEAR-------------
clearButton.addEventListener("click", () => {
  ctx!.clearRect(0, 0, canvas.width, canvas.height);
  lines.splice(0, lines.length);
});
//-------------UNDO-------------
undoButton.addEventListener("click", () => {
  const lastLine = lines.pop();
  if (lastLine !== undefined) {
    redoLines.push(lastLine);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});
//-------------REDO-------------
redoButton.addEventListener("click", () => {
  const lastLine = redoLines.pop();
  if (lastLine !== undefined) {
    lines.push(lastLine);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});
//-------------THIN-------------
thinButton.addEventListener("click", () => {
  lineWidth = 2;
});
//-------------THICK-------------
thickButton.addEventListener("click", () => {
  lineWidth = 4;
});
//--------------------------------------------------------------FUNCTIONS-------------------
function redraw() {
  ctx!.clearRect(0, 0, canvas.width, canvas.height);
  for (const command of lines) {
    command.display(ctx!);
  }
}
//--------------CREATE COMMAND FACTORY----------
// creates a command that holds: points: an array of points that form a line, drag: a method to add more points to line, display: a method to display the line
function createMarkerLine(x: number, y: number, width: number): DisplayCommand {
  const points = [{ x, y }];

  return {
    drag(x, y) {
      points.push({ x, y });
    },

    display(ctx) {
      if (points.length < 2) return;

      ctx.save(); // save current style
      ctx.lineWidth = width; // change style to what user wants for this line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (const { x, y } of points) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore; // restore previous style
    },
  };
}
