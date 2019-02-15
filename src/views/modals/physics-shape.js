export class PhysicsShapeTypeModal {
    constructor(context) {
        this.context = context;
        this.types = [
            {name:'Box',friendly_name:'Box',image_url:'#small_icons',image_coords:'0 768 128 128'},
            {name:'Cylinder',friendly_name:'Cylinder',image_url:'#small_icons',image_coords:'0 896 128 128'},
            {name:'Plane',friendly_name:'Plane',image_url:'#small_icons',image_coords:'256 768 128 128'},
            {name:'Sphere',friendly_name:'Sphere',image_url:'#small_icons',image_coords:'384 640 128 128'},
            //{name:'Quick Hull',friendly_name:'Quick Hull',image_url:'#small_icons',image_coords:'384 768 128 128'},
          //  {name:'Terrain Collider',friendly_name:'Terrain Collider',image_url:'#small_icons',image_coords:'256 896 128 128'}
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