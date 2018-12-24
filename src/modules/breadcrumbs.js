export class BreadCrumbs{
    constructor(context){
        this.context = context;
        this.breadcrumbsContainer = document.getElementById('breadcrumbsContainer');
    }
    make(items){
        // Get the breadcrumbs of the current object traversing its parents.
        while (this.breadcrumbsContainer.firstChild) {
            this.breadcrumbsContainer.removeChild(this.breadcrumbsContainer.firstChild);
        }
        // If there is too many breadcrumbs to show then hide all but the last 7
        this.isOverloaded = items.length >= 7;
        if(!this.isOverloaded){
            for(let i = 0; i < items.length; i ++){
                this.makeBreadCrumb(items[i],i,this.breadcrumbsContainer);
                this.breadcrumbsContainer.appendChild(this.makeDivider(i));
            }
        }else{
            let ingoreBelow = items.length-7;
            this.breadcrumbsContainer.appendChild(this.makeDivider(0,true));
            for(let i = 0; i < items.length; i ++){
                if(items[i].isTop&&i===0){
                    this.makeBreadCrumb(items[i],i,this.breadcrumbsContainer);
                    this.breadcrumbsContainer.appendChild(this.makeDivider(i));
                }
                if(i>ingoreBelow){
                    this.makeBreadCrumb(items[i],i-ingoreBelow,this.breadcrumbsContainer);
                    this.breadcrumbsContainer.appendChild(this.makeDivider(i-ingoreBelow));
                }
            }
        }
    }
    fromObject(object,items){
        // Get the breadcrumbs of the current object traversing its parents.
        items = items ||[];
        if(object.parent){
            items = items.concat(this.fromObject(object.parent));
        }
        items.push({
            name:object.parent?object.settings.name:this.context.sceneGraph.currentScene.metadata.name,
            callback:()=>this.context.itemView.open(object),
            isTop:!object.parent
        });
        return items;
    }
    makeBreadCrumb(item,index,parent){
        // Make breadcrumb button entity
        let breadCrumb = `<a-ui-button width="0.45" width="0.13" color="#42b8ac"
                ripple-size="0.45 0.13" wrap-count="15" class="intersectable"
                position="`+(this.isOverloaded&&index>0?((index*0.52)+0.2):(index*0.52))+` 0 0"
                text-value="`+this.shorten(item.name,13)+`"
            
            ></a-ui-button>`;
        parent.insertAdjacentHTML('beforeend',breadCrumb);
        parent.lastChild.addEventListener('mousedown',()=>{
            item.callback();
        });
        // let button = document.createElement('a-ui-button');
        // // button.setAttribute('color','#42b8ac');
        // button.setAttribute('width',0.45);
        // button.setAttribute('height',0.13);
        // button.setAttribute('ripple-size','0.45 0.13');
        // button.setAttribute('position',(this.isOverloaded&&index>0?((index*0.52)+0.2):(index*0.52))+' 0 0');
        // button.setAttribute('wrap-count',15);
        // button.setAttribute('text-value',this.shorten(item.name,13));
        // button.className = 'intersectable';
        // button.addEventListener('mousedown',()=>{
        //     item.callback();
        // });
        // return button;
    }
    makeDivider(index,isMore){
        // Make breadcrumb gap and divider.
        let divider = document.createElement('a-box');
        divider.setAttribute('width',0.12);
        divider.setAttribute('position',(this.isOverloaded&&index&&!isMore>0?(((index*0.52)+0.25)+0.2):((index*0.52)+(isMore?0.4:0.25)))+' 0 0');
        divider.setAttribute('height',0.12);
        divider.setAttribute('depth',0.00001);
        divider.setAttribute('shader','flat');
        divider.setAttribute('transparent',true);
        divider.setAttribute('src',isMore?'#breadCrumbMore':'#breadCrumb');
        return divider;
    }
    shorten(string,length){
        // Shorten the breadcrumb name with ellipsis.
        return string.length>length?string.substr(0,length)+"...":string;
    }
}