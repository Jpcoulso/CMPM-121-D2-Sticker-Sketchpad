import "./style.css";

//-----------------------------------------------------------------------------------------INITIAL GAME SETUP----------------

//-------------CREATE GLOBAL VARIABLES---------------
let usingSticker = false;
let activeSticker: StickerObject | null = null;
let currentSticker: StickerCommand | null = null;
const lines: MarkerLine[] = [];
const redoLines: MarkerLine[] = [];
const toolPreviews: ToolPreview[] = [];
let currentLine: MarkerLine | null = null;
let lineWidth: number = 2;
let toolPreview: ToolPreview | null = null;
const cursor = { active: false, x: 0, y: 0 };

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
//-----------------------------------------------------------------------------------------INTERFACES----------
interface MarkerLine {
  display(ctx: CanvasRenderingContext2D): void;
  drag(x: number, y: number): void;
}
interface ToolPreview {
  display(ctx: CanvasRenderingContext2D): void;
  drag(x: number, y: number): void; // track mouse position
}
interface StickerCommand {
  display(ctx: CanvasRenderingContext2D): void;
  drag(x: number, y: number): void;
}
interface StickerObject {
  name: string;
  text: string;
  align: CanvasTextAlign;
  baseLine: CanvasTextBaseline;
  font: string;
}

const stickers: StickerObject[] = [
  {
    name: "skull",
    text: "💀",
    align: "center",
    baseLine: "middle",
    font: "24px Arial",
  },
];

//-----------------------------------------------------------------------------------------CREATE UI BUTTONS-------------------
// CLEAR
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
document.body.append(clearButton);
// LISTENER
clearButton.addEventListener("click", () => {
  ctx!.clearRect(0, 0, canvas.width, canvas.height);
  lines.splice(0, lines.length);
});
// UNDO
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
document.body.append(undoButton);
// LISTENER
undoButton.addEventListener("click", () => {
  const lastLine = lines.pop();
  if (lastLine !== undefined) {
    redoLines.push(lastLine);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});
// REDO
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
document.body.append(redoButton);
// LISTENER
redoButton.addEventListener("click", () => {
  const lastLine = redoLines.pop();
  if (lastLine !== undefined) {
    lines.push(lastLine);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});
// THIN
const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
document.body.append(thinButton);
// LISTENER
thinButton.addEventListener("click", () => {
  usingSticker = false;
  lineWidth = 2;
});
// THICK
const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
document.body.append(thickButton);
// LISTENER
thickButton.addEventListener("click", () => {
  usingSticker = false;
  lineWidth = 6;
});
// SKULL EMOJI
const skullButton = document.createElement("button");
skullButton.textContent = "💀";
document.body.append(skullButton);
// LISTENER
skullButton.addEventListener("click", () => {
  usingSticker = true;
  activeSticker = stickers.find((s) => s.name === "skull")!;
});
//--------------------------------------------------------------------------------EVENT LISTENERS FOR DRAWING, AND DISPLAYING PREVIEW----------------
//------------------------------WHEN MOUSE DOWN ACTIVATE CURSOR--------------
canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  if (usingSticker) {
    currentSticker = createStickerCommmand(activeSticker!, cursor.x, cursor.y);
    lines.push(currentSticker);
  } else {
    currentLine = createMarkerLine(cursor.x, cursor.y, lineWidth);
    lines.push(currentLine);
  }
});
//-------------------------------WHEN MOUSE ENTERS CANVAS CREATE TOOL PREVIEW----
canvas.addEventListener("mouseenter", () => {
  if (usingSticker) {
    toolPreview = createStickerPreview(activeSticker!);
    toolPreviews.push(toolPreview);
  } else {
    toolPreview = createToolPreview(lineWidth);
    toolPreviews.push(toolPreview);
  }
});
//-------------------------------AS MOUSE MOVES DRAW ON CANVAS--------------
canvas.addEventListener("mousemove", (e) => {
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  if (usingSticker && currentSticker) {
    currentSticker.drag(cursor.x, cursor.y);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  } else {
    if (!cursor.active) {
      if (toolPreview) {
        toolPreview.drag(cursor.x, cursor.y);
      }
      canvas.dispatchEvent(new CustomEvent("tool-moved"));
    }
    if (cursor.active) {
      if (currentLine) {
        currentLine.drag(cursor.x, cursor.y);
      }
      canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
  }
});
//---------------------------WHEN MOUSE LEAVES CANVAS STOP DISPLAYING TOOL PREVIEW-------
canvas.addEventListener("mouseleave", () => {
  toolPreviews.splice(0, toolPreviews.length);
  canvas.dispatchEvent(new CustomEvent("tool-moved"));
});
//-----------------------------WHEN CURSOR IS RELEASED DEACTIVATE IT (DRAWING STOPS)-------
canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;
  currentSticker = null;
});
// wWHEN USER IS DRAWING, REDRAW THE CANVAS TO DISPLAY USER'S LINES
canvas.addEventListener("drawing-changed", redraw);
canvas.addEventListener("tool-moved", redraw);
//---------------------------------------------------------------------------------------------------FUNCTIONS-------------------
//------------REDRAW----------------------------
function redraw() {
  ctx!.clearRect(0, 0, canvas.width, canvas.height);
  for (const command of lines) {
    command.display(ctx!);
  }
  if (!cursor.active) {
    for (const preview of toolPreviews) {
      preview.display(ctx!);
    }
  }
}
//--------------CREATE COMMAND FACTORY----------
// creates a command that holds: points: an array of points that form a line, drag: a method to add more points to line, display: a method to display the line
function createMarkerLine(x: number, y: number, width: number): MarkerLine {
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
//----------CREATE TOOL PREVIEW----------------
function createToolPreview(width: number): ToolPreview {
  let x = 0;
  let y = 0;

  return {
    drag(nx, ny) {
      x = nx;
      y = ny;
    },

    display(ctx) {
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.fillStyle = "rgba(0,0,0,0.1)";

      // Draw a circle with the stroke width
      ctx.beginPath();
      ctx.arc(x, y, width / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      ctx.restore();
    },
  };
}
function createStickerCommmand(
  sticker: StickerObject,
  x: number,
  y: number,
): StickerCommand {
  return {
    drag(nx, ny) {
      x = nx;
      y = ny;
    },

    display(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.font = sticker.font;
      ctx.textAlign = sticker.align;
      ctx.textBaseline = sticker.baseLine;
      ctx.fillText(sticker.text, x, y);
      ctx.restore();
    },
  };
}
function createStickerPreview(sticker: StickerObject): ToolPreview {
  let x = 0;
  let y = 0;

  return {
    drag(nx: number, ny: number) {
      x = nx;
      y = ny;
    },

    display(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.font = `${sticker.font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Semi-transparent preview
      ctx.globalAlpha = 0.7;
      ctx.fillText(sticker.text, x, y);
      ctx.restore();
    },
  };
}
