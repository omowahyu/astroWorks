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
                'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll as placeholder
                'is_active' => true,
                'autoplay' => true,
                'loop' => true,
                'muted' => true,
                'sort_order' => 1
            ],
            [
                'title' => 'Custom Cabinet Installation Process',
                'description' => 'Watch our professional installation team transform your kitchen with custom cabinets.',
                'youtube_url' => 'https://www.youtube.com/watch?v=9bZkp7q19f0', // Gangnam Style as placeholder
                'is_active' => true,
                'autoplay' => false,
                'loop' => false,
                'muted' => true,
                'sort_order' => 2
            ],
            [
                'title' => 'Behind the Scenes: Cabinet Manufacturing',
                'description' => 'Take a look inside our workshop where we craft high-quality custom cabinets.',
                'youtube_url' => 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', // Despacito as placeholder
                'is_active' => true,
                'autoplay' => false,
                'loop' => false,
                'muted' => true,
                'sort_order' => 3
            ],
            [
                'title' => 'Customer Testimonials',
                'description' => 'Hear what our satisfied customers have to say about their new kitchens.',
                'youtube_url' => 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', // Bohemian Rhapsody as placeholder
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
