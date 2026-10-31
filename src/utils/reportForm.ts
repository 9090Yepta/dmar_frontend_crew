import type { Report, ReportFormValues } from '../types/mechanic';

export function createEmptyReportForm(): ReportFormValues {
  return {
    foremanId: '',
    date: new Date().toLocaleDateString('en-CA'),
    unitCode: '',
    hm: '',
    problem: '',
    activities: [''],
    start: '',
    finish: '',
    codeJob: 'T40. Other',
    unitStatus: '0',
    component: '16. Other',
    shift: 'day',
    remark: '',
  };
}

export function toReportPayload(form: ReportFormValues) {
  const activities = form.activities.map((activity) => activity.trim()).filter(Boolean);
  return { ...form, activities, foremanId: Number(form.foremanId), unitStatus: Number(form.unitStatus) };
}

export function toReportForm(report: Report): ReportFormValues {
  const start = report.start.slice(0, 5);
  return {
    foremanId: String(report.foremanId),
    date: report.date,
    unitCode: report.unitCode ?? '',
    hm: report.hm ?? '',
    problem: report.problem ?? '',
    activities: report.activities?.length ? report.activities : [report.activity || ''],
    start,
    finish: report.finish.slice(0, 5),
    codeJob: report.codeJob,
    unitStatus: String(report.unitStatus),
    shift: start >= '18:00' || start < '06:00' ? 'night' : 'day',
    component: report.component,
    remark: report.remark ?? '',
  };
}
