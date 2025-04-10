import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";
import { getOrCreateRcdTestingJob } from "./getJobHandler";
import { getDbs } from "../db/getDbsHandler";
import { Job } from "../../../../models/job";
import { DistributionBoard } from "../../../../models/distributionBoard";
import { patchToggleJobStage } from "../../../../../../global/services/simpro_api/handlers/patchToggleJobStageHandler";
import { postJobNote } from "../../../../../../global/services/simpro_api/handlers/postJobNoteHandler";
import { rcdCount } from "../../../helper_functions/helper_functions";
import { calculateCustomerCost } from "../../../helper_functions/customer_cost_calcs";
import { postJobOneOffItem } from "../../../../../../global/services/simpro_api/handlers/postJobOneOffItemHandler";
import { hNPerryMandurah } from "../../../helper_functions/customer_ids";
import { updateJob } from "./postUpdateJobHandler";
import { getImageData } from "../../../../../../global/services/firebase_storage_api/functions/get_image_data";
import { postJobAttachments } from "../../../../../../global/services/simpro_api/handlers/postJobAttachmentsHandler";
import { Timestamp } from "firebase-admin/firestore";

export async function postCompleteRcdJobHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const {
			simproJobId,
			employeeName,
			pdfReport,
		}: {
			simproJobId: string;
			employeeName: string;
			pdfReport: string;
		} = request.data;

		if (!simproJobId || !employeeName || !pdfReport) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const updatedJob = await toggleJobCompletion(
			simproJobId,
			employeeName,
			pdfReport
		);

		return updatedJob;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function toggleJobCompletion(
	simproJobId: string,
	employeeName: string,
	pdfReport: string
) {
	try {
		const job = await getOrCreateRcdTestingJob(simproJobId);

		const dbs = await getDbs(job.firebaseDocId);

		const newStage = job.stage === "Complete" ? "Progress" : "Complete";
		const newIsComplete = job.stage === "Complete" ? false : true;

		let sharedJobSiteAddress = "";
		let jobs = [{ job: job, dbs }];
		let parentDbs: any[] = [];

		if (job.isSplitJob) {
			const splitJobSimproId = job.splitJobDetails?.simproId!;

			const splitJob = await getOrCreateRcdTestingJob(splitJobSimproId);

			const splitJobDbs = await getDbs(splitJob.firebaseDocId);

			jobs.push({ job: splitJob, dbs: splitJobDbs });
			sharedJobSiteAddress = splitJob.getAddress();

			if (job.isSplitJobParent) {
				parentDbs = dbs;
			} else {
				parentDbs = splitJobDbs;
			}
		}

		for (const data of jobs) {
			const job = data.job;

			const jobDescription = createJobDescription(
				job,
				parentDbs,
				sharedJobSiteAddress
			);

			let updateDescription = true;

			if (job.stage !== "Complete") {
				await uploadPdfReportAsAttachment(
					job,
					parentDbs,
					employeeName,
					pdfReport
				);
				await uploadImagesAsAttachments(job.simproId, parentDbs);
				await jobOneOffItem(
					job.customerId,
					job.simproId,
					parentDbs,
					job.isSplitJob
				);

				const subject = `RCD Testing Notes - Submitted By ${employeeName}`;

				if (job.customerId !== hNPerryMandurah) {
					await addJobNote(job.simproId, subject, jobDescription);
					updateDescription = false;
				}
			}

			await toggleJobStage(
				job.simproId,
				job.stage,
				jobDescription,
				updateDescription
			);

			const updatedJob = job.copyWith({
				stage: newStage,
				jobComplete: newIsComplete,
				testCompleteDate: Timestamp.now(),
			});

			await updateJob(updatedJob);
		}

		const updatedJob = job.copyWith({
			stage: newStage,
			jobComplete: newIsComplete,
			testCompleteDate: Timestamp.now(),
		});

		return updatedJob.toFrontEndMap();
	} catch (e) {
		throw e;
	}
}

