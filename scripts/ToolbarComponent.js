class ToolbarComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .toolbar {
                    display: flex;
                    justify-content:space-between;
                    gap: 10px;
                    padding: 20px;
                    background:rgb(37, 37, 37);
                    border-radius: 5px;
                }
                
                button {
                    padding: 8px 16px;
                    background:rgb(97, 97, 97);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                button:hover {
                    background: #45a049;
                }
            </style>
            <div class="toolbar">
                <button id="createBtn">Создать полигоны</button>
                <div> 
                    <button id="saveBtn">Сохранить</button>
                    <button id="resetBtn">Сбросить</button>
                </div>
            </div>
        `;
    }
    
    connectedCallback() {
        this.shadowRoot.getElementById('createBtn').addEventListener('click',() =>{
            const bufferZone = document.querySelector('buffer-zone')
            bufferZone.generatePolygons()
        })
        this.shadowRoot.getElementById('saveBtn').addEventListener('click',() =>{
           const bufferZone = document.querySelector('buffer-zone')
           bufferZone.saveLoaclStorage()
        })

        this.shadowRoot.getElementById('resetBtn').addEventListener('click',() =>{
           const bufferZone = document.querySelector('buffer-zone')
           bufferZone.clearLocalStorage
           ()
        })
        
    }
}

customElements.define('toolbar-component', ToolbarComponent);