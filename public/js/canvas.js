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
    canvas.setBackgroundColor("#42bcf4",
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
    let url = `http://34.216.224.153:9000/fabric/fetchAllTemplates`;
    $.get(url, function(result){
      console.log(result);
      console.log(JSON.parse(result));
    });
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
  $("#fetchTemplates").click(fetchTemplates);
  $("#changeBackground").click(changeBackground);

  $("#addPhoto").change(addPhoto);
  $("#uploadTemplate").change(uploadTemplate);

  $("#addButton").click(function(){
    $("#addPhoto").click();
  });
  $("#uploadButton").click(function(){
    $("#uploadTemplate").click();
  });
});
