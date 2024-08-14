import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt
} from "sequelize-typescript"

@Table({
    timestamps: true,
    tableName: "locations",
    modelName: "Location"
})
class Location extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare id: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare description: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare type: string

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare radius: number

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare color: string

    @Column({
        type: DataType.GEOGRAPHY,
        allowNull: true
    })
    declare position: object

    @CreatedAt
    declare createdAt: Date

    @UpdatedAt
    declare updatedAt: Date
}

export default Location