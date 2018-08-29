import '../../aframe-material-components/index';
import {Content} from "./modules/content";
import {Session} from './modules/session';
import {SceneGraph} from './modules/scene-graph';
import {SceneListView} from "./views/scene-list-view";
import {ItemView} from "./views/item-view";
import './components/right_look_controls';
import './components/gizmo';
import './components/display-box';
import {PopupView} from "./views/popup-view";
import {Namer} from "./modules/namer";
import {FriendlyNames} from "./modules/friendly-names";
import {ObjectTypeModal} from "./views/modals/object-type";
import {PrimitiveTypeModal} from "./views/modals/primitive-type";
import {ParametricTypeModal} from "./views/modals/parametric-type";
import {LightTypeModal} from "./views/modals/light-type";
import {PrefabOptionModal} from "./views/modals/prefab-option";
import {KennyCategoriesModal} from "./views/modals/kenny-categories";
import {KennyModalsModal} from "./views/modals/kenny-modals";
import {AvatarCategoriesModal} from "./views/modals/avatar-categories";
import {AvatarModalsModal} from "./views/modals/avatar-models";
import {PlaceModels} from "./modules/place-models";
import {ViewUtils} from "./modules/view-utils";
import {BreadCrumbs} from "./modules/breadcrumbs";
import {ClearSceneModal} from "./views/modals/clear-scene";
import {SavePrefabModal} from "./views/modals/save-prefab";
import {BehavioursModal} from "./views/modals/behaviours";
import {MaterialTypeModal} from "./views/modals/material/material-type";
import {GeometryTypeModal} from "./views/modals/geometry/geometry-type";
import {PreloadTemplates} from "./modules/preload-templates";
import {MaterialSettingsModal} from "./views/modals/material/material-settings";
import {GeometrySettingsModal} from "./views/modals/geometry/geometry-settings";
import {TransformModal} from "./views/modals/transform-modal";
import {ObjectMaterial} from "./views/modals/object-material";
import {MapSettingsModal} from "./views/modals/material/map-settings-advanced";
import {RepeatSettingsModal} from "./views/modals/material/repeat-offset";
import {LoadTextureModal} from "./views/modals/material/load-texture";

class Main{
    constructor(){
        this.session = new Session(this);
        this.content = new Content(this);
        this.friendly_names = new FriendlyNames();
        this.namer = new Namer();
        this.sceneGraph = new SceneGraph(this);
        this.breadCrumbs = new BreadCrumbs(this);
        this.setupViews();
        this.setupModals();
        this.editor = document.getElementById('editorContainer');
        this.sceneEl = document.querySelector('a-scene');


        this.sceneEl.addEventListener('modal-closed',()=>{
            this.content.popup.components['ui-scroll-pane'].setContent('');
        });
        let loadingText = document.getElementById('loadingText');
        let loadingTextBack = document.getElementById('loadingTextBack');
        let start = 0;
        this.sceneEl.addEventListener('scene-load-start',()=>{
            start = new Date().getTime();
            loadingTextBack.setAttribute('scale','1 1 1');
        });
        this.sceneEl.addEventListener('scene-loading',e=>{
            loadingText.setAttribute('value',Math.round(e.detail*100)+'%');
            if(e.detail===1){
                console.log('Scene loaded in: '+((new Date().getTime()-start)/1000)+"s");
                setTimeout(()=>{
                    loadingText.setAttribute('value','');
                    loadingTextBack.setAttribute('scale','0 0 0');
                },500)
            }
        });
        new PreloadTemplates(this).preload();
        this.sceneEl.context = this;
        this.sceneList.open()
        this.setupTopMenu();
        this.setupPopupNavigation();
        this.setupTransformOptions();

        this.showAlphaMap = new THREE.TextureLoader().load('images/nav-alpha.jpg');
        this.hideAlphaMap = new THREE.TextureLoader().load('images/nav-alpha-hide.jpg');
        this.showMaterial = document.getElementById('uiPanel').getObject3D('mesh').material;
        this.showMaterial.transparent = true;
        this.showMaterial.alphaMap = this.hideAlphaMap;
        this.displayBox = document.getElementById('displayBox').components['display-box'];
        this.displayBox.hide();
        this.sceneEl.addEventListener('transform-update',()=>{
            if(this.transformUpdate)this.transformUpdate();
        });
        document.getElementById('topTitle').addEventListener('mousedown',()=>{
            this.itemView.open();
        });
        this.precision = 1;
        let precisionButton = document.getElementById('precisionButton');
        precisionButton.addEventListener('mousedown',()=>{
            this.precision/=10;
            if(this.precision<0.001){
                this.precision = 100;
            }
            precisionButton.components["ui-toast"].data.toastEl.setAttribute('text-value','Precision: '+this.precision)
        });
        let popupPrecision = document.getElementById('popupPrecision');
        popupPrecision.addEventListener('mousedown',()=>{
            this.precision/=10;
            if(this.precision<0.001){
                this.precision = 100;
            }
            popupPrecision.components["ui-toast"].data.toastEl.setAttribute('text-value','Precision: '+this.precision)
        });

        this.cameraDummy = document.getElementById('cameraDummyPosition');
        document.getElementById('menuButton').addEventListener('click',()=>this.openEditor());
        document.getElementById('closeEditor').addEventListener('mousedown',()=>this.closeEditor());
    }
    setupPopupNavigation(){
        document.getElementById('backButton').addEventListener('mousedown',()=>this.popupBack());
        document.getElementById('closePopup').addEventListener('mousedown',()=>this.popupBackStack.length=0);
        this.popupBackStack = [];
    }
    popupBack(){
        let back = this.popupBackStack.pop();
        if(back)back();
    }
    setupViews(){
        this.sceneList = new SceneListView(this);
        this.itemView = new ItemView(this);
        this.popupView = new PopupView(this);
        this.viewUtils = new ViewUtils(this);
    }
    setupModals(){
        this.objectTypeModal = new ObjectTypeModal(this);
        this.primitiveTypeModal = new PrimitiveTypeModal(this);
        this.parametricTypeModal = new ParametricTypeModal(this);
        this.lightTypeModal = new LightTypeModal(this);
        this.prefabOptionModal = new PrefabOptionModal(this);
        this.kennyCategories = new KennyCategoriesModal(this);
        this.kennyModelsModal = new KennyModalsModal(this);
        this.avatarCategories = new AvatarCategoriesModal(this);
        this.avatarModelsModal = new AvatarModalsModal(this);
        this.clearSceneModal = new ClearSceneModal(this);
        this.savePrefabModal = new SavePrefabModal(this);
        this.behavioursModal = new BehavioursModal(this);

        this.transformModal = new TransformModal(this);

        this.materialTypeModal = new MaterialTypeModal(this);
        this.materialSettingsModal = new MaterialSettingsModal(this);
        this.mapSettingsModal = new MapSettingsModal(this);
        this.repeatSettingsModal = new RepeatSettingsModal(this);

        this.loadTextureModal = new LoadTextureModal(this);

        this.geometryTypeModal = new GeometryTypeModal(this);
        this.geometrySettingsModal = new GeometrySettingsModal(this);

        this.objectMaterial = new ObjectMaterial(this);
    }

