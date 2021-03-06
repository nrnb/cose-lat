var refreshUndoRedoButtonsStatus = function(){

    if (ur.isUndoStackEmpty()) {
        $("#undo").parent("li").addClass("disabled");
    }
    else {
        $("#undo").parent("li").removeClass("disabled");
    }

    if (ur.isRedoStackEmpty()) {
        $("#redo").parent("li").addClass("disabled");
    }
    else {
        $("#redo").parent("li").removeClass("disabled");
    }
};


///////////////////// EDIT ////////////////////////////

var undo = function(){
    ur.undo(); 
};
$("#undo").click(undo);
shortcut.add("Ctrl+Z", undo);

var redo = function(){
    ur.redo(); 
};

$("#redo").click(redo);
shortcut.add("Ctrl+Y", redo);

var deleteSelected = function () {
    var selectedEles = cy.$(":selected");

    if(selectedEles.length == 0){
        return;
    }
    ur.do("remove", selectedEles);
    
    $('#forceCanvas').clearCanvas();
    if($('#forcesCheck').is(":checked") && keyframeNumber != -1 && keyframeNumber != null && keyframeNumber < animatedData.length-1){
        screenForces(keyframeNumber);
    }
    hideNodeDetail();
}; 

$("#delete").click(deleteSelected);
shortcut.add("Delete", deleteSelected);

var addEdge = function(){
    if(cy.$("node:selected").length == 2)
    ur.do("add", {
        group: "edges",
        data: {
            source: cy.$("node:selected")[0].data('id'),
            target: cy.$("node:selected")[1].data('id')
        }
    }); 
};

$("#addEdge").click(addEdge);
shortcut.add("e", addEdge);

///////////////////// VIEW ////////////////////////////

var getSelectedNodesForExpandCollapse = function(){

    var selectedNodes = cy.nodes(":selected");

    for(var i = 0; i < selectedNodes.length; i++)
        if(selectedNodes[i].data("expanded-collapsed") == null)
            selectedNodes[i].data("expanded-collapsed", "expanded");

    return selectedNodes;

}

$("#collapse-selected").click(function (e) {
    var nodes = getSelectedNodesForExpandCollapse().filter("[expanded-collapsed='expanded']");
    var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(nodes, "collapse");

    if (!thereIs) {
        return;
    }

    editorActionsManager._do(new SimpleCollapseGivenNodesCommand(nodes));
    refreshUndoRedoButtonsStatus();

});

$("#expand-selected").click(function (e) {
    var nodes = getSelectedNodesForExpandCollapse().filter("[expanded-collapsed='collapsed']");
    var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(nodes, "expand");

    if (!thereIs) {
        return;
    }

    editorActionsManager._do(new SimpleExpandGivenNodesCommand(nodes));
    refreshUndoRedoButtonsStatus();
});

$("#collapse-all").click(function (e) {
    var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":visible"), "collapse");

    if (!thereIs) {
        return;
    }

    editorActionsManager._do(new SimpleCollapseGivenNodesCommand(cy.nodes()));
    refreshUndoRedoButtonsStatus();
});

$("#expand-all").click(function (e) {
    var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":visible"), "expand");

    if (!thereIs) {
        return;
    }

    editorActionsManager._do(new SimpleExpandAllNodesCommand({
        firstTime: true
    }));
    refreshUndoRedoButtonsStatus();
});

///////////////////// LOAD & SAVE //////////////////////////////

var saveFile = function(){
    var sbgnmlText = jsonToGraphml.createGraphml(atts);

    var blob = new Blob([sbgnmlText], {
        type: "text/plain;charset=utf-8;",
    });
    var filename = "" + new Date().getTime() + ".graphml";;
    saveAs(blob, filename);   
};

$("#save-file").click(saveFile);
shortcut.add("Ctrl+S", saveFile);

//////////////////////////////////////////////////////////////////////////////////////////////

var tempName = "cose-bilkent";
$("#cose-bilkent").click( function (e) {
    tempName = "cose-bilkent";
    whitenBackgrounds();
    $("#cose-bilkent").css("background-color", "grey");
});

var coseBilkentLayoutProp = new COSEBilkentLayout({
    el: '#cose-bilkent-layout-table'
});

$("#add-node-dialog").hide();

function toggleUserControl(){
/*
    toggleFuncs = function (fs){
        for(var i = 0; i < fs.length; i++)
            fs[i](!fs[i]());
    };
    console.log(cy);
    toggleFuncs([*/
/*
    cy.panningEnabled(!cy.panningEnabled());
        cy.zoomingEnabled(!cy.zoomingEnabled());
        cy.boxSelectionEnabled(!cy.boxSelectionEnabled());
        cy.autoungrabify(!cy.autoungrabify());
        cy.autounselectify(!cy.autounselectify());
        cy.autolock(!cy.autolock());*/
}


