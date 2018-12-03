export class ParametricTypeModal{
    constructor(context) {
        this.context = context;
        let icon_path = 'https://cdn.theexpanse.app/images/icons/objects/geometries/parametric/';
        this.types = [
            {name:'My Parametrics',friendly_name:'My Fancys',image_url:'#objects_parametric'},
            {name:'Parametric Market',friendly_name:'Fancy Market',image_url:'#objects_market'},
            {name:'Create',friendly_name:'Create',image_url:'#objects_custom'},
            {name:'Apple',friendly_name:'Apple',image_url:'#geometry_apple'},
            {name:'AppleInverted',friendly_name:'Apple Inverted',image_url:'#geometry_apple'},
            {name:'Catenoid',friendly_name:'Catenoid',image_url:'#geometry_catenoid'},
            {name:'Fermat',friendly_name:'Fermat',image_url:'#geometry_fermat'},
            {name:'Helicoid',friendly_name:'Helicoid',image_url:'#geometry_helicoid'},
            {name:'Horn',friendly_name:'Horn',image_url:'#geometry_horn'},
            {name:'HornInverted',friendly_name:'Horn Inverted',image_url:'#geometry_horn'},
            {name:'Klein',friendly_name:'Klein',image_url:'#geometry_klein'},
            {name:'KleinInverted',friendly_name:'Klein Inverted',image_url:'#geometry_klein'},
            {name:'Mobius',friendly_name:'Mobius',image_url:'#geometry_mobius'},
            {name:'Mobius3D',friendly_name:'Mobius3D',image_url:'#geometry_mobius3d'},
            {name:'Mobius3DInverted',friendly_name:'Mobius3D Inverted',image_url:'#geometry_mobius3d'},
            {name:'Pillow',friendly_name:'Pillow',image_url:'#geometry_pillow'},
            {name:'PillowInverted',friendly_name:'Pillow Inverted',image_url:'#geometry_pillow'},
            {name:'NaticaStellata',friendly_name:'Natica',image_url:'#geometry_naticastellata'},
            {name:'NaticaStellataInverted',friendly_name:'Natica Inverted',image_url:'#geometry_naticastellata'},
            {name:'Scherk',friendly_name:'Scherk',image_url:'#geometry_scherk'},
            {name:'Snail',friendly_name:'Snail',image_url:'#geometry_snail'},
            {name:'SnailInverted',friendly_name:'Snail Inverted',image_url:'#geometry_snail'},
            {name:'Spiral',friendly_name:'Spiral',image_url:'#geometry_spiral'},
            {name:'SpiralInverted',friendly_name:'Spiral Inverted',image_url:'#geometry_spiral'},
            {name:'Spring',friendly_name:'Spring',image_url:'#geometry_spring'},
            {name:'SpringInverted',friendly_name:'Spring Inverted',image_url:'#geometry_spring'}
        ]

    }
    open() {
        //this.uiRenderer = document.getElementById('mainRenderer');
        this.context.content.compileTemplates('add-items',[{items:this.types}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.objectMaterial.open({
                            type:'Parametric',
                            sub_type:button.dataset.key,
                            geo_settings:{
                                sub_type:button.dataset.key+"Geometry"
                            }
                        });
                    });
                }
            });


        ;
    }
}