// Function to upload PDF report as attachment
async function uploadPdfReportAsAttachment(
	job: Job,
	dbs: DistributionBoard[],
	employeeName: string,
	pdfReport: string
) {
	try {
		const reportFileName = `${job.name.replace(
			/[\/\\]/g,
			","
		)} - RCD Test Report.pdf`;

		//TO BE LOOKED AT ANOTHER TIME
		// const report = await generatePdfReport({
		// 	job: job,
		// 	dbs: dbs,
		// 	employeeName: employeeName,
		// });
		// const base64Data = Buffer.from(report).toString("base64");

		const pdfPayload = {
			Filename: reportFileName,
			Base64Data: pdfReport,
			Email: true,
			Public: true,
		};

		await postJobAttachments(job.simproId, pdfPayload);
	} catch (e) {
		throw new Error(`Error uploading PDF report: ${e}`);
	}
}

// Function to upload images as attachments
async function uploadImagesAsAttachments(
	simproJobId: string,
	dbs: DistributionBoard[]
) {
	try {
		for (const db of dbs) {
			for (const [index, image] of db.images.entries()) {
				const base64Data = await getImageData(image);
				const attachment = {
					Filename: `${db.name} - Image ${index + 1}.jpeg`,
					Base64Data: base64Data,
					Email: true,
					Public: true,
				};
				await postJobAttachments(simproJobId, attachment);
			}
		}
	} catch (e) {
		throw new Error(`Error uploading images: ${e}`);
	}
}

// Function to post one-off item to Simpro job
async function jobOneOffItem(
	customerId: string,
	simproJobId: string,
	dbs: DistributionBoard[],
	isSharedJob: boolean
) {
	try {
		const rcds = rcdCount(dbs);
		const oneOffItemDescription = `Completed RCD testing on ${rcds} RCD's.`;
		const cost = calculateCustomerCost(dbs, isSharedJob, customerId);

		if (cost != null) {
			await postJobOneOffItem(simproJobId, oneOffItemDescription, cost);
		}
	} catch (e) {
		throw new Error(`Error posting one-off item: ${e}`);
	}
}

// Function to add a job note
async function addJobNote(
	simproJobId: string,
	subject: string,
	description: string
) {
	try {
		await postJobNote(simproJobId, subject, description, false);
	} catch (e) {
		throw new Error(`Error adding job note: ${e}`);
	}
}

// Function to toggle job stage
async function toggleJobStage(
	simproJobId: string,
	currentStage: string,
	description: string,
	updateDescription: boolean
) {
	try {
		await patchToggleJobStage(
			simproJobId,
			currentStage,
			description,
			updateDescription
		);
	} catch (e) {
		throw new Error(`Error toggling job stage: ${e}`);
	}
}

function createJobDescription(
	job: Job,
	dbs: DistributionBoard[],
	sharedJobSiteAddress: string
): string {
	const isSharedJob = job.isSplitJob;

	const rcdsCount = rcdCount(dbs);
	let description = `
		<p>Invoice for ${job.getAddress()}</p>
		<p><b>Attention:</b> ${job.customer}</p>
		<br>
		<p><b>Work Note:</b></p>
		<p><b>Attended site & completed the following:</b></p>
		<ul>
			<li>Completed RCD testing on ${rcdsCount} RCD's.</li>
			<li>All RCDs passed required tests.</li>
		</ul>
	`;

	if (isSharedJob) {
		description += `
		<br>
		<p><b>Site Note:</b></p>
		<p>Shared switchboard with ${sharedJobSiteAddress}</p>
		`;
	}

	return description;
}

// async function postCompleteRcdJob(
// 	simproJobId: string,
// 	employeeName: string,
// 	job: Map<string, any>,
// 	payload: Map<string, any>,
// 	updatedJob: any
// ) {
// 	await simproApiService.post(
// 		postMultipleJobAttachmentsRoute(simproJobId),
// 		payload
// 	);

// 	const jobResponse = await simproApiService.get(
// 		getJobDetailsRoute(simproJobId)
// 	);
// 	const jobMap: any = jobResponse.data;

// 	const siteId = jobMap["Site"]["ID"].toString();

// 	const siteAddressResponse = await simproApiService.get(getSitesRoute(siteId));
// 	const siteAddressMap: any = siteAddressResponse.data[0];

// 	return { jobData: jobMap, siteData: siteAddressMap, updatedJob };
// }
