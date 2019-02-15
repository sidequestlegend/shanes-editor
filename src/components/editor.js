/* global AFRAME,TWEEN,THREE */
/**
 * The display container for the currently open object.
 * @namespace expanse-editor
 * @component editor
 * @author Shane Harris
 */
AFRAME.registerPrimitive('a-shanes-editor', AFRAME.utils.extendDeep({}, AFRAME.primitives.getMeshMixin(), {
    defaultComponents: {
        editor:{}
    }
}));
module.exports = AFRAME.registerComponent('editor', {
    schema: {

    },
    init(){
        this.setupContainer();
        this.makeMainRenderer();
        this.makePopupRenderer();
    },
    setupContainer(){

        // Outer editor Container
        this.editorContainer = document.createElement('a-entity');
        this.editorContainer.setAttribute('scale','0.0001 0.0001 0.0001');
        this.editorContainer.setAttribute('position','0 0 0');
        this.editorContainer.id = 'editorContainer';
        this.el.appendChild(this.editorContainer);
    },
    makeMainRenderer(){

        // Curved plane for editor.
        let uiPanel = document.createElement('a-plane');
        uiPanel.id = 'uiPanel';
        uiPanel.setAttribute('ui-curved-plane','');
        uiPanel.setAttribute('width',6);
        uiPanel.setAttribute('height',3);
        uiPanel.setAttribute('position','0 0 0');
        uiPanel.setAttribute('side','double');
        uiPanel.setAttribute('shader','flat');
        uiPanel.setAttribute('scale','0.0001 0.0001 0.0001');
        uiPanel.setAttribute('transparent',true);
        uiPanel.setAttribute('alpha-test','0.01');
        uiPanel.setAttribute('class','intersect');

    // <menu-item scale="2 2 2" class="intersect" id="closeEditorPanel" src="https://cdn.theexpanse.app/images/menu_close.png" position="0 -2.4 -1" rotation="-30 0 0"></menu-item>
        let editorLoader = document.createElement('a-entity');
        editorLoader.id = 'editorLoader';
        editorLoader.setAttribute('geometry','primitive:plane;width:0.25;height:0.25');
        editorLoader.setAttribute('material','shader:flat;color:#48aba1;transparent:true;src:#icons');
        editorLoader.setAttribute('position','0 0 0.3');
        editorLoader.setAttribute('sprite-sheet','coords:512 384 128 128;shape:square;');
        editorLoader.setAttribute('scale','0.00001 0.00001 0.00001');
        uiPanel.appendChild(editorLoader);
        this.editorLoader = editorLoader;

        // Loading Text
        let loadingText = document.createElement('a-text');
        loadingText.setAttribute('font','roboto');
        loadingText.setAttribute('baseLine','center');
        loadingText.setAttribute('align','center');
        loadingText.setAttribute('alpha-test','0.01');
        loadingText.setAttribute('position','0 0 0.01');
        loadingText.setAttribute('color','#212121');
        loadingText.setAttribute('wrap-count','5');
        loadingText.setAttribute('width','1');
        loadingText.setAttribute('height','0.2');
        loadingText.id = 'loadingText';

        // Background for loading text
        let loadingTextBack = document.createElement('a-plane');
        loadingTextBack.id = 'loadingTextBack';
        loadingTextBack.setAttribute('shader','flat');
        loadingTextBack.setAttribute('ui-rounded','borderRadius:0.05;curveSegments:3');
        loadingTextBack.setAttribute('width',1);
        loadingTextBack.setAttribute('height',0.4);
        loadingTextBack.setAttribute('position','0 0 -0.001');
        loadingText.appendChild(loadingTextBack);
        uiPanel.appendChild(loadingText);


        let mainRenderer = document.createElement('a-ui-renderer');
        mainRenderer.id = 'mainRenderer';
        mainRenderer.setAttribute('ui-panel','#uiPanel');
        mainRenderer.setAttribute('init-delay',5000);

        let mainEditor = document.createElement('a-entity');
        mainEditor.id = 'editor';
        mainEditor.setAttribute('geometry','primitive:plane;width:4;height:2;');
        mainEditor.setAttribute('material','src:#navBack;side:double;shader:flat;');
        mainEditor.setAttribute('position','0 0 -0.835');
        mainRenderer.appendChild(mainEditor);

        let topTitle = document.createElement('a-text');
        topTitle.id = 'topTitle';
        topTitle.setAttribute('font','roboto');
        topTitle.setAttribute('baseLine','center');
        topTitle.setAttribute('anchor','center');
        topTitle.setAttribute('value','Shane\'s Editor');
        topTitle.setAttribute('class','intersectable');
        topTitle.setAttribute('geometry','primitive:plane;width:1.8;height:0.3;');
        topTitle.setAttribute('position','-1.05 0.88 0');
        topTitle.setAttribute('color','#ffffff');
        topTitle.setAttribute('wrap-count','25');
        topTitle.setAttribute('width','1.8');
        topTitle.setAttribute('height','0.3');
        mainEditor.appendChild(topTitle);

        let toastMessage = document.createElement('a-ui-toast');
        toastMessage.id = 'toastMessage';
        toastMessage.setAttribute('position','1.4 0.5 0.1');
        toastMessage.setAttribute('visible','false');
        toastMessage.setAttribute('wrap-count','15');
        mainEditor.appendChild(toastMessage);

        let breadcrumbsContainer = document.createElement('a-entity');
        breadcrumbsContainer.id = 'breadcrumbsContainer';
        breadcrumbsContainer.setAttribute('position','-1.69 0.68 0.001');
        mainEditor.appendChild(breadcrumbsContainer);

        let topMenu = document.createElement('a-entity');
        topMenu.id = 'topMenu';
        topMenu.appendChild(this.makeIcon('backToScenes','1.21 0.885 0.0001','intersectable','#small_icons',false,true,true,'832 896 32 32'));
        topMenu.appendChild(this.makeIcon('currentScene','1.435 0.885 0.0001','intersectable','#small_icons',false,true,true,'864 992 32 32'));
        topMenu.appendChild(this.makeIcon('saveScene','1.435 0.885 0.0001','intersectable','#small_icons',false,true,true,'832 960 32 32'));
        topMenu.appendChild(this.makeIcon('precisionButton','1.66 0.885 0.0001','intersectable','#small_icons','toastEl:#toastMessage;message:here!',false,true,'800 896 32 32'));
        topMenu.appendChild(this.makeIcon('hideEditor','1.885 0.885 0.0001','intersectable','#small_icons',false,false,true,'896 928 32 32'));

        mainEditor.appendChild(topMenu);
        let scrollPane = document.createElement('a-ui-scroll-pane');
        scrollPane.setAttribute('id','mainContent');
        scrollPane.setAttribute('handle-color','#4db6ac');
        scrollPane.setAttribute('position','0 -0.205 0.01');
        scrollPane.setAttribute('width','3.8');
        scrollPane.setAttribute('height','1.57');
        scrollPane.setAttribute('look-controls-el','#camera');
        scrollPane.setAttribute('look-controls-component','1.57');
        let mainContent = document.createElement('a-entity');
        mainContent.setAttribute('class','container');
        scrollPane.appendChild(mainContent);
        mainEditor.appendChild(scrollPane);

        this.editorContainer.appendChild(uiPanel);
        this.editorContainer.appendChild(mainRenderer);
    },
    makePopupRenderer(){

        // Curved plane for modal.
        let modalPanel = document.createElement('a-plane');
        modalPanel.id = 'modalPanel';
        modalPanel.setAttribute('ui-curved-plane','');
        modalPanel.setAttribute('width',4.222);
        modalPanel.setAttribute('height',2);
        modalPanel.setAttribute('scale','0.0001 0.0001 0.0001');
        modalPanel.setAttribute('position','0 0 0.3');
        modalPanel.setAttribute('side','double');
        modalPanel.setAttribute('shader','flat');
        modalPanel.setAttribute('class','intersect');
        this.editorContainer.appendChild(modalPanel);

        let modalRenderer = document.createElement('a-ui-renderer');
        modalRenderer.id = 'modalRenderer';
        modalRenderer.setAttribute('ui-panel','#modalPanel');
        modalRenderer.setAttribute('init-delay',5000);
        this.el.appendChild(modalRenderer);

        let modalRenderBacking = document.createElement('a-entity');
        modalRenderBacking.id = 'modalRenderBacking';
        modalRenderBacking.setAttribute('geometry','primitive:plane;width:4;height:1.9');
        modalRenderBacking.setAttribute('material','side:double;shader:flat;color:#efefef');
        modalRenderBacking.setAttribute('position','0 0 -0.695');
        modalRenderer.appendChild(modalRenderBacking);

        let toastEle = document.createElement('a-ui-toast');
        toastEle.id = 'popupToastMessage';
        toastEle.setAttribute('position','1 0.4 0.1');
        toastEle.setAttribute('visible',false);
        toastEle.setAttribute('wrap-count',15);
        modalRenderBacking.appendChild(toastEle);

        modalRenderBacking.appendChild(this.makeIcon('closePopup','1.57 0.740 0.001','intersectable close-modal','#small_icons',false,false,false,'768 896 32 32'));
        modalRenderBacking.appendChild(this.makeIcon('popupPrecision','1.4 0.740 0.001','intersectable','#small_icons','toastEl:#popupToastMessage;message:here!',false,false,'800 896 32 32'));
        modalRenderBacking.appendChild(this.makeIcon('backButton','-1.55 0.738 0.001','intersectable','#small_icons',false,false,false,'832 896 32 32'));

        let modalScrollPane = document.createElement('a-ui-scroll-pane');
        modalScrollPane.id = 'popupContent';
        modalScrollPane.setAttribute('handle-color','#4db6ac');
        modalScrollPane.setAttribute('position','0 -0.05 0.01');
        modalScrollPane.setAttribute('width','3');
        modalScrollPane.setAttribute('height','1.35');
        modalScrollPane.setAttribute('look-controls-el','#camera');
        modalScrollPane.setAttribute('look-controls-component','');

        let modalContent = document.createElement('a-entity');
        modalContent.setAttribute('class','container');
        modalScrollPane.appendChild(modalContent);
        modalRenderBacking.appendChild(modalScrollPane);

        let colorPicker = document.createElement('a-entity');
        colorPicker.setAttribute('ui-color-picker','');
        colorPicker.id = 'colorPicker';
        colorPicker.setAttribute('position','0 0.25 0.2');
        modalRenderBacking.appendChild(colorPicker);
    },
    makeIcon(id,position,className,src,toast,isHidden,isEditor,coords){
        let button = document.createElement('a-plane');
        button.id = id;
        button.setAttribute('width','0.225');
        button.setAttribute('height','0.225');
        button.setAttribute('position',position);
        if(isEditor){
            button.setAttribute('color','#159e92');
        }else{
            button.setAttribute('color','#efefef');
        }
        button.setAttribute('transparent','true');
        if(isHidden){
            button.setAttribute('scale','0.00001 0.00001 0.00001');
        }
        if(toast){
            button.setAttribute('ui-toast',toast);
        }
       // button.setAttribute('opacity','0.00001');
        button.setAttribute('shader','flat');
        button.setAttribute('class',className);

        let buttonIcon = document.createElement('a-entity');
        buttonIcon.setAttribute('class','intersectable');
        buttonIcon.setAttribute('ui-btn','hoverHeight:0.005');
        buttonIcon.setAttribute('ui-ripple','size:0.12 0.12;zIndex:0.001;color:'+(isEditor?'#ffffff':'#4db6ac'));
        buttonIcon.setAttribute('geometry','primitive:plane;width:0.12;height:0.12;skipCache:true');
        buttonIcon.setAttribute('material','src:'+src+';shader:flat;transparent:true;'+(!isEditor?'color:#4db6ac':''));
        buttonIcon.setAttribute('position','0 0 0.001');
        if(coords){
            buttonIcon.setAttribute('sprite-sheet','coords:'+coords+';shape:square;')
        }
        // if(!isEditor){
        //     buttonIcon.setAttribute('color','#4db6ac');
        // }
        button.appendChild(buttonIcon);

        return button;
    },
    tick(delta){
        if(this.editorLoader){
            this.editorLoader.object3D.rotation.z = delta/180 % Math.PI*2;
        }
    }
});