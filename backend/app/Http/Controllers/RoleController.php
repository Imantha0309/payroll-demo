<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * Get all roles with pagination and search
     */
    public function index(Request $request)
    {
        if (!$this->hasPermission('Security_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view roles.'
            ], 403);
        }

        $perPage = 10; // Fixed to 10 items per page
        $query = Role::query();
        
        // Add search functionality
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('name', 'LIKE', "%{$search}%");
        }
        
         $roles = $query->paginate($perPage);
        // $roles = $query
        //     ->orderBy('roles.id', 'desc')
        //     ->paginate(perPage: $perPage);
        
        return response()->json([
            'data' => $roles->items(),
            'current_page' => $roles->currentPage(),
            'last_page' => $roles->lastPage(),
            'per_page' => $roles->perPage(),
            'total' => $roles->total(),
            'from' => $roles->firstItem(),
            'to' => $roles->lastItem()
        ]);
    }

    /**
     * Get all role-permission assignments
     */
    public function getRolePermissions()
    {
        if (!$this->hasPermission('Security_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view role permissions.'
            ], 403);
        }

        try {
            // Use your existing role_permissions table
            $rolePermissions = DB::table('role_permissions')->get();
            
            return response()->json($rolePermissions);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch role permissions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync role-permission assignments (without timestamps)
     */
    public function syncRolePermissions(Request $request)
    {
        if (!$this->hasPermission('Security_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update role permissions.'
            ], 403);
        }

        $request->validate([
            'assignments' => 'required|array',
            'assignments.*' => 'array'
        ]);

        try {
            DB::beginTransaction();

            // First, clear all existing assignments from YOUR table
            DB::table('role_permissions')->delete();

            // Then, insert the new assignments
            $assignments = [];
            foreach ($request->assignments as $roleId => $permissionIds) {
                foreach ($permissionIds as $permissionId) {
                    $assignments[] = [
                        'role_id' => $roleId,
                        'permission_id' => $permissionId
                        // Removed timestamps since your table doesn't have them
                    ];
                }
            }

            if (!empty($assignments)) {
                // Insert into YOUR existing table
                DB::table('role_permissions')->insert($assignments);
            }

            DB::commit();

            // Admin Log
            $currentUser = auth()->user();
            $session = \App\Models\LoginSession::where('user_id', $currentUser->id)
                ->whereNull('logout_time')->orderBy('login_time', 'desc')->first();
            if ($session) {
                AdminLog::create([
                    'session_id'  => $session->id,
                    'module'      => 'Security',
                    'action_type' => 'Role Permissions Synced',
                    'performed_by'=> $currentUser->full_name,
                    'details'     => 'All role permissions synced by ' . $currentUser->full_name . '.',
                    'log'         => 'Role Permissions Synced',
                ]);
            }

            return response()->json(['message' => 'Permissions synchronized successfully']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to sync permissions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync permissions for a specific role (NEW METHOD)
     */
    public function syncSingleRolePermissions(Request $request)
    {
        if (!$this->hasPermission('Security_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update role permissions.'
            ], 403);
        }

        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'permission_ids' => 'array',
            'permission_ids.*' => 'exists:permissions,id'
        ]);

        try {
            DB::beginTransaction();

            // Delete existing permissions for this specific role
            DB::table('role_permissions')
                ->where('role_id', $request->role_id)
                ->delete();

            // Insert new permissions if any were selected
            if (!empty($request->permission_ids)) {
                $assignments = [];
                foreach ($request->permission_ids as $permissionId) {
                    $assignments[] = [
                        'role_id' => $request->role_id,
                        'permission_id' => $permissionId
                    ];
                }
                DB::table('role_permissions')->insert($assignments);
            }

            DB::commit();

            // Admin Log
            $currentUser = auth()->user();
            $role = Role::find($request->role_id);
            $session = \App\Models\LoginSession::where('user_id', $currentUser->id)
                ->whereNull('logout_time')->orderBy('login_time', 'desc')->first();
            if ($session) {
                AdminLog::create([
                    'session_id'  => $session->id,
                    'module'      => 'Security',
                    'action_type' => 'Role Permissions Updated',
                    'performed_by'=> $currentUser->full_name,
                    'details'     => 'Permissions updated for role: ' . ($role->name ?? $request->role_id) . '.',
                    'log'         => 'Role Permissions Updated',
                ]);
            }

            return response()->json(['message' => 'Role permissions synchronized successfully']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to sync role permissions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if current user has a specific permission
     */
    private function hasPermission($permissionName)
    {
        $user = auth()->user();
        if (!$user) {
            return false;
        }
        // // Super Admin bypass (role_id = 1)
        // if ($user->role_id == 1) {
        //     return true;
        // }
        $permission = Permission::where('name', $permissionName)->first();
        if (!$permission) {
            return false;
        }
        return DB::table('role_permissions')
            ->where('role_id', $user->role_id)
            ->where('permission_id', $permission->id)
            ->exists();
    }
}