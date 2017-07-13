//工具
import {check} from './_api.js'
import {IsPC,isFunction} from './_functions.js'
import _Object from './_object.js'
import {throwError} from './_error.js'
export default class Captcha{
    constructor({rootDom,SMCaptcha,protocol,width}){
        this._config={
            SMCaptcha:SMCaptcha,
            rootDom:rootDom,
            protocol,
            width:width||'auto'
        };
        this.prefix = 'SMCaptcha-';
        this.ImgStack = {
            bg:false,
            fg:false,
            timeout:false
        };
        this.ratios = {
            'default':[110,5,35]
        };
        this.timer = null;
        this.locked = true;
        this.IsPC = IsPC();
        this.method = !IsPC()?['touchstart','touchmove','touchend','touchstart']:['mousedown','mousemove','mouseup','onclick'];
        this.svgs = {
            fail:'<svg class="SMCaptcha-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4350" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M557.312 513.248l265.28-263.904c12.544-12.48 12.608-32.704 0.128-45.248-12.512-12.576-32.704-12.608-45.248-0.128L512.128 467.904l-263.04-263.84c-12.448-12.48-32.704-12.544-45.248-0.064-12.512 12.48-12.544 32.736-0.064 45.28l262.976 263.776L201.6 776.8c-12.544 12.48-12.608 32.704-0.128 45.248a31.937 31.937 0 0 0 22.688 9.44c8.16 0 16.32-3.104 22.56-9.312l265.216-263.808 265.44 266.24c6.24 6.272 14.432 9.408 22.656 9.408a31.94 31.94 0 0 0 22.592-9.344c12.512-12.48 12.544-32.704 0.064-45.248L557.312 513.248z" fill="#ffffff" p-id="4351"></path></svg>',
            loading:'<svg style="width: 100%;height: 100%" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3132" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M512.511489 21.482517C241.348075 21.482517 21.482517 241.343255 21.482517 512.511489 21.482517 783.684341 241.338636 1003.54046 512.511489 1003.54046 539.065295 1003.54046 560.591409 982.014346 560.591409 955.460539 560.591409 928.906733 539.065295 907.380619 512.511489 907.380619 294.446249 907.380619 117.642358 730.576728 117.642358 512.511489 117.642358 294.45134 294.455216 117.642358 512.511489 117.642358 730.576728 117.642358 907.380619 294.446249 907.380619 512.511489 907.380619 539.065295 928.906733 560.591409 955.460539 560.591409 982.014346 560.591409 1003.54046 539.065295 1003.54046 512.511489 1003.54046 241.338636 783.684341 21.482517 512.511489 21.482517Z" p-id="3133"></path></svg>',
            right:'<svg  class="SMCaptcha-icon-svg" viewBox="0 0 1126 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5074" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M578.413939 1007.963092c-19.99784-19.980564-19.99784-52.285252 0-72.265816l372.924466-372.756417H52.08265c-28.230675 0-51.138748-22.89708-51.138748-51.104196 0-28.21654 22.908074-51.11362 51.138748-51.11362h899.255755L578.413939 87.974479c-19.99784-19.988417-19.99784-52.289963 0-72.272099 19.989988-19.986847 52.31038-19.986847 72.30665 0l460.156074 459.995878c4.760344 4.700663 8.491975 10.379779 11.103803 16.665129a50.241963 50.241963 0 0 1 3.934233 19.474846 50.60319 50.60319 0 0 1-3.934233 19.520393c-2.611828 6.28692-6.34346 11.911067-11.103803 16.666699L650.72216 1008.018061c-19.99784 19.933448-52.318233 19.933448-72.308221-0.054969" fill="#000000" p-id="5075"></path></svg>',
            movingRight:'<svg class="SMCaptcha-icon-svg" viewBox="0 0 1126 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5074" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M578.413939 1007.963092c-19.99784-19.980564-19.99784-52.285252 0-72.265816l372.924466-372.756417H52.08265c-28.230675 0-51.138748-22.89708-51.138748-51.104196 0-28.21654 22.908074-51.11362 51.138748-51.11362h899.255755L578.413939 87.974479c-19.99784-19.988417-19.99784-52.289963 0-72.272099 19.989988-19.986847 52.31038-19.986847 72.30665 0l460.156074 459.995878c4.760344 4.700663 8.491975 10.379779 11.103803 16.665129a50.241963 50.241963 0 0 1 3.934233 19.474846 50.60319 50.60319 0 0 1-3.934233 19.520393c-2.611828 6.28692-6.34346 11.911067-11.103803 16.666699L650.72216 1008.018061c-19.99784 19.933448-52.318233 19.933448-72.308221-0.054969" fill="#ffffff" p-id="5075"></path></svg>',
            success:'<svg class="SMCaptcha-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5891" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M332.475765 767.674077c-1.989307-1.989307-1.990331-5.245468 0-7.234775L892.385938 200.540386c1.989307-1.990331 5.245468-1.990331 7.235798 0l55.778374 55.774281c1.989307 1.989307 1.989307 5.245468 0 7.235798L395.502217 823.458591c-1.990331 1.989307-5.245468 1.989307-7.235798 0L332.475765 767.674077z" p-id="5892" fill="#ffffff"></path><path d="M383.675868 819.519886c-1.989307 1.990331-5.245468 1.990331-7.235798 0.001023l-307.841204-307.851437c-1.990331-1.990331-1.989307-5.245468 0-7.235798l55.783491-55.773258c1.989307-1.989307 5.245468-1.989307 7.235798 0l307.836087 307.829947c1.990331 1.989307 1.990331 5.245468 0 7.235798L383.675868 819.519886z" p-id="5893" fill="#ffffff"></path></svg>',
            loadFail:'<svg class="SMCaptcha-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7160" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M317.952 316.928h241.152c12.8-7.68 23.04-19.968 15.36-39.424-8.704-22.016-27.648-37.888-40.96-58.368-22.528-34.304-17.92-85.504 10.752-115.2 31.744-32.768 83.968-30.208 83.968-30.208s51.712-3.072 83.456 30.208c28.672 29.696 32.768 80.896 10.752 115.2-13.312 20.48-32.768 36.352-41.472 58.368-7.68 19.456 3.072 31.744 15.36 39.424h247.296v235.52c-7.168 11.264-18.944 19.968-36.352 13.312-20.992-8.192-35.84-26.624-55.296-38.912-32.256-20.992-80.896-16.896-109.056 10.24-31.232 30.208-28.672 79.36-28.672 79.36s-2.56 49.152 28.672 79.36c28.16 27.136 76.8 31.232 109.056 10.24 19.456-12.8 34.304-30.72 55.296-38.912 17.408-6.656 28.672 2.048 36.352 12.8V931.84H680.96c-9.728-7.168-16.896-17.92-10.752-33.792 8.192-20.48 25.6-34.816 38.4-53.76 20.48-31.744 16.896-79.36-9.728-106.496-29.696-30.72-77.312-27.648-77.312-27.648s-48.128-2.56-77.312 27.648c-26.624 27.648-30.72 74.752-9.728 106.496 12.288 18.944 30.208 33.28 37.888 53.76 6.144 15.872-1.024 26.624-10.752 33.792H317.952v-236.032c-7.68-13.824-20.992-26.112-41.472-17.92-22.528 9.216-38.912 28.672-59.904 42.496-35.328 23.04-88.576 18.432-118.784-10.752-34.304-32.768-31.232-86.528-31.232-86.528s-3.072-53.248 31.232-86.528c30.72-29.696 83.456-34.304 118.784-10.752 20.992 13.824 37.376 33.792 59.904 42.496 20.992 8.192 33.792-4.096 41.472-17.92V316.928z" fill="#000000" p-id="7161"></path></svg>',
            refresh:'<svg class="SMCaptcha-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3261" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M661.679 715.532c-45.365 31.847-98.578 47.706-152.838 47.066-7.203-0.119-14.282-0.649-21.365-1.171-2.868-0.293-5.739-0.769-8.607-1.171-5.62-0.704-11.062-1.408-16.504-2.524-3.338-0.585-6.677-1.518-9.896-2.277-5.323-1.171-10.591-2.341-15.805-3.869-2.456-0.933-4.797-1.691-7.258-2.688-6.027-1.875-12-3.979-17.734-6.384-1.29-0.586-2.575-1.052-3.864-1.573-6.731-3.11-13.404-6.266-19.902-9.659-0.233-0.183-0.585-0.292-0.818-0.475-21.892-12.056-41.853-26.863-59.414-44.543-0.292-0.292-0.526-0.64-0.878-0.933-5.447-5.451-10.655-11.067-15.572-17.158-0.997-1.226-1.989-2.451-3.045-3.915-35.647-44.605-57.13-101.093-57.13-162.499h68.723L209.896 336.981 100.025 501.759h68.604c0 72.17 22.596 139.139 60.82 194.575 0.469 0.814 0.761 1.692 1.287 2.396 3.922 5.734 8.371 10.948 12.585 16.216 1.64 1.93 3.043 3.924 4.742 6.092 6.204 7.49 12.938 14.634 19.724 21.658 0.704 0.695 1.29 1.28 1.875 1.93 23.002 23.058 48.937 42.375 77.208 57.95 0.764 0.412 1.404 0.76 2.282 1.226 8.14 4.391 16.509 8.434 24.937 12.119 2.168 0.933 4.217 1.875 6.265 2.753 7.317 3.101 14.749 5.68 22.244 8.25a544.847 544.847 0 0 0 10.651 3.576 360.468 360.468 0 0 0 20.021 5.085c4.509 1.062 8.84 2.232 13.463 3.046 1.875 0.467 3.631 1.052 5.501 1.235 6.439 1.17 12.818 1.756 19.143 2.515 2.341 0.412 4.624 0.814 6.905 1.052 11.474 1.116 22.889 1.812 34.303 1.812 69.717 0 137.852-21.302 196.269-62.277 18.617-13.052 23.181-38.807 10.188-57.31-13.113-18.788-38.75-23.297-57.363-10.126m193.516-213.773c0-71.999-22.299-138.908-60.347-194.046-0.586-0.938-0.938-1.935-1.409-2.753-4.916-6.791-9.951-13.111-15.16-19.491a24.31 24.31 0 0 1-1.696-2.341c-35.003-42.146-78.73-74.869-128.193-96.234-1.464-0.585-2.693-1.228-4.157-1.813-7.962-3.279-16.038-6.089-24.292-8.899-2.808-0.936-5.794-1.989-8.721-2.868-7.144-2.165-14.282-3.921-21.54-5.62-4.042-0.878-8.14-1.93-12.178-2.751-1.989-0.35-3.805-0.935-5.913-1.347-5.442-0.878-10.77-1.404-16.212-2.049-3.805-0.409-7.436-0.995-11.24-1.404-9.133-0.878-18.206-1.23-27.279-1.404-1.637 0-3.274-0.236-4.916-0.236-0.292 0-0.585 0.06-0.878 0.117-69.658 0.06-137.674 21.073-195.976 61.991-18.617 12.995-23.181 38.691-10.07 57.422 12.938 18.558 38.752 23.122 57.425 10.011 45.013-31.49 97.581-47.533 151.489-47.002 7.729 0.055 15.457 0.407 22.948 1.171 2.341 0.173 4.563 0.526 6.905 0.878 6.206 0.759 12.352 1.578 18.438 2.867 2.635 0.466 5.328 1.171 7.848 1.756 6.027 1.344 11.881 2.748 17.675 4.504 1.935 0.53 3.69 1.17 5.447 1.875 6.731 2.167 13.284 4.45 19.609 7.143 0.699 0.174 1.345 0.7 1.989 0.933 38.455 16.509 72.113 41.913 98.454 73.755 0.06 0.119 0.179 0.352 0.412 0.531 36.996 45.072 59.24 102.611 59.295 165.304h-68.779L814.22 666.6l109.755-164.84h-68.78z" fill="#ffffff" p-id="3262"></path></svg>'
        };

        this.appendDom(rootDom);

        this.elements={
            root:document.getElementById(rootDom),
            CaptchaWrapper:this.getElementById('captcha-root'),
            Bg:this.getElementById('bg-con'),
            Piece:this.getElementById('piece-con'),
            ImgCon:this.getElementById('img-con'),
            SliderBlock:this.getElementById('slider-block'),
            Slider:this.getElementById('slider'),
            SliderIcon:this.getElementById('slider-icon'),
            refreshBtn:this.getElementById('refresh'),
            SliderText:this.getElementById('slider-text'),
            SliderProcess:this.getElementById('slider-process'),
            LoadingText:this.getElementById('loading-text'),
            LoadingIcon:this.getElementById('loading-icon'),
            SMCaptchaMarginBox:this.getElementById('margin-box')
        };

        this.setDefaultView();


        if(!IsPC()){
            this.bindMobileEvent();
        }else{
            this.bindPcEvent();
        }
    }

