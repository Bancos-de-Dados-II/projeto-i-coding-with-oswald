class LeafLetManager {
    constructor(){
        this.select = document.getElementsByTagName("select")[0]
        this.button = document.getElementById("add-marker")
        this.pointField = document.getElementById("point-field")
        this.circleField = document.getElementById("circle-field")
        this.gpsButton = document.getElementById("point-gps")
        this.modal = document.getElementById("modal")
        this.modal_exit = document.getElementById("exit")
        this.removeButton = document.getElementById("remove-button")
        this.editButton = document.getElementById("edit-button")
        this.popup = document.getElementsByClassName("popup")[0]
        this.popup_content = document.getElementsByClassName("content-modal")[0]
        this.subModal = document.getElementById("sub-modal")
        this.externalPopUp = document.getElementsByClassName("popup-external")[0]
        this.editText = document.getElementById("text-modal")
        this.editRadius = document.getElementById("number-modal")
        this.saveEdit = document.getElementById("confirm-edit")
        this.state = null
        this.map = null
        this.marker = null
        this.locations = []
        this.customIcon = L.icon({
            iconUrl: 'images/umbrella.png',
            iconSize: [50, 50],
            iconAnchor: [20, 50],
            popupAnchor: [0, -50]
        })
    }
    
    init() {
        window.addEventListener('load', () => {
            this.startMap()
            this.formConfig()
            this.setPositionByMarker()
            this.placeMarker()
            this.checkLocations()
            this.modal_exit.addEventListener("click", () => {
                this.modal.style.display = "none"
                this.popup.style.display = "none"
            })
        })
    } 

    async checkLocations() {
        try {
            const response = await fetch('http://localhost:3000/location', {
                method: 'GET'
            })
            if(response) {
                this.locations = await response.json()
                this.locations.forEach(location => {
                    this.generateMarker(location)
                })
            } else {
                console.error("Erro: ", response.statusText)
            }
        } catch(err) {
            console.error('Erro ao carregar localizações:', err);
        }
    }

    async loadPositions() {
        try {
            const response = await fetch('http://localhost:3000/location', {
                method: 'GET'
            })
            this.locations = await response.json()
            this.locations.forEach(location => {
                const newLoc = {
                    description: location.description,
                    position: location.location,
                    type: location.type
                }
                this.generateMarker(location)
            })
        } catch(err) {
            console.error("Erro: ", err)
        }
    }


    setPositionByMarker(){
        this.gpsButton.addEventListener('click', (event) => {
            event.preventDefault()
            if(this.state == 'point') {
                document.getElementById("point-latitude").value = this.marker.getLatLng().lat
                document.getElementById("point-longitude").value = this.marker.getLatLng().lng
            }
            if(this.state == "circle") {
                document.getElementById("circle-latitude").value = this.marker.getLatLng().lat
                document.getElementById("circle-longitude").value = this.marker.getLatLng().lng
            }
        })
    }

    formConfig(){
        this.select
            .onchange = (event) => {
                this.state = event.target.value
                if(this.state === "point"){
                    this.pointField.style.display = "block"
                    this.circleField.style.display = "none"
                    this.gpsButton.style.display = "block"
                    this.button.style.display = "block"
                }
                else if(this.state === "circle"){
                    this.pointField.style.display = "none"
                    this.circleField.style.display = "block"
                    this.gpsButton.style.display = "block"
                    this.button.style.display = "block"
                }
                else {
                    this.pointField.style.display = "none"
                    this.circleField.style.display = "none"
                    this.gpsButton.style.display = "none"
                    this.button.style.display = "block"
                }
            }
    }

    placeMarker(){
        
        this.button.addEventListener('click', async (event) => {
            event.preventDefault()
            const result = await this.generateLocation(this.state)
            return this.generateMarker(result)
        })
    }

    generateMarker(obj){
        if(obj.type === "point"){
            const newMarker = L.marker(obj.position.coordinates, { icon: this.customIcon }) 
            newMarker.bindPopup(obj.description)
            newMarker.id = obj.id
            newMarker.on("click", (event) => {
                this.popup_content.innerText = obj.description
                this.modal.style.display = "flex"
                this.popup.style.display = "block"
    
                this.editButton.addEventListener("click", () => {
                    this.subModal.style.display = "flex"
                    this.externalPopUp.style.display = "block"
                    this.editRadius.style.display = "none"
                    this.saveEdit.addEventListener("click", async () => {
                        obj.description = this.editText.value
                        
                        await fetch('http://localhost:3000/location/' + event.target.id, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(obj)
                        });
                        location.reload()
                    })
                })
    
                this.removeButton.addEventListener("click", async () => {
    
                    this.map.removeLayer(event.target)
                    this.modal.style.display = "none"
                    this.popup.style.display = "none"
                    await fetch('http://localhost:3000/location/' + event.target.id, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
    
                })
            })
            newMarker.addTo(this.map)
            return 
        }
        else if(obj.type === "circle"){
            const newMarker = L.circle(obj.position.coordinates, {
                color: obj.color,
                fillColor: obj.color,
                fillOpacity: 0.5,
                radius: obj.radius,
                stroke: false
            })
            newMarker.id = obj.id
            newMarker.on("click", (event) => {
                this.popup_content.innerText = obj.description
                this.modal.style.display = "flex"
                this.popup.style.display = "block"
                this.editButton.addEventListener("click", () => {
                    this.subModal.style.display = "flex"
                    this.externalPopUp.style.display = "block"
                    this.saveEdit.addEventListener("click", async () => {
                        obj.description = this.editText.value
                        obj.radius = this.editRadius.value
                        await fetch('http://localhost:3000/location/' + event.target.id, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(obj)
                        });
                        location.reload()
                    })
                })
    
                this.removeButton.addEventListener("click", async () => {
                    this.map.removeLayer(event.target)
                    this.modal.style.display = "none"
                    await fetch('http://localhost:3000/location/' + event.target.id, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                })
            })
            newMarker.bindPopup(obj.description)
            newMarker.addTo(this.map)
            return
        }
    }

    async generateLocation(type){
        let location = null
        if(type == 'point') {
            location = {
                description: document.getElementById("point-text").value,
                type: "point",
                location: {
                    type,
                    coordinates: [
                        document.getElementById("point-latitude").value,
                        document.getElementById("point-longitude").value
                    ]
                }
            }
        }
        else if(type == 'circle') {
            location = {
                description: document.getElementById("circle-text").value,
                radius: document.getElementById("circle-raio").value,
                color: document.getElementById("circle-color").value,
                type: "circle",
                location: {
                    type: "point",
                    coordinates: [
                        document.getElementById("circle-latitude").value,
                        document.getElementById("circle-longitude").value
                    ]
                }
            }
        }
        this.locations.push(location)
        const newLoc = {
            description: location.description,
            position: location.location,
            type: location.type,
            radius: location.radius,
            color: location.color
        }
        try {
            const response = await fetch('http://localhost:3000/location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newLoc)
            });
    
            if (response) {
                const newLocation = await response.json()
                this.locations.push(newLocation)
                location.id = newLocation.id
                //this.generateMarker(newLocation)
                return newLocation;
            } else {
                console.error('Erro ao adicionar a localização:', response.statusText)
            }
        } catch (error) {
            console.error('Erro ao adicionar a localização:', error)
        }
        

        return location
    }

    // startMap(){
    //     this.map = L.map('map', {
    //         center: [-6.887698002563706, -38.56015173326553],
    //         zoom: 10
    //     });
    
    //     this.marker = L.marker([0, 0])
    
    //     this.map.locate();
    
    //     this.map.on('locationfound', e=>{
    //         this.marker.setLatLng(e.latlng);
    //         this.map.setView(e.latlng);
    //     });
    
    //     this.map.on('click', l =>{
    //         this.marker.bindPopup("lat: " + l.latlng.lat + ", " + "log: " + l.latlng.lng)  
    //         this.marker.setLatLng(l.latlng).addTo(this.map);
    //         this.map.setView(l.latlng);
              
    //     });
    
    //     L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //         maxZoom: 19,
    //         attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    //     }).addTo(this.map);

    // }

    startMap() {
        this.map = L.map('map', {
            center: [-6.887698002563706, -38.56015173326553],
            zoom: 10
        });
    
        var meuIcone = L.icon({
            iconUrl: 'images/umbrella.png', 
            iconSize: [60, 60], 
            iconAnchor: [20, 50], 
            popupAnchor: [0, -50] 
        });
    
        this.marker = L.marker([0, 0]);
    
        this.map.locate();
    
        this.map.on('locationfound', e => {
            this.marker.setLatLng(e.latlng);
            this.map.setView(e.latlng);
        });
    
        this.map.on('click', l => {
            this.marker.setIcon(meuIcone);
            
            this.marker
                .bindPopup("lat: " + l.latlng.lat + ", " + "lng: " + l.latlng.lng)
                .setLatLng(l.latlng)
                .addTo(this.map);
    
            this.map.setView(l.latlng);
        });
    
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
    }
    
}

new LeafLetManager().init()