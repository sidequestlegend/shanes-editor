import {ParametricGeometries} from "./parametric-geometries";
export class GeometryFactory{
    constructor(sceneGraph){
        this.sceneGraph = sceneGraph;
        this.parametricGeometries = new ParametricGeometries();
    }
    makeGeometry(geo_settings){
        let settingsObj = this.geometrySettingsWithDefaults(geo_settings);
        let parameters = [null];
        for(let key in settingsObj){
            if(settingsObj.hasOwnProperty(key)){
                parameters.push(settingsObj[key]);
            }
        }
        let outputFunc = Function.prototype.bind.apply(THREE[geo_settings.type],parameters);
        return new outputFunc();
    }
    makeParametric(geo_settings){
        let _this = this;
        let settings = this.parametricSettingsWithDefaults(geo_settings);
        let globals = {
            document:document,
            scene:_this.sceneGraph.context.sceneEl.object3D,
            root:_this.sceneGraph.container,
            helper: _this.sceneGraph.behaviourHelper
        };
        let user_config = settings.user_options||{};
        let custom_functions = {
            AppleGeometry:this.parametricGeometries.apple,
            AppleInvertedGeometry:this.parametricGeometries.invertedApple.bind(this.parametricGeometries),
            FermatGeometry:this.parametricGeometries.fermet,
            KleinGeometry:this.parametricGeometries.klein,
            KleinInvertedGeometry:this.parametricGeometries.invertedKlein.bind(this.parametricGeometries),
            HelicoidGeometry:this.parametricGeometries.helicoid,
            PillowGeometry:this.parametricGeometries.pillow,
            PillowInvertedGeometry:this.parametricGeometries.invertedPillow.bind(this.parametricGeometries),
            ScherkGeometry:this.parametricGeometries.scherk,
            MobiusGeometry:this.parametricGeometries.mobius,
            Mobius3DGeometry:this.parametricGeometries.mobius3d,
            Mobius3DInvertedGeometry:this.parametricGeometries.invertedMobius3d.bind(this.parametricGeometries),
            NaticaStellataGeometry:this.parametricGeometries.natica,
            NaticaInvertedGeometry:this.parametricGeometries.invertedNatica.bind(this.parametricGeometries),
            HornGeometry:this.parametricGeometries.horn,
            HornInvertedGeometry:this.parametricGeometries.invertedHorn.bind(this.parametricGeometries),
            SpringGeometry:this.parametricGeometries.spring,
            SpringInvertedGeometry:this.parametricGeometries.invertedSpring.bind(this.parametricGeometries),
            CatenoidGeometry:this.parametricGeometries.catenoid,
            SnailGeometry:this.parametricGeometries.snail,
            SnailInvertedGeometry:this.parametricGeometries.invertedSnail.bind(this.parametricGeometries),
            SpiralGeometry:this.parametricGeometries.spiral,
            SpiralInvertedGeometry:this.parametricGeometries.invertedSpiral.bind(this.parametricGeometries),
            CustomGeometry:function(u,v){
                let vec = new THREE.Vector3(1,1,1);
                try{
                    vec = new Function('u','v','globals','user_config',(settings.method||"return new THREE.Vector3(0,0,0);"))(u,v,globals,user_config);
                    if(!vec||vec.constructor!==THREE.Vector3){
                        console.warn('Custom Geometry Error: ',settings.name,'Definition does not return a THREE.Vector3');
                        vec = new THREE.Vector3(1,1,1);
                    }
                }catch(e){
                    console.warn('Custom Geometry Error: ',settings.name,e);
                    vec = new THREE.Vector3(1,1,1);
                }
                return vec;
            }
        };
        let geo_func = custom_functions[geo_settings.sub_type];
        let parameters = [null,geo_func];
        let notAllowed = ['name','description','method','image','user_config','user_options','parametric_id'];
        for(let key in settings){
            if(settings.hasOwnProperty(key)&&
                notAllowed.indexOf(key)===-1){
                parameters.push(settings[key]);
            }
        }
        let outputFunc = Function.prototype.bind.apply(THREE.ParametricBufferGeometry,parameters);
        return new outputFunc();
    }
    parametricSettingsWithDefaults(settings){
        switch(settings.sub_type) {
            case "AppleGeometry":
            case "AppleInvertedGeometry":
            case "FermatGeometry":
            case "SpringGeometry":
            case "SpringInvertedGeometry":
            case "NaticaStellataGeometry":
            case "NaticaStellataInvertedGeometry":
            case "HelicoidGeometry":
            case "SpiralGeometry":
            case "SpiralInvertedGeometry":
            case "PillowGeometry":
            case "PillowInvertedGeometry":
            case "CatenoidGeometry":
            case "ScherkGeometry":
            case "KleinGeometry":
            case "KleinInvertedGeometry":
            case "MobiusGeometry":
            case "Mobius3DGeometry":
            case "Mobius3DInvertedGeometry":
            case "SnailGeometry":
            case "SnailInvertedGeometry":
            case "HornGeometry":
            case "HornInvertedGeometry":
                return {
                    slices:settings.slices || 24,
                    stacks:settings.stacks || 24
                };
            case "CustomGeometry":
                return {
                    name:settings.name || "",
                    description:settings.description || "",
                    image:settings.image || "images/parametric.png",
                    method:settings.method || "",
                    user_config:settings.user_config || "",
                    user_options:settings.user_options || {},
                    parametric_id:settings.parametric_id || 0,
                    slices:settings.slices || 24,
                    stacks:settings.stacks || 24
                };
        }
    }
    geometrySettingsWithDefaults(settings){
        switch(settings.type){
            case "BoxGeometry":
            case "BoxBufferGeometry":
                return {
                    width:settings.width || 1,
                    height:settings.height || 1,
                    depth:settings.depth || 1,
                    widthSegments:settings.widthSegments ||1,
                    heightSegments:settings.heightSegments || 1,
                    depthSegments:settings.depthSegments || 1,
                };
            case "CircleGeometry":
            case "CircleBufferGeometry":
                return {
                    radius:settings.radius || 1,
                    segments:settings.segments || 24,
                    thetaStart:settings.thetaStart || 0,
                    thetaLength:settings.thetaLength || Math.PI*2,
                };
            case "ConeGeometry":
            case "ConeBufferGeometry":
                return {
                    radius:settings.radius || 1,
                    height:settings.height || 1,
                    radialSegments:settings.radialSegments || 24,
                    heightSegments:settings.heightSegments || 1,
                    openEnded:false,
                    thetaStart:settings.thetaStart || 0,
                    thetaLength:settings.thetaLength || Math.PI*2,
                };
            case "CylinderGeometry":
            case "CylinderBufferGeometry":
                return {
                    radiusTop:settings.radiusTop || 1,
                    radiusBottom:settings.radiusBottom || 1,
                    height:settings.height || 1,
                    radialSegments:settings.radialSegments || 24,
                    heightSegments:settings.heightSegments || 1,
                    openEnded:false,
                    thetaStart:settings.thetaStart || 0,
                    thetaLength:settings.thetaLength || Math.PI*2,
                };
            case "DodecahedronGeometry":
            case "DodecahedronBufferGeometry":
                return {
                    radius:settings.radius || 1,
                    detail:settings.detail || 1
                };
            case "IcosahedronGeometry":
            case "IcosahedronBufferGeometry":
                return {
                    radius:settings.radius || 1,
                    detail:settings.detail || 1
                };
            case "OctahedronGeometry":
            case "OctahedronBufferGeometry":
                return {
                    radius:settings.radius || 1,
                    detail:settings.detail || 1
                };
            case "PlaneGeometry":
            case "PlaneBufferGeometry":
                return {
                    width:settings.width || 1,
                    height:settings.height || 1,
                    widthSegments:settings.widthSegments || 1,
                    heightSegments:settings.heightSegments || 1,
                };
            case "RingGeometry":
            case "RingBufferGeometry":
                return {
                    innerRadius:settings.innerRadius || 0.5,
                    outerRadius:settings.outerRadius || 1,
                    thetaSegments:settings.thetaSegments || 24,
                    phiSegments:settings.phiSegments || 8,
                    thetaStart:settings.thetaStart || 0,
                    thetaLength:settings.thetaLength || Math.PI * 2,
                };
            case "SphereGeometry":
            case "SphereBufferGeometry":
                return {
                    radius:settings.radius || 1,
                    widthSegments:settings.widthSegments || 16,
                    heightSegments:settings.heightSegments || 16,
                    phiStart:settings.phiStart || 0,
                    phiLength:settings.phiLength || Math.PI * 2,
                    thetaStart:settings.thetaStart || 0,
                    thetaLength:settings.thetaLength || Math.PI
                };
            case "TetrahedronGeometry":
            case "TetrahedronBufferGeometry":
                return {
                    radius:settings.radius || 1,
                    detail:settings.detail || 0
                };
            case "TorusGeometry":
            case "TorusBufferGeometry":
                return {
                    radius:settings.radius || 1,
                    tube:settings.tube || 0.4,
                    radialSegments:settings.radialSegments || 8,
                    tubularSegments:settings.tubularSegments || 16,
                    arc:settings.arc || Math.PI * 2,
                };
            case "TorusKnotGeometry":
            case "TorusKnotBufferGeometry":
                return {
                    radius:settings.radius || 1,
                    tube:settings.tube || 0.4,
                    tubularSegments:settings.tubularSegments || 64,
                    radialSegments:settings.radialSegments || 8,
                    p:settings.p || 2,
                    q:settings.q || 3,
                };
            default:
                return {};
        }
    }
}