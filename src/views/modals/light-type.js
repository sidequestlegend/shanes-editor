export class LightTypeModal{
    constructor(context) {
        this.context = context;
        this.types = [
            {name:'AmbientLight',friendly_name:'Ambient',image_url:'#objects_lights'},
            {name:'DirectionalLight',friendly_name:'Directional',image_url:'#objects_lights'},
            {name:'HemisphereLight',friendly_name:'Hemisphere',image_url:'#objects_lights'},
            {name:'PointLight',friendly_name:'Point',image_url:'#objects_lights'},
            {name:'RectAreaLight',friendly_name:'Rectangle Area',image_url:'#objects_lights'},
            {name:'SpotLight',friendly_name:'Spot',image_url:'#objects_lights'},
        ];
    }
    open() {
        this.uiRenderer = document.getElementById('mainRenderer');
        this.context.content.compileTemplates('add-items',[{items:this.types}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++) {
                    let button = buttons[i];
                    button.addEventListener('mousedown', () => {
                        this.context.sceneGraph.add(this.context.currentObject,{
                            type:"Light",
                            sub_type:button.dataset.key,
                            settings:this.context.sceneGraph.objectFactory.lightFactory.lightDefaults({type:button.dataset.key})
                        })
                            .then(child=>{
                                if(~["DirectionalLight","SpotLight","RectAreaLight","PointLight"].indexOf(button.dataset.key)){
                                    this.context.displayBox.setObject(child.object3D);
                                }
                                setTimeout(()=>{
                                    this.context.itemView.open(child);
                                    this.context.sceneGraph.sync();
                                },250);
                            });
                        this.uiRenderer.modal.close();
                    });
                }
            });
    }
}