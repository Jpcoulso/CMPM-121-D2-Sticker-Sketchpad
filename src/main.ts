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

//-------------CREATE LINE ARRAYS---------------
const lines: { x: number; y: number }[][] = []; // Lines is an array of arrays: "[][]", and each of those arrays contains "{x: number, y: number}" objects
let currentLine: Array<{ x: number; y: number }> = [];

//-------------CREATE CURSOR-------------------
const cursor = { active: false, x: 0, y: 0 };

//------------CREATE UI BUTTONS-------------------
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
document.body.append(clearButton);

//----------------------------------------------------MOUSE LISTENERS FOR DRAWING----------------
//----WHEN MOUSE DOWN ACTIVATE CURSOR--------------
canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  currentLine = [];
  lines.push(currentLine);
  currentLine.push({ x: cursor.x, y: cursor.y });
});
//----AS MOUSE MOVES DRAW ON CANVAS--------------
canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    //ctx!.beginPath();
    //ctx!.moveTo(cursor.x, cursor.y);
    //ctx!.lineTo(e.offsetX, e.offsetY);
    //ctx!.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    currentLine.push({ x: cursor.x, y: cursor.y });
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});
// wWHEN USER IS DRAWING, REDRAW THE CANVAS TO DISPLAY USER'S LINES
canvas.addEventListener("drawing-changed", redraw);
//----WHEN CURSOR IS RELEASED DEACTIVATE IT (DRAWING STOPS)---------------------------
canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = [];
});
//----------------------------------------------------------BUTTON LISTENERS----------------
clearButton.addEventListener("click", () => {
  ctx!.clearRect(0, 0, canvas.width, canvas.height);
  lines.splice(0, lines.length);
});
//--------------------------------------------------------------FUNCTIONS-------------------
function redraw() {
  ctx!.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length > 1) {
      ctx!.beginPath();
      const { x, y } = line[0];
      ctx!.moveTo(x, y);
      for (const { x, y } of line) {
        ctx!.lineTo(x, y);
      }
      ctx!.stroke();
    }
  }
}
