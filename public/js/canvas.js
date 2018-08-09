$(function(){
  let canvas = new fabric.Canvas("canvas");
  let selectedShape;

  // Functions
  let initializeCanvas = () => {
    canvas.setWidth(320);
    canvas.setHeight(480);
    canvas.backgroundColor = "#fff";
  };

  let addRectangle = () => {
    let rectangle = new fabric.Rect({
      left: 50,
      top: 50,
      width: 20,
      height: 20,
      opacity: .25,
    });
    canvas.add(rectangle);
  };

  let addShape = () => {
    let shape = selectedShape;
    let color = $(`#shape-color`).val();
    let opacity = parseFloat($(`#shape-opacity`).val());
    switch (shape) {
      case "circle":
        let circle = new fabric.Circle({
          left: 50,
          top: 50,
          radius: 20,
          fill: color,
          opacity
        });
        canvas.add(circle);
        break;
      case "square":
        let square = new fabric.Rect({
          left: 50,
          top: 50,
          width: 25,
          height: 25,
          fill: color,
          opacity
        });
        canvas.add(square);
        break;
      case "line":
        let line = new fabric.Line([50, 50, 150, 50], {
          left: 50,
          top: 50,
          stroke: color,
          opacity
        });
        canvas.add(line);
        break;
      default:
      return false;
    }
  };

  let addText = () => {
    let text = new fabric.IText("text", {
      left: 50,
      top: 50
    });
    canvas.add(text);
  };

  let deleteItem = () => {
    let activeObject = canvas.getActiveObject();
    canvas.remove(activeObject);
  };

  let addPhoto = (e) => {
    let reader = new FileReader();
    reader.onload = function(event) {
      let img = new Image();
      img.src = event.target.result;
      img.onload = function() {
        let image = new fabric.Image(img);
        image.set({
          left: 0,
          top: 0
        }).scale(0.1);
        canvas.add(image);
      };
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  let changeImage = (event) => {
    event.preventDefault();

    let parseUrl = (url) => {
      let regex = /http:/gi;
      let result;
      let indicies = [];
      while ( (result = regex.exec(url)) ) {
        indicies.push(result.index);
      }
      let last = indicies[indicies.length - 1];
      return url.slice(last);
    };

    let imageUrl = parseUrl(event.currentTarget.src);

    let activeObject = canvas.getActiveObject();

    let left = activeObject.left;
    let top = activeObject.top;
    let tl = activeObject.aCoords.tl;
    let br = activeObject.aCoords.br;
    let width = br.x - tl.x;
    let height = br.y - tl.y;

    fabric.Image.fromURL(imageUrl, function(img){
      img.set({
        left,
        top,
      }).scale(0.1);
      img.scaleToWidth(width);
      img.scaleToHeight(height);
      canvas.remove(activeObject);
      canvas.add(img);
    });

    // let image = new Image();
    //
    // image.onload = function () {
    //   let tempCanvas = document.createElement('canvas');
    //   tempCanvas.width = this.width;
    //   tempCanvas.height = this.height;
    //   tempCanvas.getContext(`2d`).drawImage(this, 0, 0);
    //
    //   let dataURL = canvas.toDataURL();
    //
    //   let fabricImage = new fabric.Image(dataURL);
    //
    //   tempCanvas = null;
    // };
    //
    // image.src = imageUrl;

    return false;
  };

  let changeBackground = () => {
    canvas.setBackgroundColor("#42bcf4", //this is correct
    canvas.renderAll.bind(canvas));
  };

  let downloadTemplate = () => {
    let json = JSON.stringify(canvas.toJSON());

    let download = (content, fileName, contentType) => {
        let a = document.createElement("a");
        let file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    };

    // let preview = canvas.toDataURL({
    //   multiplier: .3
    // });
    //
    // let js = JSON.parse(json);
    //
    // for (let i = 0; i < js.objects.length; i++) {
    //   if (js.objects[i].type === "image") {
    //     js.objects[i].src = "";
    //   }
    // }
    //
    // let object = {};
    // object["_id"] = 1;
    // object["templatePreviewURL"] = preview;
    // object["occasion"] = "birthday";
    // object["template"] = js;
    //
    // let string = JSON.stringify(object);
    //
    // download(string, 'json.txt', "text/plain;charset=utf-8");

    download(json, 'json.txt', "text/plain;charset=utf-8");
  };

  let fetchImages = () => {
    let html = ``;
    let url = `http://34.216.224.153:9000/n3n/cloud/app/service/tempPhotoFetch`;
    $.get(url, function(output){
      $(`#images-list`).empty();
      let parsedList = JSON.parse(output);
      parsedList.forEach((element) => {
        let previewURL = element["photoPreviewURL"];

        html += `
          <li class="images-item">
            <img class="preview-image" src="${previewURL}">
          </li>
        `;

        $(`#images-list`).append(html);

        html = ``;
      });
    });
  };

  let fetchTemplates = () => {
    let html = ``;
    let url = `http://34.216.224.153:9000/fabric/fetchAllTemplates`;

    let scale = (image, factor) => {
      image.setHeight(image.getHeight() * factor);
      image.setWidth(image.getWidth() * factor);
      if (image.backgroundImage) {
        let backgroundImage = image.backgroundImage;
        backgroundImage.width = backgroundImage.width * factor;
        backgroundImage.height = backgroundImage.height * factor;
      }
      image.setZoom(factor);
      image.renderAll();
      image.calcOffset();
    };

    let templates = window._templates = {};

    $.get(url, function(output){
      $(`#layouts-list`).empty();
      let parsedList = JSON.parse(output);

      Object.values(parsedList).forEach((element) => {
        let object = JSON.parse(element);
        let _id = object[`_id`];

        templates[`template-${_id}`] = object;

        html += `
          <li class="layouts-item">
            <canvas class="layout-image" id="template-${_id}" height="480" width="320"></canvas>
          </li>
        `;
        $(`#layouts-list`).append(html);

        let image = new fabric.StaticCanvas(`template-${_id}`);
        image.loadFromJSON(object);

        scale(image, .3);
        html = ``;

      });
    });
  };

  let setTemplate = (event) => {
    event.preventDefault();

    let templateId = event.currentTarget.id;

    let template = window._templates[templateId];

    canvas.clear();

    canvas.loadFromJSON(template, function() {
      canvas.renderAll();
    });

    return false;
  };

  let uploadTemplate = (e) => {
    let file = e.target.files[0];
    let json;

    let reader = new FileReader();

    reader.onload = function(event) {
      json = event.target.result;
      canvas.clear();
      canvas.loadFromJSON(json, function() {
        canvas.renderAll();
      });
    };

    reader.readAsText(file);
  };

  let changeColor = () => {
    let color = $(`#shape-color`).val();
    $(`#selected-color`).css(`background-color`, `${color}`);
  };

  // Events
  initializeCanvas();
  fetchTemplates(); //load all templates from the start since it's big call
  fetchImages();

  $(`#shapes-list`).selectable({
    selected: function(){
      $(`.ui-selected`, this).each(function(){
        selectedShape = $(this).get(0).id || selectedShape;
      });
    }
  });

  $("#addText").click(addText);
  $("#addRectangle").click(addRectangle);
  $("#addShape").click(addShape);
  $("#deleteItem").click(deleteItem);
  $("#downloadTemplate").click(downloadTemplate);
  $("#changeBackground").click(changeBackground);
  $("#layouts-list").on("click", ".layout-image", setTemplate);
  $("#images-list").on("click", ".preview-image", changeImage);

  $("#addPhoto").change(addPhoto);
  $("#uploadTemplate").change(uploadTemplate);
  $(`#shape-color`).change(changeColor);

  $("#addButton").click(function(){
    $("#addPhoto").click();
  });
  $("#uploadButton").click(function(){
    $("#uploadTemplate").click();
  });
});
