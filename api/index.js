import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";

dotenv.config();

const app = express();
app.use(cors());

// middleware
app.use(morgan("dev"));

// static "home /" page
app.use(express.static("public"));

app.get("/api/screenshot", async (req, res) => {
	async function takeScreenshot(url) {
		const options = {
			args: chrome.args,
			executablePath: await chrome.executablePath,
			headless: chrome.headless,
		};
		const browser = await puppeteer.launch(options);
		const page = await browser.newPage();
		await page.setViewport({
			width: 1280,
			height: 720,
		});
		await page.goto(url, { waitUntil: "networkidle0" });
		const screenshot = await page.screenshot({
			type: "webp",
			clip: { x: 0, y: 0, width: 1280, height: 720 },
		});
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
			res.status(500).json({ error: "Failed to take screenshot" });
		}
	}
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
	console.clear();
	console.log(`Server listening in port ${PORT}`);
});
