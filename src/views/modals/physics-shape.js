import {PhysicsShapeSettingsModal} from "./physics-shape-settings";

export class PhysicsShapeTypeModal {
    constructor(context) {
        this.context = context;
        let icon_path = 'https://cdn.theexpanse.app/images/icons/objects/geometries/primitive/';
        this.types = [
            {name:'Box',friendly_name:'Box',image_url:icon_path+'Box.jpg'},
            {name:'Cylinder',friendly_name:'Cylinder',image_url:icon_path+'Cylinder.jpg'},
            {name:'Plane',friendly_name:'Plane',image_url:icon_path+'Plane.jpg'},
            {name:'Sphere',friendly_name:'Sphere',image_url:icon_path+'Sphere.jpg'},
            //{name:'Quick Hull',friendly_name:'Quick Hull',image_url:icon_path+'Torus.jpg'},
          //  {name:'Terrain Collider',friendly_name:'Terrain Collider',image_url:icon_path+'Terrain.jpg'}
        ]
    }

    open() {
        document.getElementById('backButton').setAttribute('scale', '0.00001 0.00001 0.00001');
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadTemplates(['add-items'])
            .then(() => this.context.content.compileTemplates('add-items', [{items: this.types}], true))
            .then(contents => {
                this.context.content.popup.setContent(contents[0]);
            })
            .then(() => this.uiRenderer.components['ui-renderer'].play())
            .then(() => {
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.physicsShapeSettingsModal.open(button.dataset.key);
                    });
                }
            });
    }
}