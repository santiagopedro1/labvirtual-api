import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import { and, asc, gte, lte } from "drizzle-orm";

import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

import { parseDateTime } from "@internationalized/date";

import express from "express";

import cors from "cors";

const app = express();

app.use(cors());

const client = createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN! });

const db = drizzle(client);

const sensorData = sqliteTable("leitura_sensor", {
	sensor_id: text("id_sensor").notNull(),
	data: text("dados", { mode: "json" })
		.$type<{
			[key: string]: number;
		}>()
		.notNull(),
	timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
});

app.get("/", async (req, res) => {
	const date = req.query.date as string;

	console.log("oie");

	const start = parseDateTime(date)
		.set({
			hour: 0,
			minute: 0,
		})
		.toDate("America/Sao_Paulo");

	const end = parseDateTime(date)
		.add({ days: 1 })
		.set({
			hour: 0,
			minute: 0,
		})
		.toDate("America/Sao_Paulo");

	const result = await db
		.select({
			id_sensor: sensorData.sensor_id,
			timestamp: sensorData.timestamp,
			data: sensorData.data,
		})
		.from(sensorData)
		.where(and(lte(sensorData.timestamp, end), gte(sensorData.timestamp, start)))
		.orderBy(asc(sensorData.timestamp))
		.limit(2);

	res.status(200).json(result);
});

export default app;
