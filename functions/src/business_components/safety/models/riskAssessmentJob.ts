import {
	ppeItems,
	predefinedHazards,
	predefinedHighRiskTasks,
} from "../data/safetyConstants";
import { AdditionalHazard } from "./additionalHazard";
import { HazardItem } from "./hazardItem";
import { HighRiskTask } from "./highRiskTask";
import { PpeItem } from "./ppeItem";
import { TeamMember } from "./teamMember";

export class RiskAssessmentJob {
	constructor(
		public firebaseId: string = "",
		public dateCreated?: Date,
		public createdBy?: string,
		public name: string = "",
		public address: string = "",
		public customer: string = "",
		public simproId: string = "",
		public status: string = "",
		public jobDescription: string = "",
		public gpsCoords: string = "",
		public completedBy: string = "",
		public phone: string = "",
		public email: string = "",
		public taskActivity: string = "",
		public understandsTask: boolean | null = null,
		public highRiskTasks: HighRiskTask[] = [],
		public hazards: HazardItem[] = [],
		public additionalHazards: AdditionalHazard[] = [],
		public ppeSelections: PpeItem[] = [],
		public supervisor: TeamMember = new TeamMember("", "", true),
		public teamMembers: TeamMember[] = [],
		public completedByUid: string = "",
		public completedAt?: Date,
		public riskAssessmentId: string = ""
	) {}

	static defaultHighRiskTasks(): HighRiskTask[] {
		return predefinedHighRiskTasks.map(
			(task) => new HighRiskTask(task.number, task.description)
		);
	}

	static defaultHazards(): HazardItem[] {
		return predefinedHazards.map(
			(description) => new HazardItem(description)
		);
	}

	static defaultPpeItems(): PpeItem[] {
		return ppeItems.map((name) => new PpeItem(name));
	}

	static resolveHighRiskTasks(source?: any[]): HighRiskTask[] {
		const defaults = RiskAssessmentJob.defaultHighRiskTasks();
		if (!source || source.length === 0) return defaults;

		const existing = source.map((task) => HighRiskTask.fromMap(task));
		if (existing.length === defaults.length) return existing;

		return defaults.map((task) => {
			const match = existing.find(
				(item) => item.description === task.description
			);
			if (!match) return task;
			return task.copyWith({
				selected: match.selected,
				relevantSwms: match.relevantSwms,
				otherSwms: match.otherSwms,
			});
		});
	}

	static resolveHazards(source?: any[]): HazardItem[] {
		const defaults = RiskAssessmentJob.defaultHazards();
		if (!source || source.length === 0) return defaults;

		const existing = source.map((hazard) => HazardItem.fromMap(hazard));
		if (existing.length === defaults.length) return existing;

		return defaults.map((hazard) => {
			const match = existing.find(
				(item) => item.description === hazard.description
			);
			if (!match) return hazard;
			return hazard.copyWith({
				selected: match.selected,
				control: match.control,
			});
		});
	}

	static fromMap(map: Record<string, any>): RiskAssessmentJob {
		const highRiskTasks = RiskAssessmentJob.resolveHighRiskTasks(
			map["highRiskTasks"] as any[] | undefined
		);
		const hazards = RiskAssessmentJob.resolveHazards(
			map["hazards"] as any[] | undefined
		);

		const additionalHazards = (
			map["additionalHazards"] as any[] | undefined
		)?.map((hazard) => AdditionalHazard.fromMap(hazard)) ?? [];

		const ppeSelections = (map["ppeSelections"] as any[] | undefined)?.map(
			(item) => PpeItem.fromMap(item)
		) ?? RiskAssessmentJob.defaultPpeItems();

		const teamMembers = (map["teamMembers"] as any[] | undefined)?.map(
			(member) => TeamMember.fromMap(member)
		) ?? [];

		const supervisorMap = map["supervisor"] as Record<string, any> | undefined;
		const supervisor = supervisorMap
			? TeamMember.fromMap(supervisorMap).copyWith({ isSupervisor: true })
			: new TeamMember(map["completedBy"] ?? "", "", true);

		return new RiskAssessmentJob(
			map["firebaseId"] ?? "",
			map["dateCreated"]?.toDate
				? map["dateCreated"].toDate()
				: map["dateCreated"] instanceof Date
				? map["dateCreated"]
				: map["dateCreated"]
				? new Date(map["dateCreated"])
				: undefined,
			map["createdBy"],
			map["name"] ?? "",
			map["address"] ?? "",
			map["customer"] ?? "",
			map["simproId"] ?? "",
			map["status"] ?? "",
			map["jobDescription"] ?? "",
			map["gpsCoords"] ?? "",
			map["completedBy"] ?? "",
			map["phone"] ?? "",
			map["email"] ?? "",
			map["taskActivity"] ?? "",
			typeof map["understandsTask"] === "boolean"
				? map["understandsTask"]
				: null,
			highRiskTasks,
			hazards,
			additionalHazards,
			ppeSelections,
			supervisor,
			teamMembers,
			map["completedByUid"] ?? "",
			map["completedAt"]?.toDate
				? map["completedAt"].toDate()
				: map["completedAt"] instanceof Date
				? map["completedAt"]
				: map["completedAt"]
				? new Date(map["completedAt"])
				: undefined,
			map["riskAssessmentId"] ?? ""
		);
	}