    setupTransformOptions(){
        let gizmos = document.getElementById('gizmos');
        document.getElementById('positionButton').addEventListener('mousedown',()=>{
            gizmos.setAttribute('gizmo','mode:position');
        });
        document.getElementById('rotationButton').addEventListener('mousedown',()=>{
            gizmos.setAttribute('gizmo','mode:rotation');
        });
        document.getElementById('scaleButton').addEventListener('mousedown',()=>{
            gizmos.setAttribute('gizmo','mode:scale');
        });
    }
    showObject(){
        this.showMaterial.alphaMap = this.showAlphaMap;
        this.showMaterial.alphaMap.needsUpdate = true;
        setTimeout(()=>{
            this.showMaterial.alphaMap = this.hideAlphaMap;
            this.showMaterial.alphaMap.needsUpdate = true;
        },2500);

    }

    setupTopMenu(){

    }
    closeEditor(){
        let _this = this;
        new TWEEN.Tween({x:0.5})
            .to({x:0.0000001}, 650)
            .onUpdate(function(){
                _this.editor.setAttribute('scale',this.x+' '+this.x+' '+this.x);
            })
            .easing(TWEEN.Easing.Exponential.Out).start();
    }
    openEditor(){
        this.cameraDummy.object3D.position.set(0,0,-0.8);
        this.cameraDummy.object3D.updateMatrixWorld();
            let _this = this;
            new TWEEN.Tween({x:0.0000001})
                .to({x:0.5}, 650)
                .onUpdate(function(){
                    _this.editor.setAttribute('scale',this.x+' '+this.x+' '+this.x);
                })
                .easing(TWEEN.Easing.Exponential.Out).start();

            new TWEEN.Tween(_this.editor.getAttribute('position'))
                .to(this.cameraDummy.object3D.localToWorld(new THREE.Vector3(0,0,0)), 250)
                .easing(TWEEN.Easing.Exponential.Out).start();


            let quaternion = new THREE.Quaternion();
            this.cameraDummy.object3D.updateMatrixWorld();
            this.cameraDummy.object3D.matrixWorld.decompose( new THREE.Vector3(), quaternion, new THREE.Vector3() );
            new TWEEN.Tween(this.editor.object3D.quaternion).to(quaternion, 500)
                .easing(TWEEN.Easing.Exponential.Out)
                //.onUpdate(function () {
                    //_this.getKeyboardDummyPosition();
                //})
                .start();
    }
}
document.addEventListener("DOMContentLoaded", ()=> {
    document.querySelector('a-scene').addEventListener('loaded',()=>{
        window.main = new Main();
    })
});
