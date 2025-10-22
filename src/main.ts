import "./style.css";

//--------------CREATE TITLE-------------------
const title = document.createElement("h1");
title.textContent = "D2 Sketchpad";
document.body.appendChild(title);

//--------------CREATE CANVAS------------------
const pad = document.createElement("canvas");
pad.classList.add("sketchpad");
document.body.appendChild(pad);
