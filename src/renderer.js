import {SceneGraph} from "./modules/scene-graph";
import {Namer} from "./modules/namer";
import './components/right_look_controls';

class Renderer {
    constructor() {
        this.namer = new Namer();
        this.sceneGraph = new SceneGraph(this);
        this.sceneEl = document.querySelector('a-scene');
        this.setupLoadingSphere();
        this.loadScene();
    }
    loadScene(){
        let sceneCode = this.getParameterByName('code');
        if(sceneCode){
            console.log('Connecting to room:',sceneCode);
            this.sceneEl.setAttribute('networked-scene',{
                    serverURL:'https://shanesedit.org:8087',
                    room: sceneCode,
                    adapter: 'easyrtc',
                    audio: true,
                    debug: true
                });
            this.sceneGraph.load({short_code:sceneCode})
                .then(()=>this.sceneGraph.open());
        }
    }
    setupLoadingSphere(){


        let cameraEl = document.getElementById('camera');
        this.loadingSphere = new THREE.Mesh(new THREE.SphereGeometry(0.2),new THREE.MeshBasicMaterial({color:'#fff',side:THREE.BackSide}));
        let loadingText = document.getElementById('loadingText');
        let loadingLogo = document.getElementById('loadingLogo');
        let start = new Date().getTime();
        cameraEl.object3D.add(this.loadingSphere);
        this.sceneEl.addEventListener('scene-loading',e=>{
            loadingText.setAttribute('value',Math.round(e.detail*100)+'%');
            if(e.detail===1){
                console.log('Scene loaded in: '+((new Date().getTime()-start)/1000)+"s")
                let _this = this;
                new TWEEN.Tween({x:1})
                    .to({x:0}, 250)
                    .onUpdate(function(){
                        loadingLogo.setAttribute('scale',this.x+' '+this.x+' '+this.x);
                    })
                    .onComplete(()=>{
                        loadingLogo.parentElement.removeChild(loadingLogo);
                    })
                    .easing(TWEEN.Easing.Exponential.Out).start();
                new TWEEN.Tween({x:1})
                    .delay(250)
                    .to({x:0}, 250)
                    .onUpdate(function(){
                        loadingText.setAttribute('scale',this.x+' '+this.x+' '+this.x);
                        loadingLogo.setAttribute('scale',this.x+' '+this.x+' '+this.x);
                    })
                    .onComplete(()=>{
                        loadingText.parentElement.removeChild(loadingText);
                        this.loadingSphere.material.transparent = true;
                        new TWEEN.Tween({x:1})
                            .to({x:0}, 750)
                            .onUpdate(function(){
                                _this.loadingSphere.material.opacity = this.x;
                            })
                            .onComplete(()=>_this.loadingSphere.parent.remove(_this.loadingSphere))
                            .easing(TWEEN.Easing.Exponential.Out).start();
                    })
                    .easing(TWEEN.Easing.Exponential.Out).start();
            }
        });

    }
    getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}

document.addEventListener("DOMContentLoaded", ()=> {
    window.renderer = new Renderer();
});