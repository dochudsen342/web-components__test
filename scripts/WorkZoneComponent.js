class WorkZone extends HTMLElement {
    constructor() {
        super()
        this.scale = 1
        this.panning = false
        this.startPoint = { x: 0, y: 0 }
        this.offset = { x: 0, y: 0 }
        this.svgContainer = null
        
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width:100%;
                    flex-grow: 1;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    position: relative;
                    background: white;
                }
                
                .title {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    margin: 0;
                    font-size: 16px;
                    color:white;
                    z-index: 10;
                    user-select:none;
                }
                
                .viewport {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    background:rgb(70, 69, 69)
                }
                
                .svg-container {
                    position: absolute;
                    transform-origin: 0 0;
                }
                
                .axis {
                    position: absolute;
                    background: rgba(0, 0, 0, 0.1);
                    z-index: 5;
                }
                
                .x-axis {
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 20px;
                }
                
                .y-axis {
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: 20px;
                }
                
                .scale-info {
                    position: absolute;
                    bottom: 5px;
                    right: 5px;
                    background: rgba(255, 255, 255, 0.7);
                    padding: 2px 5px;
                    border-radius: 3px;
                    font-size: 12px;
                }
                
                .svg-element {
                    position: absolute;
                    cursor: move;
                    transform-origin: center;
                }
            </style>
            <h3 class="title">Рабочая зона</h3>
            <div class="viewport" id="viewport">
                <div class="svg-container" id="svgContainer"></div>
                <div class="axis x-axis" id="xAxis"></div>
                <div class="axis y-axis" id="yAxis"></div>
                <div class="scale-info">Масштаб: ${this.scale.toFixed(2)}x</div>
            </div>
        `;
    }

    connectedCallback() {
        const viewport = this.shadowRoot.getElementById('viewport')
        this.svgContainer = this.shadowRoot.getElementById('svgContainer')
        
        viewport.addEventListener('wheel', (e) => {
            e.preventDefault()
            const delta = e.deltaY < 0 ? 1.1 : 0.9
            const newScale = this.scale * delta
            if (newScale < 0.1 || newScale > 10) return
            
            const rect = viewport.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top
            
            this.offset.x = mouseX - (mouseX - this.offset.x) * delta
            this.offset.y = mouseY - (mouseY - this.offset.y) * delta
            
            this.scale = newScale
            
            this.updateTransform()
            this.updateAxis()
            this.updateScaleInfo()
        });
        
        viewport.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.panning = true
                this.startPoint = { x: e.clientX, y: e.clientY }
                viewport.style.cursor = 'grabbing'
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.panning) {
                this.offset.x += e.clientX - this.startPoint.x
                this.offset.y += e.clientY - this.startPoint.y
                this.startPoint = { x: e.clientX, y: e.clientY }
                this.updateTransform()
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.panning = false;
            viewport.style.cursor = ''
        });
        
        this.updateTransform()
        this.updateAxis()
        this.updateScaleInfo()
    }
    
    updateTransform() {
        this.svgContainer.style.transform = `translate(${this.offset.x}px, ${this.offset.y}px) scale(${this.scale})`;
    }
    
    updateScaleInfo() {
        const scaleInfo = this.shadowRoot.querySelector('.scale-info')
        if (scaleInfo) {
            scaleInfo.textContent = `Масштаб: ${this.scale.toFixed(2)}x`
        }
    }
    
    scaleSvgElements() {
        const svgElements = this.svgContainer.querySelectorAll('.svg-element')
        svgElements.forEach(svg => {
            
            const baseSize = 80
            const scaledSize = baseSize / this.scale
            
            svg.style.width = `${scaledSize}px`
            svg.style.height = `${scaledSize}px`
            
            
            svg.setAttribute('viewBox', `0 0 ${scaledSize} ${scaledSize}`)
        })
    }
    
    addSvgElementWorkZone(svgHtml) {
        const svgWrapper = document.createElement('div')
        
        svgWrapper.className = 'svg-element'
        svgWrapper.innerHTML = svgHtml;
        const svgElement = svgWrapper.querySelector('svg')
        
        svgWrapper.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startDragSvg(svgWrapper, e)
        });

        svgElement.style.position = 'absolute'
        svgElement.style.left = '100%'
        svgElement.style.top = '50%'
        
        this.svgContainer.appendChild(svgWrapper)
       
        this.scaleSvgElements()
    }
        
    
    startDragSvg(svgElement, e) {
        const bufferZone = document.querySelector('buffer-zone')
        
        const startX = e.clientX
        const startY = e.clientY
        const startLeft = parseFloat(svgElement.style.left) || 0
        const startTop = parseFloat(svgElement.style.top) || 0
        
        const onMouseMove = (e) => {
            const dx = e.clientX - startX
            const dy = e.clientY - startY
            const bufferZoneRect = bufferZone.getBoundingClientRect()

            if (e.clientX >= bufferZoneRect.left && e.clientX <= bufferZoneRect.right &&
                e.clientY >= bufferZoneRect.top && e.clientY <= bufferZoneRect.bottom) {
                
               bufferZone.addSvgElementBufferZone(svgElement)
              
                
            } else {
                
                svgElement.style.position = ''
                svgElement.style.left = ''
                svgElement.style.top = ''
                svgElement.style.border = ''
            }

            
            svgElement.style.left = `${startLeft + dx}px`
            svgElement.style.top = `${startTop + dy}px`
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        };
        
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }
    
    updateAxis() {
        const xAxis = this.shadowRoot.getElementById('xAxis')
        const yAxis = this.shadowRoot.getElementById('yAxis')
        
        xAxis.innerHTML = ''
        yAxis.innerHTML = ''
        
        const width = this.offsetWidth
        const stepX = 50 * this.scale;
        const countX = Math.ceil(width / stepX)
        
        for (let y = 0; y < countX; y++) {
            const tick = document.createElement('div')
            tick.style.position = 'absolute'
            tick.style.left = `${y * stepX}px`
            tick.style.bottom = '0'
            tick.style.width = '1px'
            tick.style.height = '5px'
            tick.style.background = '#333'
            
            const label = document.createElement('div')
            label.style.position = 'absolute'
            label.style.left = `${y * stepX}px`
            label.style.bottom = '7px'
            label.style.transform = 'translateX(-50%)'
            label.style.fontSize = '10px'
            label.textContent = Math.round(y * 50 / this.scale)
            
            xAxis.appendChild(tick)
            xAxis.appendChild(label)
        }
        
        const height = this.offsetHeight
        const stepY = 50 * this.scale
        const countY = Math.ceil(height / stepY)
        
        for (let x = 0; x < countY; x++) {
            const tick = document.createElement('div')
            tick.style.position = 'absolute'
            tick.style.top = `${x * stepY}px`
            tick.style.left = '0'
            tick.style.width = '5px'
            tick.style.height = '1px'
            tick.style.background = '#333'
            
            const label = document.createElement('div')
            label.style.position = 'absolute'
            label.style.top = `${x * stepY}px`
            label.style.left = '7px'
            label.style.transform = 'translateY(-50%)'
            label.style.fontSize = '10px'
            label.textContent = Math.round(x * 50 / this.scale)
            
            yAxis.appendChild(tick)
            yAxis.appendChild(label)
        }
    }
}



customElements.define('work-zone', WorkZone)