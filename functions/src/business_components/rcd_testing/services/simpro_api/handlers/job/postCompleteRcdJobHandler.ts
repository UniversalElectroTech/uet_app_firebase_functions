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
import { getImageData } from "../../../../../../global/services/firebase_storage_api/handlers/get_image_data";
import { postMultipleJobAttachments } from "../../../../../../global/services/simpro_api/handlers/postJobAttachmentsHandler";
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
			parentSimproJobId,
			employeeName,
			pdfReport,
		}: {
			parentSimproJobId: string;
			employeeName: string;
			pdfReport: string;
			splitJobPdfReport?: string;
		} = request.data;

		if (!parentSimproJobId || !employeeName || !pdfReport) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const updatedJob = await toggleJobCompletion(
			parentSimproJobId,
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
		const parentJob = await getOrCreateRcdTestingJob(simproJobId);
		const parentDbs = await getDbs(parentJob.firebaseDocId);

		const newStage = parentJob.stage === "Complete" ? "Progress" : "Complete";
		const newIsComplete = parentJob.stage === "Complete" ? false : true;
		const subject = `RCD Testing Notes - Submitted By ${employeeName}`;
		const sharedJobSiteAddress = parentJob.getAddress();
		let updateDescription = true;
		let jobs: { job: Job; dbs: DistributionBoard[] }[] = [];

		let jobAttachments = await uploadImagesAsAttachments(parentDbs);

		const parentJobPdfAttachment = await uploadPdfReportAsAttachment(
			parentJob,
			parentDbs,
			employeeName,
			pdfReport
		);
		jobAttachments.push(parentJobPdfAttachment);

		jobs.push({ job: parentJob, dbs: parentDbs });

		if (parentJob.isSplitJob) {
			const splitJob = await getSplitJob(parentJob.splitJobDetails!.simproId!);
			jobs.push({ job: splitJob, dbs: parentDbs });
		}

		for (const job of jobs) {
			// Create job description
			const jobDescription = createJobDescription(
				job.job,
				job.dbs,
				sharedJobSiteAddress
			);

			// Post one-off item to Simpro
			if (newIsComplete) {
				await jobOneOffItem(
					job.job.customerId,
					job.job.simproId,
					parentDbs,
					job.job.isSplitJob
				);
				// If not HN Perry Mandurah, add job note
				if (parentJob.customerId != hNPerryMandurah) {
					await addJobNote(parentJob.simproId, subject, jobDescription);
					updateDescription = false;
				}
			}

			// Upload all attachments in one go to Simpro
			await uploadAttachments(job.job.simproId, jobAttachments);

			await toggleJobStage(
				job.job.simproId,
				job.job.stage,
				jobDescription,
				updateDescription
			);

			// Update the job in the database
			await updateJob(job.job);
		}

		const updatedJob = parentJob.copyWith({
			stage: newStage,
			jobComplete: newIsComplete,
			testCompleteDate: Timestamp.now(),
		});

		return updatedJob.toFrontEndMap();
	} catch (e) {
		throw e;
	}
}

async function getSplitJob(splitJobSimproId: string) {
	let splitJob = await getOrCreateRcdTestingJob(splitJobSimproId);
	return splitJob;
}

async function uploadAttachments(simproJobId: string, attachments: any[]) {
	const payload = attachments.map((attachment) => ({
		Filename: attachment.Filename,
		Base64Data: attachment.Base64Data,
		Email: true,
		Public: true,
	}));

	await postMultipleJobAttachments(simproJobId, payload);
}

async function uploadPdfReportAsAttachment(
	job: Job,
	dbs: DistributionBoard[],
	employeeName: string,
	pdfReport: string
) {
	const reportFileName = `${job.name.replace(
		/[\/\\]/g,
		","
	)} - RCD Test Report.pdf`;
	const pdfPayload = {
		Filename: reportFileName,
		Base64Data: pdfReport,
		Email: true,
		Public: true,
	};

	return pdfPayload; // Return the payload instead of uploading immediately
}

async function uploadImagesAsAttachments(dbs: DistributionBoard[]) {
	const imageAttachments = [];

	for (const db of dbs) {
		for (const [index, image] of db.images.entries()) {
			const base64Data = await getImageData(image);
			const attachment = {
				Filename: `${db.name} - Image ${index + 1}.jpeg`,
				Base64Data: base64Data,
				Email: true,
				Public: true,
			};
			imageAttachments.push(attachment); // Collect image attachments
		}
	}

	return imageAttachments; // Return all collected image attachments
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
