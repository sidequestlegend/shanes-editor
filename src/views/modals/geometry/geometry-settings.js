export class GeometrySettingsModal {
    constructor(context) {
        this.context = context;
    }

    open() {
        this.isPrimitive = this.context.currentObject.settings.type==="Primitive";
        this.geometry = this.context.currentObject.settings.geometry;
        console.log(this.context.currentObject.settings);
        this.type = this.isPrimitive?this.geometry.type
            .replace('Geometry','')
            .replace('Buffer','')
            .replace('Inverted','').toLowerCase()
            :'parametric';

        this.resetTemplate();
        switch (this.type) {
            case "box":
                return this.openBox();
            case "circle":
                return this.openCircle();
            case "cone":
                return this.openCone();
            case "cylinder":
                return this.openCylinder();
            case "dodecahedron":
            case "icosahedron":
            case "octahedron":
            case "tetrahedron":
                return this.openHedron();
            case "plane":
                return this.openPlane();
            case "ring":
                return this.openRing();
            case "sphere":
                return this.openSphere();
            case "torus":
                return this.openTorus();
            case "torusknot":
                return this.openTorusKnot();
            case "parametric":
                return this.openParametric();
        }

    }

    async load() {
        this.startSection = `
            <a-text font="roboto" baseLine="top" anchor="center" 
            value="`+this.type.charAt(0).toUpperCase() + this.type.substr(1)+` Geometry Settings"
                    color="#212121" wrap-count="26" width="1.35" height="0.15"></a-text>
            <a-plane width="2.9" height="0.01" color="#8f8f8f" shader="flat"></a-plane>
            <a-entity width="1.35">`;

        this.midSection = `
            </a-entity>
            <a-plane width="0.01" height="1.6" color="#8f8f8f" shader="flat"></a-plane>
            <a-entity width="1.35">`;

        this.endSection = '</a-entity>';


        return this.context.content.loadTemplates([
            'radios',
            'switches',
            'number'
        ])
    }

    openSphere(){
        return this.load()
            .then(()=>{
                this.templates.number.push(
                    {name:'Radius',number:this.geometry.radius},
                    {name:'Width Segments',number:this.geometry.widthSegments},
                    {name:'Height Segments',number:this.geometry.heightSegments},
                    {name:'Phi Start',number:THREE.Math.radToDeg(this.geometry.phiStart)},
                    {name:'Phi Length',number:THREE.Math.radToDeg(this.geometry.phiLength)},
                    {name:'Theta Start',number:THREE.Math.radToDeg(this.geometry.thetaStart)},
                    {name:'Theta Length',number:THREE.Math.radToDeg(this.geometry.thetaLength)},
                );
            })
            .then(()=>this.compile())
            .then(contents=>{
                let radius = contents[0].shift();
                let widthSegments = contents[0].shift();
                let heightSegments = contents[0].shift();
                let phiStart = contents[0].shift();
                let phiLength = contents[0].shift();
                let thetaStart = contents[0].shift();
                let thetaLength = contents[0].shift();
                let standardContents = radius+widthSegments+heightSegments+phiStart+phiLength+this.midSection+thetaStart+thetaLength;
                let fullContents = this.startSection+standardContents+this.endSection;
                return this.context.content.popup.components['ui-scroll-pane'].setContent(fullContents);
            })
            .then(()=>{
                this.context.viewUtils.setupNumberUpdate('geometry','.radius','radius');
                this.context.viewUtils.setupNumberUpdate('geometry','.widthsegments','widthSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.heightsegments','heightSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.phistart','phiStart');
                this.context.viewUtils.setupNumberUpdate('geometry','.philength','phiLength',true);
                this.context.viewUtils.setupNumberUpdate('geometry','.thetastart','thetaStart',true);
            });
    }

    openTorus(){
        return this.load()
            .then(()=>{
                this.templates.number.push(
                    {name:'Tube',number:this.geometry.tube},
                    {name:'Radial Segments',number:this.geometry.radialSegments},
                    {name:'Tubular Segments',number:this.geometry.tubularSegments},
                    {name:'Arc',number:THREE.Math.radToDeg(this.geometry.arc)},
                );
            })
            .then(()=>this.compile())
            .then(contents=>{
                let tube = contents[0].shift();
                let radialSegments = contents[0].shift();
                let tubularSegments = contents[0].shift();
                let arc = contents[0].shift();
                let standardContents = tube+arc+this.midSection+radialSegments+tubularSegments;
                let fullContents = this.startSection+standardContents+this.endSection;
                return this.context.content.popup.components['ui-scroll-pane'].setContent(fullContents);
            })
            .then(()=>{
                this.context.viewUtils.setupNumberUpdate('geometry','.tube','tube');
                this.context.viewUtils.setupNumberUpdate('geometry','.radialsegments','radialSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.tubularsegments','tubularSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.arc','arc');
            });
    }

    openTorusKnot(){
        return this.load()
            .then(()=>{
                this.templates.number.push(
                    {name:'Tube',number:this.geometry.tube},
                    {name:'Radial Segments',number:this.geometry.radialSegments},
                    {name:'Tubular Segments',number:this.geometry.tubularSegments},
                    {name:'Arc',number:THREE.Math.radToDeg(this.geometry.arc)},
                    {name:'P',number:this.geometry.p},
                    {name:'Q',number:this.geometry.q},
                );
            })
            .then(()=>this.compile())
            .then(contents=>{
                let tube = contents[0].shift();
                let radialSegments = contents[0].shift();
                let tubularSegments = contents[0].shift();
                let arc = contents[0].shift();
                let p = contents[0].shift();
                let q = contents[0].shift();
                let standardContents = tube+arc+p+q+this.midSection+radialSegments+tubularSegments;
                let fullContents = this.startSection+standardContents+this.endSection;
                return this.context.content.popup.components['ui-scroll-pane'].setContent(fullContents);
            })
            .then(()=>{
                this.context.viewUtils.setupNumberUpdate('geometry','.tube','tube');
                this.context.viewUtils.setupNumberUpdate('geometry','.radialsegments','radialSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.tubularsegments','tubularSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.p','p');
                this.context.viewUtils.setupNumberUpdate('geometry','.q','q');
            })
    }

    openParametric(){
        return this.load()
            .then(()=>{
                this.templates.number.push(
                    {name:'Slices',number:this.geometry.slices},
                    {name:'Stacks',number:this.geometry.stacks}
                );
            })
            .then(()=>this.compile())
            .then(contents=>{
                let slices = contents[0].shift();
                let stacks = contents[0].shift();
                let standardContents = slices+stacks+this.midSection;
                let fullContents = this.startSection+standardContents+this.endSection;
                return this.context.content.popup.components['ui-scroll-pane'].setContent(fullContents);
            })
            .then(()=>{
                this.context.viewUtils.setupNumberUpdate('geometry','.slices','slices');
                this.context.viewUtils.setupNumberUpdate('geometry','.stacks','stacks');
            })
    }

    openRing(){
        return this.load()
            .then(()=>{
                this.templates.number.push(
                    {name:'Inner Radius',number:this.geometry.innerRadius},
                    {name:'Outer Radius',number:this.geometry.outerRadius},
                    {name:'Theta Segments',number:this.geometry.thetaSegments},
                    {name:'Phi Segments',number:this.geometry.phiSegments},
                    {name:'Theta Start',number:THREE.Math.radToDeg(this.geometry.thetaStart)},
                    {name:'Theta Length',number:THREE.Math.radToDeg(this.geometry.thetaLength)},
                );
            })
            .then(()=>this.compile())
            .then(contents=>{
                let innerRadius = contents[0].shift();
                let outerRadius = contents[0].shift();
                let thetaSegments = contents[0].shift();
                let phiSegments = contents[0].shift();
                let thetaStart = contents[0].shift();
                let thetaLength = contents[0].shift();
                let standardContents = innerRadius+outerRadius+thetaSegments+phiSegments+this.midSection+thetaStart+thetaLength;
                let fullContents = this.startSection+standardContents+this.endSection;
                return this.context.content.popup.components['ui-scroll-pane'].setContent(fullContents);
            })
            .then(()=>{
                this.context.viewUtils.setupNumberUpdate('geometry','.innerradius','innerRadius');
                this.context.viewUtils.setupNumberUpdate('geometry','.outerradius','outerRadius');
                this.context.viewUtils.setupNumberUpdate('geometry','.thetasegments','thetaSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.phisegments','phiSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.thetastart','thetaStart',true);
                this.context.viewUtils.setupNumberUpdate('geometry','.thetalength','thetaLength',true);
            })
    }

    openPlane(){
        return this.load()
            .then(()=>{
                this.templates.number.push(
                    {name:'Width',number:this.geometry.width},
                    {name:'Height',number:this.geometry.height},
                    {name:'Width Segments',number:this.geometry.widthSegments},
                    {name:'Height Segments',number:this.geometry.heightSegments}
                );
            })
            .then(()=>this.compile())
            .then(contents=>{

                let width = contents[0].shift();
                let height = contents[0].shift();

                let widthSegments = contents[0].shift();
                let heightSegments = contents[0].shift();

                let standardContents = width+height+this.midSection+widthSegments+heightSegments;
                let fullContents = this.startSection+standardContents+this.endSection;
                return this.context.content.popup.components['ui-scroll-pane'].setContent(fullContents);
            }).then(()=>{
                this.context.viewUtils.setupNumberUpdate('geometry','.width','width');
                this.context.viewUtils.setupNumberUpdate('geometry','.height','height');
                this.context.viewUtils.setupNumberUpdate('geometry','.widthsegments','widthSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.heightsegments','heightSegments');
            })
    }

    openHedron(){
        return this.load()
            .then(()=>{
                this.templates.number.push(
                    {name:'Radius',number:this.geometry.radius},
                    {name:'Detail',number:this.geometry.detail}
                );
            })
            .then(()=>this.compile())
            .then(contents=>{
                let radius = contents[0].shift();
                let detail = contents[0].shift();
                let standardContents = radius+detail+this.midSection;
                let fullContents = this.startSection+standardContents+this.endSection;
                return this.context.content.popup.components['ui-scroll-pane'].setContent(fullContents);
            })
            .then(()=>{
                this.context.viewUtils.setupNumberUpdate('geometry','.radius','radius');
                this.context.viewUtils.setupNumberUpdate('geometry','.detail','detail');
            })
    }

    openCylinder(){

        return this.load()
            .then(()=>{
                this.templates.switches.push({settings:[{name:'Open Ended',selected:this.geometry.openEnded}]});
                this.templates.number.push(
                    {name:'Radius Top',number:this.geometry.radiusTop},
                    {name:'Radius Bottom',number:this.geometry.radiusBottom},
                    {name:'Height',number:this.geometry.height},
                    {name:'Radial Segments',number:this.geometry.radialSegments},
                    {name:'Height Segments',number:this.geometry.heightSegments},
                    {name:'Theta Start',number:THREE.Math.radToDeg(this.geometry.thetaStart)},
                    {name:'Theta Length',number:THREE.Math.radToDeg(this.geometry.thetaLength)},
                );
            })
            .then(()=>this.compile())
            .then(contents=>{
                let radiusTop = contents[1].shift();
                let radiusBottom = contents[1].shift();
                let height = contents[1].shift();
                let radialSegments = contents[1].shift();
                let heightSegments = contents[1].shift();
                let thetaStart = contents[1].shift();
                let thetaLength = contents[1].shift();
                let openEnded = contents[0].shift();
                let standardContents = radiusTop+radiusBottom+height+thetaStart+thetaLength+this.midSection+radialSegments+heightSegments+openEnded;
                let fullContents = this.startSection+standardContents+this.endSection;
                return this.context.content.popup.components['ui-scroll-pane'].setContent(fullContents);
            })
            .then(()=>{
                this.context.viewUtils.setupNumberUpdate('geometry','.radiustop','radiusTop');
                this.context.viewUtils.setupNumberUpdate('geometry','.radiusbottom','radiusBottom');
                this.context.viewUtils.setupNumberUpdate('geometry','.radialsegments','radialSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.heightsegments','heightSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.thetastart','thetaStart',true);
                this.context.viewUtils.setupNumberUpdate('geometry','.thetalength','thetaLength',true);
                this.context.viewUtils.setupSwitcheInput('geometry','.switch-openended','openEnded');
            })
    }

    openCone(){
        return this.load()
            .then(()=>{
                this.templates.switches.push({settings:[{name:'Open Ended',selected:this.geometry.openEnded}]});
                this.templates.number.push(
                    {name:'Radius',number:this.geometry.radius},
                    {name:'Height',number:this.geometry.height},
                    {name:'Radial Segments',number:this.geometry.radialSegments},
                    {name:'Height Segments',number:this.geometry.heightSegments},
                    {name:'Theta Start',number:THREE.Math.radToDeg(this.geometry.thetaStart)},
                    {name:'Theta Length',number:THREE.Math.radToDeg(this.geometry.thetaLength)},
                );
            })
            .then(()=>this.compile())
            .then(contents=>{
                let radius = contents[1].shift();
                let height = contents[1].shift();
                let radialSegments = contents[1].shift();
                let heightSegments = contents[1].shift();
                let thetaStart = contents[1].shift();
                let thetaLength = contents[1].shift();
                let openEnded = contents[0].shift();
                let standardContents = radius+height+thetaStart+thetaLength+this.midSection+radialSegments+heightSegments+openEnded;
                let fullContents = this.startSection+standardContents+this.endSection;
                return this.context.content.popup.components['ui-scroll-pane'].setContent(fullContents);
            })
            .then(()=>{
                this.context.viewUtils.setupNumberUpdate('geometry','.radius','radius');
                this.context.viewUtils.setupNumberUpdate('geometry','.height','height');
                this.context.viewUtils.setupNumberUpdate('geometry','.radialsegments','radialSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.heightsegments','heightSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.thetastart','thetaStart',true);
                this.context.viewUtils.setupNumberUpdate('geometry','.thetalength','thetaLength',true);
                this.context.viewUtils.setupSwitcheInput('geometry','.switch-openended','openEnded');
            })
    }

    openCircle(){
        return this.load()
            .then(()=>{
                this.templates.number.push(
                    {name:'Radius',number:this.geometry.radius},
                    {name:'Segments',number:this.geometry.segments},
                    {name:'Theta Start',number:THREE.Math.radToDeg(this.geometry.thetaStart)},
                    {name:'Theta Length',number:THREE.Math.radToDeg(this.geometry.thetaLength)},
                );
            })
            .then(()=>this.compile())
            .then(contents=>{
                let radius = contents[0].shift();
                let segments = contents[0].shift();
                let thetaStart = contents[0].shift();
                let thetaLength = contents[0].shift();
                let standardContents = radius+segments+this.midSection+thetaStart+thetaLength;
                let fullContents = this.startSection+standardContents+this.endSection;
                return this.context.content.popup.components['ui-scroll-pane'].setContent(fullContents);
            })
            .then(()=>{
                this.context.viewUtils.setupNumberUpdate('geometry','.radius','radius');
                this.context.viewUtils.setupNumberUpdate('geometry','.segments','segments');
                this.context.viewUtils.setupNumberUpdate('geometry','.thetastart','thetaStart',true);
                this.context.viewUtils.setupNumberUpdate('geometry','.thetalength','thetaLength',true);
            })
    }

    openBox(){
        return this.load()
            .then(()=>{
                this.templates.number.push(
                    {name:'Width',number:this.geometry.width},
                    {name:'Height',number:this.geometry.height},
                    {name:'Depth',number:this.geometry.depth},
                    {name:'Width Segments',number:this.geometry.widthSegments},
                    {name:'Height Segments',number:this.geometry.heightSegments},
                    {name:'Depth Segments',number:this.geometry.depthSegments}
                );
            })
            .then(()=>this.compile())
            .then(contents=>{
                console.log(this.geometry);
                let width = contents[0].shift();
                let height = contents[0].shift();
                let depth = contents[0].shift();

                let widthSegments = contents[0].shift();
                let heightSegments = contents[0].shift();
                let depthSegments = contents[0].shift();

                let standardContents = width+height+depth+this.midSection+widthSegments+heightSegments+depthSegments;
                let fullContents = this.startSection+standardContents+this.endSection;
                return this.context.content.popup.components['ui-scroll-pane'].setContent(fullContents);
            }).then(()=>{
                this.context.viewUtils.setupNumberUpdate('geometry','.width','width');
                this.context.viewUtils.setupNumberUpdate('geometry','.height','height');
                this.context.viewUtils.setupNumberUpdate('geometry','.depth','depth');
                this.context.viewUtils.setupNumberUpdate('geometry','.widthsegments','widthSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.heightsegments','heightSegments');
                this.context.viewUtils.setupNumberUpdate('geometry','.depthsegments','depthSegments');
            })
    }


    async compile(){
        let toBeCompiled = [];
        if(this.templates.switches.length){
            toBeCompiled.push(this.context.content.compileTemplates('switches',this.templates.switches));
        }
        if(this.templates.radios.length){
            toBeCompiled.push(this.context.content.compileTemplates('radios',this.templates.radios));
        }
        if(this.templates.number.length){
            toBeCompiled.push(this.context.content.compileTemplates('number',this.templates.number));
        }
        return Promise.all(toBeCompiled);
    }
    resetTemplate(){
        this.templates = {
            switches:[],
            radios:[],
            number:[]
        };
    }
}