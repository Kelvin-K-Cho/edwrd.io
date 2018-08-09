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
    let url = `http://34.216.224.153:9000/fabric/template/fetch`;

    $.post(url, templateId, function(output){
      let template = output;
      canvas.clear();
      canvas.loadFromJSON(template, function() {
        canvas.renderAll();
      });
      let imagesList = [];

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

      let counter = 0;

      objects.forEach((object) => {
        if (object["type"] === "image") {
          let left = object.left;
          let top = object.top;
          let tl = object.aCoords.tl;
          let br = object.aCoords.br;
          let width = br.x - tl.x;
          let height = br.y - tl.y;
          let imageUrl = imagesList[counter];

          fabric.Image.fromURL(imageUrl, function(img){
            img.set({
              left,
              top
            }).scale(0.1);
            img.scaleToWidth(width);
            img.scaleToHeight(height);
            canvas.remove(object);
            canvas.add(img);
          });
        }
      });

    });

    return false;
  };

  let setLayout = (event) => {
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

  let alterColor = () => {
    let color = $(`#text-color`).val();
    $(`#chosen-color`).css(`background-color`, `${color}`);
  };

  let modifyColor = () => {
    let color = $(`#background-color`).val();
    $(`#picked-color`).css(`background-color`, `${color}`);
    changeBackground(color);
  };

  // Events
  initializeCanvas();
  fetchTemplates(); //load all templates from the start since it's big call
  // fetchImages();

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
  $(`#searchButton`).click(searchTemplates);
  $("#changeBackground").click(changeBackground);
  $("#layouts-list").on("click", ".layout-image", setLayout);
  $("#templates-list").on("click", ".template-image", setTemplate);
  $("#images-list").on("click", ".preview-image", changeImage);
  $("#saveTemplate").click(saveTemplate);

  $("#addPhoto").change(addPhoto);
  $("#uploadTemplate").change(uploadTemplate);
  $(`#shape-color`).change(changeColor);
  $(`#text-color`).change(alterColor);
  $(`#background-color`).change(modifyColor);

  $("#addButton").click(function(){
    $("#addPhoto").click();
  });
  $("#uploadButton").click(function(){
    $("#uploadTemplate").click();
  });
});
