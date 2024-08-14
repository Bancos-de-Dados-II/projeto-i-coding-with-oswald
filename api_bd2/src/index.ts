import express from "express"
import cors from "cors"
import sequelize from "./database/connection"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(cors())

app.use(express.json())

app.get("/", (req, res) => {
    res.send("Ok")
})

app.get("/location/:id", async (req, res) => {
    const {id} = req.params
    const location = await sequelize.models.Location.findByPk(id)
    res.json(location)
})

app.get("/location", async (req, res) => {
    const locations = await sequelize.models.Location.findAll()
    res.status(200).json(locations)
})

app.post("/location", async (req, res) => {
    const {description, position, type, radius, color} = req.body

    const location = await sequelize.models.Location.create({
        description,
        position,
        type,
        radius: parseInt(radius),
        color
    })

    res.json(location)
})

app.put("/location/:id", async (req, res) => {
    const {id} = req.params
    const {description, position, radius} = req.body
    const location = await sequelize.models.Location.findByPk(id) as { description: string, position: {}, type: string, radius: number, color: string } | null
    if(!location){
        return res.json({error: "Essa posicao n existe"})
    }

    const newLocation = {
        description: description || location.description,
        position: position || location.position,
        type: location.type,
        radius: radius,
        color: location.color
    }

    await sequelize.models.Location.update({
        ...newLocation
    }, {
        where: {
            id
        }
    })

    res.json(newLocation)
})

app.delete("/location/:id", async (req, res) => {
    const {id} = req.params
    await sequelize.models.Location.destroy({
        where: {
            id
        }
    })
    res.json({msg: "Deletado com sucesso"})
})


async function start() {
    await sequelize.sync({force: true})
    app.listen(3000, () => {
        console.log("Deu bom")
    })
}

start()




