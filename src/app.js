import '../../../aframe-material-components';
import {Content} from "./modules/content";
import {SceneGraph} from './modules/scene-graph';
import {SceneListView} from "./views/scene-list-view";
import {ItemView} from "./views/item-view";
import './components/gizmo';
import './components/display-box';
import './components/expanse-portal';
import './components/editor';
import './modules/fbx-loader';
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
import {CreateSceneModal} from "./views/modals/add-scene";
import {DeleteSceneModal} from "./views/modals/delete-scene";
import {BehaviourView} from "./views/behaviour-view";
import {RemoveObjectModal} from "./views/modals/remove-object";
import {ImportBehavioursModal} from "./views/modals/import-behaviours";
import {AddPrefabList} from "./views/modals/add-prefab-list";
import {LightSettingsAmbient} from "./views/modals/light-settings-ambient";
import {LightSettingsPoint} from "./views/modals/light-settings-point";
import {LightSettingsDirectional} from "./views/modals/light-settings-directional";
import {LightSettingsHemisphere} from "./views/modals/light-settings-hemisphere";
import {LightSettingsRectArea} from "./views/modals/light-settings-rectarea";
import {LightSettingsSpot} from "./views/modals/light-settings-spot";
import {CustomModal} from "./views/modals/custom-model";
import {PhysicsThree} from "./modules/scene-graph/physics-three";
import {PhysicsView} from "./views/physics-view";
import {PhysicsShapeTypeModal} from "./views/modals/physics-shape";
import {PhysicsShapeSettingsModal} from "./views/modals/physics-shape-settings";
import {Models} from "./modules/models";
import {ModelSettings} from "./views/modals/3d-model-settings";
import {EditModelSettings} from "./views/modals/edit-model-settings";
import {SpriteModalSettings} from "./views/modals/sprite-modal";
import {PortalModal} from "./views/modals/portal-modal";

