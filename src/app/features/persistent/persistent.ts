import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PersistentLesson {
  id: string;
  title: string;
  summary: string;
  points: string[];
  takeaway: string;
}

@Component({
  selector: 'app-persistent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './persistent.html',
  styleUrls: ['./persistent.scss']
})
export class Persistent implements OnInit {
  private readonly reviewedStorageKey = 'persistent-reviewed-topics-v1';

  lessons: PersistentLesson[] = [
    {
      id: 'role',
      title: 'Project Manager Role & Accountability',
      summary: 'The Project Manager (PM) coordinates delivery and keeps the project controlled, transparent and aligned with agreed outcomes.',
      points: [
        'Translate scope and commitments into an executable delivery plan.',
        'Coordinate people, milestones, dependencies, quality, risks, finances and stakeholders.',
        'Maintain transparent project health and escalate material issues early.',
        'Follow the organization’s prescribed processes, systems and governance controls.',
        'Drive delivery outcomes while protecting customer satisfaction, security and compliance.'
      ],
      takeaway: 'The PM owns day-to-day project control. Approvals and oversight may sit with the Delivery Partner (DP), account leadership or other governance roles.'
    },
    {
      id: 'setup',
      title: 'Project Setup & Delegation',
      summary: 'Establish a shared baseline before execution and make ownership clear.',
      points: [
        'Confirm objectives, scope, deliverables, acceptance criteria, assumptions and constraints.',
        'Agree the delivery approach, milestones, estimates, roles, responsibilities and communication cadence.',
        'Create a responsibility / delegation plan and confirm decision-makers.',
        'Validate access, environments, onboarding, tools, dependencies and customer ways of working.',
        'Record decisions and obtain required approvals before committing to material changes.'
      ],
      takeaway: 'A clear baseline and named owners reduce ambiguity, rework and delivery surprises.'
    },
    {
      id: 'plan',
      title: 'Planning, Schedule & Milestones',
      summary: 'Maintain a realistic, dependency-aware plan and use it to manage delivery.',
      points: [
        'Break scope into work packages, activities, estimates and accountable owners.',
        'Track milestones, critical dependencies, slippage, capacity and resource availability.',
        'Compare actual progress with the baseline and forecast completion dates.',
        'Assess the impact of change requests before accepting new work.',
        'Agree corrective actions and communicate changes to relevant stakeholders.'
      ],
      takeaway: 'A schedule is a control tool: keep it current, evidence-based and linked to action.'
    },
    {
      id: 'phr',
      title: 'PHR — Project Health Report',
      summary: 'Report project status consistently, using facts and forward-looking indicators.',
      points: [
        'Summarize scope, schedule, cost / effort, quality, risks, dependencies and customer sentiment.',
        'Use the organization’s defined health ratings, reporting cadence and templates.',
        'Explain variances, their causes, business impact, owners and recovery actions.',
        'Keep the report consistent with plans, RAID records, financials and actual delivery data.',
        'Escalate deteriorating health promptly; do not hide material concerns.'
      ],
      takeaway: 'A useful health report says what changed, why it matters, who owns the action and when it will be resolved.'
    },
    {
      id: 'raid',
      title: 'RAID / RIM — Risks, Assumptions, Issues & Dependencies',
      summary: 'Maintain a living register of uncertainty and delivery blockers.',
      points: [
        'Record each risk, assumption, issue and dependency with a clear description.',
        'Assign an owner, impact / probability or priority, response, due date and status.',
        'Review the register regularly with the team and stakeholders.',
        'Track mitigations and dependency commitments to closure.',
        'Escalate items that exceed the PM’s authority or threaten commitments.'
      ],
      takeaway: 'A RAID item without an owner, action and due date is not being actively managed.'
    },
    {
      id: 'erm',
      title: 'ERM — Enterprise Risk Management',
      summary: 'Connect project-level risks to wider organizational risk and control expectations.',
      points: [
        'Identify delivery, operational, technology, supplier, security, privacy and compliance risks.',
        'Use prescribed enterprise risk categories, rating scales and reporting channels.',
        'Document controls, mitigation evidence, residual risk and accountable owners.',
        'Raise material risks through the required governance route.',
        'Do not accept risks or waive controls beyond delegated authority.'
      ],
      takeaway: 'Use the official risk process and escalation thresholds applicable to the account and project.'
    },
    {
      id: 'metrics',
      title: 'Metrics & Reporting',
      summary: 'Use agreed measures to understand delivery performance and support decisions.',
      points: [
        'Track agreed measures such as milestone predictability, effort, productivity, defects, rework and action closure.',
        'Define metric meaning, source, owner, frequency and target before reporting.',
        'Validate data and explain trends rather than presenting numbers without context.',
        'Use trends to identify corrective actions and measure whether they worked.',
        'Share reports with the intended audience and protect confidential information.'
      ],
      takeaway: 'Metrics should lead to informed decisions, not just reporting activity.'
    },
    {
      id: 'quality',
      title: 'SQA Reviews, Audits & Quality',
      summary: 'Build quality into delivery and maintain evidence that required processes were followed.',
      points: [
        'Understand applicable quality plans, review gates, standards and audit requirements.',
        'Schedule peer reviews, testing, quality checks and required approvals.',
        'Track defects, non-conformities, corrective actions and closure evidence.',
        'Keep project artefacts accurate, accessible and version-controlled.',
        'Address repeat findings through root-cause analysis and prevention.'
      ],
      takeaway: 'Quality is a delivery responsibility throughout the lifecycle, not only at project closure.'
    },
    {
      id: 'customer',
      title: 'CSAT & Customer Management',
      summary: 'Manage expectations proactively and build trust through predictable delivery.',
      points: [
        'Agree communication cadence, escalation contacts, decision routes and acceptance criteria.',
        'Share progress, risks, decisions and changes early and factually.',
        'Listen to customer feedback and convert it into owned, time-bound actions.',
        'Manage expectations when scope, timeline, quality or resources change.',
        'Track satisfaction signals and resolve concerns before they become escalations.'
      ],
      takeaway: 'Customer trust depends on transparency, follow-through and no avoidable surprises.'
    },
    {
      id: 'roles',
      title: 'Roles, Approvals & Accountability',
      summary: 'Know the boundary between PM coordination and formal approval authority.',
      points: [
        'Clarify responsibilities among the PM, Delivery Partner, account leadership, customer and functional teams.',
        'Use the approved RACI / responsibility matrix and delegation limits.',
        'Seek authorization for scope, budget, staffing, contractual and risk decisions when required.',
        'Document decisions, approvals, action owners and dates.',
        'Escalate unresolved conflicts or decisions outside the PM’s authority.'
      ],
      takeaway: 'Being accountable for coordination does not automatically mean having approval authority.'
    },
    {
      id: 'finance',
      title: 'Financial & Contractual Discipline',
      summary: 'Monitor commercial commitments and follow the project’s financial controls.',
      points: [
        'Understand the applicable statement of work, scope, deliverables, assumptions and acceptance terms.',
        'Track planned versus actual effort, forecast, utilization and budget using approved systems.',
        'Identify scope creep, unplanned work, cost variance and billing / acceptance risks.',
        'Route change requests and commercial commitments through the authorized approval process.',
        'Protect confidential commercial information and retain supporting records.'
      ],
      takeaway: 'Never treat unapproved scope or commercial changes as automatically authorized.'
    },
    {
      id: 'people',
      title: 'Team, Capacity & Communication',
      summary: 'Enable the team to deliver by making priorities, ownership and communication clear.',
      points: [
        'Confirm capacity, skills, onboarding, leave coverage and critical role backups.',
        'Run effective planning, status, risk and retrospective meetings as appropriate to the delivery model.',
        'Remove blockers, coordinate cross-team work and follow up on commitments.',
        'Address performance or collaboration concerns fairly and through the right channels.',
        'Keep decisions and action items visible to the people who need them.'
      ],
      takeaway: 'The PM creates the conditions for delivery; clear ownership and timely follow-up matter.'
    },
    {
      id: 'security',
      title: 'Security, Compliance & Confidentiality',
      summary: 'Ensure delivery follows the security, privacy and compliance controls applicable to the project.',
      points: [
        'Follow customer and organizational policies for access, data handling, devices and approved tools.',
        'Ensure required training, approvals and evidence are completed.',
        'Report suspected incidents or control breaches immediately through official channels.',
        'Limit information sharing to authorized people and approved locations.',
        'Do not bypass mandatory controls to meet a schedule.'
      ],
      takeaway: 'Delivery targets never override mandatory security, privacy or compliance obligations.'
    },
    {
      id: 'closure',
      title: 'Change Control, Closure & Lessons Learned',
      summary: 'Control changes during execution and close the project with explicit acceptance and handover.',
      points: [
        'Log requested changes and assess impact on scope, schedule, cost, quality, risk and resources.',
        'Obtain the required approval before incorporating changes into the baseline.',
        'Confirm deliverable acceptance, documentation, operational handover and open-item ownership.',
        'Reconcile final status, effort / financial records and contractual obligations as applicable.',
        'Capture lessons learned and archive project records according to policy.'
      ],
      takeaway: 'A project is not complete merely because build work has stopped; acceptance and handover must be clear.'
    }
  ];