$("#addNodeMenu").click(function () {    toggleUserControl();

    $("#cy").css("background-image", "url('css/images/grid_background.gif')").css("cursor", "crosshair");
    $("#cy").popover({
        placement: "top",
        content: "Select the position of new node",
        template: '<div class="popover" role="tooltip">' +
        '<div class="arrow"></div>' +
        '<div class="popover-content"></div>' +
        '</div>'
    }).popover("show");

    var newNode = {
        firstTime: true
    };

    cy.one("click", function (e) {
        toggleUserControl();

        var x = e.cyPosition.x;
        var y = e.cyPosition.y;

        $("#new-node-y").val(e.cyPosition.y);

        $('#new-node-color').colorpicker();
        $('#new-node-border-color').colorpicker();

        $("#add-node-modal").modal();

        $("#exit-new-node").one("click", function () {
            toggleUserControl();
            $("#cy").css("background-image", "").css("cursor", "");
            $("#cy").popover("destroy");
        });

        $("#save-new-node").one("click", function () {
            var name = $("#new-node-name").val();
            var w = $("#new-node-width").val();
            var h = $("#new-node-height").val();
          /*  var x = $("#new-node-x").val();
            var y = $("#new-node-y").val();*/
            var color = $("#new-node-color").colorpicker("getValue", "gray");
            var shape = $("#new-node-shape").val();
            var borderColor = $("#new-node-border-color").colorpicker("getValue", "black");
            //var borderWidth = $("#new-node-border-width").val();

            if (w == "") {
                w = null;
            }
            else {
                w = Number(w);
            }

            if (h == "") {
                h = null;
            }
            else {
                h = Number(h);
            }

            if (x == "") {
                x = null;
            }
            else {
                x = Number(x);
            }

            if (y == "") {
                y = null;
            }
            else {
                y = Number(y);
            }

            var newNode = {
                name: name,
                x: x,
                y: y,
                w: w,
                h: h,
                color: color,
                shape: shape,
                borderColor: borderColor,
                firstTime: true
            };
            toggleUserControl();
            $("#cy").css("background-image", "").css("cursor", "");
            $("#cy").popover("destroy");
            ur.do("addNode", newNode);

        });
    });
});

var addChild = function(children, theChild){
    var len = children.length;
    for (var i = 0; i < theChild.children().length; i++){
        children[len++] = theChild.children()[i];
    }
    children.length = len;
    for (var i = 0 ; i < theChild.children().length; i++){
        if (theChild.children()[i].isParent()){
            addChild(children, theChild.children()[i]);
        }
    }
};

$("#makeCompound").click(function (e) {
    var nodes = cy.$('node:selected');

    ur.do("createCompound", {
        nodesToMakeCompound: nodes,
        firstTime: true
    });
});

$("#layout-properties").click(function (e) {
    if (tempName !== '') {
       coseBilkentLayoutProp.render();
    }

});

var performLayout = function(){
    cy.nodes().removeData("ports");
    cy.edges().removeData("portsource");
    cy.edges().removeData("porttarget");

    cy.nodes().data("ports", []);
    cy.edges().data("portsource", []);
    cy.edges().data("porttarget", []);

    cy.elements().unselect();
    slider.setAttribute('min', -1);
    slider.setAttribute('max', -1);
    slider.setValue(-1, false, true);
    slider.setAttribute("active", false);    
    coseBilkentLayoutProp.applyLayout(); 
};
$("#perform-layout").click(performLayout);
shortcut.add("p", performLayout);

var atts;

$("body").on("change", "#file-input", function (e) {
    var fileInput = document.getElementById('file-input');
    var file = fileInput.files[0];
    var textType = /text.*/;

    var reader = new FileReader();
    reader.onload = function (e)
    {
        var graphmlConverter = new graphmlToJSON(textToXmlObject(this.result));
        atts = graphmlConverter.attributes;
        
        var cytoscapeJsGraph = {
            edges: graphmlConverter.objects[2],
            nodes: graphmlConverter.objects[1]
        };
        //       console.log(JSON.stringify(graphmlConverter.objects[1][0]));
        refreshCytoscape(cytoscapeJsGraph);
        
        loadCanvas();
        div = document.getElementById("cy");
        var node = div.childNodes[1];
        div.removeChild(node);
        div.appendChild(node);

        slider.setAttribute('min', -1);
        slider.setAttribute('max', -1);
        slider.setValue(-1, false, true);
        slider.setAttribute("active", false);
        animatedData = [];
        numberOfKeyframes = 0;
        
        editForces();
        normalizeForces();
        $("#navigator").empty();
        var naviOptions = {
            container: $("#navigator")
        };
        cy.navigator(naviOptions);  
        hideNodeDetail();
    };
    reader.readAsText(file);
    setFileContent(file.name);
    $("#file-input").val(null);
});

