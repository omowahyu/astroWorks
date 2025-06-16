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
            // Remove unused columns
            $table->dropColumn([
                'is_thumbnail',
                'mobile_portrait_path',
                'mobile_square_path',
                'desktop_landscape_path',
                'original_file_size',
                'optimized_file_size',
                'image_metadata',
                'is_primary',
                'display_order'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            // Restore columns if needed
            $table->string('mobile_portrait_path')->nullable()->after('image_path');
            $table->string('mobile_square_path')->nullable()->after('mobile_portrait_path');
            $table->string('desktop_landscape_path')->nullable()->after('mobile_square_path');
            $table->bigInteger('original_file_size')->nullable()->after('desktop_landscape_path');
            $table->bigInteger('optimized_file_size')->nullable()->after('original_file_size');
            $table->json('image_metadata')->nullable()->after('optimized_file_size');
            $table->boolean('is_thumbnail')->default(false)->after('image_type');
            $table->boolean('is_primary')->default(false)->after('alt_text');
            $table->integer('display_order')->default(0)->after('is_thumbnail');
        });
    }
};