export class Editor{
    constructor(context,rootUrl){
        this.context = context;
        this.rootUrl = rootUrl;
        this.setupSceneEl();
        this.content = new Content(this);
        this.friendly_names = new FriendlyNames();
        this.namer = new Namer();
        this.physics = new PhysicsThree(this);
        this.sceneGraph = new SceneGraph(this);
        this.breadCrumbs = new BreadCrumbs(this);
        this.models = new Models(this);
        this.setupViews();
        this.setupModals();
        this.setupPopupNavigation();
        this.setupTransformOptions();
        new PreloadTemplates(this).preload();

        this.showAlphaMap = new THREE.TextureLoader().load('https://cdn.theexpanse.app/images/nav-alpha.jpg');
        this.hideAlphaMap = new THREE.TextureLoader().load('https://cdn.theexpanse.app/images/nav-alpha-hide.jpg');
        this.showMaterial = document.getElementById('uiPanel').getObject3D('mesh').material;
        this.showMaterial.transparent = true;
        this.showMaterial.alphaMap = this.hideAlphaMap;
        this.displayBox = document.getElementById('displayBox').components['display-box'];
        this.displayBox.hide();
        this.sceneEl.addEventListener('transform-update',()=>{
            if(this.transformUpdate){
                this.transformUpdate();
            }
        });
        let saveScene = document.getElementById('saveScene');
        saveScene.setAttribute('ui-modal','modal:#modalRenderer;main:#mainRenderer');
        saveScene.addEventListener('mousedown',()=>{
            this.createSceneModal.open(this.sceneGraph.currentScene.metadata.scenes_id,this.sceneGraph.currentScene.metadata.name);
        });
        document.getElementById('backToScenes').addEventListener('mousedown',()=>{
            this.sceneList.open(this.sceneList.scenes);
        });
        document.getElementById('currentScene').addEventListener('mousedown',()=>{
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
        this.gizmoEl = document.getElementById('gizmos');
        this.gizmoEl.addEventListener('stop-gizmo',()=>{
            this.currentObject.settings.state.transform_updated = true;
            this.sceneGraph.sync();
        });
    }
    changeTopButtons(inScene){
        if(inScene){
            document.getElementById('currentScene').setAttribute('scale','0.00001 0.00001 0.00001');
            document.getElementById('backToScenes').setAttribute('scale','1 1 1');
            document.getElementById('saveScene').setAttribute('scale','1 1 1');
        }else{
            if(this.sceneGraph.hasScene){
                document.getElementById('currentScene').setAttribute('scale','1 1 1');
            }
            document.getElementById('backToScenes').setAttribute('scale','0.00001 0.00001 0.00001');
            document.getElementById('saveScene').setAttribute('scale','0.00001 0.00001 0.00001');
        }
    }
    setupSceneEl(){
        this.sceneEl = document.querySelector('a-scene');
        this.sceneEl.renderer.shadowMap.enabled = true;
        this.sceneEl.context = this;
    }
    setupPopupNavigation(){
        document.getElementById('backButton').addEventListener('mousedown',()=>this.popupBack());
        document.getElementById('closePopup').addEventListener('mousedown',()=>this.popupBackStack.length=0);
        this.popupBackStack = [];
    }
    loader(scale){
        if(this.loaderTween){
            this.loaderTween.stop();
        }
        this.loaderTween = new TWEEN.Tween(document.getElementById('editorLoader').getAttribute('scale'))
            .to(new THREE.Vector3(scale,scale,scale), 250)
            .easing(TWEEN.Easing.Exponential.Out).start();
    }
    showLoader(){
         this.loader(1);
    }
    hideLoader(){
         this.loader(0.00001);
    }
    popupBack(){
        let back = this.popupBackStack.pop();
        if(back)back();
    }
    setupViews(){
        this.sceneList = new SceneListView(this);
        this.itemView = new ItemView(this);
        this.physicsView = new PhysicsView(this);
        this.behaviourView = new BehaviourView(this);
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
        this.deleteSceneModal = new DeleteSceneModal(this);
        this.savePrefabModal = new SavePrefabModal(this);
        this.behavioursModal = new BehavioursModal(this);
        this.removeObjectModal = new RemoveObjectModal(this);
        this.importBehavioursModal = new ImportBehavioursModal(this);
        this.customModal = new CustomModal(this);

        this.transformModal = new TransformModal(this);

        this.materialTypeModal = new MaterialTypeModal(this);
        this.materialSettingsModal = new MaterialSettingsModal(this);
        this.mapSettingsModal = new MapSettingsModal(this);
        this.repeatSettingsModal = new RepeatSettingsModal(this);
        this.portalModal = new PortalModal(this);
        this.loadTextureModal = new LoadTextureModal(this);

        this.geometryTypeModal = new GeometryTypeModal(this);
        this.geometrySettingsModal = new GeometrySettingsModal(this);

        this.objectMaterial = new ObjectMaterial(this);
        this.addPrefabList = new AddPrefabList(this);

        this.createSceneModal = new CreateSceneModal(this);
        this.modelSettings = new ModelSettings(this);
        this.editModelSettings = new EditModelSettings(this);
        this.spriteModalSettings = new SpriteModalSettings(this);
        this.lightSettingsAmbient = new LightSettingsAmbient(this);
        this.lightSettingsPoint = new LightSettingsPoint(this);
        this.lightSettingsDirectional = new LightSettingsDirectional(this);
        this.lightSettingsHemisphere = new LightSettingsHemisphere(this);
        this.lightSettingsRectArea = new LightSettingsRectArea(this);
        this.lightSettingsSpot = new LightSettingsSpot(this);
        this.physicsShapeTypeModal = new PhysicsShapeTypeModal(this);
        this.physicsShapeSettingsModal = new PhysicsShapeSettingsModal(this);

        this.sceneEl.addEventListener('modal-closed',()=>{
            this.content.popup.components['ui-scroll-pane'].setContent('');
        });
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
}