    /**
     * 获取dom
     * @param id
     * @returns {Element}
     */
    getElementById(id){
        return document.getElementById(this.prefix+id)
    }
    /**
     * 生成dom
     * @param root
     */
    appendDom(root){
        let htmlText = "<div class='SMCaptcha-captcha-wrapper ' id='SMCaptcha-captcha-root'><div class='SMCaptcha-img-wrapper' id='SMCaptcha-img-con'><div class='SMCaptcha-bg-wrapper' id='SMCaptcha-bg-con'></div><div class='SMCaptcha-piece-wrapper' id='SMCaptcha-piece-con'><img src='' alt='' id='SMCaptcha-piece-img'></div><div class='SMCaptcha-loading-box'><div class='SMCaptcha-loading-icon' id='SMCaptcha-loading-icon'>"+this.svgs.loading + "</div><div class='SMCaptcha-loading-text' id='SMCaptcha-loading-text'>加载中...</div></div><div class='SMCaptcha-refresh' id='SMCaptcha-refresh'>"+ this.svgs.refresh +"</div></div><div class='SMCaptcha-margin-box' id='SMCaptcha-margin-box'></div><div class='SMCaptcha-slider-wrapper' id='SMCaptcha-slider-block'><div class='SMCaptcha-slider-process' id='SMCaptcha-slider-process'></div><div class='SMCaptcha-slider' id='SMCaptcha-slider'><div class='SMCaptcha-slider-icon' id='SMCaptcha-slider-icon'>" + this.svgs.right+ "</div></div><div class='SMCaptcha-slider-text' id='SMCaptcha-slider-text'></div></div></div>";
        let rootDom = document.getElementById(root);
        rootDom.innerHTML = htmlText;
    }

