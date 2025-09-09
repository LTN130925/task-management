import ExcelJS from 'exceljs';
import cron from 'node-cron';

import { getProgress } from '../api/v1/admin/services/getProgress';
import { projectsProgress } from '../api/v1/admin/services/getProgressProjects';

import sendMail from '../helpers/sendMail';

export const reportDataTasks = () => {
  cron.schedule('0 8 * * MON', async () => {
    const progressTask = await getProgress();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Progress Task');
    ws.addRow([
      'User ID',
      'initial',
      'doing',
      'finish',
      'pending',
      'notFinish',
      'completionRate',
    ]);
    for (const task of progressTask) {
      ws.addRow([
        task.userId,
        task.initial,
        task.doing,
        task.finish,
        task.pending,
        task.notFinish,
        task.completionRate ? task.completionRate.toFixed(2) : 0,
      ]);
    }
    const buffer = await wb.xlsx.writeBuffer();

    const objectSendMail: any = {
      from: `quản lý công việc <${process.env.EMAIL_USER}>`,
      to: 'ltansang374@gmail.com',
      subject: 'chuyển mã OTP',
      text: 'báo cáo dữ liệu tiến trình làm việc task',
      html: `<h1>báo cáo dữ liệu</h1>
        <p>task_report_${Date.now()}.xlsx <b>${buffer}</b></p>
        <p>dữ liệu sẽ tự động báo cáo hàng tuần vào thứ 2 lúc 8 giờ</p>`,
    };
    sendMail(objectSendMail);
  });
};

export const reportDataProject = () => {
  cron.schedule('0 8 * * MON', async () => {
    const progressProject = await projectsProgress();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Progress Task');
    ws.addRow([
      'Project Id',
      'title',
      'total',
      'onTime',
      'late',
      'overdue',
      'inProgress',
      'completionRate',
    ]);
    for (const project of progressProject) {
      ws.addRow([
        project.projectId,
        project.title,
        project.total,
        project.onTime,
        project.late,
        project.overdue,
        project.inProgress,
        project.completionRate ? project.completionRate.toFixed(2) : 0,
      ]);
    }
    const buffer = await wb.xlsx.writeBuffer();

    const objectSendMail: any = {
      from: `quản lý công việc <${process.env.EMAIL_USER}>`,
      to: 'ltansang374@gmail.com',
      subject: 'chuyển mã OTP',
      text: 'báo cáo dữ liệu tiến trình làm việc dự án',
      html: `<h1>báo cáo dữ liệu</h1>
        <p>project_report_${Date.now()}.xlsx <b>${buffer}</b></p>
        <p>dữ liệu sẽ tự động báo cáo hàng tuần vào thứ 2 lúc 8 giờ</p>`,
    };
    sendMail(objectSendMail);
  });
};
