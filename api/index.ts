import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import { and, asc, gte, lte } from "drizzle-orm";

import { sensorData } from "../db-schema";

import { parseDateTime } from "@internationalized/date";

import express from "express";

const app = express();

app.get("/", async (req, res) => {
	const date = req.query.date as string;

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

	const client = createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN! });

	const db = drizzle(client);

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

app.listen(3000, () => {
	console.log("http://localhost:3000");
});

export default app;