    /**
     * 加载图片
     * @param domain
     * @param protocol
     * @param path
     * @param id
     * @param container
     */
    loadImage(url,id,container,callback){
        let error = {
            status:false,
            type:''
        };
        let self =this;
        let img = document.getElementById(id)?document.getElementById(id):document.createElement('img');
        img.id = id;
        img.src = url+'?t='+(parseInt(Math.random() * 10000) + (new Date()).valueOf());
        img.onerror = function () {
            self.loadFail();
            error.status = true;
            error.type="NETWORK_ERROR";
            callback(error);
        };
        img.onload = function () {
            img.onload =null;
            callback(error);
        };
        container.appendChild(img);
    }

    /**
     * loading效果
     */
    loading() {
        let {CaptchaWrapper,SliderText} =this.elements;
        SliderText.innerText= '加载中...';
        CaptchaWrapper.classList.add(this.prefix + 'loading');
        this.locked = true;
    }

    /**
     * 加载结束
     */
    loaded(){
        let self = this;
        let {CaptchaWrapper,SliderText} =this.elements;
        let {SMCaptcha} = this._config;
        if(this.ImgStack.bg&&this.ImgStack.fg&&!this.ImgStack.timeout){
            window.clearTimeout(self.timer);
            if(isFunction(SMCaptcha._config['onReady'])) {
                SMCaptcha._config['onReady']();
            }
            setTimeout(()=>{
                SliderText.innerText= '向右滑动完成拼图';
                CaptchaWrapper.classList.remove(this.prefix + 'loading');
                self.locked = false;
                self.ImgStack = {
                    bg:false,
                    fg:false,
                    timeout:false
                };
            },300);
        }
    }

