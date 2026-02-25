import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Attendance } from './entities/attendance.entity';
import { PayrollRun } from './entities/payroll-run.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { FieldSession } from './entities/field-session.entity';
import { EmployeesService } from './employees.service';
import { AttendanceService } from './attendance.service';
import { PayrollService } from './payroll.service';
import { LeaveRequestsService } from './leave-requests.service';
import { FieldSessionsService } from './field-sessions.service';
import { EmployeesController } from './employees.controller';
import { AttendanceController } from './attendance.controller';
import { PayrollController } from './payroll.controller';
import { LeaveRequestsController } from './leave-requests.controller';
import { FieldSessionsController } from './field-sessions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Attendance,
      PayrollRun,
      LeaveRequest,
      FieldSession,
    ]),
  ],
  providers: [
    EmployeesService,
    AttendanceService,
    PayrollService,
    LeaveRequestsService,
    FieldSessionsService,
  ],
  controllers: [
    EmployeesController,
    AttendanceController,
    PayrollController,
    LeaveRequestsController,
    FieldSessionsController,
  ],
  exports: [
    EmployeesService,
    AttendanceService,
    PayrollService,
    LeaveRequestsService,
    FieldSessionsService,
  ],
})
export class HrModule {}
