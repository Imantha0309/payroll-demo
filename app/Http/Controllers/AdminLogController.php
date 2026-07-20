<?php

namespace App\Http\Controllers;

use App\Models\AdminLog;
use Illuminate\Http\Request;

class AdminLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AdminLog::with([
            // 'session.user.organization.parent',
            // 'employee.organization.parent',
        ]);

        // Filter by module
        if ($request->filled('module') && $request->module !== 'All') {
            $query->where('module', $request->module);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderBy('created_at', 'desc')->get()->map(function ($log) {

            $sessionId = $log->session_id
                ? 'S' . str_pad($log->session_id, 3, '0', STR_PAD_LEFT)
                : '—';

            // $empOrg        = $log->employee?->organization?->name ?? null;
            // $empParentDept = $log->employee?->organization?->parent?->name ?? $empOrg;

            // $department = $log->module === 'Parliament Member'
            //     ? 'Parliament'
            //     : ($log->session?->user?->organization?->parent?->name
            //     ?? $log->session?->user?->organization?->name
            //     ?? $log->employee?->organization?->parent?->name
            //     ?? $log->employee?->organization?->name
            //     ?? '—');

            return [
                'id'                    => $log->id,
                'session_id'            => $sessionId,
                'module'                => $log->module ?? '—',
                'timestamp'             => $log->created_at
                                            ? $log->created_at->format('M d, h:i A')
                                            : '',
                'created_at_date'       => $log->created_at
                                            ? $log->created_at->format('Y-m-d')
                                            : '',
                'action_type'           => $log->action_type,
                'performed_by'          => $log->performed_by,
                'performed_by_username' => $log->session?->user?->username,
                'performed_by_email'    => $log->session?->user?->email,
                // 'employee'              => $log->employee_id
                //                             ? $log->employee_id . ' - ' . $log->employee_name
                //                             : '—',
                // 'employee_org'          => $empOrg ?? '—',
                // 'employee_parent_dept'  => $empParentDept ?? '—',
                // 'application'           => $log->application_id
                //                             ? $log->application_id . ' - ' . $log->application_name
                //                             : '—',
                // 'department'            => $department,
                'details'               => $log->details,
                'log'                   => $log->log,
            ];
        });

        // Filter by department (client-side after mapping since department is computed)
        // if ($request->filled('department') && $request->department !== 'All') {
        //     $logs = $logs->filter(fn($l) => $l['department'] === $request->department)->values();
        // }

        return response()->json($logs);
    }
}
