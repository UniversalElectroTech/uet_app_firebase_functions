// // functions/src/pdfGenerator.ts
// import { PDFDocument, rgb } from "pdf-lib";
// import { Job } from "../../models/job";
// import { DistributionBoard } from "../../models/distributionBoard";

// export async function generatePdfReport({
// 	employeeName,
// 	job,
// 	dbs,
// 	completionDate,
// }: {
// 	employeeName: string;
// 	job: Job;
// 	dbs: DistributionBoard[];
// 	completionDate?: Date;
// }): Promise<Uint8Array> {
// 	const date = completionDate ?? new Date();
// 	const pdfDoc = await PDFDocument.create();

// 	// Add a page
// 	const page = pdfDoc.addPage([600, 800]);
// 	const { width, height } = page.getSize();

// 	// Draw header
// 	// const headerLogo = await loadHeaderImage(); // Implement this function to load the image
// 	// page.drawImage(headerLogo, {
// 	// 	x: 50,
// 	// 	y: height - 100,
// 	// 	width: 100,
// 	// 	height: 100,
// 	// });

// 	// Draw title
// 	page.drawText("Residual Current Device (RCD) - Test Report", {
// 		x: 50,
// 		y: height - 50,
// 		size: 24,
// 		color: rgb(0, 0, 0),
// 	});

// 	// Draw employee name and date
// 	page.drawText(`Tester Name: ${employeeName}`, { x: 50, y: height - 100 });
// 	page.drawText(
// 		`Date Tested: ${date.getDate()}/${
// 			date.getMonth() + 1
// 		}/${date.getFullYear()}`,
// 		{ x: 50, y: height - 120 }
// 	);
// 	page.drawText(`Site Address: ${job.getAddress()}`, {
// 		x: 50,
// 		y: height - 140,
// 	});

// 	// Draw total distribution boards and RCDs
// 	const totalDbs = dbs.length;
// 	const totalRcds = dbs.reduce((count, db) => count + db.rcds.length, 0);
// 	page.drawText(`Total Distribution Boards: ${totalDbs}`, {
// 		x: 50,
// 		y: height - 160,
// 	});
// 	page.drawText(`Total RCDs: ${totalRcds}`, { x: 50, y: height - 180 });

// 	// Draw content for each distribution board
// 	let yPosition = height - 220;
// 	for (const db of dbs) {
// 		page.drawText(`Distribution Board: ${db.name}`, { x: 50, y: yPosition });
// 		yPosition -= 20;

// 		// Draw RCDs
// 		for (const rcd of db.rcds) {
// 			const result = rcd.isPassed ? "Pass" : "Fail";
// 			page.drawText(`RCD ID: ${rcd.name}, Test Result: ${result}`, {
// 				x: 50,
// 				y: yPosition,
// 			});
// 			yPosition -= 20;
// 		}

// 		yPosition -= 20; // Add space between distribution boards
// 	}

// 	// Serialize the PDF document to bytes
// 	const pdfBytes = await pdfDoc.save();
// 	return pdfBytes;
// }

// // Function to load the header image
// async function loadHeaderImage(): Promise<any> {
// 	// Implement your logic to load the image, e.g., from a URL or local storage
// 	// Return the image in a format compatible with pdf-lib
// }
