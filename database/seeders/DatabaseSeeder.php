<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Team Astro',
            'email' =>  env('ADMIN_EMAIL'),
            'password' => bcrypt(env('ADMIN_PASSWORD')),
        ]);

        $this->call([
            ProductSeeder::class,
            CategorySeeder::class,
            // ProductImageSeeder::class, // Removed - use only real uploaded images
            VideoSeeder::class,
        ]);
    }
}