    /**
     * 加载失败
     */
    loadFail(){
        let {CaptchaWrapper,SliderText,LoadingIcon,LoadingText} =this.elements;
        CaptchaWrapper.classList.add(this.prefix + 'load-fail');
        SliderText.innerText = '加载失败';
        LoadingText.innerText = '加载失败';
        LoadingIcon.innerHTML = this.svgs.loadFail;
        this.locked = true;
    }
    /**
     *
     */
    moving(){
        let {CaptchaWrapper,SliderIcon} =this.elements;
        CaptchaWrapper.classList.add(this.prefix + 'moving');
        SliderIcon.innerHTML = this.svgs.movingRight;
    }

    watchTimeOut(timeout){
        let self = this;
        let {SMCaptcha} = this._config;
        self.timer = setTimeout(function () {
            if(!self.ImgStack.bg||!self.ImgStack.fg){
                self.ImgStack ={
                    timeout:true
                };
                self.loadFail();
                throwError('NET_TIMEOUT',SMCaptcha._config,{message:"img load timeout"})
            }
        },timeout)
    }
    /**
     * 验证成功
     */
    success(){
        let {CaptchaWrapper,refreshBtn,SliderIcon} =this.elements;
        refreshBtn.classList.add(this.prefix + 'hide');
        CaptchaWrapper.classList.add(this.prefix + 'success');
        SliderIcon.innerHTML = this.svgs.success;
        this.locked = true;
        refreshBtn.onclick = null;
    }

