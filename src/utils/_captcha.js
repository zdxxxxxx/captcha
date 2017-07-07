//工具
import {check} from './_api.js'
import {IsPC,isFunction} from './_functions.js'
import _Object from './_object.js'
import {throwError} from './_error.js'
export default class Captcha{
    constructor({rootDom,SMCaptcha,protocol}){
        this._config={
            SMCaptcha:SMCaptcha,
            rootDom:rootDom,
            protocol
        };

        this.prefix = 'SMCaptcha-';
        this.ImgStack = {
            bg:false,
            fg:false
        };
        this.ratios = {
            'default':[110,5,35]
        };
        this.timer = null;
        this.locked = true;
        this.method = !IsPC()?['touchstart','touchmove','touchend','touchstart']:['mousedown','mousemove','mouseup','onclick'];

        this.svgs = {
            fail:'<svg class="SMCaptcha-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4350" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M557.312 513.248l265.28-263.904c12.544-12.48 12.608-32.704 0.128-45.248-12.512-12.576-32.704-12.608-45.248-0.128L512.128 467.904l-263.04-263.84c-12.448-12.48-32.704-12.544-45.248-0.064-12.512 12.48-12.544 32.736-0.064 45.28l262.976 263.776L201.6 776.8c-12.544 12.48-12.608 32.704-0.128 45.248a31.937 31.937 0 0 0 22.688 9.44c8.16 0 16.32-3.104 22.56-9.312l265.216-263.808 265.44 266.24c6.24 6.272 14.432 9.408 22.656 9.408a31.94 31.94 0 0 0 22.592-9.344c12.512-12.48 12.544-32.704 0.064-45.248L557.312 513.248z" fill="#ffffff" p-id="4351"></path></svg>',
            loading:'<svg style="width: 100%;height: 100%" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3132" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M512.511489 21.482517C241.348075 21.482517 21.482517 241.343255 21.482517 512.511489 21.482517 783.684341 241.338636 1003.54046 512.511489 1003.54046 539.065295 1003.54046 560.591409 982.014346 560.591409 955.460539 560.591409 928.906733 539.065295 907.380619 512.511489 907.380619 294.446249 907.380619 117.642358 730.576728 117.642358 512.511489 117.642358 294.45134 294.455216 117.642358 512.511489 117.642358 730.576728 117.642358 907.380619 294.446249 907.380619 512.511489 907.380619 539.065295 928.906733 560.591409 955.460539 560.591409 982.014346 560.591409 1003.54046 539.065295 1003.54046 512.511489 1003.54046 241.338636 783.684341 21.482517 512.511489 21.482517Z" p-id="3133"></path></svg>',
            right:'<svg  class="SMCaptcha-icon-svg" viewBox="0 0 1126 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5074" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M578.413939 1007.963092c-19.99784-19.980564-19.99784-52.285252 0-72.265816l372.924466-372.756417H52.08265c-28.230675 0-51.138748-22.89708-51.138748-51.104196 0-28.21654 22.908074-51.11362 51.138748-51.11362h899.255755L578.413939 87.974479c-19.99784-19.988417-19.99784-52.289963 0-72.272099 19.989988-19.986847 52.31038-19.986847 72.30665 0l460.156074 459.995878c4.760344 4.700663 8.491975 10.379779 11.103803 16.665129a50.241963 50.241963 0 0 1 3.934233 19.474846 50.60319 50.60319 0 0 1-3.934233 19.520393c-2.611828 6.28692-6.34346 11.911067-11.103803 16.666699L650.72216 1008.018061c-19.99784 19.933448-52.318233 19.933448-72.308221-0.054969" fill="#000000" p-id="5075"></path></svg>',
            movingRight:'<svg class="SMCaptcha-icon-svg" viewBox="0 0 1126 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5074" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M578.413939 1007.963092c-19.99784-19.980564-19.99784-52.285252 0-72.265816l372.924466-372.756417H52.08265c-28.230675 0-51.138748-22.89708-51.138748-51.104196 0-28.21654 22.908074-51.11362 51.138748-51.11362h899.255755L578.413939 87.974479c-19.99784-19.988417-19.99784-52.289963 0-72.272099 19.989988-19.986847 52.31038-19.986847 72.30665 0l460.156074 459.995878c4.760344 4.700663 8.491975 10.379779 11.103803 16.665129a50.241963 50.241963 0 0 1 3.934233 19.474846 50.60319 50.60319 0 0 1-3.934233 19.520393c-2.611828 6.28692-6.34346 11.911067-11.103803 16.666699L650.72216 1008.018061c-19.99784 19.933448-52.318233 19.933448-72.308221-0.054969" fill="#ffffff" p-id="5075"></path></svg>',
            success:'<svg class="SMCaptcha-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5891" xmlns:xlink="http://www.w3.org/1999/xlink" ><path d="M332.475765 767.674077c-1.989307-1.989307-1.990331-5.245468 0-7.234775L892.385938 200.540386c1.989307-1.990331 5.245468-1.990331 7.235798 0l55.778374 55.774281c1.989307 1.989307 1.989307 5.245468 0 7.235798L395.502217 823.458591c-1.990331 1.989307-5.245468 1.989307-7.235798 0L332.475765 767.674077z" p-id="5892" fill="#ffffff"></path><path d="M383.675868 819.519886c-1.989307 1.990331-5.245468 1.990331-7.235798 0.001023l-307.841204-307.851437c-1.990331-1.990331-1.989307-5.245468 0-7.235798l55.783491-55.773258c1.989307-1.989307 5.245468-1.989307 7.235798 0l307.836087 307.829947c1.990331 1.989307 1.990331 5.245468 0 7.235798L383.675868 819.519886z" p-id="5893" fill="#ffffff"></path></svg>',
            loadFail:'<svg class="SMCaptcha-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7160" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32"><path d="M317.952 316.928h241.152c12.8-7.68 23.04-19.968 15.36-39.424-8.704-22.016-27.648-37.888-40.96-58.368-22.528-34.304-17.92-85.504 10.752-115.2 31.744-32.768 83.968-30.208 83.968-30.208s51.712-3.072 83.456 30.208c28.672 29.696 32.768 80.896 10.752 115.2-13.312 20.48-32.768 36.352-41.472 58.368-7.68 19.456 3.072 31.744 15.36 39.424h247.296v235.52c-7.168 11.264-18.944 19.968-36.352 13.312-20.992-8.192-35.84-26.624-55.296-38.912-32.256-20.992-80.896-16.896-109.056 10.24-31.232 30.208-28.672 79.36-28.672 79.36s-2.56 49.152 28.672 79.36c28.16 27.136 76.8 31.232 109.056 10.24 19.456-12.8 34.304-30.72 55.296-38.912 17.408-6.656 28.672 2.048 36.352 12.8V931.84H680.96c-9.728-7.168-16.896-17.92-10.752-33.792 8.192-20.48 25.6-34.816 38.4-53.76 20.48-31.744 16.896-79.36-9.728-106.496-29.696-30.72-77.312-27.648-77.312-27.648s-48.128-2.56-77.312 27.648c-26.624 27.648-30.72 74.752-9.728 106.496 12.288 18.944 30.208 33.28 37.888 53.76 6.144 15.872-1.024 26.624-10.752 33.792H317.952v-236.032c-7.68-13.824-20.992-26.112-41.472-17.92-22.528 9.216-38.912 28.672-59.904 42.496-35.328 23.04-88.576 18.432-118.784-10.752-34.304-32.768-31.232-86.528-31.232-86.528s-3.072-53.248 31.232-86.528c30.72-29.696 83.456-34.304 118.784-10.752 20.992 13.824 37.376 33.792 59.904 42.496 20.992 8.192 33.792-4.096 41.472-17.92V316.928z" fill="#000000" p-id="7161"></path></svg>'
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

        };

        this.setDefaultView();

        this.bindEvent();
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
        let htmlText = "<div class='SMCaptcha-captcha-wrapper ' id='SMCaptcha-captcha-root'>" +
            "<div class='SMCaptcha-img-wrapper' id='SMCaptcha-img-con'>" +
            "<div class='SMCaptcha-bg-wrapper' id='SMCaptcha-bg-con'>" +
            "<img src='' alt='' id='SMCaptcha-bg-img'>" +
            "</div>" +
            "<div class='SMCaptcha-piece-wrapper' id='SMCaptcha-piece-con'>" +
            "<img src='' alt='' id='SMCaptcha-piece-img'>" +
            "</div>" +
            "<div class='SMCaptcha-loading-box'>" +
            "<div class='SMCaptcha-loading-icon' id='SMCaptcha-loading-icon'>" +
            this.svgs.loading +
            "</div>" +
            "<div class='SMCaptcha-loading-text' id='SMCaptcha-loading-text'>加载中...</div>" +
            "</div>" +
            "<div class='SMCaptcha-refresh' id='SMCaptcha-refresh'>" +
            "</div>" +
            "</div>" +
            "<div class='SMCaptcha-slider-wrapper' id='SMCaptcha-slider-block'>" +
            "<div class='SMCaptcha-slider-process' id='SMCaptcha-slider-process'></div>" +
            "<div class='SMCaptcha-slider' id='SMCaptcha-slider'>" +
            "<div class='SMCaptcha-slider-icon' id='SMCaptcha-slider-icon'>" +
                this.svgs.right+
            "</div>" +
            "</div>" +
            "<div class='SMCaptcha-slider-text' id='SMCaptcha-slider-text'>" +
            "</div>" +
            "</div>" +
            "</div>";
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
        let img = document.getElementById(id)?document.getElementById(id):document.createElement('img');
        img.id = id;
        img.src = url+'?t='+(parseInt(Math.random() * 10000) + (new Date()).valueOf());
        img.onerror = function () {
            callback(true);
        };
        img.onload = function () {
            img.onload =null;
            callback(false);
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
        window.clearTimeout(self.timer);
        if(this.ImgStack.bg&&this.ImgStack.fg){
            setTimeout(()=>{
                SliderText.innerText= '向右滑动完成拼图';
                CaptchaWrapper.classList.remove(this.prefix + 'loading');
                if(isFunction(SMCaptcha._config['onReady'])) {
                    SMCaptcha._config['onReady']();
                }
                self.locked = false;
            },300);
        }
    }

    /**
     * 加载失败
     */
    loadFail(){
        let {CaptchaWrapper,SliderText,LoadingIcon,LoadingText,SliderIcon} =this.elements;
        CaptchaWrapper.classList.add(this.prefix + 'load-fail');
        SliderText.innerText = '加载失败';
        LoadingText.innerText = '加载失败';
        LoadingIcon.innerHTML = this.svgs.loadFail;
        SliderIcon.removeEventListener(this.method[0],this.events['moveStartHandler']);
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
                self.loadFail();
                throwError('NETWORK_ERROR',SMCaptcha._config,{message:"img load timeout"})
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
        refreshBtn.onclick = null;
    }

    /**
     * 验证失败
     */
    fail(bool){
        let self = this;
        let {CaptchaWrapper,SliderIcon} =this.elements;
        CaptchaWrapper.classList.add(this.prefix + 'fail');
        SliderIcon.innerHTML = this.svgs.fail;
        if(bool){
            SliderIcon.removeEventListener(this.method[0],this.events['moveStartHandler']);
            return
        }
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
        let {Piece,ImgCon,SliderBlock,Slider} = this.elements;
        let ratio = this.ratios[type||'default'];
        let sum = ratio.reduce(function (a,b) {
            return a+b;
        });
        let {CaptchaWrapper} = this.elements;
        let Width = CaptchaWrapper.clientWidth;
        let Height = CaptchaWrapper.clientHeight;
        if(Width/Height!==2){
            CaptchaWrapper.style.height = Width/2;
            Height = Width/2;
        }
        let ImgHeight = (ratio[0]/sum)*Height;
        let MarginHeight = (ratio[1]/sum)*Height;
        let SliderHeight = (ratio[2]/sum)*Height;
        ImgCon.style.height = ImgHeight +"px";
        ImgCon.style.marginBottom = MarginHeight-2+'px';
        SliderBlock.style.height = SliderHeight+'px';
        Slider.style.width = Slider.style.height = SliderHeight+'px';
        Piece.style.height = ImgHeight +"px";
    }


    /**
     * 加载图片
     */
    loadImages(){
        let {Bg,Piece} = this.elements;
        let {bg,fg,domains,protocol,SMCaptcha} = this._config;
        this.watchTimeOut(SMCaptcha._config.timeout);
        this.loadImage(protocol+domains[0] + bg,this.prefix+'bg-img',Bg, (status) =>{
            if(!status) {
                this.ImgStack.bg =true
            }else{
                throwError('NETWORK_ERROR',SMCaptcha._config,{message:'bg load fail'})
            }
            this.loaded()
        });

        this.loadImage(protocol+domains[0] + fg,this.prefix+'piece-img',Piece, (status)=> {
            if(!status) {
                this.ImgStack.fg =true
            }else{
                throwError('NETWORK_ERROR',SMCaptcha._config,{mesage:'slider loda fail'})
            }
            this.loaded()
        });
    }
    /**
     * 绑定事件
     */
    bindEvent(){
        let self = this;
        let {CaptchaWrapper,Piece,Slider,SliderIcon,SliderProcess} = this.elements;
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
        let method = this.method;
        let PieceWidth = 0;
        let maxX = 0;
        let target = null;
        this.events = {
            moveStartHandler:moveStartHandler,
            moveHandler:moveHandler,
            moveEndHandler:moveEndHandler,
            refresh:refresh
        };
        document.querySelector('body').addEventListener(method[0], function (e) {
            e.preventDefault();
        });
        if(!IsPC){
            SliderIcon.addEventListener(method[0], moveStartHandler);
        }else{
            SliderIcon.addEventListener(method[0], moveStartHandler);
        }
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

            if(!IsPC()){
                currentPageX = e.touches[0].pageX;
                currentPageY = e.touches[0].pageY;
            }else{
                currentPageX = e.pageX;
                currentPageY = e.pageY;
            }
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
            if(!IsPC()){
                DValueX = e.touches[0].pageX - currentPageX;
                DValueY = e.touches[0].pageY - currentPageY;
            }else{
                DValueX = e.pageX - currentPageX;
                DValueY = e.pageY - currentPageY;
            }
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
