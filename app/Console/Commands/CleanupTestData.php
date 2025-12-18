<?php

namespace App\Console\Commands;

use App\Models\House;
use App\Models\Order;
use Illuminate\Console\Command;

class CleanupTestData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-test-data {--force : Force cleanup without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up test data and invalid house records from database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧹 Starting database cleanup...');
        $this->newLine();

        // Check pending houses
        $pendingHouses = House::where('status', 'pending')->doesntHave('orders')->get();
        $pendingCount = $pendingHouses->count();

        if ($pendingCount === 0) {
            $this->info('✅ No test data found to clean up!');
            return Command::SUCCESS;
        }

        // Show statistics
        $this->table(
            ['Data Type', 'Count', 'Description'],
            [
                ['Pending Houses (no orders)', $pendingCount, 'Houses with invalid "pending" status'],
            ]
        );

        $this->newLine();
        $this->warn("⚠️  Total records to delete: {$pendingCount}");
        $this->newLine();

        // Confirm deletion
        if (!$this->option('force')) {
            if (!$this->confirm('Do you want to proceed with cleanup?', false)) {
                $this->info('Cleanup cancelled.');
                return Command::SUCCESS;
            }
        }

        // Perform cleanup
        $this->info('🗑️  Deleting records...');

        $deletedCount = 0;

        // Delete pending houses without orders
        foreach ($pendingHouses as $house) {
            $house->delete();
            $deletedCount++;
        }

        $this->newLine();
        $this->info("✅ Cleanup completed successfully!");
        $this->info("📊 Deleted {$deletedCount} house records");

        // Show final statistics
        $this->newLine();
        $this->info('📈 Current database state:');
        $statusCounts = House::select('status', \DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        $this->table(
            ['Status', 'Count'],
            collect($statusCounts)->map(fn($count, $status) => [$status, $count])->toArray()
        );

        return Command::SUCCESS;
    }
}
