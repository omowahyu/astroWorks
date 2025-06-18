<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user if it doesn't exist
        User::firstOrCreate(
            ['email' => 'team@astrokabinet.id'],
            [
                'name' => 'Sales Team',
                'password' => Hash::make('Astrokabinet25!'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Admin user created or already exists: team@astrokabinet.id');
    }
}
