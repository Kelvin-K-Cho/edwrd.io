$(function(){
  let canvas = new fabric.Canvas("canvas");
  let selectedShape;

  // Functions
  let initializeCanvas = () => {
    canvas.setWidth(320);
    canvas.setHeight(480);
    canvas.backgroundColor = "#fff";
  };

  let addShape = () => {
    let shape = selectedShape;
    let color = $(`#shape-color`).val();
    let opacity = parseFloat($(`#shape-opacity`).val());
    if (!shape) {
      alert(`Please select a shape`);
      return false;
    }
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
    let style = $(`#text-style`).val();
    let size = parseInt($(`#text-size`).val());
    let color = $(`#text-color`).val();
    let text = new fabric.IText("Happy birthday", {
      left: 50,
      top: 50,
      fontFamily: style,
      fontSize: size,
      fill: color
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
    let width = Math.round(br.x - tl.x);
    let height = Math.round(br.y - tl.y);

    fabric.Image.fromURL(imageUrl, function(img){
      img.set({
        scaleX: width / img.width,
        scaleY: height / img.height,
        left: left,
        top: top,
      });
      canvas.remove(activeObject);
      canvas.add(img);
      canvas.renderAll();
    });

    return false;
  };

  let changeBackground = (color) => {
    canvas.setBackgroundColor(color, //this is correct
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

    download(json, 'json.txt', "text/plain;charset=utf-8");
  };

  let saveTemplate = () => {
    let _id = $(`#templateName`).val();
    let occasion = $(`#occasion`).val();

    if (!_id || !occasion) {
      return false;
    }

    let previewURL = canvas.toDataURL({
      multiplier: .3
    });

    let json = canvas.toJSON();
    let objects = json[`objects`];

    objects.forEach((object) => {
      if (object[`type`] === `image`) {
        object[`src`] = ``;
      }
    });

    let input = {
      "_id": _id,
      "occasion": occasion,
      "templatePreviewURL": previewURL,
      "template": json
    };

    let url = `http://34.216.224.153:9000/fabric/template/save`;

    $.post(url, JSON.stringify(input), function(output){
      $(".close").trigger("click");
    });

    return false;
  };

  let searchTemplates = () => {
    let phrase = $(`#search-phrase`).val();
    let url = `http://34.216.224.153:9000/n3n/cloud/syntax3`;
    let html = ``;
    $.post(url, phrase, function(output){
      let json = JSON.parse(output);
      $(`#images-list`).empty();
      let images = json.images;
      images.forEach((element) => {
        let previewURL = element["photoPreviewURL"];
        html = `
          <li class="images-item">
            <img class="preview-image" src="${previewURL}">
          </li>
        `;
        $(`#images-list`).append(html);
        html = ``;
      });
      $(`#templates-list`).empty();
      let templates = json.templates;
      templates.forEach((element) => {
        let previewURL = element["templatePreviewURL"];
        let id = element["_id"];

        html += `
          <li class="templates-item">
            <img class="template-image" id="${id}" src="${previewURL}">
          </li>
        `;

        $(`#templates-list`).append(html);

        html = ``;
      });
    });
  };


  let setTemplate = (event) => {
    event.preventDefault();

    let templateId = event.currentTarget.id;
    let url = `http://34.216.224.153:9000/fabric/template/fetch`;

    $.post(url, templateId, function(output){
      let template = output;

      canvas.clear();
      canvas.loadFromJSON(template, function() {
        canvas.renderAll();
      });

      let imagesList = [];
      let counter = 0;

      $(`.preview-image`).each((index, li) => {
        let parseUrl = (unparsedUrl) => {
          let regex = /http:/gi;
          let result;
          let indicies = [];
          while ( (result = regex.exec(unparsedUrl)) ) {
            indicies.push(result.index);
          }
          let last = indicies[indicies.length - 1];
          return unparsedUrl.slice(last);
        };

        let imageUrl = parseUrl(li.src);

        imagesList.push(imageUrl);
      });

      let objects = canvas._objects;

      objects.forEach((object) => {
        if (object["type"] === "image") {

          let imageUrl = imagesList[counter];

          let left = object.left - 1.75;
          let top = object.top - 1.75;
          let tl = object.aCoords.tl;
          let br = object.aCoords.br;
          let width = Math.round(br.x - tl.x);
          let height = Math.round(br.y - tl.y);

          fabric.Image.fromURL(imageUrl, function(img){
            img.set({
              scaleX: width / img.width,
              scaleY: height / img.height,
              left: left,
              top: top,
            });
            canvas.remove(object);
            canvas.add(img);
            canvas.renderAll();
          });

        }
      });

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

  let changeColor = (event) => {
    let eventId = event.currentTarget.id;
    let color = $(`#${eventId}`).val();
    $(`#${eventId}`).next(`.selected-color`).css(`background-color`, `${color}`);
    if (eventId === `background-color`) {
      changeBackground(color);
    }
  };

  // Events
  initializeCanvas();

  $(`#shapes-list`).selectable({
    selected: function(){
      $(`.ui-selected`, this).each(function(){
        selectedShape = $(this).get(0).id || selectedShape;
      });
    }
  });

  $("#addText").click(addText);
  $("#addShape").click(addShape);
  $("#deleteItem").click(deleteItem);
  $("#downloadTemplate").click(downloadTemplate);
  $("#saveTemplate").click(saveTemplate);
  $(`#searchButton`).click(searchTemplates);
  $("#changeBackground").click(changeBackground);
  $("#templates-list").on("click", ".template-image", setTemplate);
  $("#images-list").on("click", ".preview-image", changeImage);

  $("#addPhoto").change(addPhoto);
  $("#uploadTemplate").change(uploadTemplate);
  $(`#shape-color`).change(changeColor);
  $(`#text-color`).change(changeColor);
  $(`#background-color`).change(changeColor);

  $("#addButton").click(function(){
    $("#addPhoto").click();
  });
  $("#uploadButton").click(function(){
    $("#uploadTemplate").click();
  });
});