    /**
     * 验证失败
     */
    fail(){
        let self = this;
        let {CaptchaWrapper,SliderIcon} =this.elements;
        CaptchaWrapper.classList.add(this.prefix + 'fail');
        SliderIcon.innerHTML = this.svgs.fail;
        this.locked = true;
        setTimeout(function () {
            self.events.refresh()
        },500)
    }

    /**
     * 重置className
     */
    resetClassName(){
        let {CaptchaWrapper,SliderIcon} =this.elements;
        CaptchaWrapper.classList.remove(this.prefix + 'moving');
        CaptchaWrapper.classList.remove(this.prefix + 'success');
        CaptchaWrapper.classList.remove(this.prefix + 'fail');
        SliderIcon.innerHTML = this.svgs.right;
    }
    /**
     * 显示验证码区域
     */
    setDefaultView(type){
        let {width} = this._config;
        let {Piece,ImgCon,SliderBlock,Slider,SMCaptchaMarginBox,refreshBtn} = this.elements;
        let ratio = this.ratios[type||'default'];
        let sum = ratio.reduce(function (a,b) {
            return a+b;
        });

        let {CaptchaWrapper} = this.elements;

        let Width = null;
        let Height = null;
        if(width==='auto'){
            Width = CaptchaWrapper.clientWidth;
            Height = CaptchaWrapper.clientHeight;
            if(Width/Height!==2){
                CaptchaWrapper.style.height = Width/2 +'px';
                Height = Width/2;
            }
        }else{
            Width = width;
            Height = Width/2;
            CaptchaWrapper.style.width = Width +'px';
            CaptchaWrapper.style.height = Width/2 +'px';
        }

        //高度四舍五入
        let ImgHeight = parseInt(((ratio[0]/sum)*Height).toFixed());
        let MarginHeight = parseInt(((ratio[1]/sum)*Height).toFixed());
        let SliderHeight = parseInt(((ratio[2]/sum)*Height).toFixed());

        //修正高度加到间距里
        MarginHeight =  MarginHeight+ (Height - (ImgHeight+MarginHeight+SliderHeight));


        ImgCon.style.height = ImgHeight +"px";
        Piece.style.height = ImgHeight +"px";
        SMCaptchaMarginBox.style.height = MarginHeight+'px';
        SliderBlock.style.height = SliderHeight+'px';
        refreshBtn.style.height = refreshBtn.style.width = SliderHeight-2+'px';
        Slider.style.width = Slider.style.height = SliderHeight-2+'px';
    }


