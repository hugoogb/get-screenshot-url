import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import puppeteer from "puppeteer";
import morgan from "morgan";

dotenv.config();

const app = express();
app.use(cors());

// middleware
app.use(morgan("dev"));

// static "home /" page
app.use(express.static("public"));

app.get("/screenshot", async (req, res) => {
	async function takeScreenshot(url) {
		const browser = await puppeteer.launch({ headless: "new" });
		const page = await browser.newPage();
		await page.setViewport({
			width: 1920,
			height: 1080,
		});
		await page.goto(url, { waitUntil: "networkidle0" });
		const screenshot = await page.screenshot();
		await browser.close();
		return screenshot;
	}

	const { url } = req.query;
	if (!url) {
		res.status(400).json({ error: "URL parameter is required" });
	} else {
		try {
			const screenshot = await takeScreenshot(url);
			res.setHeader("Content-Type", "image/png");
			res.send(screenshot);
		} catch (error) {
			res.status(500).json({
				error: "Failed to take screenshot",
			});
		}
	}
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
	console.clear();
	console.log(`Server listening on port ${PORT}`);
});