$("#load-file").click(function (e) {
    $("#file-input").trigger('click');
});

$("#new").click(function(e){
    var graphData = new Object();
    graphData['nodes'] = [];
    graphData['edges'] = [];
    refreshCytoscape(graphData);
    normalizeForces();
    $("#navigator").empty();
    var naviOptions = {
        container: $("#navigator")
    };
    cy.navigator(naviOptions);  
    hideNodeDetail();
});


$("#save-as-png").click(function(evt){

    var tempCy = document.getElementById('cy');
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = tempCy.offsetWidth;
    tempCanvas.height = tempCy.offsetHeight;
    var ctx = tempCanvas.getContext("2d");
    
    var pngContent = cy.png({bg: '#ffffff', maxWidth: tempCy.offsetWidth, maxHeight: tempCy.offsetHeight, full : false});
    var image = new Image();
    image.src = pngContent;
    ctx.drawImage(image, 0, 0);
    var forceCanvas = document.getElementById('forceCanvas');
    ctx.drawImage(forceCanvas, 0, 0);
 
    var img  = tempCanvas.toDataURL("image/png");
    this.href = img;
    this.download = "layout.png";
});

var loadSample = function(fileName){

    var xmlObject = loadXMLDoc("samples/" + fileName + ".xml");
    var graphmlConverter = graphmlToJSON(xmlObject);
    atts = graphmlConverter.attributes;
    var cytoscapeJsGraph = {
        edges: graphmlConverter.objects[2],
        nodes: graphmlConverter.objects[1]
    };
    refreshCytoscape(cytoscapeJsGraph);
    setFileContent(fileName + ".graphml");

    loadCanvas();
    div = document.getElementById("cy");
    var node = div.childNodes[1];
    div.removeChild(node);
    div.appendChild(node);

    slider.setAttribute('min', -1);
    slider.setAttribute('max', -1);
    slider.setValue(-1, false, true);
    slider.setAttribute("active", false);
    animatedData = [];
    numberOfKeyframes = 0;

    editForces();
    normalizeForces();
    $("#navigator").empty();
    var naviOptions = {
        container: $("#navigator")
    };
    cy.navigator(naviOptions);
    hideNodeDetail();
};
$("#sample0").click(function (e){
    loadSample("badlayout2c");
});
$("#sample1").click(function (e){
    loadSample("badlayout2b");
});
$("#sample2").click(function (e){
    loadSample("badlayout2d");
});
$("#sample3").click(function (e){
    loadSample("emptycompound.weird.layout");
});
$("#sample4").click(function (e){
    loadSample("RPS6KB1-MTOR-badlay");
});
$("#sample5").click(function (e){
    loadSample("RPS6KB1-MTOR-badlay_org");
});
$("#sample6").click(function (e){
    loadSample("badlayout2e");
});
$("#sample7").click(function (e){
    loadSample("badlayout1");
});
$("#sample8").click(function (e){
    loadSample("badlayout2a");
});
$("#sample9").click(function (e){
    loadSample("AR-TP53-badlayout");
});
$("#sample10").click(function (e){
    loadSample("EGFR");
});
$("#sample11").click(function (e){
    loadSample("graph0");
});

var tempLayout = new COSEBilkentLayout();
var iterationRate = tempLayout.currentLayoutProperties.refresh;
var slider = new Slider('#slider', {
    orientation: "horizontal",
    step: 1,
    min: -1,
    max: -1,
    value: -1,
    active: false,
    formatter: function(value) {
        return 'iteration: ' + (value * iterationRate + iterationRate);
    }
});

var keyframeNumber;
slider.on("change", function(evt) {
    slider.setAttribute("active", true);
    $('#forceCanvas').clearCanvas();
    keyframeNumber = evt.newValue;
    if(slider.getValue() != -1){
        screenNodes(keyframeNumber);
    }
    if($('#forcesCheck').is(":checked") && keyframeNumber != -1 && keyframeNumber != null && keyframeNumber < animatedData.length-1){
        screenForces(keyframeNumber);
    }
    if(cy.elements(":selected").length == 1 && keyframeNumber < animatedData.length-1){
        $('#nodeDetail').clearCanvas();
        showNodeDetail();
        if(cy.elements(":selected").isNode()){
            var selectedNode = cy.nodes(":selected");
            screenNodeDetail(selectedNode); 
        }
        else{
            var selectedEdge = cy.edges(":selected");
            screenEdgeDetail(selectedEdge); 
        }
    }
    else{
        hideNodeDetail();
    }
});

$('#forcesCheck').change(function () {
    if($('#forcesCheck').is(":checked") && keyframeNumber != -1 && keyframeNumber != null && keyframeNumber < animatedData.length-1){
        screenForces(keyframeNumber);
    }
    else{
        $('#forceCanvas').clearCanvas();
    }
});

