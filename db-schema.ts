import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("usuario", {
	userId: text("id_usuario").primaryKey(),
	username: text("nome_usuario").notNull(),
	startDate: text("data_inicio").notNull(),
});

export const sensorTypes = sqliteTable("tipo_sensor", {
	id_sensor: text("id_tipo").primaryKey(),
	name: text("nome_tipo").notNull(),
	dataRead: text("dados_suportados", { mode: "json" }).$type<Array<string>>().notNull(),
});

export const sensors = sqliteTable("sensor", {
	id_sensor: text("id_sensor").primaryKey(),
	userId: text("id_usuario")
		.references(() => users.userId)
		.notNull(),
	sensorTypeId: text("id_tipo")
		.references(() => sensorTypes.id_sensor)
		.notNull(),
	desc: text("descricao"),
});

export const sensorData = sqliteTable("leitura_sensor", {
	sensor_id: text("id_sensor")
		.references(() => sensors.id_sensor)
		.notNull(),
	data: text("dados", { mode: "json" })
		.$type<{
			[key: string]: number;
		}>()
		.notNull(),
	timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
});