    /**
     * 加载图片
     */
    loadImages(){
        let {Bg,Piece} = this.elements;
        let {bg,fg,domains,protocol,SMCaptcha} = this._config;
        this.watchTimeOut(5000);
        this.loadImage(protocol+domains[0] + bg,this.prefix+'bg-img',Bg, (err) =>{
            let {status,type} = err;
            if(!status) {
                this.ImgStack.bg =true
            }else{
                throwError(type,SMCaptcha._config,{message:'bg load fail'})
            }
            this.loaded()
        });

        this.loadImage(protocol+domains[0] + fg,this.prefix+'piece-img',Piece, (err)=> {
            let {status,type} = err;
            if(!status) {
                this.ImgStack.fg =true
            }else{
                throwError(type,SMCaptcha._config,{mesage:'slider loda fail'})
            }
            this.loaded()
        });
    }
    /**
     * 绑定Mobile事件
     */
    bindMobileEvent(){
        let self = this;
        let {CaptchaWrapper,Piece,Slider,SliderIcon,SliderProcess,refreshBtn} = this.elements;
        let {SMCaptcha} = this._config;
        let RealWidth = CaptchaWrapper.clientWidth;
        let arr = [];
        let timestamp = null;
        let currentPageX = 0;
        let currentPageY = 0;
        let DValueX = 0;
        let DValueY = 0;
        let interval = null;
        let startFlag = false;
        let PieceWidth = 0;
        let maxX = 0;
        let target = null;
        let method = this.method;
        this.events = {
            moveStartHandler:moveStartHandler,
            moveHandler:moveHandler,
            moveEndHandler:moveEndHandler,
            refresh:refresh
        };
        refreshBtn.addEventListener('touchstart',function (e) {
            refresh()
        });
        document.querySelector('body').addEventListener(method[0], function (e) {
            e.preventDefault();
        });
        SliderIcon.addEventListener(method[0], moveStartHandler);

        /**
         * moveEnd
         * @param e
         */
        function moveEndHandler(e) {
            target.removeEventListener(method[1], moveHandler);
            if (startFlag) {
                add();
                startFlag = false;
                let data = calculate();
                check.bind(SMCaptcha,{
                    act:data,
                })()
            } else {
                arr = [];
            }
            clearInterval(interval);
        }


        /**
         * moveStart
         * @param e
         */
        function moveStartHandler(e) {
            if(self.locked){
                return
            }
            target = e.target;
            currentPageX = e.touches[0].pageX;
            currentPageY = e.touches[0].pageY;
            PieceWidth = Piece.clientWidth;
            maxX = RealWidth - PieceWidth;
            timestamp = new Date().getTime();
            startFlag = true;
            self.moving.bind(self)();
            target.addEventListener(method[1], moveHandler);
            target.addEventListener(method[2], moveEndHandler);
            interval = setInterval(add, 100)
        }

        /**
         * move
         * @param e
         */
        function moveHandler(e) {
            DValueX = e.touches[0].pageX - currentPageX;
            DValueY = e.touches[0].pageY - currentPageY;
            if (DValueX > 0 && DValueX < maxX) {
                SliderProcess.style.width = DValueX + Slider.clientWidth + 'px';
                Slider.style.marginLeft = DValueX + 'px';
                Piece.style.left = DValueX + 'px';
            } else if (DValueX <= 0) {
                Slider.style.marginLeft = '0px';
            } else {
                Slider.style.marginLeft = maxX + 'px';
            }
        }

        function calculateTimer() {
            return new Date().getTime() - timestamp
        }

        function addPoint(x, y, timer) {
            arr.push([x, y, timer])
        }

        function add(bool) {
            if (bool) {
                let timer = calculateTimer();
                addPoint(DValueX, DValueY, timer);
            } else {
                if (arr.length > 100) {
                    return;
                } else {
                    let timer = calculateTimer();
                    addPoint(DValueX, DValueY, timer);
                }
            }
        }


        function refresh() {
            Slider.style.marginLeft = '0px';
            Piece.style.left = '0px';
            SliderProcess.style.width = '0px';
            arr = [];
            timestamp = null;
            currentPageX = 0;
            currentPageY = 0;
            DValueX = 0;
            DValueY = 0;
            interval = null;
            startFlag = false;
            self.resetClassName();
            SMCaptcha.reset();
        }
        /**
         * 拼装数据
         */
        function calculate() {
            let l = arr.length;
            let X = arr[l-1][0];
            let passTime =arr[l-1][3];
            return {
                d:X/RealWidth,
                m:arr,
                c:passTime
            }
        }
    }
    /**
     * 绑定Pc事件
     */
    bindPcEvent(){
        let self = this;
        let {CaptchaWrapper,Piece,Slider,SliderIcon,SliderProcess,refreshBtn} = this.elements;
        let {SMCaptcha} = this._config;
        let RealWidth = CaptchaWrapper.clientWidth;
        let SliderWidth = Slider.clientWidth;
        let arr = [];
        let timestamp = null;
        let currentPageX = 0;
        let currentPageY = 0;
        let DValueX = 0;
        let DValueY = 0;
        let interval = null;
        let startFlag = false;
        let PieceWidth = 0;
        let maxX = 0;
        let target = null;
        let method = this.method;
        this.events = {
            moveStartHandler:moveStartHandler,
            moveHandler:moveHandler,
            moveEndHandler:moveEndHandler,
            refresh:refresh
        };
        refreshBtn.addEventListener('click',function (e) {
            refresh()
        });
        document.querySelector('body').addEventListener(method[0], function (e) {
            e.preventDefault();
        });
        document.body.addEventListener(method[0], moveStartHandler);

        /**
         * moveEnd
         * @param e
         */
        function moveEndHandler(e) {
            document.body.removeEventListener(method[1], moveHandler);
            if (startFlag) {
                add();
                startFlag = false;
                let data = calculate();
                check.bind(SMCaptcha,{
                    act:data,
                })()
            } else {
                arr = [];
            }
            clearInterval(interval);
        }


        /**
         * moveStart
         * @param e
         */
        function moveStartHandler(e) {
            if(self.locked){
                return
            }
            currentPageX = e.pageX;
            currentPageY = e.pageY;
            if(e.target == SliderIcon||e.target.parentNode==SliderIcon){
                e.preventDefault();
                PieceWidth = Piece.clientWidth;
                maxX = RealWidth - PieceWidth;
                timestamp = new Date().getTime();
                startFlag = true;
                self.moving.bind(self)();
                document.body.addEventListener(method[1], moveHandler);
                document.body.addEventListener(method[2], moveEndHandler);
                interval = setInterval(add, 100)
            }
        }

        /**
         * move
         * @param e
         */
        function moveHandler(e) {
            DValueX = e.pageX - currentPageX;
            DValueY = e.pageY - currentPageY;
            console.log(DValueX,Slider.clientWidth);
            if (DValueX > 0 && DValueX < maxX) {
                SliderProcess.style.width = (DValueX + Slider.clientWidth).toFixed(3) + 'px';
                Slider.style.marginLeft = DValueX + 'px';
                Piece.style.left = DValueX + 'px';
            } else if (DValueX <= 0) {
                Slider.style.marginLeft = '0px';
            } else {
                Slider.style.marginLeft = maxX + 'px';
            }
        }

        function calculateTimer() {
            return new Date().getTime() - timestamp
        }

        function addPoint(x, y, timer) {
            arr.push([x, y, timer])
        }

        function add(bool) {
            if (bool) {
                let timer = calculateTimer();
                addPoint(DValueX, DValueY, timer);
            } else {
                if (arr.length > 100) {
                    return;
                } else {
                    let timer = calculateTimer();
                    addPoint(DValueX, DValueY, timer);
                }
            }
        }


        function refresh() {
            Slider.style.marginLeft = '0px';
            Piece.style.left = '0px';
            SliderProcess.style.width = '0px';
            arr = [];
            timestamp = null;
            currentPageX = 0;
            currentPageY = 0;
            DValueX = 0;
            DValueY = 0;
            interval = null;
            startFlag = false;
            self.resetClassName();
            SMCaptcha.reset();
        }
        /**
         * 拼装数据
         */
        function calculate() {
            let l = arr.length;
            let X = arr[l-1][0];
            let passTime =arr[l-1][3];
            return {
                d:X/RealWidth,
                m:arr,
                c:passTime
            }
        }
    }

    /**
     * 初始化
     * @param conf
     */
    init(conf){
        new _Object(conf)._each((key,value)=>{
            this._config[key] = value;
        });
        this.loadImages();
    }
}
