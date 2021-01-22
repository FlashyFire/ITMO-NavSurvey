import { setupNav } from "./nav.js";
import { routes, groups, teachers, places } from "./routes.js";
import { removeElements, hideElements, addHandlers, strEq } from "./utils.js";

const inputError = "input-error";

function checkTarget(name) {
  var page = window.survey.currentPage;
  if (page.name == name && window.survey.getValue(name) == "Затрудняюсь") {
    window.survey.setValue(name, page.timeSpent.toString());
    window.survey.nextPage();
  }
}

setupNav(onActivate);

var activeRouteId = null;
var activePartId = 1;

var floors = document.getElementsByClassName("button");

for (var i = 0; i < floors.length; i++) {
  floors[i].addEventListener("click", floorClick);
}

function floorClick() {
  selectFloor(this.innerHTML);
  clearRoute();
}

function selectFloor(floor) {
  for (var i = 0; i < floors.length; i++) {
    if (floors[i].innerHTML == floor) {
      floors[i].classList.add("active");
      document.getElementById("map").src = `images/${floor}_floor.png`;
    } else {
      floors[i].classList.remove("active");
    }
  }
}

function drawRoute() {
  setTimeout(function () {}, 0);
  var canvas = document.getElementById("canvas");
  var box = document.getElementById("map");
  canvas.width = box.offsetWidth;
  canvas.height = box.offsetHeight;

  var ctx = canvas.getContext("2d");

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (activeRouteId == null) return;

  ctx.strokeStyle = "#444";
  ctx.lineWidth = 16;
  ctx.setLineDash([1, 24]);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  let cvp = getCanvasParams(canvas);
  ctx.translate(cvp.x, cvp.y);
  ctx.scale(cvp.scale, cvp.scale);

  var route = routes.find((x) => strEq(x.id, activeRouteId));
  var part = route.floors.find((x) => x.part === activePartId);

  selectFloor(part.floor);

  var points = part.points;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (var i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
}

function getCanvasParams(canvas) {
  let yscale = canvas.height / 1250;
  let xscale = canvas.width / 1600;
  let scale = Math.min(xscale, yscale);
  if (yscale < xscale) {
    let x = Math.floor((canvas.width - 1600 * scale) / 2);
    return { x: x, y: 0, scale: scale };
  } else {
    let y = Math.floor((canvas.height - 1250 * scale) / 2);
    return { x: 0, y: y, scale: scale };
  }
}

window.onresize = function () {
  drawRoute();
};

function clearRoute() {
  activeRouteId = null;
  drawRoute();
}

function showRoute(panel, value) {
  removeElements(panel, "route-part");

  if (value === "") return true;

  var route = routes.find((x) => strEq(x.id, value));
  if (route !== undefined) {
    activeRouteId = value;
    activePartId = 1;
    drawRoute();
    route.floors.forEach((x) => {
      var p = document.createElement("div");
      p.classList.add("route-part");
      p.innerHTML = x.guide;
      p.routeId = route.id;
      p.partId = x.part;
      p.onclick = function () {
        activeRouteId = this.routeId;
        activePartId = this.partId;
        drawRoute();
      };
      panel.appendChild(p);
    });
  }
  return route !== undefined;
}

function onSearchRoom() {
  var panel = document.getElementById("room-panel");
  var input = document.getElementById("room");
  var value = input.value;
  if (showRoute(panel, value)) {
    input.classList.remove(inputError);
    if (strEq(value, "141")) checkTarget("room141");
    if (strEq(value, "262")) checkTarget("room262");
  } else input.classList.add(inputError);
}

function onSearchGroup() {
  var panel = document.getElementById("group-panel");

  removeElements(panel, "panel");
  removeElements(panel, "level-part");
  clearRoute();

  var input = document.getElementById("group");
  var value = input.value;

  if (value === "") {
    input.classList.remove(inputError);
    return;
  }

  var group = groups.find((x) => strEq(x.id, value));
  if (group !== undefined) {
    input.classList.remove(inputError);
    group.schedule.forEach((x) => {
      var p = document.createElement("div");
      p.classList.add("level-part");
      p.innerHTML =
        x.time +
        ", аудитория " +
        x.room +
        ",<br>" +
        x.course +
        ", " +
        x.teacher;
      p.routeId = x.room;
      p.groupId = value;
      p.onclick = function () {
        var r = this.nextElementSibling;
        hideElements(this.parentElement, "panel", r);
        r.style.display = "block";
        showRoute(r, this.routeId);
        if (strEq(this.routeId, "141") && strEq(this.groupId, "P4171"))
          checkTarget("groupP4171");
      };
      panel.appendChild(p);
      var p = document.createElement("div");
      p.classList.add("panel");
      panel.appendChild(p);
    });
  } else input.classList.add(inputError);
}

function onSearchTeacher() {
  var panel = document.getElementById("teacher-panel");

  removeElements(panel, "panel");
  removeElements(panel, "level-part");
  clearRoute();

  var input = document.getElementById("teacher");
  var value = input.value;

  if (value === "") {
    input.classList.remove(inputError);
    return;
  }

  var teacher = teachers.find((x) => strEq(x.name, value));
  if (teacher !== undefined) {
    input.classList.remove(inputError);
    teacher.schedule.forEach((x) => {
      var p = document.createElement("div");
      p.classList.add("level-part");
      p.innerHTML =
        x.time + ", аудитория " + x.room + ",<br>" + x.course + ", " + x.group;
      p.routeId = x.room;
      p.teacher = value;
      p.onclick = function () {
        var r = this.nextElementSibling;
        hideElements(this.parentElement, "panel", r);
        r.style.display = "block";
        showRoute(r, this.routeId);
        if (strEq(this.routeId, "285") && strEq(this.teacher, "Саркисова"))
          checkTarget("teacher");
      };
      panel.appendChild(p);
      var p = document.createElement("div");
      p.classList.add("panel");
      panel.appendChild(p);
    });
  } else input.classList.add(inputError);
}

function onSearchPlace() {
  var panel = document.getElementById("place-panel");

  removeElements(panel, "route-part");
  clearRoute();

  var input = document.getElementById("place");
  var value = input.value;
  var place = places.find((x) => strEq(x.name, value));
  if (place !== undefined) {
    input.classList.remove(inputError);
    showRoute(panel, place.room);
    if (strEq(value, "ФПИиКТ")) checkTarget("place");
  } else if (showRoute(panel, value)) input.classList.remove(inputError);
  else input.classList.add(inputError);
}

addHandlers("room", onSearchRoom);
addHandlers("group", onSearchGroup);
addHandlers("teacher", onSearchTeacher);
addHandlers("place", onSearchPlace);

function onActivate(id) {
  if (id === "room-panel") onSearchRoom();
  else if (id === "group-panel") onSearchGroup();
  else if (id === "teacher-panel") onSearchTeacher();
  else if (id === "place-panel") onSearchPlace();
}