$('#fitCheck').change(function () {
    if($('#fitCheck').is(":checked") && slider.getAttribute("active")){
        if(cy.nodes(":selected").length == 1 && cy.nodes(":selected").isParent() == false){
            cy.fit(cy.nodes(":selected"), 250);
        }
        else{             
            cy.fit(cy.nodes(":selected"), 100);
        }
    }
    else{
        if(slider.getAttribute("active")){
            var tempLayout = new COSEBilkentLayout();
            cy.fit(cy.nodes(), tempLayout.currentLayoutProperties.padding); 
        }
    }
});

$('#normalizeCheck').change(function () {
    $('#forceCanvas').clearCanvas();
    screenForces(keyframeNumber);
});

var speedSlider = new Slider('#speedSlider', {
    orientation: "horizontal",
    step: 250,
    min: 100,
    max: 1600,
    value: 850,
    tooltip: 'hide'
});

var numberOfKeyframes;
var onPlay = false;
var timeout;
$("#playButton").click(function (e){
    numberOfKeyframes = animatedData.length;
    if(numberOfKeyframes > 0){
        slider.setAttribute("min", 0);
        slider.setAttribute("max", numberOfKeyframes - 1);
        clearTimeout(timeout);
    }
    if(slider.getValue() === numberOfKeyframes - 1){
        slider.setValue(-1, false, true); 
    }
    var $el = $(this);
    var currentFrameNumber = slider.getValue();
    if(onPlay === false && numberOfKeyframes !== 0){
       $el.find('span').toggleClass('fa fa-pause fa-fw fa fa-play fa-fw');
       onPlay = true;
       slide(currentFrameNumber, onPlay);     
    }
    else if(onPlay === true){
       $el.find('span').toggleClass('fa fa-play fa-fw fa fa-pause fa-fw');
       onPlay = false;
       clearTimeout(timeout);
    }
});

$("#stopButton").click(function (e){
    numberOfKeyframes = animatedData.length;
    if(numberOfKeyframes > 0){
       if(onPlay === true){
           $("#playButton").find('span').toggleClass('fa fa-play fa-fw fa fa-pause fa-fw');
       }
       onPlay = false;
       clearTimeout(timeout);
       slider.setValue(0, false, true);
   }
});

$("#backwardButton").click(function (e){
    clearTimeout(timeout);
    var currentFrameNumber = slider.getValue();      
    if(currentFrameNumber - 5 >= slider.getAttribute("min")){
       if(onPlay){
           slide(currentFrameNumber - 6, onPlay);
       }
       else{
           slider.setValue(currentFrameNumber - 5, false, true);
       }
    }
});

$("#forwardButton").click(function (e){
    numberOfKeyframes = animatedData.length;
    if(numberOfKeyframes > 0){
        slider.setAttribute("min", 0);
        slider.setAttribute("max", numberOfKeyframes - 1);
        clearTimeout(timeout);
    }
    var currentFrameNumber = slider.getValue();
    if(currentFrameNumber + 4 < slider.getAttribute("max")){
       if(onPlay){
           slide(currentFrameNumber + 4, onPlay);
       }
       else{
           slider.setValue(currentFrameNumber + 5, false, true);
       }
    }
});

$("#stepBackwardButton").click(function (e){
    clearTimeout(timeout);
    var currentFrameNumber = slider.getValue();
    if(currentFrameNumber - 1 >= slider.getAttribute("min")){
        if(onPlay){
            slide(currentFrameNumber - 2 , onPlay);
        }
        else{
            slider.setValue(currentFrameNumber - 1, false, true); 
        }
    }
});

$("#stepForwardButton").click(function (e){

    numberOfKeyframes = animatedData.length;
    if(numberOfKeyframes > 0){
        slider.setAttribute("min", 0);
        slider.setAttribute("max", numberOfKeyframes - 1);
        clearTimeout(timeout);
    }
    var currentFrameNumber = slider.getValue();
    if(currentFrameNumber < slider.getAttribute("max")){
        if(onPlay){
            slide(currentFrameNumber, onPlay);
        }
        else{
            slider.setValue(currentFrameNumber + 1, false, true); 
        }
    }
});

function slide(i, check) {
   timeout = setTimeout(function () {            
      i++;
      slider.setValue(i, false, true); 
      if (i < numberOfKeyframes - 1 && check) {            
         slide(i, check);              
      }
      else if(i>=numberOfKeyframes - 1){
         $("#playButton").find('span').toggleClass('fa fa-play fa-fw fa fa-pause fa-fw');
         onPlay = false;
         clearTimeout(timeout);
      }
   }, 1700 - speedSlider.getValue());
}
