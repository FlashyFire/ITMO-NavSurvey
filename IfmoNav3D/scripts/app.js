import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js";
import { OBJLoader2 } from "https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/loaders/OBJLoader2.js";
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

function main() {
  setupNav(onActivate);

  // Получение канвы, создание рендерера
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });

  // Настройка камеры
  const fov = 45;
  const aspect = 2;
  const near = 0.01;
  const far = 7500;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 100, 200);

  // Настройка управления 3D вида мышью
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  // Создание сцены, задание фонового цвета
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf9f9f9);

  // Функция настройки позиции камеры
  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // вектор направления на камеру
    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(-50, 1, -1))
      .normalize();
    // перемещение камеры в новую позицию
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
    // настройка поля зрения камеры по глубине
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;
    camera.updateProjectionMatrix();
    // настройка направления камеры
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

  // Настройка освещения сцены (небесное)
  {
    const skyColor = 0xffffff;
    const groundColor = 0xa0a0a0;
    const intensity = 0.85;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  // Настройка освещения сцены (направленное)
  {
    const color = 0xffffff;
    const intensity = 0.15;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(10, 10, -10);
    light.target.position.set(0, -5, 0);
    scene.add(light);
    scene.add(light.target);
  }

  // Настройка свойств материала
  function setupMaterial(material, opacity, color) {
    material.opacity = opacity;
    material.transparent = opacity < 1;
    material.color.setHex(color);
  }

  // Загрузка моделей этажей здания
  const wallColor = 0x80a0f0;
  const wallOpacity = 0.4;

  function loadFloor(name, ypos) {
    const objLoader = new OBJLoader2();
    objLoader.load(`./models/${name}.obj`, (floor) => {
      floor.position.set(0, ypos, 0);
      floor.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material))
            child.material.forEach((material) =>
              setupMaterial(material, wallOpacity, wallColor)
            );
          else setupMaterial(child.material, wallOpacity, wallColor);
        }
      });
      scene.add(floor);
      if (name == "ifmo3") {
        // Вычисление размеров загруженных объектов
        const box = new THREE.Box3().setFromObject(floor);
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());
        // Настройка позиции камеры
        frameArea(boxSize * 0.75, boxSize, boxCenter, camera);
        // Настройка управления видом 3D сцены
        controls.maxPolarAngle = Math.PI / 2;
        controls.maxDistance = boxSize * 10;
        controls.target.copy(boxCenter);
        controls.update();
      }
    });
  }

  loadFloor("ifmo1", 0);
  loadFloor("ifmo2", 1.05);
  loadFloor("ifmo3", 1.9);
  loadFloor("ifmo4", 2.55);
  loadFloor("ifmoroof", 3.9);

  // Номера этажей
  function makeFloorNum(font, num, x, y, z, a) {
    const geometry = new THREE.TextGeometry(num.toString(), {
      font: font,
      size: 0.35,
      height: 0.07,
    });
    var material = new THREE.MeshPhongMaterial({
      color: 0xc0c0ff,
      side: THREE.DoubleSide,
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotateY(a);
    mesh.position.set(x, y, z);
    return mesh;
  }

  var labelFont = null;
  const loader = new THREE.FontLoader();

  loader.load("./fonts/roboto-regular.json", (font) => {
    labelFont = font;

    const a1 = (Math.PI * 2) / 3;
    scene.add(makeFloorNum(font, 1, -0.55, 0.1, -9, a1));
    scene.add(makeFloorNum(font, 2, -0.55, 1.0, -9, a1));
    scene.add(makeFloorNum(font, 3, -0.55, 1.8, -9, a1));
    scene.add(makeFloorNum(font, 4, -0.55, 2.5, -9, a1));
    scene.add(makeFloorNum(font, 5, -0.55, 3.15, -9, a1));

    const a2 = (Math.PI * 5) / 6;
    scene.add(makeFloorNum(font, 1, 9.25, 0.1, 1.25, a2));
    scene.add(makeFloorNum(font, 2, 9.25, 1.0, 1.25, a2));
    scene.add(makeFloorNum(font, 3, 9.25, 1.8, 1.25, a2));
    scene.add(makeFloorNum(font, 4, 9.25, 2.5, 1.25, a2));
    scene.add(makeFloorNum(font, 5, 9.25, 3.15, 1.25, a2));
  });

  // Маршруты
  var activeRoute = null;
  var activeTarget = null;
  var activeLabel = null;
  const routeColor = 0xff3333;

  function clearRoute() {
    if (activeRoute != null) {
      scene.remove(activeRoute);
      activeRoute = null;
    }
    if (activeTarget != null) {
      scene.remove(activeTarget);
      activeTarget = null;
    }
    if (activeLabel != null) {
      scene.remove(activeLabel);
      activeLabel = null;
    }
  }

  function createRoute(points) {
    const path = new THREE.CurvePath();
    for (var i = 1; i < points.length; i++) {
      let p1 = points[i - 1];
      let p2 = points[i];
      path.add(
        new THREE.LineCurve3(
          new THREE.Vector3(p1.x, p1.y, p1.z),
          new THREE.Vector3(p2.x, p2.y, p2.z)
        )
      );
    }
    const geometry = new THREE.TubeBufferGeometry(path, 486, 0.055, 12, false);
    const material = new THREE.MeshBasicMaterial({
      color: routeColor,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  function createTargetGeometry(room) {
    if (room.geom == "box")
      return new THREE.PlaneBufferGeometry(room.w, room.h);

    const shape = new THREE.Shape();
    var p = room.points[0];
    shape.moveTo(p.x, p.y);
    for (var i = 1; i < room.points.length; i++) {
      var pt = room.points[i];
      shape.lineTo(pt.x, pt.y);
    }
    shape.lineTo(p.x, p.y);
    return new THREE.ShapeBufferGeometry(shape);
  }

  function createTarget(room) {
    const geometry = createTargetGeometry(room);
    const material = new THREE.MeshBasicMaterial({
      color: routeColor,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(Math.PI / 2);
    mesh.position.set(room.x, room.y, room.z);
    mesh.rotateZ(room.a);
    return mesh;
  }

  function createLabel(id, room) {
    if (labelFont === null) return null;
    const geometry = new THREE.TextGeometry(id, {
      font: labelFont,
      size: 0.3,
      height: 0.055,
    });
    var material = new THREE.MeshPhongMaterial({
      color: 0x404040,
      side: THREE.DoubleSide,
    });
    geometry.center();
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotateY(Math.PI / 2);
    mesh.position.set(room.x, room.y + 0.4, room.z);
    return mesh;
  }

  function drawRoute(route) {
    clearRoute();
    if (route !== undefined) {
      activeRoute = createRoute(route.points);
      activeTarget = createTarget(route.room);
      activeLabel = createLabel(route.id, route.room);
      scene.add(activeRoute);
      scene.add(activeTarget);
      if (activeLabel !== null) scene.add(activeLabel);
    }
  }

  function showRoute(panel, value) {
    removeElements(panel, "route-part");

    if (value === "") return true;

    var route = routes.find((x) => strEq(x.id, value));
    if (route !== undefined) {
      drawRoute(route);

      var p = document.createElement("div");
      p.classList.add("route-part");
      p.innerHTML = route.guides.join("<br><br>");
      p.routeId = route.id;
      p.onclick = function () {
        drawRoute(routes.find((x) => strEq(x.id, this.routeId)));
      };

      panel.appendChild(p);
    }
    return route !== undefined;
  }

  // Поиск по номеру аудитории
  function onSearchRoom() {
    clearRoute();
    var panel = document.getElementById("room-panel");
    var input = document.getElementById("room");
    var value = input.value;
    if (showRoute(panel, value)) {
      input.classList.remove(inputError);
      if (strEq(value, "141")) checkTarget("room141");
      if (strEq(value, "262")) checkTarget("room262");
    } else input.classList.add(inputError);
  }

  // Поиск по номеру группы
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
          if (strEq(this.routeId, "141") && strEq(this.groupId, "P4171")) checkTarget("groupP4171");
        };
        panel.appendChild(p);
        var p = document.createElement("div");
        p.classList.add("panel");
        panel.appendChild(p);
      });
    } else input.classList.add(inputError);
  }

  // Поиск по преподавателю
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
          x.time +
          ", аудитория " +
          x.room +
          ",<br>" +
          x.course +
          ", " +
          x.group;
        p.routeId = x.room;
        p.teacher = value;
        p.onclick = function () {
          var r = this.nextElementSibling;
          hideElements(this.parentElement, "panel", r);
          r.style.display = "block";
          showRoute(r, this.routeId);
          if (strEq(this.routeId, "285") && strEq(this.teacher, "Саркисова")) checkTarget("teacher");
        };
        panel.appendChild(p);
        var p = document.createElement("div");
        p.classList.add("panel");
        panel.appendChild(p);
      });
    } else input.classList.add(inputError);
  }

  // Поиск по наименованию
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

  // Настройка размеров рендерера при изменении размеров канвы
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) renderer.setSize(width, height, false);
    return needResize;
  }

  // Рендеринг сцены
  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    if (activeLabel !== null) activeLabel.rotateY(Math.PI / 96);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
