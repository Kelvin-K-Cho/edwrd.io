$(function(){
  let canvas = new fabric.Canvas("canvas");

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

  let addText = () => {
    let text = new fabric.IText("text", {
      left: 50,
      top: 50
    });
    canvas.add(text);
  };

  let deleteImage = () => {
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

    download(json, 'json.txt', "text/plain;charset=utf-8");
  };

  let fetchTemplates = () => {
    let html = ``;
    let url = `http://34.216.224.153:9000/fabric/fetchAllTemplates`;

    //Function to scale the canvas to a certain dimension.
    let scale = (image, factor) => {
      image.setHeight(image.getHeight() * factor);
      image.setWidth(image.getWidth() * factor);
      if (image.backgroundImage) {
          // Need to scale background images as well
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

  // Events
  initializeCanvas();

  $("#addText").click(addText);
  $("#addRectangle").click(addRectangle);
  $("#deleteImage").click(deleteImage);
  $("#downloadTemplate").click(downloadTemplate);
  $("#layouts-button").click(fetchTemplates);
  $("#changeBackground").click(changeBackground);
  $("#layouts-list").on("click", ".layout-image", setTemplate);

  $("#addPhoto").change(addPhoto);
  $("#uploadTemplate").change(uploadTemplate);

  $("#addButton").click(function(){
    $("#addPhoto").click();
  });
  $("#uploadButton").click(function(){
    $("#uploadTemplate").click();
  });
});