	toFirebaseMap(): Record<string, any> {
		return {
			dateCreated: this.dateCreated ?? null,
			createdBy: this.createdBy,
			name: this.name,
			address: this.address,
			customer: this.customer,
			simproId: this.simproId,
			riskAssessmentId: this.riskAssessmentId,
			status: this.status,
			jobDescription: this.jobDescription,
			gpsCoords: this.gpsCoords,
			completedBy: this.completedBy,
			phone: this.phone,
			email: this.email,
			taskActivity: this.taskActivity,
			understandsTask: this.understandsTask,
			highRiskTasks: this.highRiskTasks.map((task) => task.toMap()),
			hazards: this.hazards.map((hazard) => hazard.toMap()),
			additionalHazards: this.additionalHazards.map((hazard) =>
				hazard.toMap()
			),
			ppeSelections: this.ppeSelections.map((item) => item.toMap()),
			supervisor: this.supervisor.toMap(),
			teamMembers: this.teamMembers.map((member) => member.toMap()),
			completedByUid: this.completedByUid,
			// Firestore rejects undefined — use null until the assessment is submitted.
			completedAt: this.completedAt ?? null,
		};
	}

	toFirebaseUpdateMap(): Record<string, any> {
		return {
			name: this.name,
			address: this.address,
			customer: this.customer,
			simproId: this.simproId,
			jobDescription: this.jobDescription,
			gpsCoords: this.gpsCoords,
			completedBy: this.completedBy,
			phone: this.phone,
			email: this.email,
			taskActivity: this.taskActivity,
			understandsTask: this.understandsTask,
			highRiskTasks: this.highRiskTasks.map((task) => task.toMap()),
			hazards: this.hazards.map((hazard) => hazard.toMap()),
			additionalHazards: this.additionalHazards.map((hazard) =>
				hazard.toMap()
			),
			ppeSelections: this.ppeSelections.map((item) => item.toMap()),
			supervisor: this.supervisor.toMap(),
			teamMembers: this.teamMembers.map((member) => member.toMap()),
		};
	}

	toFrontendMap(): Record<string, any> {
		return {
			firebaseId: this.firebaseId,
			dateCreated: this.dateCreated?.toISOString(),
			createdBy: this.createdBy,
			name: this.name,
			address: this.address,
			customer: this.customer,
			simproId: this.simproId,
			riskAssessmentId: this.riskAssessmentId,
			status: this.status,
			jobDescription: this.jobDescription,
			gpsCoords: this.gpsCoords,
			completedBy: this.completedBy,
			phone: this.phone,
			email: this.email,
			taskActivity: this.taskActivity,
			understandsTask: this.understandsTask,
			highRiskTasks: this.highRiskTasks.map((task) => task.toMap()),
			hazards: this.hazards.map((hazard) => hazard.toMap()),
			additionalHazards: this.additionalHazards.map((hazard) =>
				hazard.toMap()
			),
			ppeSelections: this.ppeSelections.map((item) => item.toMap()),
			supervisor: this.supervisor.toMap(),
			teamMembers: this.teamMembers.map((member) => member.toMap()),
			completedByUid: this.completedByUid,
			completedAt: this.completedAt?.toISOString(),
		};
	}

	copyWith(updates: {
		firebaseId?: string;
		dateCreated?: Date;
		createdBy?: string;
		name?: string;
		address?: string;
		customer?: string;
		simproId?: string;
		status?: string;
		jobDescription?: string;
		gpsCoords?: string;
		completedBy?: string;
		phone?: string;
		email?: string;
		taskActivity?: string;
		understandsTask?: boolean | null;
		highRiskTasks?: HighRiskTask[];
		hazards?: HazardItem[];
		additionalHazards?: AdditionalHazard[];
		ppeSelections?: PpeItem[];
		supervisor?: TeamMember;
		teamMembers?: TeamMember[];
		completedByUid?: string;
		completedAt?: Date;
		riskAssessmentId?: string;
	}): RiskAssessmentJob {
		return new RiskAssessmentJob(
			updates.firebaseId ?? this.firebaseId,
			updates.dateCreated ?? this.dateCreated,
			updates.createdBy ?? this.createdBy,
			updates.name ?? this.name,
			updates.address ?? this.address,
			updates.customer ?? this.customer,
			updates.simproId ?? this.simproId,
			updates.status ?? this.status,
			updates.jobDescription ?? this.jobDescription,
			updates.gpsCoords ?? this.gpsCoords,
			updates.completedBy ?? this.completedBy,
			updates.phone ?? this.phone,
			updates.email ?? this.email,
			updates.taskActivity ?? this.taskActivity,
			updates.understandsTask === undefined
				? this.understandsTask
				: updates.understandsTask,
			updates.highRiskTasks ?? this.highRiskTasks,
			updates.hazards ?? this.hazards,
			updates.additionalHazards ?? this.additionalHazards,
			updates.ppeSelections ?? this.ppeSelections,
			updates.supervisor ?? this.supervisor,
			updates.teamMembers ?? this.teamMembers,
			updates.completedByUid ?? this.completedByUid,
			updates.completedAt ?? this.completedAt,
			updates.riskAssessmentId ?? this.riskAssessmentId
		);
	}
}
