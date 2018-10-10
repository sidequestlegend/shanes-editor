export class PrimitiveTypeModal{
    constructor(context) {
        this.context = context;
        let icon_path = 'https://cdn.theexpanse.app/images/icons/objects/geometries/primitive/';
        this.types = [
            {name:'Box',friendly_name:'Box',image_url:icon_path+'Box.jpg'},
            {name:'Circle',friendly_name:'Circle',image_url:icon_path+'Circle.jpg'},
            {name:'Cone',friendly_name:'Cone',image_url:icon_path+'Cone.jpg'},
            {name:'Cylinder',friendly_name:'Cylinder',image_url:icon_path+'Cylinder.jpg'},
            {name:'Dodecahedron',friendly_name:'Dodecahedron',image_url:icon_path+'Dodecahedron.jpg'},
            {name:'Icosahedron',friendly_name:'Icosahedron',image_url:icon_path+'Icosahedron.jpg'},
            {name:'Octahedron',friendly_name:'Octahedron',image_url:icon_path+'Octahedron.jpg'},
            {name:'Plane',friendly_name:'Plane',image_url:icon_path+'Plane.jpg'},
            {name:'Ring',friendly_name:'Ring',image_url:icon_path+'Ring.jpg'},
            {name:'Sphere',friendly_name:'Sphere',image_url:icon_path+'Sphere.jpg'},
            {name:'Tetrahedron',friendly_name:'Tetrahedron',image_url:icon_path+'Tetrahedron.jpg'},
            {name:'Torus',friendly_name:'Torus',image_url:icon_path+'Torus.jpg'},
            {name:'TorusKnot',friendly_name:'TorusKnot',image_url:icon_path+'TorusKnot.jpg'}
        ]
    }
    open(){
        this.context.content.compileTemplates('add-items',[{items:this.types}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.objectMaterial.open({type:'Primitive',sub_type:button.dataset.key+"Geometry"});
                    });
                }
            });
    }
}