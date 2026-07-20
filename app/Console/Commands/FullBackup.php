<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use App\Mail\BackupNotification;
use Carbon\Carbon;
use ZipArchive;

class FullBackup extends Command
{
    protected $signature = 'backup:full {--clean : Clean old backups}';
    protected $description = 'Create full backup including database and storage files';

    public function handle()
    {
        $this->info('Starting full backup process...');
        
        $startTime = microtime(true);

        $backupPath = storage_path('app/backups');
        if (!file_exists($backupPath)) {
            mkdir($backupPath, 0755, true);
        }

        $timestamp = Carbon::now()->format('Y-m-d_His');
        $zipFilename = "full-backup-{$timestamp}.zip";
        $zipFilepath = $backupPath . '/' . $zipFilename;

        // Step 1: Backup database
        $this->info('Step 1/3: Backing up database...');
        if (!$this->backupDatabase($backupPath)) {
            $this->error('Aborting full backup due to database backup failure.');
            return Command::FAILURE;
        }

        // Step 2: Create zip archive
        $this->info('Step 2/3: Creating archive with storage files...');
        
        if (!class_exists('ZipArchive')) {
            $this->warn('ZipArchive extension not available. Using PowerShell compression...');
            return $this->createBackupWithPowerShell($backupPath, $timestamp);
        }

        $zip = new ZipArchive();
        if ($zip->open($zipFilepath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            $this->error('Failed to create zip file!');
            return Command::FAILURE;
        }

        // Add database backup (latest one)
        $dbBackups = glob($backupPath . '/backup-*.sql');
        if (!empty($dbBackups)) {
            rsort($dbBackups);
            $latestDbBackup = $dbBackups[0];
            $zip->addFile($latestDbBackup, 'database/' . basename($latestDbBackup));
            $this->line('✓ Added database backup');
        }

        // Add storage files
        /*
        $storagePath = storage_path('app/public');
        if (is_dir($storagePath)) {
            $this->addDirectoryToZip($zip, $storagePath, 'storage');
            $this->line('✓ Added storage files');
        }

        $publicStoragePath = public_path('storage');
        if (is_dir($publicStoragePath) && !is_link($publicStoragePath)) {
            $this->addDirectoryToZip($zip, $publicStoragePath, 'public_storage');
            $this->line('✓ Added public storage files');
        }

        $envFile = base_path('.env');
        if (file_exists($envFile)) {
            $zip->addFile($envFile, 'config/.env');
            $this->line('✓ Added configuration file');
        }
        */

        $zip->close();

        // Step 3: Verify and report
        $this->info('Step 3/3: Verifying backup...');
        
        if (file_exists($zipFilepath)) {
            $size = $this->formatBytes(filesize($zipFilepath));
            $duration = round(microtime(true) - $startTime, 2);
            
            $this->newLine();
            $this->info('════════════════════════════════════════');
            $this->info('✓ Full backup completed successfully!');
            $this->info('════════════════════════════════════════');
            $this->info("Backup file: {$zipFilename}");
            $this->info("Size: {$size}");
            $this->info("Duration: {$duration} seconds");
            $this->info("Location: {$zipFilepath}");
            $this->info('════════════════════════════════════════');

            if ($this->option('clean')) {
                $this->cleanOldBackups($backupPath);
            }

            $this->sendEmailNotification('Full Backup', $zipFilename, $zipFilepath, $size, 'success');

            return Command::SUCCESS;
        } else {
            $this->error('Backup file was not created!');
            $this->sendEmailNotification('Full Backup', $zipFilename, $zipFilepath, '0 B', 'failed', 'Backup file was not created');
            return Command::FAILURE;
        }
    }

    /**
     * Backup the MySQL Database
     */
    protected function backupDatabase($backupPath)
    {
        $filename = 'backup-' . Carbon::now()->format('Y-m-d_His') . '.sql';
        $filepath = $backupPath . '/' . $filename;

        $dbHost = config('database.connections.mysql.host');
        $dbPort = config('database.connections.mysql.port');
        $dbName = config('database.connections.mysql.database');
        $dbUser = config('database.connections.mysql.username');
        $dbPass = config('database.connections.mysql.password');

        $mysqldumpPaths = [
            'mysqldump',
            'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe',
            'C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqldump.exe',
            'C:\xampp\mysql\bin\mysqldump.exe',
            'C:\wamp64\bin\mysql\mysql8.0.31\bin\mysqldump.exe',
            'C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqldump.exe',
        ];

        $mysqldump = null;
        foreach ($mysqldumpPaths as $path) {
            if ($path === 'mysqldump') {
                exec('where mysqldump 2>nul', $output, $returnVar);
                if ($returnVar === 0 && !empty($output)) { $mysqldump = 'mysqldump'; break; }
            } elseif (file_exists($path)) {
                $mysqldump = $path; break;
            }
        }

        if (!$mysqldump) {
            $this->error('mysqldump not found! Please ensure MySQL is installed.');
            return false;
        }

        // Simplified Command as requested
        $command = "\"{$mysqldump}\" --host={$dbHost} --user={$dbUser} --password={$dbPass} {$dbName} > \"{$filepath}\"";

        $this->info("Running: " . $command);
        
        // Run using system() as requested
        system($command, $returnVar);

        if ($returnVar !== 0) {
            $this->warn("Database backup had warnings or errors (Code $returnVar). Continuing anyway...");
        }

        if (file_exists($filepath) && filesize($filepath) > 0) {
            return true;
        }

        return false;
    }

    protected function addDirectoryToZip($zip, $directory, $zipPath = '')
    {
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($directory) + 1);
                $zip->addFile($filePath, $zipPath . '/' . $relativePath);
            }
        }
    }

    protected function cleanOldBackups($backupPath)
    {
        $this->newLine();
        $this->info('Cleaning old backups...');

        $files = glob($backupPath . '/full-backup-*.zip');
        rsort($files); 
        $deleted = 0;

        foreach (array_slice($files, 7) as $file) {
            if (is_file($file)) {
                unlink($file);
                $deleted++;
                $this->line('Deleted: ' . basename($file));
            }
        }

        $dbFiles = glob($backupPath . '/backup-*.sql');
        $now = time();
        $daysToKeep = 30;

        foreach ($dbFiles as $file) {
            if (is_file($file)) {
                if ($now - filemtime($file) >= 60 * 60 * 24 * $daysToKeep) {
                    unlink($file);
                    $deleted++;
                    $this->line('Deleted: ' . basename($file));
                }
            }
        }

        $this->info("Cleaned {$deleted} old backup(s).");
    }

    protected function formatBytes($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }

    protected function createBackupWithPowerShell($backupPath, $timestamp)
    {
        $tempDir = $backupPath . '/temp-backup-' . $timestamp;
        $zipFilename = "full-backup-{$timestamp}.zip";
        $zipFilepath = $backupPath . '/' . $zipFilename;

        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $this->line('Creating temporary backup structure...');

        $dbBackups = glob($backupPath . '/backup-*.sql');
        if (!empty($dbBackups)) {
            rsort($dbBackups);
            $latestDbBackup = $dbBackups[0];
            $dbDir = $tempDir . '/database';
            mkdir($dbDir, 0755, true);
            copy($latestDbBackup, $dbDir . '/' . basename($latestDbBackup));
            $this->line('✓ Added database backup');
        }

        /*
        $storagePath = storage_path('app/public');
        if (is_dir($storagePath)) {
            $storageDir = $tempDir . '/storage';
            mkdir($storageDir, 0755, true);
            $this->xcopy($storagePath, $storageDir);
            $this->line('✓ Added storage files');
        }

        $envFile = base_path('.env');
        if (file_exists($envFile)) {
            $configDir = $tempDir . '/config';
            mkdir($configDir, 0755, true);
            copy($envFile, $configDir . '/.env');
            $this->line('✓ Added configuration file');
        }
        */

        $this->info('Compressing files with PowerShell...');
        
        $psCommand = sprintf(
            'Compress-Archive -Path "%s\*" -DestinationPath "%s" -Force',
            $tempDir,
            $zipFilepath
        );

        exec("powershell -Command \"$psCommand\"", $output, $returnVar);

        $this->deleteDirectory($tempDir);

        if ($returnVar === 0 && file_exists($zipFilepath)) {
            $size = $this->formatBytes(filesize($zipFilepath));
            
            $this->newLine();
            $this->info('════════════════════════════════════════');
            $this->info('✓ Full backup completed successfully!');
            $this->info('════════════════════════════════════════');
            $this->info("Backup file: {$zipFilename}");
            $this->info("Size: {$size}");
            $this->info("Location: {$zipFilepath}");
            $this->info('════════════════════════════════════════');

            if ($this->option('clean')) {
                $this->cleanOldBackups(dirname($zipFilepath));
            }

            $this->sendEmailNotification('Full Backup', $zipFilename, $zipFilepath, $size, 'success');
            return Command::SUCCESS;
        } else {
            $this->error('Failed to create backup archive!');
            $this->sendEmailNotification('Full Backup', $zipFilename, $zipFilepath, '0 B', 'failed', 'Failed to create backup archive');
            return Command::FAILURE;
        }
    }

    protected function xcopy($src, $dst)
    {
        $dir = opendir($src);
        if (!file_exists($dst)) {
            mkdir($dst, 0755, true);
        }

        while (($file = readdir($dir)) !== false) {
            if (($file != '.') && ($file != '..')) {
                if (is_dir($src . '/' . $file)) {
                    $this->xcopy($src . '/' . $file, $dst . '/' . $file);
                } else {
                    copy($src . '/' . $file, $dst . '/' . $file);
                }
            }
        }
        closedir($dir);
    }

    protected function deleteDirectory($dir)
    {
        if (!file_exists($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                $this->deleteDirectory($path);
            } else {
                unlink($path);
            }
        }
        rmdir($dir);
    }

    protected function sendEmailNotification($backupType, $filename, $filepath, $filesize, $status = 'success', $errorMessage = null)
    {
        try {
            $this->newLine();
            $this->info('Sending email notification...');
            
            $emailTo = env('BACKUP_EMAIL_TO');
            
            if (empty($emailTo)) {
                $this->warn('BACKUP_EMAIL_TO is not set in .env. Skipping email notification.');
                return;
            }
            
            Mail::to(explode(',', $emailTo))->send(
                new BackupNotification($backupType, $filename, $filepath, $filesize, $status, $errorMessage)
            );
            
            $this->info("✓ Email sent to: {$emailTo}");
        } catch (\Exception $e) {
            $this->warn('Failed to send email notification: ' . $e->getMessage());
            $this->warn('Backup completed but email notification failed.');
        }
    }
}
