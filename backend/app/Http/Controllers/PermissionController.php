<?php
namespace App\Http\Controllers;
use App\Models\Permission;
use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    /**
     * Check if current user has a specific permission
     */
    private function hasPermission($permissionName)
    {
        $user = auth()->user();
        if (!$user) {
            return false;
        }
        $permission = Permission::where('name', $permissionName)->first();
        if (!$permission) {
            return false;
        }
        return DB::table('role_permissions')
            ->where('role_id', $user->role_id)
            ->where('permission_id', $permission->id)
            ->exists();
    }

    public function index(Request $request)
    {
        if (!$this->hasPermission('Security_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view permissions.'
            ], 403);
        }

        $perPage = 10;
        $query = Permission::query();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            if (strlen($search) >= 3) {
                $query->where('name', 'LIKE', "%{$search}%");
            }
        }

        $permissions = $query->paginate($perPage);

        return response()->json([
            'data' => $permissions->items(),
            'current_page' => $permissions->currentPage(),
            'last_page' => $permissions->lastPage(),
            'per_page' => $permissions->perPage(),
            'total' => $permissions->total(),
            'from' => $permissions->firstItem(),
            'to' => $permissions->lastItem()
        ]);
    }
    
    public function store(Request $request)
    {
        if (!$this->hasPermission('Security_create')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to create permissions.'
            ], 403);
        }
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z_]+(?:\.[a-zA-Z_]+)*$/', 
                'unique:permissions,name'
            ],
        ], [
            'name.required' => 'Permission name is required',
            'name.string' => 'Permission name must be a string',
            'name.max' => 'Permission name may not be greater than 255 characters',
            'name.regex' => 'Permission name must be in alphanumeric with underscores and dots (e.g., "Users.Create")',
            'name.unique' => 'This permission name already exists'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }
        try {
            $permission = Permission::create(['name' => $request->name]);

            // Admin Log
            $currentUser = auth()->user();
            $session = \App\Models\LoginSession::where('user_id', $currentUser->id)
                ->whereNull('logout_time')->orderBy('login_time', 'desc')->first();
            if ($session) {
                AdminLog::create([
                    'session_id'  => $session->id,
                    'module'      => 'Security',
                    'action_type' => 'Permission Created',
                    'performed_by'=> $currentUser->full_name,
                    'details'     => 'Permission ID P' . str_pad($permission->id, 3, '0', STR_PAD_LEFT) . ' "' . $permission->name . '" created.',
                    'log'         => 'Permission Created',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Permission created successfully',
                'data' => $permission
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // Update permission
    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('Security_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update permissions.'
            ], 403);
        }
        $permission = Permission::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z_]+(?:\.[a-zA-Z_]+)*$/', 
                Rule::unique('permissions', 'name')->ignore($id)
            ],
        ], [
            'name.required' => 'Permission name is required',
            'name.string' => 'Permission name must be a string',
            'name.max' => 'Permission name may not be greater than 255 characters',
            'name.regex' => 'Permission name must be in alphanumeric with underscores and dots (e.g., "Users.Create")',
            'name.unique' => 'This permission name already exists'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }
        try {
            $permission->update(['name' => $request->name]);

            // Admin Log
            $currentUser = auth()->user();
            $session = \App\Models\LoginSession::where('user_id', $currentUser->id)
                ->whereNull('logout_time')->orderBy('login_time', 'desc')->first();
            if ($session) {
                AdminLog::create([
                    'session_id'  => $session->id,
                    'module'      => 'Security',
                    'action_type' => 'Permission Updated',
                    'performed_by'=> $currentUser->full_name,
                    'details'     => 'Permission ID P' . str_pad($permission->id, 3, '0', STR_PAD_LEFT) . ' "' . $permission->name . '" updated.',
                    'log'         => 'Permission Updated',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Permission updated successfully',
                'data' => $permission
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // Delete permission
    public function destroy($id)
    {
        if (!$this->hasPermission('Security_delete')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to delete permissions.'
            ], 403);
        }
        
        try {
            // Find and delete the permission
            $permission = Permission::findOrFail($id);
            $permissionName = $permission->name;
            $permission->delete();

            // Admin Log
            $currentUser = auth()->user();
            $session = \App\Models\LoginSession::where('user_id', $currentUser->id)
                ->whereNull('logout_time')->orderBy('login_time', 'desc')->first();
            if ($session) {
                AdminLog::create([
                    'session_id'  => $session->id,
                    'module'      => 'Security',
                    'action_type' => 'Permission Deleted',
                    'performed_by'=> $currentUser->full_name,
                    'details'     => 'Permission "' . $permissionName . '" deleted.',
                    'log'         => 'Permission Deleted',
                ]);
            }

            \Illuminate\Support\Facades\Artisan::call('permissions:reset-ids');
            
            return response()->json([
                'success' => true,
                'message' => "Permission '{$permissionName}' deleted successfully"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}