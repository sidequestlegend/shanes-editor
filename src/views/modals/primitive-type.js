export class PrimitiveTypeModal{
    constructor(context) {
        this.context = context;
        let icon_path = 'https://cdn.theexpanse.app/images/icons/objects/geometries/primitive/';
        this.types = [
            {name:'Box',friendly_name:'Box',image_url:'#geometry_box'},
            {name:'Circle',friendly_name:'Circle',image_url:'#geometry_circle'},
            {name:'Cone',friendly_name:'Cone',image_url:'#geometry_cone'},
            {name:'Cylinder',friendly_name:'Cylinder',image_url:'#geometry_cylinder'},
            {name:'Dodecahedron',friendly_name:'Dodecahedron',image_url:'#geometry_dodecahedron'},
            {name:'Icosahedron',friendly_name:'Icosahedron',image_url:'#geometry_icosahedron'},
            {name:'Octahedron',friendly_name:'Octahedron',image_url:'#geometry_octahedron'},
            {name:'Plane',friendly_name:'Plane',image_url:'#geometry_plane'},
            {name:'Ring',friendly_name:'Ring',image_url:'#geometry_ring'},
            {name:'Sphere',friendly_name:'Sphere',image_url:'#geometry_sphere'},
            {name:'Tetrahedron',friendly_name:'Tetrahedron',image_url:'#geometry_tetrahedron'},
            {name:'Torus',friendly_name:'Torus',image_url:'#geometry_torus'},
            {name:'TorusKnot',friendly_name:'TorusKnot',image_url:'#geometry_torusknot'}
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