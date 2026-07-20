<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\AdminLog;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{

    /**
     * Get the current user's active login session
     */
    private function getActiveSession()
    {
        $user = auth()->user();
        if (!$user) return null;
        return \App\Models\LoginSession::where('user_id', $user->id)
            ->whereNull('logout_time')
            ->orderBy('login_time', 'desc')
            ->first();
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
        
        $permission = Permission::where('name', $permissionName)->first();
        if (!$permission) {
            return false;
        }
        
        return DB::table('role_permissions')
            ->where('role_id', $user->role_id)
            ->where('permission_id', $permission->id)
            ->exists();
    }


    /**
     * Get all org IDs that a tenant admin can manage (their parent org + all sub-orgs).
     * Returns an empty array if the user has no org assigned.
     */
    private function getTenantOrgIds()
    {
        $user = auth()->user();
        if (!$user || !$user->organization_id) {
            return [];
        }

        $userOrg = Organization::find($user->organization_id);
        if (!$userOrg) {
            return [];
        }

        // Traverse up to find the top-level parent (root org)
        $rootOrg = $userOrg;
        while ($rootOrg->parent_id !== null) {
            $parent = Organization::find($rootOrg->parent_id);
            if (!$parent) break;
            $rootOrg = $parent;
        }

        // Collect root + all its direct children
        $ids = [$rootOrg->id];
        $children = Organization::where('parent_id', $rootOrg->id)->pluck('id')->toArray();
        $ids = array_merge($ids, $children);

        return $ids;
    }

    /**
     * Get current user's permissions
     */
    public function permissions()
    {
        $user = auth()->user();
        
        // Get all permissions for the user's role
        $permissions = DB::table('role_permissions')
            ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
            ->where('role_permissions.role_id', $user->role_id)
            ->pluck('permissions.name')
            ->toArray();
        
        return response()->json([
            'permissions' => $permissions
        ]);
    }

    public function index(Request $request)
    {
        if (!$this->hasPermission('Security_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view users.'
            ], 403);
        }
        
        $query = User::with('role', 'designation', 'organization');

        // Scope: OTA/PTA can only see users in their org tree
        if ($this->isTenantAdmin()) {
            $orgIds = $this->getTenantOrgIds();
            if (!empty($orgIds)) {
                $query->whereIn('organization_id', $orgIds);
            } else {
                // No org assigned — show nothing
                $query->whereRaw('1 = 0');
            }
        }

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'LIKE', "%{$search}%")
                  ->orWhere('full_name', 'LIKE', "%{$search}%");
            });
        }

        $users = $query->paginate(10);
        return response()->json($users);
    }

    public function store(Request $request)
    {
        if (!$this->hasPermission('Security_create')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to create users.'
            ], 403);
        }

        $authUser = auth()->user();
        $isTenantAdmin = $this->isTenantAdmin();

        // For OTA: force role_id = 8 (Organization Subject Officer)
        // For PTA: force role_id = 9 (Parliament Subject Officer)
        if ($authUser && $authUser->role_id == self::ROLE_OTA) {
            $request->merge(['role_id' => 8]);
        } elseif ($authUser && $authUser->role_id == self::ROLE_PTA) {
            $request->merge(['role_id' => 9]);
        }

        // Build validation rules
        $rules = [
            'username'        => 'required|string|max:255|unique:users,username|regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/',
            'full_name'       => 'required|string|max:255|regex:/^[A-Za-z\s\.\-]+$/',
            'phone_no'        => 'nullable|string|max:20',
            'password'        => 'required|string|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'role_id'         => 'required|exists:roles,id',
            'designation_id'  => 'nullable|exists:designations,id',
            'organization_id' => 'nullable|exists:organizations,id',
        ];

        // NIC is required for OTA and PTA contexts
        if ($isTenantAdmin) {
            $rules['nic'] = 'required|string|max:15|unique:users,nic';
        } else {
            $rules['nic'] = 'nullable|string|max:15|unique:users,nic';
        }

        $messages = [
            'username.required'       => 'Username is required',
            'username.regex'          => 'Please enter a valid email address',
            'full_name.required'      => 'Full name is required',
            'full_name.regex'         => 'Full name can only contain letters, spaces, periods, and hyphens',
            'phone_no.max'            => 'Phone number must not exceed 20 characters',
            'password.required'       => 'Password is required',
            'password.min'            => 'Password must be at least 6 characters',
            'password.regex'          => 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'role_id.required'        => 'Role is required',
            'designation_id.exists'   => 'Selected designation does not exist',
            'organization_id.exists'  => 'Selected organization does not exist',
            'nic.required'            => 'NIC is required',
            'nic.unique'              => 'This NIC is already registered',
            'nic.max'                 => 'NIC must not exceed 15 characters',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors'  => $validator->errors()
            ], 422);
        }

        // For tenant admins: ensure organization_id is within their scope
        if ($isTenantAdmin && $request->organization_id) {
            $orgIds = $this->getTenantOrgIds();
            if (!in_array($request->organization_id, $orgIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only assign users to your organization or its sub-organizations.',
                    'errors'  => ['organization_id' => ['Selected organization is outside your scope.']]
                ], 403);
            }
        }

        $user = User::create([
            'username'        => $request->username,
            'full_name'       => $request->full_name,
            'phone_no'        => $request->phone_no ?? null,
            'nic'             => $request->nic ?? null,
            'password'        => Hash::make($request->password),
            'role_id'         => $request->role_id,
            'designation_id'  => $request->designation_id,
            'organization_id' => $request->organization_id,
            'is_active'       => true
        ]);

        // Admin Log
        $currentUser = auth()->user();
        $session = $this->getActiveSession();
        if ($session) {
            AdminLog::create([
                'session_id'  => $session->id,
                'module'      => 'Security',
                'action_type' => 'User Created',
                'performed_by'=> $currentUser->full_name,
                'details'     => 'User ID U' . str_pad($user->id, 3, '0', STR_PAD_LEFT) . ' ' . $user->full_name . ' (' . $user->username . ') created.',
                'log'         => 'User Created',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data'    => $user->load('role', 'designation', 'organization')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if (!$this->hasPermission('Security_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update users.'
            ], 403);
        }
        
        $user = User::findOrFail($id);
        $authUser = auth()->user();
        $isTenantAdmin = $this->isTenantAdmin();

        // For tenant admins: ensure the target user is within their scope
        if ($isTenantAdmin) {
            $orgIds = $this->getTenantOrgIds();
            if (!in_array($user->organization_id, $orgIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only update users within your organization.'
                ], 403);
            }
        }

        // Build validation rules
        $rules = [
            'username'        => 'required|string|max:255|regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/|unique:users,username,'.$id,
            'full_name'       => 'required|string|max:255|regex:/^[A-Za-z\s\.\-]+$/',
            'phone_no'        => 'nullable|string|max:20',
            'role_id'         => 'required|exists:roles,id',
            'designation_id'  => 'nullable|exists:designations,id',
            'organization_id' => 'nullable|exists:organizations,id',
            'password'        => 'nullable|string|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
        ];

        // NIC required for tenant admin context
        if ($isTenantAdmin) {
            $rules['nic'] = 'required|string|max:15|unique:users,nic,'.$id;
        } else {
            $rules['nic'] = 'nullable|string|max:15|unique:users,nic,'.$id;
        }

        $messages = [
            'username.required'       => 'Username is required',
            'username.regex'          => 'Please enter a valid email address',
            'full_name.required'      => 'Full name is required',
            'full_name.regex'         => 'Full name can only contain letters, spaces, periods, and hyphens',
            'phone_no.max'            => 'Phone number must not exceed 20 characters',
            'role_id.required'        => 'Role is required',
            'designation_id.exists'   => 'Selected designation does not exist',
            'organization_id.exists'  => 'Selected organization does not exist',
            'password.min'            => 'Password must be at least 6 characters',
            'password.regex'          => 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'nic.required'            => 'NIC is required',
            'nic.unique'              => 'This NIC is already registered',
            'nic.max'                 => 'NIC must not exceed 15 characters',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors'  => $validator->errors()
            ], 422);
        }

        // For tenant admins: ensure new organization_id is within their scope
        if ($isTenantAdmin && $request->organization_id) {
            $orgIds = $this->getTenantOrgIds();
            if (!in_array($request->organization_id, $orgIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only assign users to your organization or its sub-organizations.',
                    'errors'  => ['organization_id' => ['Selected organization is outside your scope.']]
                ], 403);
            }
        }

        $updateData = [
            'username'        => $request->username,
            'full_name'       => $request->full_name,
            'phone_no'        => $request->phone_no ?? null,
            'nic'             => $request->nic ?? null,
            'role_id'         => $request->role_id,
            'designation_id'  => $request->designation_id,
            'organization_id' => $request->organization_id
        ];

        // Only hash and update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        // Admin Log
        $currentUser = auth()->user();
        $session = $this->getActiveSession();
        if ($session) {
            AdminLog::create([
                'session_id'  => $session->id,
                'module'      => 'Security',
                'action_type' => 'User Updated',
                'performed_by'=> $currentUser->full_name,
                'details'     => 'User ID U' . str_pad($user->id, 3, '0', STR_PAD_LEFT) . ' ' . $user->full_name . ' (' . $user->username . ') updated.',
                'log'         => 'User Updated',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data'    => $user->load('role', 'designation', 'organization')
        ]);
    }

    // Toggle user active/inactive status
    public function toggleStatus($id)
    {
        if (!$this->hasPermission('Security_update')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to update user status.'
            ], 403);
        }

        $user = User::findOrFail($id);

        // For tenant admins: ensure target user is in their scope
        if ($this->isTenantAdmin()) {
            $orgIds = $this->getTenantOrgIds();
            if (!in_array($user->organization_id, $orgIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only change the status of users within your organization.'
                ], 403);
            }
        }

        $user->is_active = !$user->is_active;
        $user->save();

        // Admin Log
        $currentUser = auth()->user();
        $session = $this->getActiveSession();
        if ($session) {
            $action = $user->is_active ? 'User Activated' : 'User Deactivated';
            AdminLog::create([
                'session_id'  => $session->id,
                'module'      => 'Security',
                'action_type' => $action,
                'performed_by'=> $currentUser->full_name,
                'details'     => 'User ID U' . str_pad($user->id, 3, '0', STR_PAD_LEFT) . ' ' . $user->full_name . ' (' . $user->username . ') ' . ($user->is_active ? 'activated.' : 'deactivated.'),
                'log'         => $action,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data'    => $user->load('role', 'designation', 'organization')
        ]);
    }

    // Get all roles for dropdown
    public function getRoles()
    {
        if (!$this->hasPermission('Security_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You do not have permission to view roles.'
            ], 403);
        }
        
        $roles = Role::all();
        return response()->json($roles);
    }

    // Reset password for logged-in user
    public function resetPassword(Request $request)
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Please login first.'
            ], 401);
        }

        // Validate inputs
        $validator = Validator::make($request->all(), [
            'old_password'     => 'required|string',
            'new_password'     => 'required|string|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'confirm_password' => 'required|string|same:new_password'
        ], [
            'old_password.required'     => 'Current password is required',
            'new_password.required'     => 'New password is required',
            'new_password.min'          => 'New password must be at least 6 characters',
            'new_password.regex'        => 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
            'confirm_password.required' => 'Password confirmation is required',
            'confirm_password.same'     => 'Password confirmation does not match the new password'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors'  => $validator->errors()
            ], 422);
        }

        // Verify old password
        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 422);
        }

        // Check that new password is different from old password
        if (Hash::check($request->new_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'New password must be different from current password'
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        // Admin Log
        $session = $this->getActiveSession();
        if ($session) {
            AdminLog::create([
                'session_id'  => $session->id,
                'module'      => 'Security',
                'action_type' => 'Password Reset',
                'performed_by'=> $user->full_name,
                'details'     => 'User ID U' . str_pad($user->id, 3, '0', STR_PAD_LEFT) . ' ' . $user->full_name . ' (' . $user->username . ') changed their password.',
                'log'         => 'Password Reset',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }
}