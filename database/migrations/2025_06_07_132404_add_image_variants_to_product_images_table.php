<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->string('mobile_portrait_path')->nullable()->after('image_path'); // 4:5 aspect ratio
            $table->string('mobile_square_path')->nullable()->after('mobile_portrait_path'); // 1:1 aspect ratio
            $table->string('desktop_landscape_path')->nullable()->after('mobile_square_path'); // 16:9 aspect ratio
            $table->bigInteger('original_file_size')->nullable()->after('desktop_landscape_path');
            $table->bigInteger('optimized_file_size')->nullable()->after('original_file_size');
            $table->json('image_metadata')->nullable()->after('optimized_file_size');

            // Add support for image types and thumbnail functionality
            $table->enum('image_type', ['thumbnail', 'gallery', 'hero'])->default('gallery')->after('image_metadata');
            $table->boolean('is_thumbnail')->default(false)->after('image_type');
            $table->integer('display_order')->default(0)->after('is_thumbnail');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropColumn([
                'mobile_portrait_path',
                'mobile_square_path',
                'desktop_landscape_path',
                'original_file_size',
                'optimized_file_size',
                'image_metadata',
                'image_type',
                'is_thumbnail',
                'display_order'
            ]);
        });
    }
};
