export class PhysicsShapeSettingsModal {
    constructor(context) {
        this.context = context;
        this.types_images = {
            'Box': '#geometry_box',
            'Cylinder': '#geometry_cylinder',
            'Plane': '#geometry_plane',
            'Sphere': '#geometry_sphere',
           // 'Quick Hull': icon_path + 'Torus.jpg',
           // 'Terrain Collider': icon_path + 'Terrain.jpg'
        }
    }
    openList(page){
        this.page = page||0;
        document.getElementById('backButton').setAttribute('scale', '0.00001 0.00001 0.00001');
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        let start = this.page*10;
        let end  = start+10;
        let displayMeshes = this.meshes.slice(start,end);
        this.context.content.loadTemplates(['physics-shape-settings'])
            .then(() => this.context.content.compileTemplates('physics-shape-settings', [{name: this.name,image:this.types_images[this.type],meshes:displayMeshes,page: this.page}], true))
            .then(contents => {
                this.context.content.popup.setContent(contents[0]);
            })
            .then(() => this.uiRenderer.components['ui-renderer'].play())
            .then(() => {
                let switches = document.querySelectorAll('.shapeWrap');
                for(let i = 0; i < switches.length; i ++){
                    let _switch = switches[i];
                    _switch.addEventListener('ui-switch-changed',e=>{
                        for(let j= 0; j < this.meshes.length; j++){
                            if(this.meshes[j].name === _switch.dataset.name){
                                this.meshes[j].enabled = e.detail;
                            }
                        }
                    });
                }
                let next = this.context.content.popup.querySelector('.next-meshes-button');
                if(next){
                    next.addEventListener('mousedown',()=>this.openList(++this.page))
                }
                let prev = this.context.content.popup.querySelector('.prev-meshes-button');
                if(prev) {
                    prev.addEventListener('mousedown', () => this.openList(--this.page))
                }
                this.context.content.popup.querySelector('.left-button').addEventListener('mousedown',()=>{
                    this.uiRenderer.modal.close();
                });
                this.context.content.popup.querySelector('.right-button').addEventListener('mousedown',()=>{
                    let meshObjects = [];
                    for(let i = 0; i < this.meshes.length; i ++){
                        if(this.objects[this.meshes[i].name]&&this.meshes[i].enabled){
                            meshObjects.push(this.objects[this.meshes[i].name]);
                        }
                    }
                    this.context.physics.add(this.type,meshObjects);
                    this.context.sceneGraph.updatePhysicsChildren();
                    this.context.physicsView.showShapeHelpers();
                    this.uiRenderer.modal.close();
                    this.context.physicsView.open();
                    this.context.physicsView.resetPhysics();
                });
            });
    }
    open(type) {
        this.type = type;
        let childrenGeometries = [];
        this.name = this.context.namer.generateName()+" "+this.type;
        this.context.currentObject.object3D.traverse(child=>{
            if(child.geometry&&child.name!=="<collider-mesh>"){
                childrenGeometries.push(child);
            }
        });
        this.meshes = [];
        this.objects = {};

        for(let i = 0; i < childrenGeometries.length; i++){
            let child = childrenGeometries[i];
            let uuid = UI.utils.uniqueNumberedName(child.name,childrenGeometries,'name');
            this.meshes.push({
                name:uuid,
                enabled:i===0
            });
            child.name = uuid;
            this.objects[uuid] = child;
        }
        this.openList();
    }
}