  currentIndex = 0;
  reviewedTopics: string[] = [];

  ngOnInit(): void {
    this.restoreReviewedTopics();
    this.restoreCurrentLesson();
  }

  get currentLesson(): PersistentLesson {
    return this.lessons[this.currentIndex];
  }

  get reviewedCount(): number {
    return this.lessons.filter(lesson => this.isReviewed(lesson.id)).length;
  }

  isReviewed(lessonId: string): boolean {
    return this.reviewedTopics.includes(lessonId);
  }

  toggleReviewed(lessonId: string): void {
    const wasReviewed = this.isReviewed(lessonId);
    this.reviewedTopics = wasReviewed
      ? this.reviewedTopics.filter(id => id !== lessonId)
      : [...this.reviewedTopics, lessonId];

    this.persistReviewedTopics();
  }

  selectLesson(index: number): void {
    if (index < 0 || index >= this.lessons.length) return;
    this.currentIndex = index;
    this.persistCurrentLesson();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  previousLesson(): void {
    if (this.currentIndex > 0) this.selectLesson(this.currentIndex - 1);
  }

  nextLesson(): void {
    if (this.currentIndex < this.lessons.length - 1) {
      this.selectLesson(this.currentIndex + 1);
    }
  }

  private restoreReviewedTopics(): void {
    try {
      const saved = localStorage.getItem(this.reviewedStorageKey);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      this.reviewedTopics = Array.isArray(parsed)
        ? parsed.filter((id): id is string =>
            typeof id === 'string' && this.lessons.some(lesson => lesson.id === id))
        : [];
    } catch {
      this.reviewedTopics = [];
    }
  }

  private persistReviewedTopics(): void {
    try {
      localStorage.setItem(this.reviewedStorageKey, JSON.stringify(this.reviewedTopics));
    } catch (error) {
      console.warn('Unable to save Persistent review progress.', error);
    }
  }

  private restoreCurrentLesson(): void {
    try {
      const savedId = localStorage.getItem('persistent-current-lesson-v1');
      const savedIndex = this.lessons.findIndex(lesson => lesson.id === savedId);
      this.currentIndex = savedIndex >= 0 ? savedIndex : 0;
    } catch {
      this.currentIndex = 0;
    }
  }

  private persistCurrentLesson(): void {
    try {
      localStorage.setItem('persistent-current-lesson-v1', this.currentLesson.id);
    } catch (error) {
      console.warn('Unable to save Persistent lesson position.', error);
    }
  }
}
