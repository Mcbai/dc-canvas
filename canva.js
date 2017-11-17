var Canva = (function () {
	function Canva(obj) {
		var defaultSet = {
			el: function () {
				throw Error('请输入canvas元素的id值');
			},
			lineCap: 'butt',
			lineJoin: 'miter'
		};
		var canvaAttr = Object.assign({}, defaultSet, obj);

		this.canvaWrap = document.getElementById(canvaAttr.el); // 画板父级元素

		// 定义 canvas 以及它的宽高等属性
		this.canvas = ''
		this.canvasWidth = this.canvaWrap.clientWidth - 2;
		this.canvasHeight = this.canvaWrap.clientHeight - 27;
		this.canvasTop = 0
		this.canvasLeft = 0
		this.ctx = null
		
		// 定义 canvas 线条的宽度颜色等属性
		this.lineWidth = 1
		this.lineCap = canvaAttr.lineCap
		this.lineJoin = canvaAttr.lineJoin
		this.strokeStyle = '#000'
		this.fillStyle = '#000'

		this.activeToolName = 'free'
		this.arr = []


		this.init()
	}


	/**
	 * 画板工具条和 canvas 渲染
	 * Canva.TOOLBAR 是渲染元素所需的参数
	 */
	Canva.TOOLBAR = {
		STYLES: [
			{ NAME: 'color', TIP: '颜色选择' },
			{ NAME: 'linewidth', TIP: '线条宽度' }
		],
		TOOLS: [
			{ NAME: 'free', TIP: '画笔', ICON: '\270E' },
			{ NAME: 'point', TIP: '点', ICON: '\25CF' },
			{ NAME: 'line', TIP: '线', ICON: '\2500' },
			{ NAME: 'circle', TIP: '圆形', ICON: '\25EF' },
			{ NAME: 'rect', TIP: '矩形', ICON: '\25AD' },
			{ NAME: 'repeal', TIP: '撤销', ICON: '\23F4' }
		]
	};
	Canva.renderToolBar = function () {
		// 颜色选择和线条宽度两个按钮
		var toolbar = document.createElement('div');
		toolbar.id = 'dccanva-toolbar';
		var styles = Canva.TOOLBAR.STYLES;
		var stylesHtml = '';
		stylesHtml += '<div class="tool-style '+ styles[0].NAME +'" title="'+ styles[0].TIP +'">'
				   +    '<input type="color" class="input-color">'
				   +  '</div>'
		stylesHtml += '<div class="tool-style '+ styles[1].NAME +'" title="'+ styles[1].TIP +'">'
				   +    '<input type="number" class="input-linewidth" value="1">'
				   +    '<span style="font-size: 14px; vertical-align: middle;">px</span>'
				   +  '</div>'

		// 画笔形状选择按钮
		var tools = Canva.TOOLBAR.TOOLS;
		var toolsHtml = '';
		tools.forEach(function (item, index) {
			toolsHtml += '<div class="tool-item '+ item.NAME +'" title="'+ item.TIP +'" data-name="'+ item.NAME +'"></div>'
		})
		toolbar.innerHTML = stylesHtml + toolsHtml

		return toolbar;
	}
	Canva.renderCanvas = function (width, height) {
		var canvas = document.createElement('canvas');
		canvas.id = 'dccanva-canvas';
		canvas.width = width;
		canvas.height = height;

		return canvas;
	}


	Canva.prototype = {
		/**
		 * 初始化
		 */
		init: function () {
			this.render()
			this.draw()
			this.toogleTool()
		},
		/**
		 * 渲染 toolbar
		 */
		render: function () {
			var canvaWrap = this.canvaWrap,
				toolbar = Canva.renderToolBar(),
				canvas = Canva.renderCanvas(this.canvasWidth, this.canvasHeight);
			canvaWrap.appendChild(toolbar)
			canvaWrap.appendChild(canvas)
			this.canvas = canvas;
			this.ctx = canvas.getContext('2d')
			this.canvasTop = getElementTop(this.canvas)
			this.canvasLeft = getElementLeft(this.canvas)
			changeStyle.call(this)
		},
		/**
		 * 设置线条颜色宽度等属性
		 */
		setStyle: function () {
			this.ctx.lineWidth = this.lineWidth
			this.ctx.lineCap = this.lineCap
			this.ctx.lineJoin = this.lineJoin
			this.ctx.strokeStyle = this.strokeStyle
		},
		/**
		 * 初始化绘制
		 */
		draw: function () {
			var that = this;
			var canvas = this.canvas,
				ctx = this.ctx;
					var type = this.activeToolName;
			canvas.onmousedown = function (e) {
				var startX = e.offsetX,
					startY = e.offsetY;

				if (type === 'point') {
					that.drawPoint(startX, startY)
				} else {
					if (type === 'free') {
						ctx.beginPath();
						// ctx.lineWidth = 
						ctx.moveTo(startX, startY);				
					}
					canvas.onmousemove = function (e) {
			            var endX = e.offsetX,
			            	endY = e.offsetY;

		                ctx.clearRect(0,0,that.canvasWidth,that.canvasHeight);
		                if(that.arr.length!=0){
		                    ctx.putImageData(that.arr[that.arr.length-1],0,0,0,0,that.canvasWidth,that.canvasHeight);
		                }
		                that['draw'+type](startX, startY, endX, endY)
					}
				}
				canvas.onmouseup = function () {
					canvas.onmousemove = canvas.onmouseup = null;
	            	that.arr.push(ctx.getImageData(0,0,that.canvasWidth,that.canvasHeight));
				}
			}
		},
		/**
		 * 自由绘制
		 */
		drawfree: function (startX, startY, endX, endY) {
			this.setStyle()
			this.ctx.lineTo(endX, endY)
			this.ctx.stroke()
		},
		/**
		 * 画点
		 */
		drawPoint: function (startX, startY) {
			this.setStyle()
			this.ctx.beginPath();
			this.ctx.arc(startX, startY, 5, 0, Math.PI*2);
			this.ctx.fill()
		},
		/**
		 * 画直线
		 */
		drawline: function (startX, startY, endX, endY) {
			this.setStyle()
			this.ctx.beginPath();
			this.ctx.moveTo(startX, startY)
			this.ctx.lineTo(endX, endY)
			this.ctx.stroke()
		},
		/**
		 * 画点自动连线
		 */
		drawcircle: function (startX, startY, endX, endY) {
	   		var k = ((endX-startX)/0.75)/2,
		      	w = (endX-startX)/2,
		     	h = (endY-startY)/2,
		     	x=(endX+startX)/2,
		     	y=(endY+startY)/2;
			this.setStyle()
			this.ctx.beginPath();
			this.ctx.moveTo(x, y-h);
			this.ctx.bezierCurveTo(x+k, y-h, x+k, y+h, x, y+h);
			this.ctx.bezierCurveTo(x-k, y+h, x-k, y-h, x, y-h);
			this.ctx.closePath();
			this.ctx.stroke();
		},
		/**
		 * 绘制矩形
		 */
		drawrect: function (startX, startY, endX, endY) {
			this.setStyle()
	        this.ctx.beginPath();
	        this.ctx.rect(startX, startY, endX - startX, endY - startY);
			this.ctx.stroke()
		},
		toogleTool: function () {
			var that = this;
			var toolItems = document.getElementsByClassName('tool-item');
			Array.prototype.forEach.call(toolItems, function (item, index) {
				item.onclick = function () {
					var siblings = getSiblings(item);
					this.classList.add('tool-item-active')
					siblings.forEach(function (item) {
						item.classList.remove('tool-item-active')
					})

					that.activeToolName = this.dataset.name
					that.draw()
				}
			})
		},
		addBgImg: function (imgSrc) {
			var that = this;
			var canvas = this.canvas,
				ctx = this.ctx;

			var img = new Image();
			img.src = imgSrc
			img.onload = function () {
				ctx.drawImage(img, 0, 0, that.canvasWidth,that.canvasHeight)
				that.arr.push(ctx.getImageData(0,0,that.canvasWidth,that.canvasHeight))
			}
		}
	}

	// 获取元素相对于页面的 Top 值
	function getElementTop(el) {
		var actualTop = el.offsetTop;
		var currentEl = el.offsetParent;
		while (currentEl !== null) {
			actualTop += currentEl.offsetTop;
			currentEl = currentEl.offsetParent;
		}
		return actualTop;
	}
	// 获取元素相对于页面的 Left 值
	function getElementLeft(el) {
		var actualLeft = el.offsetLeft;
		var currentEl = el.offsetParent;
		while (currentEl !== null) {
			actualLeft += currentEl.offsetLeft;
			currentEl = currentEl.offsetParent;
		}
		return actualLeft;
	}
	// 获取兄弟元素
	function getSiblings(el) {
		var parent = el.parentNode;
		var siblings = Array.prototype.filter.call(parent.children, function (item, index) {
			return item !== el;
		})
		return siblings;
	}
	// 修改颜色和线条宽度
	function changeStyle() {
		var that = this;
		var inputColor = that.canvaWrap.getElementsByClassName('input-color')[0],
			inputLineWidth = that.canvaWrap.getElementsByClassName('input-linewidth')[0];

		inputColor.onchange = function () {
			that.strokeStyle = this.value
			that.fillStyle = this.value
		}

		inputLineWidth.onchange = function () {
			that.lineWidth = parseInt(this.value, 10)
		}
 	}

	return Canva;
})()