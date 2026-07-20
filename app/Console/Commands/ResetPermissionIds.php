<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Permission;

class ResetPermissionIds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permissions:reset-ids';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset the permission IDs to be sequential starting from 1';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting permission IDs reset...');
        
        try {
            // Get all permissions ordered by name
            $permissions = Permission::orderBy('name')->get();
            $this->info('Found ' . $permissions->count() . ' permissions.');
            
            // Create a backup of role_permissions table
            $this->info('Creating backup of role permissions...');
            $rolePermissions = DB::table('role_permissions')->get();
            
            // Store mapping of permission name to original ID for reference
            $nameToOriginalId = [];
            foreach ($permissions as $permission) {
                $nameToOriginalId[$permission->name] = $permission->id;
            }
            
            // Temporarily disable foreign key checks
            $this->info('Disabling foreign key checks...');
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            
            // Clear role_permissions table
            $this->info('Clearing role_permissions table...');
            DB::table('role_permissions')->delete();
            
            // Truncate permissions table and reset auto-increment
            $this->info('Truncating permissions table...');
            DB::statement('TRUNCATE TABLE permissions');
            
            // Re-insert permissions with sequential IDs
            $this->info('Re-creating permissions with sequential IDs...');
            $idMap = []; // old ID => new ID
            $counter = 1;
            
            foreach ($permissions as $permission) {
                $oldId = $permission->id;
                
                // Insert with a new sequential ID
                $newId = $counter++;
                $idMap[$oldId] = $newId;
                
                DB::table('permissions')->insert([
                    'id' => $newId,
                    'name' => $permission->name
                ]);
                
                $this->info("Re-created permission '{$permission->name}' with ID $newId (was $oldId)");
            }
            
            // Restore role_permissions with updated permission IDs
            $this->info('Restoring role permissions with updated IDs...');
            foreach ($rolePermissions as $rp) {
                if (isset($idMap[$rp->permission_id])) {
                    DB::table('role_permissions')->insert([
                        'role_id' => $rp->role_id,
                        'permission_id' => $idMap[$rp->permission_id]
                    ]);
                }
            }
            
            // Re-enable foreign key checks
            $this->info('Re-enabling foreign key checks...');
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            
            $this->info('Permission IDs reset successfully!');
        } catch (\Exception $e) {
            $this->error('Failed to reset permission IDs: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}