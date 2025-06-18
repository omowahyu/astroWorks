<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Video;

class VideoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $videos = [
            [
                'title' => 'Modern Kitchen Design Showcase',
                'description' => 'Explore our latest modern kitchen designs featuring sleek cabinets and contemporary styling.',
                'youtube_url' => 'https://www.youtube.com/embed/ScMzIvxBSi4', // Big Buck Bunny - safe for embed
                'is_active' => true,
                'autoplay' => false, // Disable autoplay to prevent CORS issues
                'loop' => false,
                'muted' => true,
                'sort_order' => 1
            ],
            [
                'title' => 'Custom Cabinet Installation Process',
                'description' => 'Watch our professional installation team transform your kitchen with custom cabinets.',
                'youtube_url' => 'https://www.youtube.com/embed/aqz-KE-bpKQ', // Big Buck Bunny trailer
                'is_active' => true,
                'autoplay' => false,
                'loop' => false,
                'muted' => true,
                'sort_order' => 2
            ],
            [
                'title' => 'Behind the Scenes: Cabinet Manufacturing',
                'description' => 'Take a look inside our workshop where we craft high-quality custom cabinets.',
                'youtube_url' => 'https://www.youtube.com/embed/YE7VzlLtp-4', // Sintel trailer
                'is_active' => true,
                'autoplay' => false,
                'loop' => false,
                'muted' => true,
                'sort_order' => 3
            ],
            [
                'title' => 'Customer Testimonials',
                'description' => 'Hear what our satisfied customers have to say about their new kitchens.',
                'youtube_url' => 'https://www.youtube.com/embed/eRsGyueVLvQ', // Tears of Steel trailer
                'is_active' => false,
                'autoplay' => false,
                'loop' => false,
                'muted' => true,
                'sort_order' => 4
            ]
        ];

        foreach ($videos as $videoData) {
            Video::create($videoData);
        }
    }
}
