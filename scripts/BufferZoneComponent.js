class BufferZone extends HTMLElement {
    isDragable
    currentZone
    svgElementHeight = 100
    constructor() {
        super()
        this.isDragable = false
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position:relative
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    padding: 10px;
                    overflow: auto;
                    background:rgb(70, 69, 69);
                    transition:  0.1s;
                }
                
                .title {
                    margin-top: 0;
                    font-size: 16px;
                    color: white;
                }
                
                .polygons-container {
                    display: flex;
                    flex-wrap: wrap;
                    height:200px;
                    gap: 10px;
                    transition:  0.1s;
                }
            
                .svg-polygon {
                    width: 80px;
                    height: 80px;
                    cursor: grab;
                    transition:0.1s;
                }
                
                .svg-polygon:hover {
                    transform: scale(1.05);
                }
            </style>
            <h3 class="title">Буферная зона</h3>
            <div class="polygons-container" id="container"></div>
        `;
    }
    connectedCallback() {
        const container = this.shadowRoot.getElementById('container')
        container.innerHTML = ''
        if (localStorage.getItem('svgEditor')) {
            const dataSvg = localStorage.getItem('svgEditor')
            container.innerHTML = JSON.parse(dataSvg)
            const allSvgElement = container.querySelectorAll('svg')
            allSvgElement.forEach((item) => {
                item.addEventListener('mousedown', (e) => {
                    this.DragAnDrop(e, item, this.svgElementHeight)
                })
            })
        }
    }


    generatePolygons() {
        const container = this.shadowRoot.getElementById('container')
        container.innerHTML = ''

        const countPolygons = Math.floor(Math.random() * 16) + 5


        for (let i = 0; i < countPolygons; i++) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

            svg.classList.add('svg-polygon')
            svg.setAttribute('width', this.svgElementHeight)
            svg.setAttribute('height', this.svgElementHeight)
            svg.setAttribute('viewBox', '0 0 100 100')


            const sides = Math.floor(Math.random() * 7) + 3
            const points = this.generatePolygonPoints(50, 50, 40, sides)

            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
            polygon.setAttribute('points', points)
            polygon.setAttribute('fill', 'red')


            svg.appendChild(polygon)

            svg.addEventListener('mousedown', (e) => {
                this.DragAnDrop(e, svg, this.svgElementHeight)
            });
            container.appendChild(svg)

        }

    }

    generatePolygonPoints(centreX, centreY, radius, sides) {
        let points = ''
        for (let i = 0; i < sides; i++) {
            const randomnessPercent = Math.floor(Math.random() * 100)
            const randomFactor = 1 + (Math.random() * randomnessPercent / 50 - randomnessPercent / 100)
            const effectiveRadius = radius * randomFactor
            const angle = (i * 2 * Math.PI / sides) - Math.PI / 2
            const x = centreX + effectiveRadius * Math.cos(angle)
            const y = centreY + effectiveRadius * Math.sin(angle)

            points += `${x},${y} `
        }

        return points.trim()
    }


    saveLoaclStorage() {
        const container = this.shadowRoot.getElementById('container')
        const data = container.innerHTML
        localStorage.setItem('svgEditor', JSON.stringify(data))
        alert('Данные сохранены')
    }

    clearLocalStorage() {
        localStorage.removeItem('svgEditor')
        alert('Данные удалены')
    }

    addSvgElementBufferZone(svgHtml) {
         const container = this.shadowRoot.getElementById('container')
         const currentSvgElement = svgHtml.querySelector('svg')
            
        currentSvgElement.style.position = ''
        currentSvgElement.style.left = ''
        currentSvgElement.style.top = ''
        currentSvgElement.addEventListener('mousedown',(e) =>{
            this.DragAnDrop(e,currentSvgElement)
        })
        container.appendChild(currentSvgElement)
    }

   DragAnDrop(e, svgElement ) {
         const container = this.shadowRoot.getElementById('container')
        const workZone = document.querySelector('work-zone')

        svgElement.style.cursor = 'grabbing'
        svgElement.style.zIndex = '10000'

        const shiftX = e.clientX - svgElement.getBoundingClientRect().left
        const shiftY = e.clientY - svgElement.getBoundingClientRect().top

        

        const move = (e) => {
            const newLeft = Math.max(0, Math.min(container.offsetWidth - 60, e.pageX - shiftX));
            const newTop = Math.max(container.getBoundingClientRect().top - 50, Math.min(document.body.offsetHeight - this.svgElementHeight, e.pageY - shiftY));
            
            svgElement.style.position = 'absolute'
            svgElement.style.left = newLeft + 'px'
            svgElement.style.top = newTop + 'px'

        }

        const onMouseMove = (e) => move(e)
        const onMouseUp = (e) => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            
           
            const workZoneRect = workZone.getBoundingClientRect()
            if (e.clientX >= workZoneRect.left && e.clientX <= workZoneRect.right &&
                e.clientY >= workZoneRect.top && e.clientY <= workZoneRect.bottom) {
                workZone.addSvgElementWorkZone(svgElement.outerHTML)
                container.removeChild(svgElement)

            } else {
                
                svgElement.style.position = ''
                svgElement.style.left = ''
                svgElement.style.top = ''
                svgElement.style.border = ''
            }
            
            svgElement.style.cursor = 'grab';
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
}



customElements.define('buffer-zone', BufferZone)